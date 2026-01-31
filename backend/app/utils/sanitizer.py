import bleach
from typing import Optional

BLEACH_ALLOWED_TAGS = set(bleach.ALLOWED_TAGS)
ADDITIONAL_TAGS = {'iframe', 'h1', 'h2', 'h3', 'hr', 'pre', 'code', 'img'}
ALLOWED_TAGS = BLEACH_ALLOWED_TAGS.union(ADDITIONAL_TAGS)

ALLOWED_ATTRIBUTES = {
    **bleach.ALLOWED_ATTRIBUTES,
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    'img': ['src', 'alt', 'width', 'height'],
    'a': ['href', 'target', 'rel'],
}

def sanitize_html(html: str, allow_iframe: bool = False) -> str:
    """Sanitize HTML to prevent XSS attacks.
    
    Args:
        html: Raw HTML string to sanitize
        allow_iframe: Whether to allow iframe tags (only YouTube iframes)
    
    Returns:
        Sanitized HTML string
    """
    tags = ALLOWED_TAGS.copy()
    
    # Only allow YouTube iframes
    def iframe_filter(tag: str, name: str, value: str) -> bool:
        if name == 'src' and 'youtube.com' not in value and 'youtu.be' not in value:
            return False
        return True
    
    if not allow_iframe:
        tags = tags - {'iframe'}
    
    return bleach.clean(
        html,
        tags=list(tags),
        attributes=ALLOWED_ATTRIBUTES,
        strip=True,
    )

def sanitize_text(text: str) -> str:
    """Sanitize plain text to prevent XSS.
    
    Args:
        text: Plain text string to sanitize
    
    Returns:
        Sanitized plain text string
    """
    return bleach.clean(text, tags=[], strip=True)