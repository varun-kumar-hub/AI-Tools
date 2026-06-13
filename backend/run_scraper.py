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


def validate_env():
    """Check that required environment variables are set before running."""
    required = ['SUPABASE_URL', 'SUPABASE_KEY']
    missing = [var for var in required if not os.environ.get(var)]
    if missing:
        logger.error(f"❌ Missing required env vars: {', '.join(missing)}")
        sys.exit(1)

    # Warn if service role key is not set (inserts may fail due to RLS)
    if not os.environ.get('SUPABASE_SERVICE_ROLE_KEY'):
        logger.warning(
            "⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. "
            "Inserts may fail silently due to Row Level Security (RLS) policies. "
            "The service role key bypasses RLS and is required for scraper inserts."
        )


def main():
    validate_env()

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
    total_failed = 0
    total_rls_blocked = 0
    total_candidates = 0

    for scraper in scrapers:
        name = scraper.__class__.__name__
        logger.info(f"▶ Running {name}...")
        try:
            tools = scraper.scrape(limit=60)
            logger.info(f"  Found {len(tools)} candidate tools")
            total_candidates += len(tools)

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

                    response = supabase.table('ai_tools').insert(tool).execute()

                    # Validate insert actually succeeded
                    if response.data and len(response.data) > 0:
                        total_added += 1
                        logger.info(f"  + Added: {tool['name'][:60]}")
                    else:
                        # Insert returned empty data — likely RLS blocking
                        total_rls_blocked += 1
                        logger.error(
                            f"  ⚠️ INSERT returned empty for '{tool['name'][:60]}' — "
                            f"likely blocked by RLS. Check SUPABASE_SERVICE_ROLE_KEY."
                        )

                except Exception as e:
                    total_failed += 1
                    error_msg = str(e).lower()
                    if 'row-level security' in error_msg or 'rls' in error_msg or '403' in error_msg:
                        total_rls_blocked += 1
                        logger.error(
                            f"  🔒 RLS BLOCKED insert for '{tool.get('name', '?')[:60]}': {e}"
                        )
                    else:
                        logger.error(f"  ✗ Error inserting '{tool.get('name', '?')}': {e}")

        except Exception as e:
            logger.error(f"  ✗ {name} failed: {e}")

    # Summary
    logger.info(f"\n{'='*60}")
    logger.info(f"📊 SCRAPER RESULTS SUMMARY")
    logger.info(f"{'='*60}")
    logger.info(f"  Candidates found:    {total_candidates}")
    logger.info(f"  ✅ Added:            {total_added}")
    logger.info(f"  ⏭️  Skipped (dupes):  {total_skipped}")
    logger.info(f"  ❌ Failed:           {total_failed}")
    logger.info(f"  🔒 RLS blocked:      {total_rls_blocked}")
    logger.info(f"{'='*60}")

    # Exit with error if RLS is blocking everything (so GitHub Actions marks run as failed)
    if total_rls_blocked > 0 and total_added == 0:
        logger.error(
            "❌ CRITICAL: All inserts were blocked by RLS! "
            "Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly in GitHub Actions secrets."
        )
        sys.exit(1)

    if total_candidates == 0:
        logger.warning("⚠️ No candidate tools found from any scraper. APIs may be down or rate-limited.")


if __name__ == '__main__':
    main()
