import requests
from datetime import datetime, timedelta
import logging
import time
import re

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
                        seen_urls.add(url)

                        tool = {
                            'name': hit.get('title', '')[:200],
                            'description': self._clean_text(hit.get('story_text') or hit.get('title', '')),
                            'url': url,
                            'source': 'Hacker News',
                            'tags': self._extract_tags(hit.get('title', '')),
                            'category': self._categorize(hit.get('title', '') + ' ' + (hit.get('story_text') or '')),
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
            'AI': ['ai', 'artificial intelligence', 'gpt', 'llm', 'generative', 'openai', 'claude'],
            'Open Source': ['open source', 'oss', 'open-source'],
            'Developer Tools': ['devtools', 'developer', 'tools', 'api', 'sdk', 'cli'],
            'Automation': ['automation', 'automate', 'workflow', 'agent', 'bot'],
            'Machine Learning': ['machine learning', 'ml', 'neural', 'deep learning', 'computer vision'],
            'Data Science': ['data science', 'analytics', 'data engineering', 'pipeline'],
            'RAG': ['rag', 'retrieval', 'vector', 'embedding', 'knowledge base'],
            'Agents': ['agent', 'autonomous', 'multi-agent'],
        }
        text_lower = text.lower()
        for tag, keywords in tag_keywords.items():
            if any(k in text_lower for k in keywords):
                tags.append(tag)
        return tags[:6]

    def _categorize(self, text):
        text_lower = text.lower()
        categories = {
            'Code & Development': ['code', 'programming', 'developer', 'api', 'github', 'software', 'devops'],
            'Data Analysis': ['data', 'analytics', 'visualization', 'dashboard', 'metrics'],
            'Productivity': ['productivity', 'workflow', 'task', 'management'],
            'Research & Education': ['research', 'education', 'learning'],
            'Content Writing': ['writing', 'content', 'blog'],
            'Design & Creative': ['image', 'art', 'design', 'generate', 'diffusion'],
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
        return cleaned[:500]  # Reasonable description length