from fastapi import APIRouter, HTTPException
from ..config.supabase_setup import supabase
from ..models.users import UserProfile, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(user_id: str):
    try:
        response = supabase.table('users')\
            .select('*')\
            .eq('id', user_id)\
            .single()\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bets/history")
async def get_user_bet_history(user_id: str):
    try:
        created_bets = supabase.table('bets')\
            .select('*')\
            .eq('creator_id', user_id)\
            .execute()
            
        participated_bets = supabase.table('bet_contributions')\
            .select('*, bets(*)')\
            .eq('user_id', user_id)\
            .execute()
            
        return {
            "created_bets": created_bets.data,
            "participated_bets": participated_bets.data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=UserResponse)
async def create_user(body: CreateUserBody):
    try:
        # Create Firebase auth user
        firebase_user = admin_auth.create_user(
            display_name=body.username,
            email=body.email,
            password=body.password
        )
        print(f"User {body.username} created Firebase account successfully")

        # Create Supabase user record
        user_data = {
            "id": firebase_user.uid,  # Use Firebase UID as Supabase ID
            "username": body.username,
            "email": body.email,
        }
        
        response = supabase.table("users")\
            .insert(user_data)\
            .execute()
        
        print(f"User {body.username} created Supabase account successfully")
        return response.data[0]

    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    try:
        # Get user from Supabase first
        user = supabase.table("users")\
            .select("email")\
            .eq("id", user_id)\
            .single()\
            .execute()
            
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete from Firebase
        admin_auth.delete_user(user_id)
        
        # Delete from Supabase
        supabase.table("users")\
            .delete()\
            .eq("id", user_id)\
            .execute()
            
        return {"message": f"User deleted successfully"}

    except Exception as e:
        print(f"Error deleting user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[UserResponse])
async def get_users():
    try:
        # Get all users from Firebase
        firebase_users = admin_auth.list_users()
        
        user_list = []
        for firebase_user in firebase_users.users:
            # Get corresponding Supabase data
            supabase_user = supabase.table("users")\
                .select("*")\
                .eq("id", firebase_user.uid)\
                .single()\
                .execute()
            
            supabase_data = supabase_user.data if supabase_user else {}
            
            # Get user's betting stats
            stats = supabase.rpc(
                'calculate_user_stats',
                {"user_id": firebase_user.uid}
            ).execute().data

            user_obj = {
                "id": firebase_user.uid,
                "username": firebase_user.display_name,
                "email": firebase_user.email,
                "joined_at": supabase_data.get("created_at"),
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
        # Get Firebase user
        firebase_user = admin_auth.get_user(user_id)
        
        # Get Supabase user data
        supabase_user = supabase.table("users")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
            
        if not supabase_user.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Get user's betting stats
        stats = supabase.rpc(
            'calculate_user_stats',
            {"user_id": user_id}
        ).execute().data

        return {
            "id": firebase_user.uid,
            "username": firebase_user.display_name,
            "email": firebase_user.email,
            "joined_at": supabase_user.data.get("created_at"),
            "total_bets": stats.get("total_bets", 0),
            "wins": stats.get("wins", 0)
        }

    except Exception as e:
        print(f"Error getting user: {e}")
        raise HTTPException(status_code=400, detail=str(e))