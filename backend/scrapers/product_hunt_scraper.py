import requests
from bs4 import BeautifulSoup
import feedparser
from datetime import datetime
import logging
import time
import re
from functools import wraps

logger = logging.getLogger(__name__)

class ProductHuntScraper:
    def __init__(self):
        self.rss_url = "https://www.producthunt.com/feed"
        self.session = self._get_session()

    def _get_session(self):
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        session = requests.Session()
        retry = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        return session

    def scrape(self, limit=50):
        """Scrape AI tools from Product Hunt RSS feed — broader AI filter, higher limit"""
        try:
            tools = []
            response = self.session.get(self.rss_url, timeout=30)
            if response.status_code != 200:
                logger.error(f"Failed to fetch Product Hunt feed: {response.status_code}")
                return []

            feed = feedparser.parse(response.content)

            for entry in feed.entries[:limit]:
                title = entry.get('title', '')
                description = entry.get('summary', '')
                full_text = title + ' ' + description

                # Include everything by default — sort by relevance later
                tool = {
                    'name': title[:200],
                    'description': self._clean_text(description),
                    'url': entry.link,
                    'source': 'Product Hunt',
                    'tags': self._extract_tags(full_text),
                    'category': self._categorize(full_text),
                    'is_deleted': False,
                    'created_at': datetime.now().isoformat()
                }
                if self._validate_tool(tool):
                    tools.append(tool)

            logger.info(f"ProductHunt: scraped {len(tools)} tools")
            return tools
        except Exception as e:
            logger.error(f"Error scraping Product Hunt: {e}")
            return []

    def _extract_tags(self, text):
        tags = []
        tag_keywords = {
            'AI': ['ai', 'artificial intelligence', 'gpt', 'llm', 'openai', 'claude', 'gemini'],
            'Automation': ['automation', 'automate', 'workflow', 'agent'],
            'Chatbot': ['chatbot', 'chat', 'assistant', 'conversation'],
            'Analytics': ['analytics', 'analysis', 'data', 'metrics', 'insights'],
            'Productivity': ['productivity', 'efficiency', 'organize', 'task'],
            'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural', 'model'],
            'NLP': ['nlp', 'natural language', 'text', 'speech'],
            'Creative': ['image', 'video', 'audio', 'design', 'art', 'music', 'diffusion', 'generate'],
            'DevTools': ['code', 'developer', 'api', 'sdk', 'database', 'devops'],
            'No-Code': ['no-code', 'no code', 'low-code', 'drag and drop'],
        }
        text_lower = text.lower()
        for tag, keywords in tag_keywords.items():
            if any(k in text_lower for k in keywords):
                tags.append(tag)
        return tags[:6]

    def _categorize(self, text):
        text_lower = text.lower()
        categories = {
            'Code & Development': ['code', 'programming', 'developer', 'api', 'github', 'software', 'devops', 'sdk'],
            'Data Analysis': ['data', 'analytics', 'visualization', 'dashboard', 'metrics', 'insights', 'bi'],
            'Productivity': ['productivity', 'task', 'workflow', 'management', 'organize', 'efficiency', 'calendar'],
            'Video & Audio': ['video', 'audio', 'media', 'podcast', 'transcription', 'voice', 'music', 'speech'],
            'Research & Education': ['research', 'education', 'learning', 'study', 'academic', 'teaching', 'quiz'],
            'Design & Creative': ['design', 'creative', 'graphic', 'art', 'image', 'photo', 'generate', 'diffusion'],
            'Marketing & Sales': ['marketing', 'sales', 'advertising', 'seo', 'campaign', 'email', 'lead', 'crm'],
            'Content Writing': ['writing', 'content', 'blog', 'copy', 'article', 'text', 'essay', 'summarize'],
            'Customer Service': ['customer', 'service', 'support', 'helpdesk', 'chat', 'ticket'],
        }
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[category] = score
        return max(scores, key=scores.get) if scores else 'Other'

    def _validate_tool(self, tool):
        for field in ['name', 'description', 'url']:
            if not tool.get(field):
                return False
        if not tool['url'].startswith(('http://', 'https://')):
            return False
        if len(tool['name']) < 2:
            return False
        return True

    def _clean_text(self, text):
        if not text:
            return ""
        text = re.sub(r'<[^>]+>', '', text)
        return ' '.join(text.split()).strip()