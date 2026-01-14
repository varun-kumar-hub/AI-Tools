"""
Setup script to create the ai_tools table in Supabase
"""
from supabase_client import get_supabase_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database():
    """Create the ai_tools table in Supabase"""
    supabase = get_supabase_client()
    
    # SQL to create the table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS ai_tools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags TEXT[],
        website TEXT,
        source TEXT,
        added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_category ON ai_tools(category);
    CREATE INDEX IF NOT EXISTS idx_added_date ON ai_tools(added_date DESC);
    CREATE INDEX IF NOT EXISTS idx_name ON ai_tools(name);
    """
    
    try:
        # Execute the SQL using Supabase
        logger.info("Creating ai_tools table...")
        # Note: Supabase client doesn't directly support raw SQL execution from Python
        # You'll need to run this SQL in the Supabase SQL Editor
        logger.info("Please run the following SQL in your Supabase SQL Editor:")
        print("\n" + "="*80)
        print(create_table_sql)
        print("="*80 + "\n")
        
        logger.info("After creating the table, you can use the API endpoints.")
        
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        raise

if __name__ == "__main__":
    setup_database()
