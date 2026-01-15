from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session,joinedload

from database import get_db
from models.sales_order import SalesOrder
from models.order_item import OrderItem
from models.products import Products
from schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


# ---------------- HELPER ----------------
def get_order_total(order: SalesOrder) -> float:
    total = 0.0
    for item in order.items:
        total += item.quantity * item.product.price
    return total

@router.get("/{order_id}/paid",response_model=OrderResponse)
def pay_order(order_id : int,db : Session = Depends(get_db)):
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.paid: # type: ignore
        raise HTTPException(status_code=400,detail="order already paid")
    
    order.paid = True # type: ignore
    db.commit()

    return  {
        "id": order.id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "customer_address": order.customer_address,
        "created_at": order.created_at,
        "order_paid" : order.paid,
        "invoice_generated" : order.invoice_generated,
        "total_amount": get_order_total(order),
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name,
                "price": item.product.price,
                "quantity": item.quantity,
            }
            for item in order.items
        ]}
# ---------------- CREATE ORDER ----------------

@router.post("/", response_model=OrderResponse)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    try:
        # 1️⃣ Create order
        order = SalesOrder(
            customer_name=data.customer.name,
            customer_email=data.customer.email,
            customer_phone=data.customer.phone,
            customer_address=data.customer.address,
            paid = False,
            invoice_generated = False
        )
        db.add(order)
        db.flush()  # generates order.id

        # 2️⃣ Validate items + reduce stock
        for item in data.items:
            product = (
                db.query(Products)
                .filter(Products.id == item.product_id)
                .with_for_update()
                .first()
            )

            if not product:
                raise HTTPException(status_code=404, detail="Product not found")

            if product.stock < item.quantity: # type: ignore
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {product.name}"
                )

            product.stock -= item.quantity # type: ignore

            db.add(OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity
            ))

        # 3️⃣ Commit transaction
        db.commit()

        # 4️⃣ Reload order with items + products
        order = (
            db.query(SalesOrder)
            .options(
                joinedload(SalesOrder.items)
                .joinedload(OrderItem.product)
            )
            .filter(SalesOrder.id == order.id)
            .first()
        )

        # 5️⃣ Build response manually
        return {
            "id": order.id, # type: ignore
            "customer_name": order.customer_name, # type: ignore
            "customer_email": order.customer_email, # type: ignore
            "customer_phone": order.customer_phone, # type: ignore
            "customer_address": order.customer_address, # type: ignore
            "created_at": order.created_at, # type: ignore
            "total_amount": get_order_total(order),
            "order_paid":order.paid, # type: ignore
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "price": item.product.price,
                    "quantity": item.quantity,
                }
                for item in order.items # type: ignore
            ]
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- GET ALL ORDERS ----------------
# ---------------- GET ALL ORDERS ----------------
@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(SalesOrder)
        .options(
            joinedload(SalesOrder.items)
            .joinedload(OrderItem.product)
        )
        .all()
    )

    response = []

    for order in orders:
        response.append({
            "id": order.id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "customer_address": order.customer_address,
            "created_at": order.created_at,
            "order_paid" : order.paid,
            "invoice_generated" : order.invoice_generated,
            "total_amount": get_order_total(order),
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "price": item.product.price,
                    "quantity": item.quantity,
                }
                for item in order.items
            ]
        })

    return response

#------------------PAY ORDER------------------------
@router.post("/{order_id}/generate_invoice")
def generate_invoice(order_id : int,db : Session = Depends(get_db)):
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404,detail="Order not found")
    order.invoice_generated = True # type: ignore
    db.commit()

    return {"message" : "invoice generated","invoice_id" : f"INV - {order.id}","order_id" : order.id}



# ---------------- GET SINGLE ORDER ----------------
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(SalesOrder)
        .options(
            joinedload(SalesOrder.items)
            .joinedload(OrderItem.product)
        )
        .filter(SalesOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "customer_address": order.customer_address,
        "created_at": order.created_at,
        "order_paid" : order.paid,
        "invoice_generated" : order.invoice_generated,
        "total_amount": get_order_total(order),
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name,
                "price": item.product.price,
                "quantity": item.quantity,
            }
            for item in order.items
        ]
    }



# ---------------- DELETE ORDER ----------------
@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()

    return {"message": "Order deleted successfully"}
