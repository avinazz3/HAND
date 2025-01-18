from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class UserProfile(BaseModel):
    username: str
    email: str
    created_at: datetime

class UserProfileUpdate(BaseModel):
    username: Optional[str]
    email: Optional[str]

class CreateUserBody(BaseModel):
    username: str
    email: str
    password: str  # For Firebase auth

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    joined_at: date
    total_bets: Optional[int] = 0
    wins: Optional[int] = 0

class UserStats(BaseModel):
    total_bets: int
    wins: int
    losses: int