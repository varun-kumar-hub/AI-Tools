# API Contracts & Integration Plan

## Backend Architecture

### Database (Supabase)
**Table: ai_tools**
- id (uuid, primary key)
- name (text)
- description (text)
- category (text)
- tags (text array)
- website (text)
- source (text) - 'Product Hunt', 'Hacker News', or 'Dev.to'
- added_date (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

### API Endpoints

#### 1. Get All Tools
- **GET** `/api/tools`
- Query params: `category`, `search`, `limit`, `offset`
- Response: List of tools

#### 2. Get Tool by ID
- **GET** `/api/tools/{id}`
- Response: Single tool details

#### 3. Create Tool (Admin)
- **POST** `/api/tools`
- Body: { name, description, category, tags, website, source }
- Response: Created tool

#### 4. Update Tool (Admin)
- **PUT** `/api/tools/{id}`
- Body: Partial tool data
- Response: Updated tool

#### 5. Delete Tool (Admin)
- **DELETE** `/api/tools/{id}`
- Response: Success message

#### 6. Get Categories with Counts
- **GET** `/api/categories`
- Response: List of categories with tool counts

#### 7. Get Stats
- **GET** `/api/stats`
- Response: { totalTools, addedToday, tagsTracked, categories }

#### 8. Run Scraper (Admin)
- **POST** `/api/scraper/run`
- Response: { status, toolsAdded, source }

### Web Scraping Strategy

#### Product Hunt
- Use Product Hunt API or RSS feed
- Extract: name, description, website URL, tags
- Category mapping based on tags

#### Hacker News
- Use Hacker News API (algolia)
- Search for "Show HN" posts with AI-related keywords
- Extract: title, description, URL
- Auto-categorize based on content

#### Dev.to
- Use Dev.to API
- Search for AI-related articles with tags
- Extract tool mentions from content
- Auto-categorize

### Frontend Integration

#### Mock Data Replacement
- Replace mockData.js imports with API calls
- Use Supabase client directly in frontend for real-time updates
- Implement loading states and error handling

#### Components to Update
1. Home.jsx - Fetch latest tools
2. Categories.jsx - Fetch categories with counts
3. CategoryDetail.jsx - Fetch tools by category
4. Search.jsx - Implement server-side search
5. ToolDetail.jsx - Fetch single tool
6. Admin.jsx - CRUD operations and scraper trigger
