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
    # FRONTEND_URLS : str
    # REDIS_PORT : str
    # REDIS_HOST: str
    # CELERY_BROKER_URL: str
    # CELERY_RESULT_BACKEND: str
    OPENAI_API_KEY : str = Field(default=os.getenv("OPENAI_API_KEY"))
    class Config:
        env_file = str(Path(__file__).parent.parent / ".env")

settings = Settings()


