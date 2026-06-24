from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .database import get_connection, init_db
from .schemas import (
    CreateOrderRequest,
    LoginRequest,
    OrderResponse,
    ProductResponse,
    UserResponse,
)

app = FastAPI(title="Manul Coin Shop API")

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


def get_user_id(x_user_id: Optional[str]) -> int:
    if not x_user_id:
        error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")
    try:
        return int(x_user_id)
    except ValueError:
        error(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED")


def row_to_user(row) -> UserResponse:
    return UserResponse(id=row["id"], login=row["login"], name=row["name"], balance=row["balance"])


def load_user(user_id: int):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, login, name, balance FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if not row:
            error(status.HTTP_404_NOT_FOUND, "USER_NOT_FOUND")
        return row_to_user(row)


def build_order_response(conn, order_id: int) -> OrderResponse:
    order = conn.execute(
        "SELECT id, date, total_price, status FROM orders WHERE id = ?", (order_id,)
    ).fetchone()
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
            SELECT id, login, name, balance
            FROM users
            WHERE login = ? AND password = ?
            """,
            (data.login, data.password),
        ).fetchone()
        if not row:
            error(status.HTTP_401_UNAUTHORIZED, "INVALID_CREDENTIALS")
        return row_to_user(row)

@app.get("/api/user", response_model=UserResponse)
def get_current_user(x_user_id: Optional[str] = Header(default=None, alias="X-User-Id")):
    return load_user(get_user_id(x_user_id))

@app.get("/api/products", response_model=list[ProductResponse])
def get_products():
    with get_connection() as conn:
        rows = conn.execute("SELECT id, name, price, image FROM products ORDER BY id").fetchall()
        return [dict(row) for row in rows]


@app.get("/api/orders", response_model=list[OrderResponse])
def get_orders(x_user_id: Optional[str] = Header(default=None, alias="X-User-Id")):
    user_id = get_user_id(x_user_id)
    with get_connection() as conn:
        order_ids = conn.execute(
            "SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC", (user_id,)
        ).fetchall()
        return [build_order_response(conn, row["id"]) for row in order_ids]


@app.post("/api/order", status_code=status.HTTP_201_CREATED, response_model=OrderResponse)
def create_order(data: CreateOrderRequest, x_user_id: Optional[str] = Header(default=None, alias="X-User-Id")):
    user_id = get_user_id(x_user_id)
    if not data.items:
        error(status.HTTP_400_BAD_REQUEST, "EMPTY_ORDER")

    with get_connection() as conn:
        user = conn.execute("SELECT id, balance FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            error(status.HTTP_404_NOT_FOUND, "USER_NOT_FOUND")

        product_ids = [item.product_id for item in data.items]
        placeholders = ",".join("?" for _ in product_ids)
        products = conn.execute(
            f"SELECT id, price FROM products WHERE id IN ({placeholders})", product_ids
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
                (order_id, item.product_id, item.quantity, int(product["price"])),
            )

        conn.execute("UPDATE users SET balance = balance - ? WHERE id = ?", (total_price, user_id))
        return build_order_response(conn, order_id)
