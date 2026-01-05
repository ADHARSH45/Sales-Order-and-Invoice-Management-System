from fastapi import FastAPI
from database import Base,engine
from models.customers import Customer
from routes.customer import router as customer_router
from routes.products import router as product_router

app = FastAPI(title="Sales Order and Invoice Management System")

Base.metadata.create_all(bind = engine)

@app.get("/")
def root():
    return {"message":"backend is running"}

app.include_router(customer_router)
app.include_router(product_router)