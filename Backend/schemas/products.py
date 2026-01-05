from pydantic import BaseModel

class ProductCreate(BaseModel):
    name:str
    description : str | None = None
    price : float
    stock : int

class ProductUpdate(BaseModel):
    name:str |  None = None
    description : str | None = None
    price : float |None = None
    stock :int | None = None
    is_active : bool |None = None

class ProductResponse(ProductCreate):
    id : int
    is_active : bool

    class config:
        orm_mode = True
