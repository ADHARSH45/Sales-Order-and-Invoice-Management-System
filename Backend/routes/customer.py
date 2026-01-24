from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.customers import Customer
from schemas.customer import CustomerCreate,CustomerResponse,CustomerUpdate

router = APIRouter(prefix="/customers",tags=["customers"])

@router.post("/",response_model=CustomerResponse)
def create_customer(customer:CustomerCreate,db:Session = Depends(get_db)):
    db_customer = Customer(name = customer.name,phone = customer.phone,email = customer.email,address = customer.address)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/",response_model=list[CustomerResponse])
def get_customers(db:Session = Depends(get_db)):
    return db.query(Customer).all()

@router.get("/{customer_id}",response_model=CustomerResponse)
def get_customer(customer_id:int , db:Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404,detail="Customer not Found")
    return customer

@router.put("/{customer_id}",response_model=CustomerResponse)
def update_customer(customer_id:int , customer_data:CustomerUpdate, db :Session = Depends(get_db)):
    print("hi")
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    #print(type(customer))
    if not customer:
        raise HTTPException(status_code=404,detail="Customer Not found")
    
    if customer_data.name is not None:
        customer.name = customer_data.name  # type: ignore
    if customer_data.phone is not None:
        customer.phone = customer_data.phone  # type: ignore
    if customer_data.email is not None:
        customer.email = customer_data.email  # type: ignore
    if customer_data.address is not None:
        customer.address = customer_data.address  # type: ignore
    db.commit()
    db.refresh(customer)
    return customer
        
@router.patch("/")
@router.delete("/{customer_id}")
def delete_customer(customer_id:int, db:Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404,detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return {"message":"customer deleted successfully"}




