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
        # Build the base query
        query = supabase.table('groups')\
            .select('*')\
            .eq('is_private', False)\
            .order('created_at', desc=True)
            
        if search:
            query = query.ilike('name', f'%{search}%')
            
        # Add pagination
        query = query.range(offset, offset + limit - 1)
        
        # Execute with admin privileges
        result = execute_with_admin(query)
        
        # Handle empty result
        if result is None:
            return []
            
        return result
        
    except Exception as e:
        print(f"Error fetching public groups: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=GroupResponse)
async def create_group(group: GroupCreate, current_user: dict = Depends(get_current_user)):
    try:
        print(f"Creating group with data: {group}")
        print(f"Current user: {current_user}")
        
        # Get user's current group count and premium status
        user_query = supabase.table('users')\
            .select('groups_created, premium_expires_at')\
            .eq('id', current_user['id'])\
            .single()
            
        user_data = execute_with_admin(user_query)
        print(f"User data: {user_data}")
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
            
        is_premium = user_data.get('premium_expires_at') and \
                    datetime.fromisoformat(user_data['premium_expires_at'].replace('Z', '+00:00')) > datetime.utcnow()
            
        # Check if non-premium user has reached group limit
        if not is_premium and user_data.get('groups_created', 0) >= 1:
            raise HTTPException(
                status_code=403,
                detail="Free users can only create 1 group. Upgrade to premium for unlimited groups!"
            )
        
        # Create the group using admin client
        group_data = {
            "name": group.name,
            "is_private": group.is_private,
            "firebase_uid": str(current_user['firebase_uid']),  # Store Firebase UID
            "created_by": current_user['id'],  # Keep the UUID foreign key
            "created_at": datetime.utcnow().isoformat()
        }
        print(f"Creating group with data: {group_data}")
        
        group_query = supabase.table('groups').insert(group_data)
        group_result = execute_with_admin(group_query)
        
        if not group_result:
            raise HTTPException(status_code=400, detail="Failed to create group")
            
        group_id = group_result[0]['id']
        print(f"Created group with ID: {group_id}")
        
        # Add creator as admin member
        member_data = {
            "group_id": group_id,
            "user_id": current_user['id'],
            "is_admin": True,
            "joined_at": datetime.utcnow().isoformat()
        }
        print(f"Adding member with data: {member_data}")
        
        member_query = supabase.table('group_members').insert(member_data)
        member_result = execute_with_admin(member_query)
        
        if not member_result:
            # Rollback group creation
            print("Failed to add member, rolling back group creation")
            delete_query = supabase.table('groups').delete().eq('id', group_id)
            execute_with_admin(delete_query)
            raise HTTPException(status_code=400, detail="Failed to add member to group")
        
        # Increment user's group count
        update_query = supabase.table('users')\
            .update({"groups_created": user_data.get('groups_created', 0) + 1})\
            .eq('id', current_user['id'])
            
        execute_with_admin(update_query)
        print("Successfully created group and added member")
        
        return group_result[0]
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error creating group: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, current_user: dict = Depends(get_current_user)):
    try:
        print(f"Getting group {group_id} for user {current_user['id']}")
        
        # Get the group using admin client
        group_query = supabase.table('groups')\
            .select('*')\
            .eq('id', group_id)\
            .single()
            
        group = execute_with_admin(group_query)
        print(f"Group data: {group}")
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
            
        # Check if user is a member
        member_query = supabase.table('group_members')\
            .select('*')\
            .eq('group_id', group_id)\
            .eq('user_id', current_user['id'])
            
        member = execute_with_admin(member_query)
        print(f"Member data: {member}")
        
        # If group is private and user is not a member or creator, deny access
        if (group['is_private'] and 
            not member and 
            group['firebase_uid'] != current_user['firebase_uid']):
            raise HTTPException(
                status_code=403, 
                detail="You don't have access to this group"
            )
            
        # Add current user info to response
        group['current_user_email'] = current_user.get('email')
            
        return group
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error getting group: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{join_code}/join")
async def join_group(join_code: str, current_user: dict = Depends(get_current_user)):
    try:
        # Find the group using admin client
        group = execute_with_admin(
            supabase.table('groups')
            .select('id')
            .eq('join_code', join_code)
            .single()
        )
        
        if not group.data:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Check if user is already a member using admin client
        existing_member = execute_with_admin(
            supabase.table('group_members')
            .select('id')
            .eq('group_id', group.data['id'])
            .eq('user_id', current_user['id'])
        )
            
        if existing_member.data:
            raise HTTPException(status_code=400, detail="You are already a member of this group")
        
        # Add user to group using admin client
        response = execute_with_admin(
            supabase.table('group_members')
            .insert({
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
        # Check if user is the last admin using admin client
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
        
        # Remove user from group using admin client
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
        print(f"Getting members for group {group_id}")
        
        # First check if group exists and user has access
        group_query = supabase.table('groups')\
            .select('*')\
            .eq('id', group_id)\
            .single()
            
        group = execute_with_admin(group_query)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
            
        # Check if user is a member
        member_query = supabase.table('group_members')\
            .select('*')\
            .eq('group_id', group_id)\
            .eq('user_id', current_user['id'])
            
        member = execute_with_admin(member_query)
        
        # If group is private and user is not a member or creator, deny access
        if (group['is_private'] and 
            not member and 
            group['firebase_uid'] != current_user['firebase_uid']):
            raise HTTPException(
                status_code=403, 
                detail="You don't have access to this group"
            )
        
        # Get all members with their user info
        members_query = supabase.table('group_members')\
            .select(
                'user_id',
                'is_admin',
                'joined_at',
                'users(email, username)'
            )\
            .eq('group_id', group_id)
            
        members = execute_with_admin(members_query)
        print(f"Found {len(members) if members else 0} members")
        
        # Transform the response to match our model
        transformed_members = []
        for member in (members or []):
            user_info = member.get('users', {})
            transformed_members.append({
                'user_id': member['user_id'],
                'username': user_info.get('username'),
                'email': user_info.get('email'),
                'is_admin': member.get('is_admin', False),
                'joined_at': member['joined_at']
            })
        
        return transformed_members
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error getting group members: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))