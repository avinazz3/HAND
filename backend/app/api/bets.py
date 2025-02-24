from fastapi import APIRouter, HTTPException
from ..config.supabase_setup import supabase
from ..models.bets import BetCreate, BetResponse, BetContribution
from typing import List, Optional

router = APIRouter(prefix="/bets", tags=["bets"])

@router.post("/one-to-many", response_model=BetResponse)
async def create_one_to_many_bet(bet: BetCreate):
    try:
        bet_data = bet.dict()
        bet_data["bet_type"] = "one_to_many"
        response = supabase.table('bets').insert(bet_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/many-to-many", response_model=BetResponse)
async def create_many_to_many_bet(bet: BetCreate):
    try:
        bet_data = bet.dict()
        bet_data["bet_type"] = "many_to_many"
        response = supabase.table('bets').insert(bet_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/group/{group_id}", response_model=List[BetResponse])
async def get_bets_in_group(group_id: str):
    try:
        response = supabase.table('bets')\
            .select('*')\
            .eq('group_id', group_id)\
            .order('created_at', desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/active", response_model=List[BetResponse])
async def get_active_bets():
    try:
        response = supabase.table('bets')\
            .select('*')\
            .eq('status', 'active')\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/contribute", response_model=BetResponse)
async def contribute_to_bet(contribution: BetContribution):
    try:
        # First get current bet details
        bet = supabase.table('bets')\
            .select('*')\
            .eq('id', contribution.bet_id)\
            .single()\
            .execute()
            
        if not bet.data:
            raise HTTPException(status_code=404, detail="Bet not found")
            
        # Add contribution
        response = supabase.table('bet_contributions').insert({
            "bet_id": contribution.bet_id,
            "user_id": "user_id",  # You'll get this from auth
            "quantity": contribution.quantity,
            "bet_side": contribution.bet_side
        }).execute()
        
        return bet.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/public/top-bets", response_model=List[BetResponse]) 
async def get_top_public_bets(
    limit: int = 10,
    offset: int = 0
):
    try:
        # First get public group ids
        public_groups = supabase.table('groups')\
            .select('id')\
            .eq('is_private', False)\
            .execute()
        
        public_group_ids = [group['id'] for group in public_groups.data]
        
        # Get bets with contributions total
        response = supabase.table('bets')\
            .select('''
                *,
                groups(*),
                users!creator_id(*),
                (
                    SELECT COALESCE(SUM(quantity), 0)
                    FROM bet_contributions
                    WHERE bet_id = bets.id
                ) as current_total
            ''')\
            .in_('group_id', public_group_ids)\
            .order('created_at', desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))