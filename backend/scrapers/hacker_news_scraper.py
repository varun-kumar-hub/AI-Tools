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

class HackerNewsScraper:
    def __init__(self):
        self.api_url = "https://hn.algolia.com/api/v1/search"
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
        """Scrape AI tools from Hacker News"""
        try:
            tools = []
            # Search for Show HN posts about AI tools and other relevant queries
            queries = [
                'Show HN AI tool', 
                'Show HN AI assistant', 
                'Show HN AI platform',
                'Launch HN AI',
                'Ask HN: Who is hiring? (AI)',
                'Show HN LLM',
                'Show HN GPT'
            ]
            
            # Distribute limit across queries (approximate)
            per_query_limit = max(5, limit // len(queries))
            
            for query in queries:
                # Stop if we have enough tools
                if len(tools) >= limit:
                    break
                    
                response = self.session.get(
                    self.api_url,
                    params={
                        'query': query,
                        'tags': 'show_hn',
                        'hitsPerPage': per_query_limit
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for hit in data.get('hits', []):
                        tool = {
                            'name': hit.get('title'),
                            'description': self._clean_text(hit.get('story_text') or hit.get('title')),
                            'url': hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                            'source': 'Hacker News',
                            'tags': self._extract_tags(hit.get('title', '')),
                            'category': self._categorize(hit.get('title', '') + ' ' + (hit.get('story_text', '') or '')),
                            'created_at': datetime.now().isoformat()
                        }
                        
                        # Only add if validation passes
                        if self._validate_tool(tool):
                            tools.append(tool)
                            if len(tools) >= limit:
                                break
                
                # Rate limit between queries
                time.sleep(0.5)
            
            logger.info(f"Scraped {len(tools)} tools from Hacker News")
            return tools
        except Exception as e:
            logger.error(f"Error scraping Hacker News: {e}")
            return []
    
    def _extract_tags(self, text):
        """Extract relevant tags from text"""
        tags = []

        tag_keywords = {
            'AI': ['ai', 'artificial intelligence', 'gpt', 'llm', 'generative'],
            'Open Source': ['open source', 'oss', 'github'],
            'Developer Tools': ['devtools', 'developer', 'tools', 'api', 'sdk'],
            'Automation': ['automation', 'automate', 'workflow', 'agent'],
            'Machine Learning': ['machine learning', 'ml', 'neural', 'deep learning', 'computer vision'],
            'Data Science': ['data science', 'analytics', 'data engineering'],
            'Robotics': ['robotics', 'robot', 'drone']
        }
        
        text_lower = text.lower()
        for tag, keywords in tag_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                tags.append(tag)
        
        return tags[:5]
    
    def _categorize(self, text):
        """Categorize tool based on content with scoring"""
        text_lower = text.lower()
        
        categories = {
            'Code & Development': ['code', 'programming', 'developer', 'api', 'github', 'software'],
            'Data Analysis': ['data', 'analytics', 'visualization', 'dashboard', 'metrics'],
            'Productivity': ['productivity', 'workflow', 'task', 'management'],
            'Research & Education': ['research', 'education', 'learning'],
            'Content Writing': ['writing', 'content', 'blog'],
            'DevOps & Infrastructure': ['devops', 'infrastructure', 'deployment', 'cloud']
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
        return ' '.join(text.split()).strip()