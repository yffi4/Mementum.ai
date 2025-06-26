from fastapi import FastAPI
from jwt_auth.router import router as auth_router
from notes.router import router as notes_router
from ai_agent.router import router as ai_agent_router
from auth.oauth_router import router as oauth_router
from database import async_engine
from models import Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Notes Manager",
    description="Интеллектуальная система управления заметками с AI агентом и Google Calendar",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173", 
                   "chrome-extension://*"],  # Vite dev server
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
app.include_router(notes_router, prefix="/notes", tags=["notes"])
app.include_router(ai_agent_router, prefix="/ai-agent", tags=["ai-agent"])





