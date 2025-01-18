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

class GroupMember(BaseModel):
    user_id: str
    username: str
    joined_at: datetime