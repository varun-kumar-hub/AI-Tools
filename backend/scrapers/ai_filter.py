"""
Shared AI keyword filter used across all scrapers.
Only tools/posts that mention at least one of these keywords are kept.
Keywords are intentionally AI/ML-specific to avoid generic tech articles.
"""

# Primary AI keywords — must match at least ONE of these in title+description
AI_KEYWORDS = [
    # Core AI/ML
    'artificial intelligence', ' ai ', 'ai-', 'ai tool', 'ai platform', 'ai app',
    'machine learning', ' ml ', 'deep learning', 'neural network', 'neural net',
    # Popular AI brands/models
    'openai', 'chatgpt', 'gpt-4', 'gpt-3', 'gpt4', 'gpt3', 'gpt',
    'claude', 'anthropic', 'gemini', 'llama', 'mistral', 'groq',
    'hugging face', 'huggingface',
    # LLM concepts
    'llm', 'large language model', 'language model',
    'rag', 'retrieval augmented', 'vector database', 'vector db', 'embedding',
    'fine-tun', 'finetuning', 'prompt engineer',
    # AI agent / automation
    'ai agent', 'autonomous agent', 'agentic', 'multi-agent', 'autoagent',
    'ai assistant', 'ai copilot', 'copilot',
    # Generative AI
    'generative ai', 'gen ai', 'genai',
    'text-to-image', 'text to image', 'image generation', 'ai image',
    'text-to-video', 'text to video', 'ai video', 'video generation',
    'text-to-speech', 'text to speech', 'ai voice', 'voice synthesis', 'voice cloning',
    'stable diffusion', 'midjourney', 'dall-e', 'dalle',
    # AI capabilities
    'ai-powered', 'ai powered', 'powered by ai', 'powered by llm',
    'ai-generated', 'ai generated', 'ai-driven', 'ai driven',
    'natural language processing', 'nlp', 'sentiment analysis',
    'computer vision', 'object detection', 'image recognition',
    'speech recognition', 'transcription ai', 'ai transcription',
    'ai summariz', 'ai summar',
    # Specific AI tools / frameworks
    'langchain', 'llamaindex', 'llama index', 'autogpt', 'babyagi',
    'openai api', 'gemini api', 'anthropic api',
    'ai workflow', 'ai chatbot', 'chatbot ai',
    'ai search', 'semantic search',
    'ai writing', 'ai content', 'ai code', 'ai coding',
    'ai model', 'foundation model', 'transformer model',
    # Functional AI tools
    'ai detector', 'ai detection',
    'ai productivity', 'ai automation',
    'ai analytics', 'predictive ai',
    'ai for', 'using ai', 'with ai',
    'ai writing', 'ai content', 'ai copywriter', 'ai blogging',
    'ai audio', 'ai voice', 'ai podcast', 'ai music generation',
    'ai video', 'ai video editing', 'ai video generator', 'ai animation',

    # General Tech & Development
    'software', 'saas', 'cloud', 'api ', 'framework', 'database', 'developer tools',
    'devtools', 'cybersecurity', 'blockchain', 'web3', 'fintech', 'edtech',
    'healthtech', 'data science', 'big data', 'automation', 'devops', 'frontend',
    'backend', 'fullstack', 'open source', 'oss', 'startup',
    'technology', 'innovation', 'app development', 'web development',
    'mobile app', 'ios', 'android', 'react', 'next.js', 'python', 'javascript',
    'typescript', 'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'serverless',
    'machine vision', 'robotics', 'iot', 'internet of things', 'ar/vr', 'virtual reality',
    'augmented reality', 'quantum computing', 'edge computing', '5g',
]

# Convert all to lowercase once for performance
AI_KEYWORDS_LOWER = [kw.lower() for kw in AI_KEYWORDS]


def is_ai_tool(text: str) -> bool:
    """
    Returns True if the given text (title + description) is AI-related.
    Uses a broad but AI-specific keyword list to avoid generic tech articles.
    """
    if not text:
        return False
    text_lower = text.lower()
    return any(kw in text_lower for kw in AI_KEYWORDS_LOWER)
