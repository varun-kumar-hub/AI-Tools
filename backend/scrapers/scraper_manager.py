"""
Main scraper manager that orchestrates all scrapers
"""
import logging
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

from .devto_scraper import DevToScraper
from .hacker_news_scraper import HackerNewsScraper
from .product_hunt_scraper import ProductHuntScraper

from .scraper_utils import deduplicate_tools, validate_tool


logger = logging.getLogger(__name__)


class ScraperManager:
    """
    Manages all scrapers and coordinates data collection
    """
    
    def __init__(self, parallel=True):
        """
        Initialize scraper manager
        
        Args:
            parallel: Whether to run scrapers in parallel (default: True)
        """
        self.scrapers = {
            'devto': DevToScraper(),
            'hackernews': HackerNewsScraper(),
            'producthunt': ProductHuntScraper()
        }
        self.parallel = parallel
        self.last_scrape_time = None
        self.last_results = None
    
    def scrape_all(self, sources=None):
        """
        Scrape from all or specific sources
        
        Args:
            sources: List of source names to scrape. If None, scrapes all.
                    Valid values: ['devto', 'hackernews', 'producthunt']
        
        Returns:
            list: Consolidated and deduplicated list of tools
        """
        start_time = time.time()
        
        # Determine which sources to scrape
        if sources is None:
            sources_to_scrape = self.scrapers.keys()
        else:
            sources_to_scrape = [s for s in sources if s in self.scrapers]
            if not sources_to_scrape:
                logger.error(f"No valid sources provided. Valid sources: {list(self.scrapers.keys())}")
                return []
        
        logger.info(f"Starting scrape from sources: {list(sources_to_scrape)}")
        
        all_tools = []
        
        if self.parallel:
            all_tools = self._scrape_parallel(sources_to_scrape)
        else:
            all_tools = self._scrape_sequential(sources_to_scrape)
        
        # Process results
        logger.info(f"Raw tools collected: {len(all_tools)}")
        
        # Validate tools
        valid_tools = [tool for tool in all_tools if validate_tool(tool)]
        logger.info(f"Valid tools after validation: {len(valid_tools)}")
        
        # Deduplicate
        unique_tools = deduplicate_tools(valid_tools)
        logger.info(f"Unique tools after deduplication: {len(unique_tools)}")
        
        elapsed_time = time.time() - start_time
        logger.info(f"Scraping completed in {elapsed_time:.2f} seconds")
        
        # Store results
        self.last_scrape_time = time.time()
        self.last_results = unique_tools
        
        return unique_tools
    
    def _scrape_parallel(self, sources):
        """
        Scrape sources in parallel using ThreadPoolExecutor
        
        Args:
            sources: List of source names to scrape
        
        Returns:
            list: Combined list of tools from all sources
        """
        all_tools = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Submit all scraper tasks
            future_to_source = {
                executor.submit(self.scrapers[source].scrape): source 
                for source in sources
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    tools = future.result(timeout=30)
                    all_tools.extend(tools)
                    logger.info(f"✓ {source}: {len(tools)} tools")
                except Exception as e:
                    logger.error(f"✗ {source} failed: {e}")
        
        return all_tools
    
    def _scrape_sequential(self, sources):
        """
        Scrape sources one by one
        
        Args:
            sources: List of source names to scrape
        
        Returns:
            list: Combined list of tools from all sources
        """
        all_tools = []
        
        for source in sources:
            try:
                logger.info(f"Scraping {source}...")
                scraper = self.scrapers[source]
                tools = scraper.scrape()
                all_tools.extend(tools)
                logger.info(f"✓ {source}: {len(tools)} tools")
            except Exception as e:
                logger.error(f"✗ {source} failed: {e}")
        
        return all_tools
    
    def get_source_stats(self):
        """
        Get statistics about the last scrape
        
        Returns:
            dict: Statistics by source
        """
        if not self.last_results:
            return {}
        
        stats = {}
        for tool in self.last_results:
            source = tool.get('source', 'Unknown')
            if source not in stats:
                stats[source] = {
                    'count': 0,
                    'categories': {}
                }
            stats[source]['count'] += 1
            
            category = tool.get('category', 'Other')
            stats[source]['categories'][category] = stats[source]['categories'].get(category, 0) + 1
        
        return stats
    
    def get_category_distribution(self):
        """
        Get distribution of tools by category
        
        Returns:
            dict: Count of tools per category
        """
        if not self.last_results:
            return {}
        
        distribution = {}
        for tool in self.last_results:
            category = tool.get('category', 'Other')
            distribution[category] = distribution.get(category, 0) + 1
        
        return distribution
    
    def filter_by_category(self, category):
        """
        Filter last results by category
        
        Args:
            category: Category name to filter by
        
        Returns:
            list: Tools in the specified category
        """
        if not self.last_results:
            return []
        
        return [tool for tool in self.last_results if tool.get('category') == category]
    
    def filter_by_source(self, source):
        """
        Filter last results by source
        
        Args:
            source: Source name to filter by
        
        Returns:
            list: Tools from the specified source
        """
        if not self.last_results:
            return []
        
        return [tool for tool in self.last_results if tool.get('source') == source]


# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create manager and scrape
    manager = ScraperManager(parallel=True)
    
    # Scrape from all sources
    tools = manager.scrape_all()
    
    # Display results
    print(f"\n{'='*60}")
    print(f"Total tools scraped: {len(tools)}")
    print(f"{'='*60}\n")
    
    # Show source statistics
    print("Source Statistics:")
    stats = manager.get_source_stats()
    for source, data in stats.items():
        print(f"  {source}: {data['count']} tools")
    
    # Show category distribution
    print("\nCategory Distribution:")
    categories = manager.get_category_distribution()
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count} tools")
    
    # Show sample tools
    print("\nSample Tools (first 3):")
    for i, tool in enumerate(tools[:3], 1):
        print(f"\n{i}. {tool['name']}")
        print(f"   Source: {tool['source']}")
        print(f"   Category: {tool['category']}")
        print(f"   URL: {tool['url']}")
        print(f"   Description: {tool['description'][:100]}...")