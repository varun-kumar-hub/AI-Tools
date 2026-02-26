import requests
from datetime import datetime, timedelta
import logging
import time
import re
from .ai_filter import is_ai_tool

logger = logging.getLogger(__name__)

class HackerNewsScraper:
    def __init__(self):
        self.api_url = "https://hn.algolia.com/api/v1/search"
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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        return session

    def scrape(self, limit=60):
        """Scrape AI tools from Hacker News — broader queries, recent posts, higher limit"""
        try:
            tools = []
            seen_urls = set()

            # Broader, more productive queries — focused on recent AI launches
            queries = [
                'Show HN AI',
                'Show HN LLM',
                'Show HN GPT',
                'Show HN machine learning',
                'Show HN open source AI',
                'Launch HN AI',
                'Show HN chatbot',
                'Show HN agent',
                'Show HN automation',
                'Show HN RAG',
                'Show HN SaaS',
                'Show HN API',
                'Show HN devtools',
                'Show HN framework',
                'Show HN app',
                'Show HN web',
                'Show HN AI writing',
                'Show HN AI video',
                'Show HN AI audio',
                'Show HN AI content generator',
            ]

            # Timestamp for last 48 hours — get fresh results each run
            since = int((datetime.now() - timedelta(hours=48)).timestamp())

            per_query = max(10, limit // len(queries))

            for query in queries:
                if len(tools) >= limit:
                    break
                try:
                    response = self.session.get(
                        self.api_url,
                        params={
                            'query': query,
                            'tags': 'show_hn',
                            'hitsPerPage': per_query,
                            'numericFilters': f'created_at_i>{since}',  # Only last 48h
                        },
                        timeout=15
                    )

                    if response.status_code != 200:
                        time.sleep(1)
                        continue

                    data = response.json()
                    for hit in data.get('hits', []):
                        url = hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
                        if url in seen_urls:
                            continue

                        title = hit.get('title', '')
                        story_text = hit.get('story_text') or ''
                        full_text = title + ' ' + story_text

                        # ✅ AI keyword filter
                        if not is_ai_tool(full_text):
                            logger.debug(f"Skipped (not AI): {title[:60]}")
                            continue

                        seen_urls.add(url)
                        tool = {
                            'name': title[:200],
                            'description': self._clean_text(story_text or title),
                            'url': url,
                            'source': 'Hacker News',
                            'tags': self._extract_tags(title),
                            'category': self._categorize(full_text),
                            'is_deleted': False,
                            'created_at': datetime.now().isoformat()
                        }
                        if self._validate_tool(tool):
                            tools.append(tool)
                            if len(tools) >= limit:
                                break

                    time.sleep(0.3)
                except Exception as e:
                    logger.error(f"HN query '{query}' failed: {e}")
                    continue

            logger.info(f"HackerNews: scraped {len(tools)} tools")
            return tools
        except Exception as e:
            logger.error(f"Error scraping Hacker News: {e}")
            return []

    def _extract_tags(self, text):
        tags = []
        tag_keywords = {
            'AI': ['ai', 'artificial intelligence', 'gpt', 'llm', 'openai', 'claude', 'gemini', 'llama', 'mistral', 'anthropic', 'huggingface'],
            'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural network', 'model', 'nlp', 'computer vision'],
            'Generative AI': ['generative ai', 'genai', 'diffusion', 'midjourney', 'dall-e', 'text-to', 'generation'],
            'Automation & Agents': ['automation', 'automate', 'workflow', 'agent', 'autonomous', 'copilot'],
            'Chatbot': ['chatbot', 'chat', 'assistant', 'conversation'],
            'Data & Analytics': ['analytics', 'analysis', 'data', 'metrics', 'insights', 'predictive', 'big data', 'vector', 'rag'],
            'DevTools': ['code', 'developer', 'api', 'sdk', 'database', 'devops', 'framework', 'frontend', 'backend', 'open source', 'github'],
            'Tech & Cloud': ['software', 'technology', 'cloud', 'security', 'saas', 'startup', 'aws', 'docker'],
            'Web/Mobile App': ['web', 'app', 'ios', 'android', 'react', 'next.js', 'mobile'],
            'No-Code': ['no-code', 'no code', 'low-code', 'drag and drop'],
            'Video & Audio': ['video', 'audio', 'podcast', 'voice', 'speech', 'music'],
            'Content & Writing': ['writing', 'content', 'blog', 'copywriting', 'essay', 'summarize', 'text'],
        }
        text_lower = text.lower()
        for tag, keywords in tag_keywords.items():
            if any(k in text_lower for k in keywords):
                tags.append(tag)
        return tags[:6]

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
        cleaned = ' '.join(text.split()).strip()
        return cleaned[:2000]  # Increased description length limit