from sqlalchemy import Column, Integer, String, DateTime,Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)

    # Customer snapshot
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(255), nullable=False)
    customer_address = Column(String(255), nullable=True)
    paid = Column(Boolean, default=False)
    invoice_generated = Column(Boolean,default = False)

    created_at = Column(DateTime, default=datetime.now())

    items = relationship("OrderItem", back_populates="order",cascade="all, delete")
