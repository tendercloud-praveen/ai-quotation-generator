import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
print("DATABASE_URL:", DATABASE_URL)

# First create the engine
engine = create_engine(DATABASE_URL)

# Then create SessionLocal using the engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

try:
    with engine.connect() as connection:
        print("✅ Database Connected Successfully!")
except Exception as e:
    print("❌ Database Connection Failed!")
    print(e)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

