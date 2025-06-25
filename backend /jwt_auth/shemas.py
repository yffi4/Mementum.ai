from pydantic import BaseModel
from datetime import datetime
class User(BaseModel):
    id: int
    username: str
    email: str
    is_pro: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    
class UserUpdate(BaseModel):
    username: str
    email: str
    password: str
    

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserInDB(User):
    hashed_password: str


