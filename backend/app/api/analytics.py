from fastapi import APIRouter, HTTPException
from ..config.supabase_setup import supabase
from typing import List, Optional
from ..models.users import UserStats
from ..models.groups import GroupStats

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/users/{user_id}/stats", response_model=UserStats)
async def get_user_win_rate(user_id: str):
    try:
        # Get all bets where user participated
        bets = supabase.rpc('calculate_user_stats', {
            'user_id': user_id
        }).execute()
        
        return bets.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/groups/{group_id}/stats", response_model=GroupStats)
async def get_group_stats(group_id: str):
    try:
        stats = supabase.rpc('calculate_group_stats', {
            'group_id': group_id
        }).execute()
        
        return stats.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))