from fastapi import APIRouter, HTTPException, Depends
from ..config.supabase_setup import supabase, execute_with_admin
from ..models.users import PremiumSubscription
from ..api.users import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.post("/premium")
async def subscribe_to_premium(
    subscription: PremiumSubscription,
    current_user: dict = Depends(get_current_user)
):
    """
    Subscribe to premium for one month.
    Auto-renewal is optional and off by default.
    """
    try:
        # TODO: Implement actual payment processing here
        
        # Calculate new expiration date
        new_expires_at = datetime.utcnow() + timedelta(days=30)
        
        # Update user's premium status
        response = execute_with_admin(
            supabase.table('users')
            .update({
                'premium_expires_at': new_expires_at.isoformat(),
                'auto_renew_premium': subscription.auto_renew
            })
            .eq('id', current_user['id'])
        )
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to update subscription")
            
        return {
            "message": "Successfully subscribed to premium",
            "expires_at": new_expires_at,
            "auto_renew": subscription.auto_renew
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/premium/cancel")
async def cancel_premium_auto_renew(current_user: dict = Depends(get_current_user)):
    """
    Cancel premium auto-renewal. The user will remain premium until their current period ends.
    """
    try:
        response = execute_with_admin(
            supabase.table('users')
            .update({
                'auto_renew_premium': False
            })
            .eq('id', current_user['id'])
        )
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to cancel auto-renewal")
            
        return {"message": "Successfully cancelled premium auto-renewal"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/premium/status")
async def get_premium_status(current_user: dict = Depends(get_current_user)):
    """
    Get current premium subscription status
    """
    try:
        user = execute_with_admin(
            supabase.table('users')
            .select('premium_expires_at, auto_renew_premium')
            .eq('id', current_user['id'])
            .single()
        )
        
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        expires_at = user.data.get('premium_expires_at')
        is_premium = expires_at and datetime.fromisoformat(expires_at.replace('Z', '+00:00')) > datetime.utcnow()
        
        return {
            "is_premium": is_premium,
            "expires_at": expires_at,
            "auto_renew": user.data.get('auto_renew_premium', False)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
