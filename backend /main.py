from fastapi import FastAPI
from fastapi.security import HTTPBearer, OAuth2PasswordBearer
from jwt_auth.router import router as auth_router
from notes.router import router as notes_router
from ai_agent.router import router as ai_agent_router
from auth.oauth_router import router as oauth_router, protected_router as oauth_protected_router
from google_calendar.router import router as calendar_router
from database import async_engine
from models import Base
from fastapi.middleware.cors import CORSMiddleware
import os

# Глобальная схема безопасности для Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

app = FastAPI(
    title="AI Notes Manager",
    description="Интеллектуальная система управления заметками с AI агентом и Google Calendar",
    version="1.0.0",
    # Добавляем конфигурацию безопасности для Swagger
    swagger_ui_parameters={
        "persistAuthorization": True,
    }
)

# CORS middleware
frontend_urls_env = os.getenv("FRONTEND_URLS", os.getenv("FRONTEND_URL", ""))
if frontend_urls_env:
    frontend_urls = frontend_urls_env.split(",")
    frontend_urls.extend(["chrome-extension://*"])  # Добавляем поддержку расширений
else:
    frontend_urls = ["chrome-extension://*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
async def startup():
    # Создаем таблицы при запуске (для разработки)
    pass

@app.get("/")
def read_root():
    return {
        "message": "AI Notes Manager API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "notes": "/notes", 
            "ai_agent": "/ai-agent",
            "calendar": "/calendar"
        }
    }

app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(oauth_router)  # OAuth роутер уже имеет prefix="/auth"
app.include_router(oauth_protected_router)  # Защищенные OAuth эндпоинты
app.include_router(notes_router, prefix="/notes", tags=["notes"])
app.include_router(ai_agent_router, prefix="/ai-agent", tags=["ai-agent"])
app.include_router(calendar_router, prefix="/calendar", tags=["calendar"])





