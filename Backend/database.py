from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

#Sqlite database URL
DATABASE_URL = "mysql+mysqlconnector://sales_user:Sales%40123@localhost:3306/sales_db"
DB_URL = "sqlite:///./sales.db"

#Create database engine
engine = create_engine(DATABASE_URL,echo = True,pool_pre_ping = True)
#engine = create_engine(DB_URL,connect_args={"check_same_thread":False})

#Create session
SessionLocal = sessionmaker(autocommit = False,autoflush=False,bind=engine)

#Base class for models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()