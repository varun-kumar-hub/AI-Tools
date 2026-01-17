import requests
from bs4 import BeautifulSoup
import feedparser
from datetime import datetime
import logging
import time
import re
from functools import wraps

logger = logging.getLogger(__name__)

def rate_limit(calls=1, period=1):
    """Decorator to rate limit function calls"""
    def decorator(func):
        last_called = [0.0]
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = period - elapsed
            if wait_time > 0:
                time.sleep(wait_time)
            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        return wrapper
    return decorator

class ProductHuntScraper:
    def __init__(self):
        self.rss_url = "https://www.producthunt.com/feed"
        self.base_url = "https://www.producthunt.com"
        self.session = self._get_session_with_retries()
    
    def _get_session_with_retries(self):
        """Create a session with retry logic"""
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        return session
    
    @rate_limit(calls=1, period=2)
    def scrape(self, limit=15):
        """Scrape AI tools from Product Hunt RSS feed"""
        try:
            tools = []
            
            # Fetch feed content using session with headers
            response = self.session.get(self.rss_url, timeout=30)
            if response.status_code != 200:
                logger.error(f"Failed to fetch Product Hunt feed: {response.status_code}")
                return []
                
            feed = feedparser.parse(response.content)
            
            for entry in feed.entries[:limit]:  # Get latest 'limit' posts
                # Filter for AI-related posts
                title = entry.get('title', '')
                description = entry.get('summary', '')
                
                if self._is_ai_related(title + ' ' + description):
                    tool = {
                        'name': title,
                        'description': self._clean_text(description),
                        'url': entry.link,
                        'source': 'Product Hunt',
                        'tags': self._extract_tags(title + ' ' + description),
                        'category': self._categorize(title + ' ' + description),
                        'created_at': datetime.now().isoformat()
                    }
                    
                    # Only add if validation passes
                    if self._validate_tool(tool):
                        tools.append(tool)
            
            logger.info(f"Scraped {len(tools)} tools from Product Hunt")
            return tools
        except Exception as e:
            logger.error(f"Error scraping Product Hunt: {e}")
            return []
    
    def _is_ai_related(self, text):
        """Check if the post is AI-related"""
        ai_keywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 
                      'llm', 'chatbot', 'automation', 'neural', 'deep learning', 'nlp',
                      'generative', 'openai', 'claude', 'assistant', 'copilot', 'model', 
                      'diffusion', 'computer vision', 'robotics', 'analytics', 'data', 
                      'voice', 'video', 'content creation', 'sora', 'gemini', 'llama']
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in ai_keywords)
    
    def _extract_tags(self, text):
        """Extract relevant tags from text"""
        tags = []

        tag_keywords = {
            'AI': ['ai', 'artificial intelligence', 'gpt', 'llm'],
            'Automation': ['automation', 'automate', 'workflow'],
            'Chatbot': ['chatbot', 'chat bot', 'conversational', 'assistant'],
            'Analytics': ['analytics', 'analysis', 'data', 'metrics'],
            'Productivity': ['productivity', 'productive', 'efficiency'],
            'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural'],
            'NLP': ['nlp', 'natural language', 'text processing'],
            'Creative': ['image', 'video', 'audio', 'design', 'art', 'music', 'diffusion'],
            'DevTools': ['code', 'developer', 'api', 'sdk', 'database']
        }
        
        text_lower = text.lower()
        for tag, keywords in tag_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                tags.append(tag)
        
        return tags[:5]  # Limit to 5 tags
    
    def _categorize(self, text):
        """Categorize tool based on content with scoring"""
        text_lower = text.lower()
        
        categories = {
            'Code & Development': ['code', 'programming', 'developer', 'api', 'github', 'software'],
            'Data Analysis': ['data', 'analytics', 'visualization', 'dashboard', 'metrics', 'insights'],
            'Productivity': ['productivity', 'task', 'workflow', 'management', 'organize', 'efficiency'],
            'Video & Audio': ['video', 'audio', 'media', 'podcast', 'transcription', 'voice'],
            'Research & Education': ['research', 'education', 'learning', 'study', 'academic', 'teaching'],
            'Design & Creative': ['design', 'creative', 'graphic', 'art', 'image', 'photo'],
            'Marketing & Sales': ['marketing', 'sales', 'advertising', 'seo', 'campaign', 'promotion'],
            'Content Writing': ['writing', 'content', 'blog', 'copy', 'article', 'text', 'generator'],
            'Customer Service': ['customer', 'service', 'support', 'helpdesk', 'crm', 'chat']
        }
        
        # Score each category
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scores[category] = score
        
        # Return category with highest score, or 'Other'
        return max(scores, key=scores.get) if scores else 'Other'
    
    def _validate_tool(self, tool):
        """Validate tool data before returning"""
        required_fields = ['name', 'description', 'url']
        
        for field in required_fields:
            if not tool.get(field):
                return False
                
        # Check if URL is valid
        if not tool['url'].startswith(('http://', 'https://')):
            return False
        
        return True

    def _clean_text(self, text):
        """Clean html tags and whitespace from text"""
        if not text:
            return ""
        # Remove all HTML tags using regex
        text = re.sub(r'<[^>]+>', '', text)
        # Remove multiple spaces
        return ' '.join(text.split()).strip()