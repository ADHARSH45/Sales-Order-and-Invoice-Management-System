from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sales_order import SalesOrder
from models.order_item import OrderItem
from models.products import Products
from schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):

    order = SalesOrder(customer_id=data.customer_id)
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in data.items:
        product = db.query(Products).filter(Products.id == item.product_id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if  product.stock < item.quantity: # type: ignore
            raise HTTPException(status_code=400, detail="Insufficient stock")

        product.stock -= item.quantity # type: ignore

        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order
