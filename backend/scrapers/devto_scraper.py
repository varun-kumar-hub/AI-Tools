import requests
from datetime import datetime, timedelta
import logging
import time
import re
from .ai_filter import is_ai_tool

logger = logging.getLogger(__name__)

class DevToScraper:
    def __init__(self):
        self.api_url = "https://dev.to/api/articles"
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
            'User-Agent': 'AI-Tools-Hub-Scraper/1.0',
            'Accept': 'application/json',
        })
        return session

    def scrape(self, limit=60):
        """Scrape AI tools from Dev.to — uses latest articles not top-of-all-time, more tags"""
        try:
            tools = []
            seen_urls = set()

            # ✅ KEY FIX: Use 'latest' not 'top=1' — top=1 returns same articles every run
            # More diverse tags to cast a wider net
            tags = [
                'ai', 'machinelearning', 'datascience',
                'llm', 'openai', 'python', 'deeplearning',
                'nlp', 'generativeai', 'aitools',
                'webdev', 'javascript', 'react', 'nextjs', 'programming',
                'softwaredevelopment', 'devtools', 'opensource', 'saas',
                'cloud', 'devops', 'api', 'frontend', 'backend',
                'contentcreation', 'writing', 'copywriting', 'video', 'audio',
                'podcast', 'music', 'creativeai'
            ]

            per_tag = max(10, limit // len(tags))

            for tag in tags:
                if len(tools) >= limit:
                    break
                try:
                    response = self.session.get(
                        self.api_url,
                        params={
                            'tag': tag,
                            'per_page': per_tag,
                            # ✅ No 'top' param = return latest/recent articles
                            'state': 'fresh',
                        },
                        timeout=15
                    )

                    if response.status_code != 200:
                        time.sleep(1)
                        continue

                    articles = response.json()
                    for article in articles:
                        if len(tools) >= limit:
                            break

                        url = article.get('url', '')
                        if not url or url in seen_urls:
                            continue

                        title = article.get('title', '')
                        description = article.get('description', '') or title
                        full_text = title + ' ' + description

                        # ✅ AI keyword filter
                        if not is_ai_tool(full_text):
                            logger.debug(f"Skipped (not AI): {title[:60]}")
                            continue

                        seen_urls.add(url)
                        tool = {
                            'name': self._clean_title(title),
                            'description': self._clean_text(description),
                            'url': url,
                            'source': 'Dev.to',
                            'tags': article.get('tag_list', [])[:6],
                            'category': self._categorize(full_text),
                            'is_deleted': False,
                            'created_at': datetime.now().isoformat()
                        }

                        if self._validate_tool(tool):
                            tools.append(tool)

                    time.sleep(0.3)

                except Exception as e:
                    logger.error(f"Dev.to tag '{tag}' failed: {e}")
                    continue

            logger.info(f"DevTo: scraped {len(tools)} tools")
            return tools
        except Exception as e:
            logger.error(f"Error scraping Dev.to: {e}")
            return []

    def _clean_title(self, title):
        """Clean up article titles"""
        if not title:
            return ""
        # Remove common article prefixes that aren't tool names
        for prefix in ['How I ', 'How to ', 'Building ', 'Creating ', 'Introducing ']:
            if title.startswith(prefix):
                title = title[len(prefix):]
        return title.strip()[:200]

    def _categorize(self, text):
        text_lower = text.lower()
        categories = {
            'Code & Development': ['code', 'programming', 'developer', 'api', 'github', 'software', 'devops', 'sdk', 'framework', 'library', 'backend', 'frontend', 'fullstack', 'open source', 'react', 'python', 'javascript', 'docker'],
            'Data & Analytics': ['data', 'analytics', 'visualization', 'dashboard', 'metrics', 'insights', 'bi', 'big data', 'pipeline'],
            'AI & Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural', 'model', 'llm', 'rag', 'embedding', 'vector', 'generative', 'nlp', 'computer vision'],
            'Productivity & Automation': ['productivity', 'task', 'workflow', 'management', 'organize', 'efficiency', 'calendar', 'automation', 'agent', 'bot', 'copilot'],
            'Video & Audio': ['video', 'audio', 'media', 'podcast', 'transcription', 'voice', 'music', 'speech', 'text-to-video', 'text-to-speech'],
            'Design & Creative': ['design', 'creative', 'graphic', 'art', 'image', 'photo', 'generate', 'diffusion', 'text-to-image', 'midjourney'],
            'Marketing & Sales': ['marketing', 'sales', 'advertising', 'seo', 'campaign', 'email', 'lead', 'crm'],
            'Content Writing': ['writing', 'content', 'blog', 'copy', 'article', 'text', 'essay', 'summarize', 'prompt'],
            'Customer Service & Chat': ['customer', 'service', 'support', 'helpdesk', 'chat', 'ticket', 'chatbot', 'assistant', 'conversation'],
            'Research & Education': ['research', 'education', 'learning', 'study', 'academic', 'teaching', 'quiz', 'tutorial'],
        }
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[category] = score
        return max(scores, key=scores.get) if scores else 'Other'

    def _validate_tool(self, tool):
        for field in ['name', 'url']:
            if not tool.get(field):
                return False
        if not tool['url'].startswith(('http://', 'https://')):
            return False
        if len(tool['name']) < 3:
            return False
        return True

    def _clean_text(self, text):
        if not text:
            return ""
        text = re.sub(r'<[^>]+>', '', text)
        return ' '.join(text.split()).strip()[:2000]