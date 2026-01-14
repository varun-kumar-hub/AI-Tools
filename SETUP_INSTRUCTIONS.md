# AI Tools Hub - Setup Instructions

## 🎉 Your AI Tools Hub is Almost Ready!

I've built a complete AI Tools Hub application with:
- ✅ Modern, clean UI with light theme (different from the original)
- ✅ Frontend with React (mock data currently showing)
- ✅ Backend API with FastAPI
- ✅ Supabase integration ready
- ✅ Web scrapers for Product Hunt, Hacker News, and Dev.to
- ✅ Admin panel for managing tools
- ✅ Search and filtering functionality

## 📋 What You Need to Do Next

### Step 1: Create the Database Table in Supabase

1. Go to your Supabase Dashboard: https://ytezmrthhvhxtpjbobpq.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "+ New query"
4. Copy and paste this SQL:

```sql
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
```

5. Click "Run" to execute the SQL

### Step 2: Enable Row Level Security (RLS) - Optional but Recommended

In the Supabase SQL Editor, run this to allow public read access:

```sql
-- Enable RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON ai_tools
FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON ai_tools
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON ai_tools
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON ai_tools
FOR DELETE USING (auth.role() = 'authenticated');
```

If you want to allow anyone to add tools (not just authenticated users), replace the insert policy with:

```sql
CREATE POLICY "Allow public insert" ON ai_tools
FOR INSERT WITH CHECK (true);
```

### Step 3: Test Your Application

1. **Access your app**: Visit https://frontend-ai-tools-finder-6.em-ai.in (or http://localhost:3000)

2. **Test the Scraper**:
   - Go to the Admin panel (click "Admin" in navigation)
   - Click "Run Scraper" button
   - Wait for it to fetch AI tools from Product Hunt, Hacker News, and Dev.to
   - The tools will appear on the homepage

3. **Add Tools Manually**:
   - Click "Add Tool" in the Admin panel
   - Fill in the details
   - Submit

## 🚀 Features Available

### For Users:
- **Home Page**: Browse latest AI tools with search
- **Categories**: Explore tools by category
- **Search**: Find tools by name, description, or tags
- **Tool Details**: View detailed information about each tool
- **Stats Dashboard**: See total tools, categories, tags tracked

### For Admins:
- **Add Tools**: Manually add AI tools
- **Edit Tools**: Update tool information
- **Delete Tools**: Remove tools from the database
- **Run Scraper**: Automatically fetch new tools from:
  - Product Hunt (RSS feed)
  - Hacker News (API)
  - Dev.to (API)

## 🎨 Design Features

The new design has:
- Light gradient background (slate, purple, blue)
- Modern card layouts with hover effects
- Smooth animations and transitions
- Professional purple-blue color scheme
- Custom scrollbar
- Responsive design for all devices

## 📁 Project Structure

```
/app
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── utils/          # Supabase client and helpers
│   │   └── mockData.js     # Mock data (can be removed after real data)
│   └── .env                # Environment variables with Supabase credentials
├── backend/
│   ├── server.py           # Main FastAPI server
│   ├── supabase_client.py  # Supabase connection
│   ├── scrapers/           # Web scrapers
│   │   ├── product_hunt_scraper.py
│   │   ├── hacker_news_scraper.py
│   │   └── devto_scraper.py
│   └── .env                # Backend environment variables
└── contracts.md            # API documentation

```

## 🔧 Troubleshooting

### If tools don't appear after scraping:
1. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
2. Verify the table was created correctly in Supabase
3. Check that RLS policies allow public access

### If you can't add tools manually:
1. Make sure the RLS policies are set correctly
2. Try the "Allow public insert" policy mentioned above

### If the scraper doesn't work:
1. Check internet connectivity
2. Some sites may rate-limit or block requests
3. Check backend logs for detailed error messages

## 📝 Notes

- **Mock Data**: The frontend currently shows 6 mock tools. Once you create the table and run the scraper, real data will appear.
- **Scraping**: The scrapers run in the background and may take a minute to complete.
- **Categories**: Tools are automatically categorized based on their content.
- **Tags**: Tags are extracted from tool descriptions and titles.
- **Deduplication**: The system checks for duplicate tool names before adding.

## 🎯 Next Steps

After setting up the database:
1. Run the scraper to populate your database
2. The homepage will show real tools instead of mock data
3. You can start using all features!

Enjoy your AI Tools Hub! 🚀
