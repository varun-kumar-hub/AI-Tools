import requests
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

class DevToScraper:
    def __init__(self):
        self.api_url = "https://dev.to/api/articles"
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
    
    @rate_limit(calls=1, period=1)
    def scrape(self, limit=15):
        """Scrape AI tools from Dev.to"""
        try:
            tools = []
            # Search for articles with AI tags
            response = self.session.get(
                self.api_url,
                params={
                    'tag': 'ai',
                    'per_page': limit
                },
                headers={'User-Agent': 'AI Tools Hub Scraper'},
                timeout=10
            )
            
            if response.status_code == 200:
                articles = response.json()
                for article in articles:
                    # Extract tool information from article
                    tool = {
                        'name': self._extract_tool_name(article.get('title', '')),
                        'description': self._clean_text(article.get('description', '')),
                        'url': article.get('url'),
                        'source': 'Dev.to',
                        'tags': article.get('tag_list', [])[:5],
                        'category': self._categorize(article.get('title', '') + ' ' + article.get('description', '')),
                        'created_at': datetime.now().isoformat()
                    }
                    
                    # Only add if validation passes
                    if self._validate_tool(tool):
                        tools.append(tool)
            
            logger.info(f"Scraped {len(tools)} tools from Dev.to")
            return tools
        except Exception as e:
            logger.error(f"Error scraping Dev.to: {e}")
            return []
    
    def _extract_tool_name(self, title):
        """Extract tool name from article title"""
        # Remove common prefixes
        prefixes = ['Building', 'Creating', 'How to build', 'Introducing', 'Building a', 'Check out']
        for prefix in prefixes:
            if title.startswith(prefix):
                title = title.replace(prefix, '').strip()
        return title[:100]  # Limit length
    
    def _categorize(self, text):
        """Categorize tool based on content with scoring"""
        text_lower = text.lower()
        
        categories = {
            'Code & Development': ['code', 'programming', 'developer', 'api', 'github', 'software', 'framework'],
            'Data Analysis': ['data', 'analytics', 'visualization', 'dashboard', 'metrics', 'insights'],
            'Productivity': ['productivity', 'workflow', 'task', 'management', 'organize'],
            'Video & Audio': ['video', 'audio', 'media', 'podcast', 'transcription'],
            'Research & Education': ['research', 'learning', 'education', 'study', 'academic'],
            'Content Writing': ['writing', 'content', 'blog', 'copy', 'article', 'text'],
            'Design & Creative': ['design', 'creative', 'graphic', 'art', 'image']
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