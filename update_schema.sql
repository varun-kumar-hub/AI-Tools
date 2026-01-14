-- Add is_deleted column to ai_tools table
ALTER TABLE ai_tools ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Update existing rows to have is_deleted = FALSE
UPDATE ai_tools SET is_deleted = FALSE WHERE is_deleted IS NULL;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_is_deleted ON ai_tools(is_deleted);

-- Query to HARD DELETE tools older than X days (e.g., 365 days) if you need to free up space
-- DELETE FROM ai_tools WHERE created_at < NOW() - INTERVAL '365 days';
