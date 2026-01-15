from pydantic import BaseModel
from typing import List
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class CustomerInfo(BaseModel):
    name: str
    email: str
    phone: str
    address: str

class OrderCreate(BaseModel):
    customer: CustomerInfo
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    product_id: int
    product_name:str
    price:float
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int

    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str

    created_at: datetime
    order_paid : bool
    invoice_generated : bool
    items: List[OrderItemResponse]
    total_amount:float

    class Config:
        from_attributes = True
