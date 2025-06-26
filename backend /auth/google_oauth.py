from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import httpx
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models import User, GoogleToken
from config import settings


class GoogleOAuthService:
    def __init__(self):
        self.client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        }
        self.scopes = [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/calendar'
        ]

    def get_authorization_url(self) -> str:
        """Получить URL для OAuth авторизации"""
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.scopes
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        return authorization_url

    def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """Обменять authorization code на токены"""
        flow = Flow.from_client_config(
            self.client_config,
            scopes=self.scopes
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        
        try:
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Получить информацию о пользователе
            user_info = self._get_user_info(credentials.token)
            
            return {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'expires_at': credentials.expiry,
                'scope': ' '.join(credentials.scopes),
                'user_info': user_info
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange code for tokens: {str(e)}"
            )

    def _get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Получить информацию о пользователе из Google API"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            response = httpx.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to get user info: {str(e)}"
            )

    def create_or_update_user(self, db: Session, token_data: Dict[str, Any]) -> User:
        """Создать или обновить пользователя после OAuth"""
        try:
            user_info = token_data['user_info']
            google_id = user_info['id']
            
            print(f"DEBUG: Processing user with Google ID: {google_id}, email: {user_info['email']}")
            
            # Найти пользователя по Google ID или email
            user = db.query(User).filter(User.google_id == google_id).first()
            if not user:
                user = db.query(User).filter(User.email == user_info['email']).first()
            
            if user:
                print(f"DEBUG: Updating existing user: {user.email}")
                # Обновить существующего пользователя
                user.google_id = google_id
                user.google_email = user_info['email']
                user.google_name = user_info['name']
                user.google_picture = user_info.get('picture')
                if not user.email:
                    user.email = user_info['email']
                if not user.username:
                    user.username = user_info['email'].split('@')[0]
            else:
                print(f"DEBUG: Creating new user: {user_info['email']}")
                # Создать нового пользователя
                user = User(
                    username=user_info['email'].split('@')[0],
                    email=user_info['email'],
                    google_id=google_id,
                    google_email=user_info['email'],
                    google_name=user_info['name'],
                    google_picture=user_info.get('picture')
                )
                db.add(user)
                db.commit()  # ПЕРВЫЙ COMMIT для сохранения пользователя
                db.refresh(user)  # Получить ID
                print(f"DEBUG: Created user with ID: {user.id}")

            # Создать или обновить токены
            google_token = db.query(GoogleToken).filter(GoogleToken.user_id == user.id).first()
            if google_token:
                print(f"DEBUG: Updating existing token for user {user.id}")
                google_token.access_token = token_data['access_token']
                google_token.refresh_token = token_data.get('refresh_token') or google_token.refresh_token
                google_token.expires_at = token_data['expires_at']
                google_token.scope = token_data['scope']
                google_token.updated_at = datetime.utcnow()
            else:
                print(f"DEBUG: Creating new token for user {user.id}")
                google_token = GoogleToken(
                    user_id=user.id,
                    access_token=token_data['access_token'],
                    refresh_token=token_data['refresh_token'],
                    expires_at=token_data['expires_at'],
                    scope=token_data['scope']
                )
                db.add(google_token)

            db.commit()  # ВТОРОЙ COMMIT для сохранения токена
            db.refresh(user)
            print(f"DEBUG: Successfully saved user and token")
            return user
            
        except Exception as e:
            print(f"ERROR in create_or_update_user: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            db.rollback()
            raise

    def refresh_token_if_needed(self, db: Session, user_id: int) -> Optional[GoogleToken]:
        """Обновить токен если он истекает"""
        google_token = db.query(GoogleToken).filter(GoogleToken.user_id == user_id).first()
        
        if not google_token:
            return None
            
        # Проверить, нужно ли обновить токен (за 5 минут до истечения)
        if google_token.expires_at <= datetime.utcnow() + timedelta(minutes=5):
            if not google_token.refresh_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token not available. Please re-authenticate."
                )
            
            try:
                credentials = Credentials(
                    token=google_token.access_token,
                    refresh_token=google_token.refresh_token,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GOOGLE_CLIENT_ID,
                    client_secret=settings.GOOGLE_CLIENT_SECRET
                )
                
                credentials.refresh(Request())
                
                # Обновить токен в БД
                google_token.access_token = credentials.token
                google_token.expires_at = credentials.expiry
                google_token.updated_at = datetime.utcnow()
                
                db.commit()
                db.refresh(google_token)
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Failed to refresh token: {str(e)}"
                )
        
        return google_token

    def get_calendar_service(self, db: Session, user_id: int):
        """Получить Google Calendar service для пользователя"""
        google_token = self.refresh_token_if_needed(db, user_id)
        
        if not google_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google account not connected"
            )
        
        credentials = Credentials(
            token=google_token.access_token,
            refresh_token=google_token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET
        )
        
        return build('calendar', 'v3', credentials=credentials)


google_oauth_service = GoogleOAuthService() 