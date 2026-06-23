from pydantic import BaseModel, Field
from typing import List


class LoginRequest(BaseModel):
    login: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)


class RegisterRequest(LoginRequest):
    name: str = Field(min_length=2, max_length=50)


class UserResponse(BaseModel):
    id: int
    login: str
    name: str
    balance: int


class ProductResponse(BaseModel):
    id: int
    name: str
    price: int
    image: str


class OrderItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=99)


class CreateOrderRequest(BaseModel):
    items: List[OrderItemRequest]


class TopUpRequest(BaseModel):
    amount: int = Field(gt=0, le=100000)


class CartProduct(BaseModel):
    id: int
    name: str
    price: int
    image: str


class CartItemResponse(BaseModel):
    id: int
    product: CartProduct
    quantity: int


class OrderResponse(BaseModel):
    id: int
    date: str
    items: List[CartItemResponse]
    total_price: int
    status: str
