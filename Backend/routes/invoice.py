from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.sales_order import SalesOrder
from models.customers import Customer

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


# ---------------- GET ALL INVOICES ----------------
@router.get("/")
def get_invoices(db: Session = Depends(get_db)):
    orders = db.query(SalesOrder).all()
    
    invoices = []

    for order in orders:
        total_amount = 0
        items = []
        

        for item in order.items:
            product = item.product
            line_total = product.price * item.quantity
            total_amount += line_total

            items.append({
                "product_id": product.id,
                "product_name": product.name,
                "price": product.price,
                "quantity": item.quantity,
                "line_total": line_total
            })

        invoices.append({
            "invoice_id": order.id,
            "order_id": order.id,
            "created_at": order.created_at,

            # ✅ customer data stored in order
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "customer_email" : order.customer_email,
            "customer_address": order.customer_address,

            "total_amount": total_amount,
            "items": items,
            "order_paid" : order.paid
        })

    return invoices


# ---------------- GET SINGLE INVOICE ----------------
@router.get("/{order_id}")
def get_invoice(order_id: int, db: Session = Depends(get_db)):
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Invoice not found")

    total_amount = 0
    items = []

    for item in order.items:
        product = item.product
        line_total = product.price * item.quantity
        total_amount += line_total

        items.append({
            "product_id": product.id,
            "product_name": product.name,
            "price": product.price,
            "quantity": item.quantity,
            "line_total": line_total
        })

    invoice = {
        "invoice_id": order.id,
        "order_id": order.id,
        "created_at": order.created_at,

        # ✅ customer data from order
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "customer_email" : order.customer_email,
        "customer_address": order.customer_address,

        "total_amount": total_amount,
        "items": items,
        "payment_status" : order.paid
    }

    return invoice
