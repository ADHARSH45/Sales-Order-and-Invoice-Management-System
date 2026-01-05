from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.products import Products
from schemas.products import ProductCreate,ProductResponse,ProductUpdate

router = APIRouter(prefix="/products",tags=["products"])

@router.post("/",response_model=ProductResponse)
def create_product(product:ProductCreate,db:Session = Depends(get_db)):
    new_product = Products(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/",response_model=list[ProductResponse])
def get_products(db:Session = Depends(get_db)):
    return db.query(Products).all()

@router.get("/{product_id}",response_model=ProductResponse)
def get_customer(product_id:int , db:Session = Depends(get_db)):
    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404,detail="Product not Found")
    return product

@router.put("/{product_id}",response_model=ProductResponse)
def update_customer(product_id:int , product_data:ProductUpdate, db :Session = Depends(get_db)):
    print("hi")
    product = db.query(Products).filter(Products.id == product_id).first()
    #print(type(customer))
    if not product:
        raise HTTPException(status_code=404,detail="Product Not found")
    
    for key,value in product_data.model_dump(exclude_unset=True).items():
        setattr(product,key,value)
    db.commit()
    db.refresh(product)
    return product
        
    
@router.delete("/{product_id}")
def delete_customer(product_id:int, db:Session = Depends(get_db)):
    product = db.query(Products).filter(Products.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404,detail="Customer not found")
    
    db.delete(product)
    db.commit()
    return {"message":"Products deleted successfully"}




