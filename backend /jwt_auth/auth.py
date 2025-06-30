from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from database import get_async_db
from .shemas import TokenData, UserCreate, Token
from models import User, RefreshToken
from passlib.context import CryptContext
from passlib.hash import bcrypt
import jwt
from jwt import InvalidTokenError
from datetime import datetime, timedelta, timezone
import os
import secrets
from typing import Annotated, Optional
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 минут для access токена
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 дней для refresh токена

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password, username=user.username)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def get_user(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def create_refresh_token(user_id: int, db: AsyncSession) -> str:
    """Создание нового refresh токена"""
    # Деактивируем старые refresh токены пользователя
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id)
        .values(is_active=False)
    )
    
    # Создаем новый refresh токен
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    
    db.add(refresh_token)
    await db.commit()
    
    return token


async def verify_refresh_token(token: str, db: AsyncSession) -> Optional[User]:
    """Проверка refresh токена и возврат пользователя"""
    try:
        # Ищем активный refresh токен
        result = await db.execute(
            select(RefreshToken, User)
            .join(User, RefreshToken.user_id == User.id)
            .where(
                RefreshToken.token == token,
                RefreshToken.is_active == True,
                RefreshToken.expires_at > datetime.utcnow()
            )
        )
        
        row = result.first()
        if not row:
            return None
            
        refresh_token, user = row
        
        # Обновляем время последнего использования
        refresh_token.last_used_at = datetime.utcnow()
        await db.commit()
        
        return user
        
    except Exception:
        return None

async def get_current_user(request: Request, db: AsyncSession = Depends(get_async_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Попробуем получить токен из заголовка Authorization (для Swagger)
    token = None
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    # Если токена нет в заголовке, попробуем получить из cookies
    if not token:
        token = request.cookies.get("access_token")
    
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
        user = await get_user(db, email=email)
        if user is None:
            raise credentials_exception
        return user
        
    except InvalidTokenError:
        # Если access токен истек, возвращаем 401 - фронтенд сам обновит токен
        raise credentials_exception

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user







