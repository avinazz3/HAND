from fastapi import APIRouter, HTTPException
from ..config.supabase_setup import supabase
from ..models.notifications import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])

async def notify_witnesses_required(bet_id: str):
    try:
        # Get group members who could be witnesses
        bet = supabase.table('bets')\
            .select('group_id')\
            .eq('id', bet_id)\
            .single()\
            .execute()
            
        if bet.data:
            group_members = supabase.table('group_members')\
                .select('user_id')\
                .eq('group_id', bet.data['group_id'])\
                .execute()
                
            # Create notifications for each potential witness
            for member in group_members.data:
                await create_notification(
                    member['user_id'],
                    'WITNESS_REQUIRED',
                    f'Your verification is needed for a bet'
                )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def create_notification(user_id: str, type: str, message: str):
    try:
        response = supabase.table('notifications').insert({
            "user_id": user_id,
            "type": type,
            "message": message
        }).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Notification])
async def get_notifications(user_id: str):
    try:
        response = supabase.table('notifications')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))