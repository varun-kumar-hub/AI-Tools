import asyncio
from supabase_client import get_supabase_client

async def clear_database():
    supabase = get_supabase_client()
    print("Clearing ai_tools table...")
    try:
        # Delete all rows
        response = supabase.table('ai_tools').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print("Database cleared successfully.")
    except Exception as e:
        print(f"Error clearing database: {e}")

if __name__ == "__main__":
    asyncio.run(clear_database())
