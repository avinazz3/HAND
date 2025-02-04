from supabase import create_client, Client
import os
from dotenv import load_dotenv
from postgrest import APIResponse

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # This should be the service role key
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  # Add the anon key for public operations

# Initialize the admin client with service role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def execute_with_admin(operation) -> APIResponse:
    """
    Execute a Supabase operation with admin privileges using the service role key.
    This bypasses RLS policies.
    """
    try:
        return operation.execute()
    except Exception as e:
        print(f"Supabase admin operation failed: {str(e)}")
        raise e