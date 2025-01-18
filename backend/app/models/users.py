from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserProfile(BaseModel):
    username: str
    email: str
    created_at: datetime

class UserProfileUpdate(BaseModel):
    username: Optional[str]
    email: Optional[str]