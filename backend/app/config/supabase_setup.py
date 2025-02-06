import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # This should be the service role key

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def execute_with_admin(query):
    """Execute a query with admin privileges"""
    try:
        result = query.execute()
        return result.data if hasattr(result, 'data') else result
    except Exception as e:
        print(f"Supabase admin operation failed: {e}")
        raise e