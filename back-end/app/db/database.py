from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# URL for the db
DATABASE_URL="sqlite:///./submissions.db"

# Creates an engine for the URL
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Creates a local session to access the db
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
