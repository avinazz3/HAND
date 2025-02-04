from fastapi import APIRouter, HTTPException, Header, Depends
from ..models.groups import GroupResponse
from ..config.supabase_setup import supabase
from firebase_admin import auth
from ..config.firebase_setup import admin_auth
from typing import List, Optional
from ..models.users import CreateUserBody, UserProfile, UserProfileUpdate, UserResponse
from datetime import datetime
import uuid

router = APIRouter(prefix="/users", tags=["users"])

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(' ')[1]
    try:
        # Verify the Firebase token
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Get user from your Supabase custom user table
        user = supabase.table('users').select('*').eq('firebase_uid', user_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        return user.data[0]
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/", response_model=UserResponse)
async def create_user(body: CreateUserBody):
    try:
        # Create Firebase auth user first
        firebase_user = admin_auth.create_user(
            display_name=body.username,
            email=body.email,
            password=body.password
        )

        # Create Supabase user record with generated UUID and firebase_uid
        user_data = {
            "email": body.email,
            "firebase_uid": firebase_user.uid  # Store Firebase UID in the firebase_uid column
        }
        
        response = supabase.table("users")\
            .insert(user_data)\
            .execute()
        
        created_user = response.data[0]
        
        return {
            "id": created_user['id'],  # Use Supabase UUID
            "username": body.username,
            "email": body.email,
            "joined_at": created_user['created_at'],
            "total_bets": 0,
            "wins": 0
        }

    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-groups", response_model=List[GroupResponse])
async def get_my_groups(current_user: dict = Depends(get_current_user)):
    try:
        # Using Supabase UUID for joining with group_members
        response = supabase.table('group_members')\
            .select('groups(*)')\
            .eq('user_id', current_user['id'])\
            .execute()
        
        groups = [item['groups'] for item in response.data]
        return groups
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bets/history")
async def get_user_bet_history(current_user: dict = Depends(get_current_user)):
    try:
        # Using Supabase UUID for both queries
        created_bets = supabase.table('bets')\
            .select('*')\
            .eq('creator_id', current_user['id'])\
            .execute()
            
        participated_bets = supabase.table('bet_contributions')\
            .select('*, bets(*)')\
            .eq('user_id', current_user['id'])\
            .execute()
            
        return {
            "created_bets": created_bets.data,
            "participated_bets": participated_bets.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    try:
        # Get user from Supabase first
        user = supabase.table("users")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
            
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete from Firebase using firebase_uid
        admin_auth.delete_user(user.data['firebase_uid'])
        
        # Delete from Supabase using UUID
        supabase.table("users")\
            .delete()\
            .eq("id", user_id)\
            .execute()
            
        return {"message": "User deleted successfully"}

    except Exception as e:
        print(f"Error deleting user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get-users", response_model=List[UserResponse])
async def get_users():
    try:
        # Get users from Supabase with their stats
        users = supabase.table("users")\
            .select("*")\
            .execute()
        
        user_list = []
        for user_data in users.data:
            # Get Firebase user info
            firebase_user = admin_auth.get_user(user_data['firebase_uid'])
            
            # Get user's betting stats
            stats = supabase.rpc(
                'calculate_user_stats',
                {"user_id": user_data['id']}  # Using Supabase UUID
            ).execute().data

            user_obj = {
                "id": user_data['id'],  # Use Supabase UUID
                "username": firebase_user.display_name,
                "email": user_data['email'],
                "joined_at": user_data['created_at'],
                "total_bets": stats.get("total_bets", 0),
                "wins": stats.get("wins", 0)
            }
            user_list.append(user_obj)

        return user_list

    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    try:
        # Get Supabase user data
        supabase_user = supabase.table("users")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
            
        if not supabase_user.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Get Firebase user using firebase_uid
        firebase_user = admin_auth.get_user(supabase_user.data['firebase_uid'])
            
        # Get user's betting stats
        stats = supabase.rpc(
            'calculate_user_stats',
            {"user_id": user_id}  # Using Supabase UUID
        ).execute().data

        return {
            "id": supabase_user.data['id'],  # Use Supabase UUID
            "username": firebase_user.display_name,
            "email": supabase_user.data['email'],
            "joined_at": supabase_user.data['created_at'],
            "total_bets": stats.get("total_bets", 0),
            "wins": stats.get("wins", 0)
        }

    except Exception as e:
        print(f"Error getting user: {e}")
        raise HTTPException(status_code=400, detail=str(e))