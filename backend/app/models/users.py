from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class UserProfile(BaseModel):
    username: str
    email: str
    created_at: datetime
    premium_expires_at: Optional[datetime] = None
    auto_renew_premium: bool = False
    groups_created: int = 0

    @property
    def is_premium(self) -> bool:
        if not self.premium_expires_at:
            return False
        return self.premium_expires_at > datetime.utcnow()

class UserProfileUpdate(BaseModel):
    username: Optional[str]
    email: Optional[str]
    auto_renew_premium: Optional[bool]

class CreateUserBody(BaseModel):
    username: str
    email: str
    password: str  # For Firebase auth

class PremiumSubscription(BaseModel):
    auto_renew: bool = False

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    joined_at: date
    premium_expires_at: Optional[datetime] = None
    auto_renew_premium: bool = False
    groups_created: int = 0
    total_bets: Optional[int] = 0
    wins: Optional[int] = 0

    @property
    def is_premium(self) -> bool:
        if not self.premium_expires_at:
            return False
        return self.premium_expires_at > datetime.utcnow()

class UserStats(BaseModel):
    total_bets: int
    wins: int
    losses: int