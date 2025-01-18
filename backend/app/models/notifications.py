from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Notification(BaseModel):
    user_id: str
    type: str  # 'WITNESS_REQUIRED', 'BET_ACCEPTED', 'VERIFICATION_COMPLETE', 'BET_COMPLETE'
    message: str
    read: bool = False
    created_at: datetime