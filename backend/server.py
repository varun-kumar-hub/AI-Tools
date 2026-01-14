from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from supabase_client import get_supabase_client
from scrapers import ProductHuntScraper, HackerNewsScraper, DevToScraper

ROOT_DIR = Path(__file__).parent
# Reload trigger
load_dotenv(ROOT_DIR / '.env')

import asyncio

# Create the main app without a prefix
app = FastAPI()

# Global variable to track next scheduled scrape (Removed)
# NEXT_SCRAPE_TIME = None

# Startup event removed to rely on external scheduler (GitHub Actions)

# ... (omitting health check) ...



@app.get("/")
async def health_check():
    return {
        "message": "AI Tools Hub API is running",
        "docs": "/docs",
        "api_root": "/api"
    }

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get Supabase client
supabase = get_supabase_client()

# Define Models
class ToolCreate(BaseModel):
    name: str
    description: str
    category: str
    tags: List[str]
    url: str
    source: Optional[str] = 'Manual'

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    url: Optional[str] = None

class Tool(BaseModel):
    id: str
    name: str
    description: str
    category: str
    tags: List[str]
    url: str
    source: str
    created_at: str
    updated_at: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    count: int

class StatsResponse(BaseModel):
    total_tools: int
    added_today: int
    tags_tracked: int
    categories: int

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "AI Tools Hub API", "version": "1.0.0"}

# Get all tools
@api_router.get("/tools")
async def get_tools(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    try:
        query = supabase.table('ai_tools').select('*')
        
        if category and category != 'all':
            query = query.eq('category', category)
        
        # Default to not showing deleted tools
        query = query.eq('is_deleted', False)
        
        if search:
            query = query.or_(f'name.ilike.%{search}%,description.ilike.%{search}%')
        
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        response = query.execute()
        
        return {"tools": response.data, "count": len(response.data)}
    except Exception as e:
        logger.error(f"Error fetching tools: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get tool by ID
@api_router.get("/tools/{tool_id}")
async def get_tool(tool_id: str):
    try:
        response = supabase.table('ai_tools').select('*').eq('id', tool_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create tool
@api_router.post("/tools")
async def create_tool(tool: ToolCreate):
    try:
        tool_data = {
            **tool.dict(),
            **tool.dict(),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        response = supabase.table('ai_tools').insert(tool_data).execute()
        return response.data[0]
    except Exception as e:
        logger.error(f"Error creating tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Update tool
@api_router.put("/tools/{tool_id}")
async def update_tool(tool_id: str, tool: ToolUpdate):
    try:
        update_data = {k: v for k, v in tool.dict().items() if v is not None}
        update_data['updated_at'] = datetime.now().isoformat()
        
        response = supabase.table('ai_tools').update(update_data).eq('id', tool_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Delete tool
@api_router.delete("/tools/{tool_id}")
async def delete_tool(tool_id: str):
    try:
        logger.info(f"Attempting to soft-delete tool: {tool_id}")
        response = supabase.table('ai_tools').update({'is_deleted': True}).eq('id', tool_id).execute()
        logger.info(f"Supabase delete response: {response}")
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        return {"message": "Tool moved to trash"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Restore tool
@api_router.post("/tools/{tool_id}/restore")
async def restore_tool(tool_id: str):
    try:
        response = supabase.table('ai_tools').update({'is_deleted': False}).eq('id', tool_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error restoring tool: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get deleted tools
@api_router.get("/tools/deleted/all")
async def get_deleted_tools():
    try:
        response = supabase.table('ai_tools').select('*').eq('is_deleted', True).order('updated_at', desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching deleted tools: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get categories with counts
@api_router.get("/categories")
async def get_categories():
    try:
        response = supabase.table('ai_tools').select('category').eq('is_deleted', False).execute()
        
        category_counts = {}
        for item in response.data:
            category = item.get('category', 'Other')
            category_counts[category] = category_counts.get(category, 0) + 1
        
        categories = []
        category_ids = {
            'Code & Development': '1',
            'Data Analysis': '2',
            'Productivity': '3',
            'Video & Audio': '4',
            'Research & Education': '5',
            'Design & Creative': '6',
            'Marketing & Sales': '7',
            'Content Writing': '8',
            'Customer Service': '9',
            'Other': '10'
        }
        
        for category, count in category_counts.items():
            categories.append({
                'id': category_ids.get(category, '10'),
                'name': category,
                'count': count
            })
        
        return {'categories': categories}
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get stats
@api_router.get("/stats")
async def get_stats():
    try:
        # Get total count and recent data
        all_tools = supabase.table('ai_tools').select('*').eq('is_deleted', False).execute()
        total_tools = len(all_tools.data)
        
        # Tools added today
        today = datetime.now().date()
        added_today = sum(1 for tool in all_tools.data 
                         if datetime.fromisoformat(tool['created_at']).date() == today)
        
        # Unique tags & categories
        all_tags = set()
        categories = set()
        latest_tool_time = None

        for tool in all_tools.data:
            all_tags.update(tool.get('tags', []))
            categories.add(tool.get('category'))
            
            # Find latest creation time (logic kept for other potential uses, but not for scrape schedule)
            # tool_time = datetime.fromisoformat(tool['created_at'])
            # ...

        # Calculate next scrape time based on deterministic 2-hour schedule (matches GitHub Actions)
        now_utc = datetime.utcnow()
        current_hour = now_utc.hour
        
        # Next even hour
        # If current hour is 10 (10:xx), next run is 12:00
        # If current hour is 11 (11:xx), next run is 12:00
        next_hour = (current_hour // 2 + 1) * 2
        
        # Handle day rollover (e.g., if next_hour is 24)
        if next_hour >= 24:
            next_scrape = (now_utc + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            next_scrape = now_utc.replace(hour=next_hour, minute=0, second=0, microsecond=0)
            
        return {
            'total_tools': total_tools,
            'added_today': added_today,
            'tags_tracked': len(all_tags),
            'categories': len(categories),
            'next_scrape_time': next_scrape.isoformat() + "Z"  # Ensure Z for UTC
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task for scraping
async def run_scrapers_task(limit: int = 15):
    """Background task to run all scrapers"""
    scrapers = [
        ProductHuntScraper(),
        HackerNewsScraper(),
        DevToScraper()
    ]
    
    total_added = 0
    
    for scraper in scrapers:
        try:
            # Pass limit to scraper if it accepts it, otherwise just scrape
            if hasattr(scraper, 'scrape') and 'limit' in scraper.scrape.__code__.co_varnames:
                tools = scraper.scrape(limit=limit)
            else:
                tools = scraper.scrape()
            
            for tool in tools:
                try:
                    # Check if tool already exists by URL (more unique than name) or Name
                    # Using OR logic via multiple queries for safety
                    existing_url = supabase.table('ai_tools').select('id').eq('url', tool['url']).execute()
                    existing_name = supabase.table('ai_tools').select('id').eq('name', tool['name']).execute()
                    
                    if not existing_url.data and not existing_name.data:
                        supabase.table('ai_tools').insert(tool).execute()
                        total_added += 1
                        logger.info(f"Added tool: {tool['name']}")
                    else:
                        logger.info(f"Skipped duplicate: {tool['name']}")
                except Exception as e:
                    logger.error(f"Error adding tool {tool.get('name')}: {e}")
                    continue
        except Exception as e:
            logger.error(f"Error running scraper {scraper.__class__.__name__}: {e}")
    
    logger.info(f"Scraping complete. Added {total_added} new tools.")
    return total_added

# Run scraper endpoint
@api_router.get("/scraper/run")
@api_router.post("/scraper/run")
async def run_scraper(background_tasks: BackgroundTasks, limit: int = 15):
    try:
        background_tasks.add_task(run_scrapers_task, limit)
        return {
            'status': 'started',
            'message': 'Scraping task started in background'
        }
    except Exception as e:
        logger.error(f"Error starting scraper: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)