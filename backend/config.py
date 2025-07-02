from pathlib import Path
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()
class Settings(BaseSettings):
    DEBUG: bool = Field(default=False)
    SECRET_KEY: str = Field(default=os.getenv("SECRET_KEY"))
    GOOGLE_CLIENT_ID: str = Field(default=os.getenv("GOOGLE_CLIENT_ID"))
    GOOGLE_CLIENT_SECRET: str = Field(default=os.getenv("GOOGLE_CLIENT_SECRET"))
    GOOGLE_REDIRECT_URI: str = Field(default=os.getenv("GOOGLE_REDIRECT_URI"))
    # FRONTEND_URLS : str
    REDIS_URL: str = Field(default=os.getenv("REDIS_URL"))
    CELERY_BROKER_URL: str = Field(default=os.getenv("REDIS_URL"))
    CELERY_RESULT_BACKEND: str = Field(default=os.getenv("REDIS_URL"))
    OPENAI_API_KEY : str = Field(default=os.getenv("OPENAI_API_KEY"))
    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")

settings = Settings()


