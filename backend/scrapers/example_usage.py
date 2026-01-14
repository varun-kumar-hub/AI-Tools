"""
Example usage of the AI Tools Scrapers

This file demonstrates various ways to use the scraper system.
"""
import logging
import json
from datetime import datetime

from scraper_manager import ScraperManager
from devto_scraper import DevToScraper
from hacker_news_scraper import HackerNewsScraper
from product_hunt_scraper import ProductHuntScraper


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def example_1_basic_usage():
    """Example 1: Basic usage - scrape all sources"""
    print("\n" + "="*70)
    print("EXAMPLE 1: Basic Usage - Scrape All Sources")
    print("="*70 + "\n")
    
    manager = ScraperManager(parallel=True)
    tools = manager.scrape_all()
    
    print(f"✓ Scraped {len(tools)} tools successfully")
    
    # Display first tool as example
    if tools:
        print("\nFirst tool example:")
        print(json.dumps(tools[0], indent=2))


def example_2_specific_sources():
    """Example 2: Scrape only specific sources"""
    print("\n" + "="*70)
    print("EXAMPLE 2: Scrape Specific Sources")
    print("="*70 + "\n")
    
    manager = ScraperManager(parallel=True)
    
    # Only scrape Dev.to and Hacker News
    tools = manager.scrape_all(sources=['devto', 'hackernews'])
    
    print(f"✓ Scraped {len(tools)} tools from Dev.to and Hacker News")


def example_3_individual_scraper():
    """Example 3: Use individual scraper directly"""
    print("\n" + "="*70)
    print("EXAMPLE 3: Use Individual Scraper")
    print("="*70 + "\n")
    
    scraper = ProductHuntScraper()
    tools = scraper.scrape()
    
    print(f"✓ Scraped {len(tools)} tools from Product Hunt")
    
    # Show categories found
    categories = set(tool['category'] for tool in tools)
    print(f"Categories found: {', '.join(categories)}")


def example_4_statistics():
    """Example 4: Get statistics about scraped data"""
    print("\n" + "="*70)
    print("EXAMPLE 4: Get Statistics")
    print("="*70 + "\n")
    
    manager = ScraperManager(parallel=True)
    tools = manager.scrape_all()
    
    # Source statistics
    print("Source Statistics:")
    stats = manager.get_source_stats()
    for source, data in stats.items():
        print(f"\n  {source}:")
        print(f"    Total: {data['count']} tools")
        print(f"    Categories:")
        for category, count in data['categories'].items():
            print(f"      - {category}: {count}")
    
    # Category distribution
    print("\nCategory Distribution:")
    categories = manager.get_category_distribution()
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        bar = "█" * (count * 2)
        print(f"  {category:.<30} {count:>3} {bar}")


def example_5_filtering():
    """Example 5: Filter tools by category or source"""
    print("\n" + "="*70)
    print("EXAMPLE 5: Filter Tools")
    print("="*70 + "\n")
    
    manager = ScraperManager(parallel=True)
    manager.scrape_all()
    
    # Filter by category
    code_tools = manager.filter_by_category('Code & Development')
    print(f"Code & Development tools: {len(code_tools)}")
    
    # Filter by source
    devto_tools = manager.filter_by_source('Dev.to')
    print(f"Dev.to tools: {len(devto_tools)}")
    
    # Show a couple of filtered tools
    if code_tools:
        print("\nSample Code & Development tools:")
        for tool in code_tools[:2]:
            print(f"  • {tool['name']}")
            print(f"    {tool['website']}")


def example_6_export_to_json():
    """Example 6: Export scraped data to JSON"""
    print("\n" + "="*70)
    print("EXAMPLE 6: Export to JSON")
    print("="*70 + "\n")
    
    manager = ScraperManager(parallel=True)
    tools = manager.scrape_all()
    
    # Prepare data for export
    export_data = {
        'scraped_at': datetime.now().isoformat(),
        'total_tools': len(tools),
        'tools': tools
    }
    
    # Save to file
    filename = f"ai_tools_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Exported {len(tools)} tools to {filename}")


def example_7_sequential_scraping():
    """Example 7: Sequential scraping (slower but more controlled)"""
    print("\n" + "="*70)
    print("EXAMPLE 7: Sequential Scraping")
    print("="*70 + "\n")
    
    # Create manager with parallel=False for sequential execution
    manager = ScraperManager(parallel=False)
    tools = manager.scrape_all()
    
    print(f"✓ Scraped {len(tools)} tools sequentially")


def example_8_error_handling():
    """Example 8: Handling errors gracefully"""
    print("\n" + "="*70)
    print("EXAMPLE 8: Error Handling")
    print("="*70 + "\n")
    
    try:
        manager = ScraperManager(parallel=True)
        
        # Try to scrape with invalid source name
        tools = manager.scrape_all(sources=['invalid_source'])
        print(f"Result: {len(tools)} tools (should be 0)")
        
        # Try with valid sources
        tools = manager.scrape_all(sources=['devto'])
        print(f"✓ Successfully scraped from valid source: {len(tools)} tools")
        
    except Exception as e:
        logger.error(f"Error occurred: {e}")


def example_9_custom_processing():
    """Example 9: Custom processing of scraped data"""
    print("\n" + "="*70)
    print("EXAMPLE 9: Custom Processing")
    print("="*70 + "\n")
    
    manager = ScraperManager(parallel=True)
    tools = manager.scrape_all()
    
    # Find tools with most tags
    tools_with_tags = [t for t in tools if t.get('tags')]
    if tools_with_tags:
        most_tagged = max(tools_with_tags, key=lambda x: len(x['tags']))
        print(f"Tool with most tags: {most_tagged['name']}")
        print(f"Tags: {', '.join(most_tagged['tags'])}")
    
    # Group by category
    by_category = {}
    for tool in tools:
        category = tool.get('category', 'Other')
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(tool['name'])
    
    print(f"\nTools by category:")
    for category, tool_names in by_category.items():
        print(f"  {category}: {len(tool_names)} tools")


def run_all_examples():
    """Run all examples"""
    examples = [
        example_1_basic_usage,
        example_2_specific_sources,
        example_3_individual_scraper,
        example_4_statistics,
        example_5_filtering,
        example_6_export_to_json,
        example_7_sequential_scraping,
        example_8_error_handling,
        example_9_custom_processing
    ]
    
    for example in examples:
        try:
            example()
        except Exception as e:
            logger.error(f"Error in {example.__name__}: {e}")
        
        input("\nPress Enter to continue to next example...")


if __name__ == "__main__":
    print("\n🤖 AI Tools Scraper - Example Usage\n")
    print("This script demonstrates various ways to use the scraper system.")
    print("\nChoose an example to run:")
    print("  1. Basic usage - scrape all sources")
    print("  2. Scrape specific sources")
    print("  3. Use individual scraper")
    print("  4. Get statistics")
    print("  5. Filter tools")
    print("  6. Export to JSON")
    print("  7. Sequential scraping")
    print("  8. Error handling")
    print("  9. Custom processing")
    print("  0. Run all examples")
    
    choice = input("\nEnter your choice (0-9): ").strip()
    
    examples = {
        '1': example_1_basic_usage,
        '2': example_2_specific_sources,
        '3': example_3_individual_scraper,
        '4': example_4_statistics,
        '5': example_5_filtering,
        '6': example_6_export_to_json,
        '7': example_7_sequential_scraping,
        '8': example_8_error_handling,
        '9': example_9_custom_processing,
        '0': run_all_examples
    }
    
    if choice in examples:
        examples[choice]()
    else:
        print("Invalid choice. Please run again with a valid option.")