from sqlalchemy import create_engine
import asyncio
import os
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import psycopg2

DB_PORT = os.getenv("POSTGRES_PORT", "5432")  # по умолчанию 5432
DB_HOST = os.getenv("POSTGRES_HOST", "db")  # имя контейнера с базой
DB_DB = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")

# Синхронный URL для Alembic
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DB}"

# Асинхронный URL для приложения
ASYNC_DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DB}"

# Синхронный движок для Alembic
engine = create_engine(DATABASE_URL, echo=True)

# Асинхронный движок для приложения
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# Синхронная сессия для Alembic
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Асинхронная сессия для приложения
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

def get_db():
    """Синхронная функция для получения сессии БД (для Alembic)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    """Асинхронная функция для получения сессии БД (для FastAPI)"""
    async with AsyncSessionLocal() as session:
        yield session
