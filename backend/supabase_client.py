import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

# Use service role key if available for backend operations (scrapers)
# Otherwise fall back to the anon key
key_to_use = SUPABASE_SERVICE_ROLE_KEY if SUPABASE_SERVICE_ROLE_KEY else SUPABASE_KEY

if not key_to_use:
    raise ValueError("Supabase key not found. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY in .env")

if key_to_use == SUPABASE_SERVICE_ROLE_KEY:
    print("DEBUG: Using SERVICE ROLE KEY")
else:
    print("DEBUG: Using ANON KEY")

supabase: Client = create_client(SUPABASE_URL, key_to_use)

def get_supabase_client():
    return supabase