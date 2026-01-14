"""
AI Tools Scrapers Package

This package contains scrapers for various sources of AI tools:
- Dev.to (developer articles and tools)
- Hacker News (Show HN posts)
- Product Hunt (product launches)
"""

from .devto_scraper import DevToScraper
from .hacker_news_scraper import HackerNewsScraper
from .product_hunt_scraper import ProductHuntScraper
from .scraper_manager import ScraperManager
from .scraper_utils import deduplicate_tools, validate_tool

__version__ = '1.0.0'

__all__ = [
    'DevToScraper',
    'HackerNewsScraper', 
    'ProductHuntScraper',
    'ScraperManager'
]