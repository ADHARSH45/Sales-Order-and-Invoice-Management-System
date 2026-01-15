from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base,engine
from models.customers import Customer
from routes.customer import router as customer_router
from routes.products import router as product_router
from routes.order import router as order_route
from routes.invoice import router as invoice_router


app = FastAPI(title="Sales Order and Invoice Management System")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],

)


Base.metadata.create_all(bind = engine)

@app.get("/")
def root():
    return {"message":"backend is running"}

app.include_router(customer_router)
app.include_router(product_router)
app.include_router(order_route)
app.include_router(invoice_router)
