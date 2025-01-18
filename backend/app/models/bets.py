from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BetCreate(BaseModel):
    group_id: str
    description: str
    reward_type: str  # 'coffee', 'pushups', etc.
    target_quantity: int
    bet_type: str    # 'one_to_many' or 'many_to_many'
    required_witnesses: int = 2

class BetContribution(BaseModel):
    bet_id: str
    quantity: int
    bet_side: str = "for"  # "for" or "against" for many_to_many

class BetResponse(BaseModel):
    id: str
    description: str
    reward_type: str
    target_quantity: int
    current_total: int
    status: str
    created_at: datetime