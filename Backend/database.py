from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

#Sqlite database URL
DATABASE_URL = "sqlite:///./sales.db"

#Create database engine
engine = create_engine(DATABASE_URL,connect_args={"check_same_thread":False})

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