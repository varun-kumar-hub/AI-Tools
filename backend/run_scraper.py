"""
Standalone scraper script for GitHub Actions.
Runs all scrapers and inserts new tools into Supabase.
"""
import os
import sys
import logging

# Add backend to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger('run_scraper')

def main():
    from supabase_client import get_supabase_client
    from scrapers import ProductHuntScraper, HackerNewsScraper, DevToScraper

    supabase = get_supabase_client()
    logger.info("✅ Supabase connected")

    scrapers = [
        ProductHuntScraper(),
        HackerNewsScraper(),
        DevToScraper(),
    ]

    total_added = 0
    total_skipped = 0

    for scraper in scrapers:
        name = scraper.__class__.__name__
        logger.info(f"▶ Running {name}...")
        try:
            tools = scraper.scrape(limit=60)
            logger.info(f"  Found {len(tools)} candidate tools")

            for tool in tools:
                try:
                    # Check for duplicate by URL first (most reliable), then name
                    dup_url = supabase.table('ai_tools').select('id').eq('url', tool['url']).execute()
                    if dup_url.data:
                        total_skipped += 1
                        continue

                    dup_name = supabase.table('ai_tools').select('id').eq('name', tool['name']).execute()
                    if dup_name.data:
                        total_skipped += 1
                        continue

                    # Ensure is_deleted is set
                    tool.setdefault('is_deleted', False)

                    supabase.table('ai_tools').insert(tool).execute()
                    total_added += 1
                    logger.info(f"  + Added: {tool['name'][:60]}")

                except Exception as e:
                    logger.error(f"  ✗ Error inserting '{tool.get('name', '?')}': {e}")

        except Exception as e:
            logger.error(f"  ✗ {name} failed: {e}")

    logger.info(f"\n{'='*50}")
    logger.info(f"✅ Done! Added: {total_added} | Skipped (duplicates): {total_skipped}")
    logger.info(f"{'='*50}")

if __name__ == '__main__':
    main()
