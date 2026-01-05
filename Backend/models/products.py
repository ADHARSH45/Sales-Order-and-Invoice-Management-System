from sqlalchemy import Column,Integer,Float,String,Boolean,DateTime
from datetime import datetime
from database import Base

class Products(Base):
    __tablename__ = "Products"

    id = Column(Integer,primary_key=True,index = True)
    name = Column(String,nullable =False)
    description = Column(String)
    price = Column(Float,nullable = False)
    stock = Column(Integer,default=0)
    is_active = Column(Boolean,default = True)
    created_at = Column(DateTime,default = datetime.now())

