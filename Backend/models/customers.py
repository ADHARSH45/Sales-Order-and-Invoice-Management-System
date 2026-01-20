from sqlalchemy import Column,Integer,String,Float
from database import Base

class Customer(Base):

    __tablename__ = "Customers"

    id = Column(Integer,primary_key = True,index = True)
    name = Column(String(255),nullable=True)
    phone = Column(String(255),nullable = True)
    email = Column(String(255),nullable = True)
    address = Column(String(255),nullable = True)
    total_amount = Column(Float,nullable = True,default=0.0)
    total_orders = Column(Integer,nullable = True,default = 0)
    score = Column(Integer,nullable = True,default = 0)
    
    