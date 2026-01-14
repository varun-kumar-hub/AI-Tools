"""
Unit tests for scrapers
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from devto_scraper import DevToScraper
from hacker_news_scraper import HackerNewsScraper
from product_hunt_scraper import ProductHuntScraper
from scraper_manager import ScraperManager
from scraper_utils import deduplicate_tools, validate_tool, normalize_url


class TestDevToScraper:
    def setup_method(self):
        self.scraper = DevToScraper()
    
    def test_extract_tool_name(self):
        assert self.scraper._extract_tool_name("Building a ChatGPT Clone") == "a ChatGPT Clone"
        assert self.scraper._extract_tool_name("Introducing MyTool") == "MyTool"
        assert self.scraper._extract_tool_name("Simple Tool") == "Simple Tool"
    
    def test_categorize(self):
        assert self.scraper._categorize("code editor for developers") == "Code & Development"
        assert self.scraper._categorize("data visualization dashboard") == "Data Analysis"
        assert self.scraper._categorize("random tool description") == "Other"
    
    def test_validate_tool_valid(self):
        tool = {
            'name': 'Test Tool',
            'description': 'This is a test tool for testing',
            'website': 'https://example.com'
        }
        assert self.scraper._validate_tool(tool) == True
    
    def test_validate_tool_invalid_url(self):
        tool = {
            'name': 'Test Tool',
            'description': 'This is a test tool',
            'website': 'example.com'  # Missing protocol
        }
        assert self.scraper._validate_tool(tool) == False
    
    def test_validate_tool_missing_field(self):
        tool = {
            'name': 'Test Tool',
            'website': 'https://example.com'
            # Missing description
        }
        assert self.scraper._validate_tool(tool) == False


class TestHackerNewsScraper:
    def setup_method(self):
        self.scraper = HackerNewsScraper()
    
    def test_extract_tags(self):
        tags = self.scraper._extract_tags("Show HN: AI powered open source developer tools")
        assert 'AI' in tags
        assert 'Open Source' in tags
        assert 'Developer Tools' in tags
    
    def test_categorize(self):
        assert self.scraper._categorize("programming tool for developers") == "Code & Development"
        assert self.scraper._categorize("productivity app for tasks") == "Productivity"


class TestProductHuntScraper:
    def setup_method(self):
        self.scraper = ProductHuntScraper()
    
    def test_is_ai_related(self):
        assert self.scraper._is_ai_related("New AI chatbot for customer service") == True
        assert self.scraper._is_ai_related("Machine learning tool") == True
        assert self.scraper._is_ai_related("Simple calculator app") == False
    
    def test_extract_tags(self):
        tags = self.scraper._extract_tags("AI powered automation chatbot")
        assert 'AI' in tags
        assert 'Automation' in tags
        assert 'Chatbot' in tags


class TestScraperUtils:
    def test_deduplicate_tools(self):
        tools = [
            {'name': 'Tool A', 'description': 'desc1', 'website': 'http://a.com'},
            {'name': 'Tool B', 'description': 'desc2', 'website': 'http://b.com'},
            {'name': 'tool a', 'description': 'desc3', 'website': 'http://a.com'},  # Duplicate
        ]
        unique = deduplicate_tools(tools)
        assert len(unique) == 2
    
    def test_validate_tool_valid(self):
        tool = {
            'name': 'Valid Tool',
            'description': 'A good description that is different from name',
            'website': 'https://example.com'
        }
        assert validate_tool(tool) == True
    
    def test_validate_tool_short_description(self):
        tool = {
            'name': 'Tool',
            'description': 'hi',  # Too short
            'website': 'https://example.com'
        }
        assert validate_tool(tool) == False
    
    def test_validate_tool_same_name_description(self):
        tool = {
            'name': 'Same Text',
            'description': 'same text',  # Same as name
            'website': 'https://example.com'
        }
        assert validate_tool(tool) == False
    
    def test_normalize_url(self):
        url = "https://example.com/page?utm_source=twitter&utm_campaign=summer&id=123#section"
        normalized = normalize_url(url)
        assert 'utm_source' not in normalized
        assert 'utm_campaign' not in normalized
        assert 'id=123' in normalized
        assert '#section' not in normalized


class TestScraperManager:
    def setup_method(self):
        self.manager = ScraperManager(parallel=False)
    
    @patch('devto_scraper.DevToScraper.scrape')
    @patch('hacker_news_scraper.HackerNewsScraper.scrape')
    @patch('product_hunt_scraper.ProductHuntScraper.scrape')
    def test_scrape_all(self, mock_ph, mock_hn, mock_devto):
        # Mock scraper responses
        mock_devto.return_value = [
            {'name': 'Tool1', 'description': 'desc1', 'website': 'https://t1.com', 
             'source': 'Dev.to', 'tags': [], 'category': 'Other', 'added_date': '2024-01-01'}
        ]
        mock_hn.return_value = [
            {'name': 'Tool2', 'description': 'desc2', 'website': 'https://t2.com',
             'source': 'Hacker News', 'tags': [], 'category': 'Other', 'added_date': '2024-01-01'}
        ]
        mock_ph.return_value = [
            {'name': 'Tool3', 'description': 'desc3', 'website': 'https://t3.com',
             'source': 'Product Hunt', 'tags': [], 'category': 'Other', 'added_date': '2024-01-01'}
        ]
        
        tools = self.manager.scrape_all()
        
        assert len(tools) == 3
        assert mock_devto.called
        assert mock_hn.called
        assert mock_ph.called
    
    def test_get_source_stats(self):
        self.manager.last_results = [
            {'source': 'Dev.to', 'category': 'Code & Development'},
            {'source': 'Dev.to', 'category': 'Data Analysis'},
            {'source': 'Hacker News', 'category': 'Code & Development'},
        ]
        
        stats = self.manager.get_source_stats()
        
        assert stats['Dev.to']['count'] == 2
        assert stats['Hacker News']['count'] == 1
        assert stats['Dev.to']['categories']['Code & Development'] == 1
    
    def test_filter_by_category(self):
        self.manager.last_results = [
            {'name': 'Tool1', 'category': 'Code & Development', 'description': 'test', 'website': 'http://t1.com'},
            {'name': 'Tool2', 'category': 'Data Analysis', 'description': 'test', 'website': 'http://t2.com'},
            {'name': 'Tool3', 'category': 'Code & Development', 'description': 'test', 'website': 'http://t3.com'},
        ]
        
        code_tools = self.manager.filter_by_category('Code & Development')
        
        assert len(code_tools) == 2
        assert all(t['category'] == 'Code & Development' for t in code_tools)


# Run tests with: pytest test_scrapers.py -v