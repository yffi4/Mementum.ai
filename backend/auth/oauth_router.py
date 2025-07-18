import logging
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, get_async_db
from jwt_auth.auth import create_access_token, get_current_active_user, oauth2_scheme, create_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from models import User
from .google_oauth import google_oauth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])

# Защищенные эндпоинты с авторизацией
protected_router = APIRouter(prefix="/auth", tags=["authentication"], dependencies=[Depends(oauth2_scheme)])


@router.get("/google")
def google_login():
    """Перенаправить на Google OAuth"""
    auth_url = google_oauth_service.get_authorization_url()
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    db: Session = Depends(get_db),
):
    """Обработать callback от Google OAuth"""
    try:
        print(f"DEBUG: Processing Google OAuth callback with code: {code[:20]}...")
        logger.info(f"Processing Google OAuth callback with code: {code[:20]}...")
        
        token_data = google_oauth_service.exchange_code_for_tokens(code)
        print(f"DEBUG: Successfully exchanged code for tokens")
        print(f"DEBUG: Token data keys: {list(token_data.keys())}")
        print(f"DEBUG: User info: {token_data.get('user_info', {})}")
        logger.info("Successfully exchanged code for tokens")
        
        user = google_oauth_service.create_or_update_user(db, token_data)
        print(f"DEBUG: User created/updated: {user.email}, ID: {user.id}")
        logger.info(f"User created/updated: {user.email}")

        # Создать JWT access токен и refresh токен для аутентификации в приложении
        access_token = create_access_token(data={"sub": user.email})
        
        # Для создания refresh токена нужна async session
        from database import AsyncSessionLocal
        async with AsyncSessionLocal() as async_db:
            refresh_token = await create_refresh_token(user.id, async_db)
            
        print(f"DEBUG: JWT tokens created")
        logger.info("JWT tokens created")
        
        # Перенаправить на фронтенд с параметром успеха
        base_frontend = os.getenv("FRONTEND_URL")
        if not base_frontend:
            raise HTTPException(status_code=500, detail="FRONTEND_URL environment variable is not set")
        frontend_url = base_frontend.rstrip("/") + "/login"
        redirect_response = RedirectResponse(url=f"{frontend_url}?auth=success")

        # Установить cookies с токенами
        redirect_response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # False для localhost
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # 30 минут
        )
        
        redirect_response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # False для localhost
            samesite="lax",
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # 7 дней
        )
        print(f"DEBUG: Cookie set successfully, redirecting to frontend")
        logger.info("Cookie set successfully, redirecting to frontend")
        
        return redirect_response
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR: Google OAuth callback error: {str(e)}")
        print(f"ERROR: Full traceback: {error_details}")
        logger.error(f"Google OAuth callback error: {str(e)}")
        logger.error(f"Full traceback: {error_details}")
        base_frontend = os.getenv("FRONTEND_URL")
        if not base_frontend:
            raise HTTPException(status_code=500, detail="FRONTEND_URL environment variable is not set")
        frontend_url = base_frontend.rstrip("/") + "/login"
        return RedirectResponse(url=f"{frontend_url}?error={str(e)}")


@router.get("/status")
async def get_auth_status(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить статус авторизации пользователя"""
    from models import GoogleToken
    from sqlalchemy import select
    
    result = await db.execute(select(GoogleToken).filter(
        GoogleToken.user_id == current_user.id
    ))
    google_token = result.scalar_one_or_none()
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "google_connected": google_token is not None,
            "google_name": current_user.google_name,
            "google_picture": current_user.google_picture
        },
        "google_token_expires": google_token.expires_at if google_token else None
    }


@router.get("/test-cookie")
def test_cookie(request: Request):
    """Тестовый endpoint для проверки cookies"""
    token = request.cookies.get("access_token")
    return {
        "has_cookie": token is not None,
        "cookie_length": len(token) if token else 0,
        "cookie_start": token[:20] if token else None
    }


@router.post("/logout")
def logout(response: Response):
    """Выйти из системы"""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


@protected_router.delete("/google/disconnect")
async def disconnect_google(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Отключить Google аккаунт"""
    from models import GoogleToken
    from sqlalchemy import select
    
    result = await db.execute(select(GoogleToken).filter(
        GoogleToken.user_id == current_user.id
    ))
    google_token = result.scalar_one_or_none()
    
    if google_token:
        await db.delete(google_token)
        # Очистить Google данные пользователя
        current_user.google_id = None
        current_user.google_email = None
        current_user.google_name = None
        current_user.google_picture = None
        await db.commit()
    
    return {"message": "Google account disconnected successfully"} 