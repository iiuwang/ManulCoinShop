from sqlite3 import IntegrityError

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .database import get_connection, init_db
from .schemas import (
    CreateOrderRequest,
    LoginRequest,
    OrderResponse,
    ProductResponse,
    RegisterRequest,
    TopUpRequest,
    UserResponse,
)
from .security import create_token, hash_password, verify_password

app = FastAPI(title="Manul Coin Shop API")
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def error(status_code: int, code: str) -> None:
    raise HTTPException(status_code=status_code, detail={"error": code})


def create_session(conn, user_id: int) -> str:
    token = create_token()
    conn.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user_id),
    )
    return token


def get_user_id_by_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    token = credentials.credentials

    with get_connection() as conn:
        row = conn.execute(
            "SELECT user_id FROM sessions WHERE token = ?",
            (token,),
        ).fetchone()

        if not row:
            error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")

        return int(row["user_id"])


def row_to_user(row, token: str | None = None) -> UserResponse:
    return UserResponse(
        id=row["id"],
        login=row["login"],
        name=row["name"],
        balance=row["balance"],
        token=token,
    )


def load_user(user_id: int) -> UserResponse:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, login, name, balance FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not row:
            error(status.HTTP_404_NOT_FOUND, "USER_NOT_FOUND")

        return row_to_user(row)


def build_order_response(conn, order_id: int) -> OrderResponse:
    order = conn.execute(
        "SELECT id, date, total_price, status FROM orders WHERE id = ?",
        (order_id,),
    ).fetchone()

    if not order:
        error(status.HTTP_404_NOT_FOUND, "ORDER_NOT_FOUND")

    items = conn.execute(
        """
        SELECT oi.id, oi.quantity, p.id AS product_id, p.name, oi.price, p.image
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id
        """,
        (order_id,),
    ).fetchall()

    return OrderResponse(
        id=order["id"],
        date=order["date"],
        total_price=order["total_price"],
        status=order["status"],
        items=[
            {
                "id": item["id"],
                "quantity": item["quantity"],
                "product": {
                    "id": item["product_id"],
                    "name": item["name"],
                    "price": item["price"],
                    "image": item["image"],
                },
            }
            for item in items
        ],
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=UserResponse)
def login(data: LoginRequest):
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT id, login, name, balance, password_hash
            FROM users
            WHERE login = ?
            """,
            (data.login,),
        ).fetchone()

        if not row or not verify_password(data.password, row["password_hash"]):
            error(status.HTTP_401_UNAUTHORIZED, "INVALID_CREDENTIALS")

        token = create_session(conn, row["id"])
        return row_to_user(row, token)


@app.post(
    "/api/auth/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
)
def register(data: RegisterRequest):
    with get_connection() as conn:
        try:
            cursor = conn.execute(
                """
                INSERT INTO users (login, password_hash, name, balance)
                VALUES (?, ?, ?, 500)
                """,
                (data.login, hash_password(data.password), data.name),
            )
        except IntegrityError:
            error(status.HTTP_409_CONFLICT, "LOGIN_ALREADY_EXISTS")

        user_id = cursor.lastrowid
        token = create_session(conn, user_id)

        row = conn.execute(
            "SELECT id, login, name, balance FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        return row_to_user(row, token)


@app.get("/api/user", response_model=UserResponse)
def get_current_user(user_id: int = Depends(get_user_id_by_token)):
    return load_user(user_id)


@app.post("/api/user/top-up", response_model=UserResponse)
def top_up(
    data: TopUpRequest,
    user_id: int = Depends(get_user_id_by_token),
):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not row:
            error(status.HTTP_404_NOT_FOUND, "USER_NOT_FOUND")

        conn.execute(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            (data.amount, user_id),
        )

        updated = conn.execute(
            "SELECT id, login, name, balance FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        return row_to_user(updated)


@app.get("/api/products", response_model=list[ProductResponse])
def get_products():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, name, price, image FROM products ORDER BY id",
        ).fetchall()

        return [dict(row) for row in rows]


@app.get("/api/orders", response_model=list[OrderResponse])
def get_orders(user_id: int = Depends(get_user_id_by_token)):
    with get_connection() as conn:
        order_ids = conn.execute(
            "SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC",
            (user_id,),
        ).fetchall()

        return [build_order_response(conn, row["id"]) for row in order_ids]


@app.post(
    "/api/order",
    status_code=status.HTTP_201_CREATED,
    response_model=OrderResponse,
)
def create_order(
    data: CreateOrderRequest,
    user_id: int = Depends(get_user_id_by_token),
):
    if not data.items:
        error(status.HTTP_400_BAD_REQUEST, "EMPTY_ORDER")

    with get_connection() as conn:
        user = conn.execute(
            "SELECT id, balance FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not user:
            error(status.HTTP_404_NOT_FOUND, "USER_NOT_FOUND")

        product_ids = [item.product_id for item in data.items]
        placeholders = ",".join("?" for _ in product_ids)

        products = conn.execute(
            f"SELECT id, price FROM products WHERE id IN ({placeholders})",
            product_ids,
        ).fetchall()

        products_by_id = {row["id"]: row for row in products}

        total_price = 0

        for item in data.items:
            product = products_by_id.get(item.product_id)

            if not product:
                error(status.HTTP_404_NOT_FOUND, "PRODUCT_NOT_FOUND")

            total_price += int(product["price"]) * item.quantity

        if user["balance"] < total_price:
            error(status.HTTP_400_BAD_REQUEST, "INSUFFICIENT_FUNDS")

        cursor = conn.execute(
            "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, 'assembly')",
            (user_id, total_price),
        )

        order_id = cursor.lastrowid

        for item in data.items:
            product = products_by_id[item.product_id]

            conn.execute(
                """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
                """,
                (
                    order_id,
                    item.product_id,
                    item.quantity,
                    int(product["price"]),
                ),
            )

        conn.execute(
            "UPDATE users SET balance = balance - ? WHERE id = ?",
            (total_price, user_id),
        )

        return build_order_response(conn, order_id)