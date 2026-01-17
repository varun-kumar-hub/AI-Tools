import logging
import sys
import os

# Add parent directory to path to handle imports if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.scrapers import ProductHuntScraper, HackerNewsScraper, DevToScraper

# Configure logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def debug_scrapers():
    print("Testing individual scrapers with limit=30")
    
    print("\n--- Product Hunt ---")
    try:
        ph = ProductHuntScraper()
        count = len(ph.scrape(limit=30))
        print(f"Product Hunt Count: {count}")
    except Exception as e:
        print(f"Product Hunt Error: {e}")
    
    print("\n--- Hacker News ---")
    try:
        hn = HackerNewsScraper()
        count = len(hn.scrape(limit=30))
        print(f"Hacker News Count: {count}")
    except Exception as e:
        print(f"Hacker News Error: {e}")
    
    print("\n--- Dev.to ---")
    try:
        dt = DevToScraper()
        count = len(dt.scrape(limit=30))
        print(f"Dev.to Count: {count}")
    except Exception as e:
        print(f"Dev.to Error: {e}")

if __name__ == "__main__":
    debug_scrapers()
