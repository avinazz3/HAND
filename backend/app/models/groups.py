from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GroupCreate(BaseModel):
    name: str
    is_private: bool = True

class GroupResponse(BaseModel):
    id: str
    name: str
    join_code: str
    is_private: bool
    created_at: datetime
    firebase_uid: Optional[str] = None
    created_by: Optional[str] = None
    current_user_email: Optional[str] = None

class GroupMember(BaseModel):
    user_id: str
    username: Optional[str] = None
    email: Optional[str] = None
    is_admin: bool = False
    joined_at: datetime

class GroupStats(BaseModel):
    total_bets: int
    active_bets: int
    total_members: int