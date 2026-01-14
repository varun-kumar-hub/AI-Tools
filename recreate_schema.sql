-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Table with is_deleted column
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'Manual',
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_created_at ON ai_tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_is_deleted ON ai_tools(is_deleted);

-- Enable RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public Read Access (only active tools)
CREATE POLICY "Allow public read access" ON ai_tools
FOR SELECT USING (is_deleted = FALSE);

-- Admin Read Access (all tools including deleted) - Optional specific policy if needed, 
-- but usually admin client bypasses RLS or has a specific policy.
-- Assuming backend uses service role (bypasses RLS) or admin user logic.

-- Admin Write/Update/Delete Access
CREATE POLICY "Allow admin insert" ON ai_tools
FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'cvarunkumar455@gmail.com'
);

CREATE POLICY "Allow admin update" ON ai_tools
FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'cvarunkumar455@gmail.com'
);

CREATE POLICY "Allow admin delete" ON ai_tools
FOR DELETE USING (
    auth.jwt() ->> 'email' = 'cvarunkumar455@gmail.com'
);
