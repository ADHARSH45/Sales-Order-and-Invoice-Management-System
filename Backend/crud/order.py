
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.products import Products
from models.order_item import OrderItem

def get_order_total(db: Session, order_id: int):
    total = (
        db.query(func.sum(Products.price * OrderItem.quantity))
        .join(Products, Products.id == OrderItem.product_id)
        .filter(OrderItem.order_id == order_id)
        .scalar()
    )
    return total or 0
