"""
Utility functions for web scrapers
"""
import time
from functools import wraps
import logging

logger = logging.getLogger(__name__)


def rate_limit(calls=1, period=1):
    """
    Decorator to rate limit function calls
    
    Args:
        calls: Number of calls allowed (currently only supports 1)
        period: Time period in seconds
    
    Example:
        @rate_limit(calls=1, period=2)
        def my_api_call():
            pass
    """
    def decorator(func):
        last_called = [0.0]
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = period - elapsed
            if wait_time > 0:
                time.sleep(wait_time)
            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        return wrapper
    return decorator


def get_session_with_retries():
    """
    Create a requests session with automatic retry logic
    
    Returns:
        requests.Session: Configured session with retry logic
    """
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.3,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


def deduplicate_tools(tools_list):
    """
    Remove duplicate tools based on name similarity
    
    Args:
        tools_list: List of tool dictionaries
    
    Returns:
        list: Deduplicated list of tools
    """
    seen = {}
    unique_tools = []
    
    for tool in tools_list:
        # Normalize name for comparison
        name_key = tool['name'].lower().strip()
        
        # Check if we've seen this name or a very similar one
        if name_key not in seen:
            seen[name_key] = True
            unique_tools.append(tool)
        else:
            logger.debug(f"Skipping duplicate tool: {tool['name']}")
    
    logger.info(f"Deduplication: {len(tools_list)} -> {len(unique_tools)} tools")
    return unique_tools


def validate_tool(tool):
    """
    Validate tool data meets minimum quality standards
    
    Args:
        tool: Dictionary containing tool information
    
    Returns:
        bool: True if tool is valid, False otherwise
    """
    required_fields = ['name', 'description', 'url']
    
    # Check required fields exist and aren't empty
    for field in required_fields:
        if not tool.get(field):
            logger.debug(f"Missing field: {field}")
            return False
        
        if len(str(tool[field]).strip()) < 3:
            logger.debug(f"Tool field '{field}' too short: {tool[field]}")
            return False
    
    # Check if URL is valid
    if not tool['url'].startswith(('http://', 'https://')):
        logger.debug(f"Invalid URL: {tool['url']}")
        return False
    
    # Check description is meaningful (not just title repeated)
    if tool['name'].lower() == tool['description'].lower():
        logger.debug(f"Description same as name: {tool['name']}")
        return False
    
    return True


def normalize_url(url):
    """
    Normalize URL by removing tracking parameters and fragments
    
    Args:
        url: URL string
    
    Returns:
        str: Normalized URL
    """
    from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
    
    parsed = urlparse(url)
    
    # Remove common tracking parameters
    tracking_params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref']
    
    query_params = parse_qs(parsed.query)
    filtered_params = {k: v for k, v in query_params.items() if k not in tracking_params}
    
    # Rebuild URL without tracking params and fragment
    normalized = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        urlencode(filtered_params, doseq=True),
        ''  # Remove fragment
    ))
    
    return normalized


def extract_domain(url):
    """
    Extract domain from URL
    
    Args:
        url: URL string
    
    Returns:
        str: Domain name
    """
    from urllib.parse import urlparse
    
    parsed = urlparse(url)
    return parsed.netloc


def safe_get(dictionary, *keys, default=''):
    """
    Safely get nested dictionary values
    
    Args:
        dictionary: Dict to extract from
        *keys: Keys to traverse
        default: Default value if key not found
    
    Returns:
        Value or default
    
    Example:
        safe_get(data, 'user', 'profile', 'name', default='Unknown')
    """
    current = dictionary
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key)
            if current is None:
                return default
        else:
            return default
    return current if current is not None else default