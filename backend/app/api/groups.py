from fastapi import APIRouter, HTTPException, Depends
from ..config.supabase_setup import supabase, execute_with_admin
from typing import List, Optional
from ..models.groups import GroupCreate, GroupResponse, GroupMember
from ..api.users import get_current_user
from datetime import datetime

router = APIRouter(prefix="/groups", tags=["groups"])

@router.get("/public", response_model=List[GroupResponse])
async def get_public_groups(
    limit: int = 10,
    offset: int = 0,
    search: Optional[str] = None
):
    """Get public groups with optional search"""
    try:
        query = supabase.table('groups')\
            .select('*')\
            .eq('is_private', False)
            
        if search:
            query = query.ilike('name', f'%{search}%')
            
        query = query.range(offset, offset + limit - 1)
        
        response = execute_with_admin(query)
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=GroupResponse)
async def create_group(group: GroupCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Get user's current group count and premium status
        user = execute_with_admin(
            supabase.table('users')
            .select('groups_created, premium_expires_at')
            .eq('id', current_user['id'])
            .single()
        )
        
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        is_premium = user.data['premium_expires_at'] and \
                    datetime.fromisoformat(user.data['premium_expires_at'].replace('Z', '+00:00')) > datetime.utcnow()
            
        # Check if non-premium user has reached group limit
        if not is_premium and user.data['groups_created'] >= 1:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Free users can only create 1 group. "
                    "Upgrade to premium for unlimited groups! "
                    "Premium subscription is valid for one month."
                )
            )
        
        # Create the group
        group_response = execute_with_admin(
            supabase.table('groups').insert({
                "name": group.name,
                "is_private": group.is_private
            })
        )
        
        if not group_response.data:
            raise HTTPException(status_code=400, detail="Failed to create group")
            
        group_id = group_response.data[0]['id']
        
        # Add creator as member
        member_response = execute_with_admin(
            supabase.table('group_members').insert({
                "group_id": group_id,
                "user_id": current_user['id'],
                "is_admin": True  # Creator is automatically an admin
            })
        )
        
        return group_response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Get the group
        group = execute_with_admin(
            supabase.table('groups')
            .select('*')
            .eq('id', group_id)
            .single()
        )
        
        if not group.data:
            raise HTTPException(status_code=404, detail="Group not found")
            
        # Check if user is a member
        member_check = execute_with_admin(
            supabase.table('group_members')
            .select('*')
            .eq('group_id', group_id)
            .eq('user_id', current_user['id'])
        )
        
        # If group is private and user is not a member, deny access
        if group.data['is_private'] and not member_check.data:
            raise HTTPException(status_code=403, detail="You don't have access to this group")
            
        return group.data
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{join_code}/join")
async def join_group(join_code: str, current_user: dict = Depends(get_current_user)):
    try:
        # First find the group
        group = execute_with_admin(
            supabase.table('groups')
            .select('id')
            .eq('join_code', join_code)
            .single()
        )
        
        if not group.data:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Check if user is already a member
        existing_member = execute_with_admin(
            supabase.table('group_members')
            .select('id')
            .eq('group_id', group.data['id'])
            .eq('user_id', current_user['id'])
        )
            
        if existing_member.data:
            raise HTTPException(status_code=400, detail="You are already a member of this group")
        
        # Add user to group
        response = execute_with_admin(
            supabase.table('group_members').insert({
                "group_id": group.data['id'],
                "user_id": current_user['id']
            })
        )
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to join group")
        
        return {"message": "Successfully joined group"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{group_id}/leave")
async def leave_group(group_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if user is the last admin
        admins = execute_with_admin(
            supabase.table('group_members')
            .select('user_id')
            .eq('group_id', group_id)
            .eq('is_admin', True)
        )
        
        if len(admins.data) == 1 and admins.data[0]['user_id'] == current_user['id']:
            raise HTTPException(
                status_code=400, 
                detail="You are the last admin. Please assign another admin before leaving."
            )
        
        response = execute_with_admin(
            supabase.table('group_members')
            .delete()
            .eq('group_id', group_id)
            .eq('user_id', current_user['id'])
        )
        return {"message": "Successfully left group"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{group_id}/members", response_model=List[GroupMember])
async def get_group_members(group_id: str, current_user: dict = Depends(get_current_user)):
    try:
        response = execute_with_admin(
            supabase.table('group_members')
            .select('user_id, users(email), joined_at')
            .eq('group_id', group_id)
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))