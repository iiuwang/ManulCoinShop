import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from .security import hash_password

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "manul_coin_shop.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

PRODUCTS = [
    (1, "products.mug1", 150, "assets/images/products/selection.png"),
    (2, "products.mug2", 160, "assets/images/products/selection.png"),
    (3, "products.mug3", 200, "assets/images/products/selection.png"),
    (4, "products.mug4", 100, "assets/images/products/selection.png"),
    (5, "products.mug5", 340, "assets/images/products/selection.png"),
    (6, "products.mug6", 3400, "assets/images/products/selection.png"),
    (7, "products.mug7", 40, "assets/images/products/selection.png"),
    (8, "products.mug8", 940, "assets/images/products/selection.png"),
    (9, "products.mug9", 140, "assets/images/products/selection.png"),
    (10, "products.mug10", 1400, "assets/images/products/selection.png"),
    (11, "products.mug11", 1400, "assets/images/products/selection.png"),
    (12, "products.mug12", 450, "assets/images/products/selection.png"),
    (13, "products.mug13", 140, "assets/images/products/selection.png"),
    (14, "products.mug14", 390, "assets/images/products/selection.png"),
]


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _column_exists(conn: sqlite3.Connection, table_name: str, column_name: str) -> bool:
    rows = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    return any(row["name"] == column_name for row in rows)


def _migrate_users_table(conn: sqlite3.Connection) -> None:
    if not _column_exists(conn, "users", "password_hash"):
        conn.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")

    # If an old local DB exists with plain-text column `password`, convert it once.
    if _column_exists(conn, "users", "password"):
        rows = conn.execute(
            "SELECT id, password FROM users WHERE password_hash IS NULL OR password_hash = ''"
        ).fetchall()
        for row in rows:
            conn.execute(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                (hash_password(row["password"]), row["id"]),
            )


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                login TEXT NOT NULL UNIQUE,
                password_hash TEXT,
                name TEXT NOT NULL,
                balance INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                price INTEGER NOT NULL CHECK(price >= 0),
                image TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                total_price INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'assembly',
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                price INTEGER NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY(product_id) REFERENCES products(id)
            );
            """
        )
        _migrate_users_table(conn)
        conn.executemany(
            """
            INSERT INTO products (id, name, price, image)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                price = excluded.price,
                image = excluded.image
            """,
            PRODUCTS,
        )
        conn.execute(
            """
            INSERT OR IGNORE INTO users (id, login, password_hash, name, balance)
            VALUES (1, 'adminadmin', ?, 'Алена', 5000)
            """,
            (hash_password("qwerty1234"),),
        )
