from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from database import get_async_db
from .auth import *
from .shemas import UserCreate, Token, TokenRefresh, User, UserInDB
from models import User as UserModel, RefreshToken
from datetime import timedelta

router = APIRouter()

# oauth2_scheme импортируется из auth.py

@router.post("/token", response_model=Token)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_async_db)
):
    user = await authenticate_user(db, form_data.username, form_data.password,)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем access и refresh токены
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token = await create_refresh_token(user.id, db)

    # Устанавливаем cookies для веб-приложения
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # 7 дней в секундах
    )
    
    # Возвращаем токены для Swagger UI
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(UserModel).filter(UserModel.email == user.email))
    db_user = result.scalar_one_or_none()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    new_user = await create_user(db, user)
    return new_user

# Функции get_current_user и get_current_active_user импортируются из auth.py

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_async_db)
):
    # Получаем refresh токен из cookie или из тела запроса
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Верифицируем refresh токен
    user = await verify_refresh_token(refresh_token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем новый access токен
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Создаем новый refresh токен
    new_refresh_token = await create_refresh_token(user.id, db)
    
    # Обновляем cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_async_db)
):
    # Получаем refresh токен из cookie
    refresh_token = request.cookies.get("refresh_token")
    
    if refresh_token:
        # Деактивируем refresh токен в базе данных
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.token == refresh_token)
            .values(is_active=False)
        )
        await db.commit()
    
    # Удаляем cookies
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    
    return {"message": "Successfully logged out"}


@router.get("/users/me", response_model=User, dependencies=[Depends(oauth2_scheme)])
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user
