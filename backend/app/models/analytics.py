from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class UserStats(BaseModel):
    total_bets: int
    wins: int
    losses: int
    win_rate: float
    total_rewards_won: Dict[str, int]  # e.g., {"coffee": 10, "pushups": 50}

class GroupStats(BaseModel):
    total_bets: int
    active_bets: int
    total_members: int
    most_popular_reward: str
    most_active_bettor: str