from pydantic import BaseModel

#used when creating a customer
class CustomerCreate(BaseModel):
    name:str
    phone:str
    email:str | None = None
    address:str | None = None
    total_amount : float
    total_orders:int 
    score :int

class CustomerUpdate(BaseModel):
    name:str |None = None
    phone:str|None = None
    email:str|None = None
    address:str|None = None
    
#used when returning customer data
class CustomerResponse(CustomerCreate):
    id:int

    class Config:
        orm_mode = True