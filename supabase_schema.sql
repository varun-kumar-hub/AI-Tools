-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Table
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'Manual'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_created_at ON ai_tools(created_at DESC);

-- Enable RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read Access
CREATE POLICY "Allow public read access" ON ai_tools
FOR SELECT USING (true);

-- Policy: Admin Write Access (Insert)
CREATE POLICY "Allow admin insert" ON ai_tools
FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'cvarunkumar455@gmail.com'
);

-- Policy: Admin Update Access
CREATE POLICY "Allow admin update" ON ai_tools
FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'cvarunkumar455@gmail.com'
);

-- Policy: Admin Delete Access
CREATE POLICY "Allow admin delete" ON ai_tools
FOR DELETE USING (
    auth.jwt() ->> 'email' = 'cvarunkumar455@gmail.com'
);
