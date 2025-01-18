from fastapi import APIRouter, HTTPException
from ..config.supabase_setup import supabase
from typing import List, Optional
from ..models.groups import GroupCreate, GroupResponse, GroupMember

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("/", response_model=GroupResponse)
async def create_group(group: GroupCreate):
    try:
        # Create the group
        group_response = supabase.table('groups').insert({
            "name": group.name,
            "is_private": group.is_private
        }).execute()
        
        if not group_response.data:
            raise HTTPException(status_code=400, detail="Failed to create group")
            
        group_id = group_response.data[0]['id']
        
        # Add creator as member
        member_response = supabase.table('group_members').insert({
            "group_id": group_id,
            "user_id": supabase.auth.current_user().id  # Get the current user's ID
        }).execute()
        
        return group_response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{join_code}/join")
async def join_group(join_code: str):
    try:
        # First find the group
        group = supabase.table('groups')\
            .select('id')\
            .eq('join_code', join_code)\
            .single()\
            .execute()
        
        if not group.data:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Add user to group
        response = supabase.table('group_members').insert({
            "group_id": group.data['id'],
            "user_id": "user_id"  # You'll get this from auth
        }).execute()
        
        return {"message": "Successfully joined group"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{group_id}/leave")
async def leave_group(group_id: str):
    try:
        response = supabase.table('group_members')\
            .delete()\
            .eq('group_id', group_id)\
            .eq('user_id', "user_id")\
            .execute()
        return {"message": "Successfully left group"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{group_id}/members", response_model=List[GroupMember])
async def get_group_members(group_id: str):
    try:
        response = supabase.table('group_members')\
            .select('user_id, users(email), joined_at')\
            .eq('group_id', group_id)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/search", response_model=List[GroupResponse])
async def search_public_groups(search_term: Optional[str] = None):
    try:
        query = supabase.table('groups')\
            .select('*')\
            .eq('is_private', False)
            
        if search_term:
            query = query.ilike('name', f'%{search_term}%')
            
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/public", response_model=List[GroupResponse])
async def get_public_groups(
    limit: int = 10,
    offset: int = 0
):
    try:
        response = supabase.table('groups')\
            .select('*')\
            .eq('is_private', False)\
            .range(offset, offset + limit - 1)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))