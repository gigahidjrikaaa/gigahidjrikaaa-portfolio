"""
scraper_service.py
------------------
Fetches a URL, extracts key metadata via BeautifulSoup, then sends the
content to the Z.AI API (OpenAI-compatible) for intelligent structuring
into one of three content-type schemas.

Supported content_type values:
  - "press_mention"   → maps to PressMentionBase
  - "blog_article"    → maps to BlogPostBase (is_external=True)
  - "project"         → maps to ProjectBase
"""

import json
import logging
import re
from typing import Any, Literal
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from openai import AsyncOpenAI

from ..core.config import settings

logger = logging.getLogger(__name__)

ContentType = Literal["press_mention", "blog_article", "project"]
SocialPlatform = Literal["twitter", "instagram", "facebook", "linkedin"]

# ---------------------------------------------------------------------------
# Social-platform detection
# ---------------------------------------------------------------------------

_SOCIAL_PATTERNS: dict[str, re.Pattern[str]] = {
    "twitter":   re.compile(r"(?:twitter\.com|x\.com)/\w+/status/\d+", re.I),
    "instagram": re.compile(r"instagram\.com/(?:p|reel|tv)/[A-Za-z0-9_-]+", re.I),
    "facebook":  re.compile(r"(?:facebook\.com|fb\.com|fb\.watch)", re.I),
    "linkedin":  re.compile(r"linkedin\.com/(?:posts?|feed/update|pulse|in/|company/)", re.I),
}

_SOCIAL_NAMES: dict[str, str] = {
    "twitter":   "X (Twitter)",
    "instagram": "Instagram",
    "facebook":  "Facebook",
    "linkedin":  "LinkedIn",
}


def detect_social_platform(url: str) -> str | None:
    """Return the social platform key if the URL is a recognised social post, else None."""
    for platform, pattern in _SOCIAL_PATTERNS.items():
        if pattern.search(url):
            return platform
    return None


def _social_username_from_url(url: str, platform: str) -> str:
    """Best-effort extraction of a username / page name from a social URL."""
    parts = [p for p in urlparse(url).path.split("/") if p]
    if platform in ("twitter", "instagram") and parts:
        return "@" + parts[0]
    if platform == "linkedin" and len(parts) >= 2:
        return parts[1]
    if platform == "facebook" and parts:
        return parts[0]
    return ""


async def _fetch_twitter_oembed(url: str) -> dict[str, Any]:
    """
    Call the free Twitter/X oEmbed endpoint (no auth required).
    Returns the raw oEmbed JSON dict, or {} on failure.
    """
    oembed_url = f"https://publish.twitter.com/oembed?url={url}&omit_script=true&dnt=true"
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(oembed_url)
        if resp.status_code == 200:
            return resp.json()
    except Exception as exc:
        logger.warning("Twitter oEmbed failed for %s: %s", url, exc)
    return {}


def _extract_tweet_text(html: str) -> str:
    """Strip tags from oEmbed HTML and return the plain tweet text."""
    soup = BeautifulSoup(html, "lxml")
    # Remove trailing attribution links (<a> with twitter.com href)
    for a in soup.find_all("a", href=re.compile(r"twitter\.com|x\.com|t\.co")):
        a.decompose()
    text = re.sub(r"\s+", " ", soup.get_text(separator=" ")).strip()
    return text[:320]


def _build_social_metadata(url: str, platform: str) -> dict[str, Any]:
    """
    Return a partial scraped-metadata dict for platforms where HTML scraping
    is blocked.  The caller should add the `_social_platform` hint so the
    frontend can show a specialised form.
    """
    username = _social_username_from_url(url, platform)
    pub_name = _SOCIAL_NAMES.get(platform, platform.title())
    domain   = urlparse(url).netloc.replace("www.", "")
    return {
        "url":             url,
        "title":           "",          # user must supply
        "description":     "",
        "image_url":       "",
        "site_name":       pub_name,
        "published_time":  "",
        "author":          username,
        "domain":          domain,
        "content_snippet": "",
        "keywords":        [],
        "article_section": "",
        # Extra hint consumed by _fallback_extraction and the frontend
        "_social_platform": platform,
        "_social_username": username,
    }


# ---------------------------------------------------------------------------
# Scraping helpers
# ---------------------------------------------------------------------------

SCRAPER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    # Intentionally omit 'br' (brotli) — httpx can only decode it when the
    # optional 'brotlicffi' package is installed. Gzip/deflate is universally
    # supported and avoids garbled binary responses from sites like Kompas.id.
    "Accept-Encoding": "gzip, deflate",
    "Cache-Control": "no-cache",
}

CONTENT_SELECTORS = [
    "article",
    "main",
    '[role="main"]',
    ".post-content",
    ".entry-content",
    ".article-content",
    ".article-body",
    ".post-body",
    "#content",
    ".content",
]

BOILERPLATE_TAGS = [
    "script", "style", "nav", "header", "footer", "aside",
    "noscript", "iframe", "form", "button", "svg",
]

# HTML selectors likely to contain author bylines, in priority order
AUTHOR_SELECTORS = [
    "[rel='author']",
    "[itemprop='author']",
    ".author-name", ".author__name", ".byline-name",
    ".byline", ".article-author", ".post-author",
    "[class*='author']", "[class*='byline']",
    "address",
]

# Keyword → category mapping for automatic category inference
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Engineering": [
        "engineering", "backend", "frontend", "devops", "infrastructure",
        "system design", "architecture", "microservice", "kubernetes", "docker",
        "api", "database", "server",
    ],
    "Design": [
        "design", "ui", "ux", "user experience", "figma", "prototype",
        "visual", "interface", "wireframe", "usability",
    ],
    "Career": [
        "career", "job", "interview", "hiring", "resume", "linkedin",
        "professional", "internship", "salary", "workplace",
    ],
    "Tutorial": [
        "tutorial", "how to", "how-to", "guide", "step by step",
        "learn", "course", "walkthrough", "getting started",
    ],
    "Reflection": [
        "reflection", "story", "journey", "lesson", "experience",
        "thoughts", "opinion", "lessons learned",
    ],
    # "Technology" is the catch-all — matched last
    "Technology": [
        "ai", "machine learning", "deep learning", "software", "tech",
        "digital", "programming", "code", "data", "algorithm", "python",
        "javascript", "blockchain", "cloud", "startup", "innovation",
        "mental health", "application", "platform", "model",
    ],
}


# ---------------------------------------------------------------------------
# Low-level metadata helpers
# ---------------------------------------------------------------------------

def _get_meta(soup: BeautifulSoup, *, property: str | None = None, name: str | None = None) -> str:
    """Extract a <meta> tag's content attribute."""
    if property:
        tag = soup.find("meta", property=property)
    elif name:
        tag = soup.find("meta", attrs={"name": name})
    else:
        return ""
    return str(tag.get("content") or "").strip() if tag else ""


def _get_ld_json(soup: BeautifulSoup) -> dict:
    """
    Extract the richest application/ld+json block available.
    Prefers Article/NewsArticle/BlogPosting types; falls back to the first item.
    """
    results: list[dict] = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string or "{}")
            if isinstance(data, list):
                results.extend([d for d in data if isinstance(d, dict)])
            elif isinstance(data, dict):
                results.append(data)
        except json.JSONDecodeError:
            continue

    article_types = ("Article", "NewsArticle", "BlogPosting", "WebPage")
    for item in results:
        if item.get("@type") in article_types:
            return item
    return results[0] if results else {}


def _extract_main_text(soup: BeautifulSoup, max_chars: int = 5000) -> str:
    """Remove boilerplate and return the primary page text."""
    for tag in soup(BOILERPLATE_TAGS):
        tag.decompose()

    for selector in CONTENT_SELECTORS:
        el = soup.select_one(selector)
        if el:
            return el.get_text(separator="\n", strip=True)[:max_chars]

    return soup.body.get_text(separator="\n", strip=True)[:max_chars] if soup.body else ""


def _clean_title(title: str, site_name: str) -> str:
    """
    Strip common ' | Site Name' or ' - Site Name' suffixes that appear in
    <title> tags but not in og:title.  Only strips if the suffix is short
    (≤ 60 chars) to avoid accidentally truncating short article titles.
    """
    if not title:
        return title
    for sep in (" | ", " - ", " — ", " – ", " · ", " :: ", " » "):
        if sep in title:
            parts = title.rsplit(sep, 1)
            suffix = parts[-1].strip()
            # Matches the known site name, or is a short generic suffix
            if len(parts) == 2 and (
                suffix.lower() == site_name.lower()
                or len(suffix) <= 60
            ):
                cleaned = parts[0].strip()
                # Sanity check: don't strip if the result is too short
                if len(cleaned) > 10:
                    return cleaned
    return title


def _extract_keywords(soup: BeautifulSoup, ld: dict) -> list[str]:
    """
    Return a deduplicated list of keyword strings from:
      1. <meta name="keywords">
      2. LD+JSON keywords array
      3. article:tag meta properties
    """
    kw_set: list[str] = []

    raw_kw = _get_meta(soup, name="keywords")
    if raw_kw:
        kw_set.extend([k.strip() for k in raw_kw.split(",") if k.strip()])

    ld_kw = ld.get("keywords")
    if isinstance(ld_kw, list):
        kw_set.extend([k for k in ld_kw if isinstance(k, str)])
    elif isinstance(ld_kw, str):
        kw_set.extend([k.strip() for k in ld_kw.split(",") if k.strip()])

    for tag in soup.find_all("meta", property="article:tag"):
        val = str(tag.get("content") or "").strip()
        if val:
            kw_set.append(val)

    # Deduplicate while preserving order
    seen: set[str] = set()
    result: list[str] = []
    for kw in kw_set:
        lk = kw.lower()
        if lk not in seen:
            seen.add(lk)
            result.append(kw)
    return result[:20]  # cap at 20 tags


def _extract_author(soup: BeautifulSoup, ld: dict) -> str:
    """
    Try multiple sources for a human-readable author name:
      1. LD+JSON author.name
      2. <meta name="author"> / <meta property="article:author">
      3. Common HTML byline selectors
    """
    # LD+JSON: author can be a Person object or a list
    ld_author = ld.get("author")
    if isinstance(ld_author, dict):
        name = ld_author.get("name", "")
        if name:
            return str(name).strip()
    elif isinstance(ld_author, list) and ld_author:
        first = ld_author[0]
        name = first.get("name", "") if isinstance(first, dict) else str(first)
        if name:
            return str(name).strip()

    for source in (
        _get_meta(soup, name="author"),
        _get_meta(soup, property="article:author"),
        _get_meta(soup, name="dc.creator"),
        _get_meta(soup, name="byl"),
    ):
        if source and not source.startswith("http"):
            return source

    # HTML byline selectors as last resort
    for selector in AUTHOR_SELECTORS:
        el = soup.select_one(selector)
        if el:
            text = el.get_text(strip=True)
            # Filter out long blocks that are likely not just an author name
            if text and 2 < len(text) < 80:
                # Strip common prefixes: "By John Smith" → "John Smith"
                text = re.sub(r"^(?:by|oleh|ditulis oleh)\s+", "", text, flags=re.IGNORECASE).strip()
                if text:
                    return text
    return ""


def _extract_published_date(soup: BeautifulSoup, ld: dict) -> str:
    """
    Try multiple sources for the article published date (ISO format).
    Returns the first non-empty value found.
    """
    candidates = [
        _get_meta(soup, property="article:published_time"),
        _get_meta(soup, property="og:published_time"),
        _get_meta(soup, name="date"),
        _get_meta(soup, name="pubdate"),
        _get_meta(soup, name="publish_date"),
        _get_meta(soup, name="DC.date"),
        str(ld.get("datePublished") or ""),
        str(ld.get("dateCreated") or ""),
        str(ld.get("dateModified") or ""),
    ]
    for candidate in candidates:
        if candidate and candidate.strip():
            # Normalise: take only the date portion (YYYY-MM-DD)
            match = re.search(r"\d{4}-\d{2}-\d{2}", candidate)
            if match:
                return match.group(0)
    return ""


def _make_excerpt(description: str, content_snippet: str, max_length: int = 320) -> str:
    """
    Build a short excerpt, preferring the OG description, then falling back
    to the first 2–3 sentences from the page body text.
    """
    if description and len(description.strip()) > 20:
        return description.strip()[:max_length]

    if not content_snippet:
        return ""

    # Split on sentence-ending punctuation followed by whitespace/newline
    sentences = re.split(r"(?<=[.!?])\s+|\n{2,}", content_snippet.strip())
    excerpt = ""
    for sent in sentences:
        sent = sent.strip()
        if not sent or len(sent) < 15:
            continue
        if len(excerpt) + len(sent) + 1 > max_length:
            break
        excerpt = (excerpt + " " + sent).strip()
        # Stop after collecting 2–3 good sentences
        if len(re.findall(r"[.!?]", excerpt)) >= 2:
            break
    return excerpt


def _infer_category(title: str, description: str, keywords: list[str]) -> str:
    """
    Guess the best category from the article text using keyword matching.
    Returns one of the CATEGORY_KEYWORDS keys, defaulting to 'Technology'.
    """
    combined = " ".join([title, description, " ".join(keywords)]).lower()
    for category, kw_list in CATEGORY_KEYWORDS.items():
        if any(kw in combined for kw in kw_list):
            return category
    return "Technology"


# ---------------------------------------------------------------------------
# Main scrape entry point
# ---------------------------------------------------------------------------

async def scrape_url(url: str) -> dict[str, Any]:
    """
    Fetch a URL and fully extract structured metadata from the page.

    Returns a dict with keys:
      url, title, description, image_url, site_name, published_time,
      author, domain, content_snippet, keywords, article_section

    For social-platform URLs:
      - Twitter/X posts: resolved via the public oEmbed API (no auth needed).
      - Instagram / Facebook / LinkedIn: blocked by login walls; returns an
        empty-field dict with `_social_platform` and `_social_username` keys
        so the frontend can show a specialised entry form.
    """
    # -----------------------------------------------------------------------
    # Social-platform short-circuit
    # -----------------------------------------------------------------------
    platform = detect_social_platform(url)

    if platform == "twitter":
        oembed = await _fetch_twitter_oembed(url)
        if oembed:
            tweet_text = _extract_tweet_text(oembed.get("html", ""))
            author      = oembed.get("author_name", "")
            return {
                "url":             url,
                "title":           tweet_text[:140] or "",
                "description":     tweet_text,
                "image_url":       oembed.get("thumbnail_url", ""),
                "site_name":       "X (Twitter)",
                "published_time":  "",
                "author":          author,
                "domain":          "x.com",
                "content_snippet": tweet_text,
                "keywords":        [],
                "article_section": "",
                # Frontend / fallback hints
                "_social_platform": "twitter",
                "_social_username":  ("@" + author) if author else "",
            }
        # oEmbed unavailable — fall through to normal HTML scrape

    elif platform in ("instagram", "facebook", "linkedin"):
        return _build_social_metadata(url, platform)

    # -----------------------------------------------------------------------
    # Normal HTML scrape
    # -----------------------------------------------------------------------
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers=SCRAPER_HEADERS,
        verify=False,  # some sites (e.g. Indonesian universities) have self-signed / expired certs
    ) as client:
        response = await client.get(url)

    # For 5xx errors on the target server, still attempt to parse whatever HTML came back.
    # Only raise for client-side errors (4xx) that indicate access denial.
    if response.status_code in (401, 403, 407):
        response.raise_for_status()
    elif response.status_code >= 400:
        logger.warning(
            "Target URL %s returned HTTP %s — attempting to parse anyway.",
            url, response.status_code,
        )

    html = response.text
    if not html or len(html.strip()) < 100:
        raise httpx.HTTPStatusError(
            f"HTTP {response.status_code}: empty or unusable response body",
            request=response.request,
            response=response,
        )

    soup = BeautifulSoup(html, "lxml")
    ld = _get_ld_json(soup)
    domain = urlparse(url).netloc.replace("www.", "")

    # --- site / publication name -------------------------------------------
    site_name = (
        _get_meta(soup, property="og:site_name")
        or (ld.get("publisher", {}).get("name") if isinstance(ld.get("publisher"), dict) else "")
        or domain
    )

    # --- title (prefer og:title; strip site suffix from raw <title>) --------
    raw_title = (
        _get_meta(soup, property="og:title")
        or _get_meta(soup, name="twitter:title")
        or str(ld.get("headline") or "")
        or ((soup.title.string or "").strip() if soup.title else "")
    )
    title = _clean_title(raw_title, site_name)

    # --- description --------------------------------------------------------
    description = (
        _get_meta(soup, property="og:description")
        or _get_meta(soup, name="twitter:description")
        or _get_meta(soup, name="description")
        or str(ld.get("description") or "")
    )

    # --- cover image --------------------------------------------------------
    ld_image = ld.get("image")
    ld_image_url = (
        ld_image.get("url", "") if isinstance(ld_image, dict)
        else (ld_image[0] if isinstance(ld_image, list) else str(ld_image or ""))
    )
    image_url = (
        _get_meta(soup, property="og:image")
        or _get_meta(soup, name="twitter:image")
        or ld_image_url
    )

    # --- date ---------------------------------------------------------------
    published_time = _extract_published_date(soup, ld)

    # --- author -------------------------------------------------------------
    author = _extract_author(soup, ld)

    # --- keywords & article section ----------------------------------------
    keywords = _extract_keywords(soup, ld)
    article_section = (
        _get_meta(soup, property="article:section")
        or str(ld.get("articleSection") or "")
    )

    # --- full-text snippet for AI enrichment / excerpt fallback -------------
    content_snippet = _extract_main_text(soup)

    return {
        "url": url,
        "title": title,
        "description": description,
        "image_url": image_url or "",
        "site_name": site_name,
        "published_time": published_time,
        "author": author,
        "domain": domain,
        "content_snippet": content_snippet,
        "keywords": keywords,              # list[str]
        "article_section": article_section,
    }


# ---------------------------------------------------------------------------
# Z.AI analysis
# ---------------------------------------------------------------------------

def _slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug[:80]


SYSTEM_PROMPTS: dict[ContentType, str] = {
    "press_mention": """You are a press-coverage analyzer. Given scraped web page data, extract and return ONLY a JSON object with these exact fields:
{
  "title": "article headline",
  "publication": "publication / media outlet name (e.g. TechCrunch, Forbes)",
  "publication_url": "direct URL to the article",
  "publication_date": "ISO date string YYYY-MM-DD or empty string",
  "excerpt": "2-3 sentence summary of the article relevant to the subject",
  "image_url": "article cover image URL or empty string",
  "is_featured": false
}
Return ONLY the JSON object. No prose, no markdown fences.""",

    "blog_article": """You are a blog-content curator. Given scraped web page data, extract and return ONLY a JSON object with these exact fields:
{
  "title": "article title",
  "slug": "url-friendly-slug-from-title",
  "excerpt": "1-2 sentence hook for the article",
  "category": "one category from: Technology, Engineering, Design, Career, Tutorial, Reflection, Other",
  "tags": "semicolon-separated relevant tags",
  "cover_image_url": "cover image URL or empty string",
  "is_external": true,
  "external_url": "the original article URL",
  "external_source": "source platform name (e.g. Medium, LinkedIn, Dev.to, Hashnode)"
}
Return ONLY the JSON object. No prose, no markdown fences.""",

    "project": """You are a portfolio project analyzer. Given scraped web page data (typically a GitHub repo, project page, or case study), extract and return ONLY a JSON object with these exact fields:
{
  "title": "project name",
  "tagline": "one-line elevator pitch (max 80 chars)",
  "description": "2-3 paragraph detailed description of what the project does and why",
  "github_url": "GitHub URL if identifiable, else empty string",
  "live_url": "live demo / production URL if identifiable, else empty string",
  "role": "inferred role (Full-Stack Developer / Frontend Developer / Backend Developer / etc.)",
  "challenges": "key technical challenges encountered",
  "solutions": "how those challenges were solved",
  "impact": "measurable outcomes or value delivered"
}
Return ONLY the JSON object. No prose, no markdown fences.""",
}


async def analyze_with_ai(scraped: dict[str, Any], content_type: ContentType) -> dict[str, Any]:
    """
    Send scraped page data to Z.AI and return structured JSON for the given content type.
    Falls back to a raw extraction if the API key is not configured or the call fails.

    Social-platform shortcut:
    - Instagram / Facebook / LinkedIn: all fields are empty (login-walled), so
      AI has nothing to work with. Skip the API call and return the fallback
      immediately.  The `_social_platform` hint is preserved so the frontend
      knows to show a specialised entry form.
    - Twitter/X: tweet text comes back via oEmbed; AI enrichment is still
      worthwhile for a concise excerpt, so the call proceeds normally.
    """
    social_platform = scraped.get("_social_platform")
    if social_platform in ("instagram", "facebook", "linkedin"):
        logger.info(
            "Skipping AI enrichment for %s URL — content is login-walled.", social_platform,
        )
        return _fallback_extraction(scraped, content_type)

    if not settings.ZAI_API_KEY:
        logger.warning("ZAI_API_KEY not set — returning raw scraped data without AI enrichment.")
        return _fallback_extraction(scraped, content_type)

    client = AsyncOpenAI(
        api_key=settings.ZAI_API_KEY,
        base_url=settings.ZAI_BASE_URL,
        timeout=float(settings.ZAI_SCRAPER_TIMEOUT),
    )

    user_message = f"""URL: {scraped["url"]}
Title: {scraped["title"]}
Site/Publication: {scraped["site_name"]}
Published: {scraped["published_time"]}
Author: {scraped["author"]}
Description: {scraped["description"]}
Image: {scraped["image_url"]}

Page content (first ~5000 chars):
{scraped["content_snippet"]}"""

    try:
        completion = await client.chat.completions.create(
            model=settings.ZAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPTS[content_type]},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=1024,
        )

        raw = completion.choices[0].message.content or "{}"

        # Strip markdown code fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
        raw = re.sub(r"\s*```$", "", raw.strip())

        ai_result = json.loads(raw)

        # Guarantee no empty fields: AI takes priority, but any blank AI value
        # falls back to the fast OG-tag extraction so the form is always useful.
        fallback = _fallback_extraction(scraped, content_type)
        result = {
            k: (v if v not in (None, "", [], {}) else fallback.get(k, v))
            for k, v in ai_result.items()
        }
        # Include any fallback keys the AI didn't return at all
        for k, v in fallback.items():
            if k not in result or result[k] in (None, "", [], {}):
                result[k] = v

        return result

    except (json.JSONDecodeError, Exception) as exc:
        logger.error("Z.AI analysis failed: %s — falling back to raw extraction.", exc)
        return _fallback_extraction(scraped, content_type)


def _fallback_extraction(scraped: dict[str, Any], content_type: ContentType) -> dict[str, Any]:
    """
    Rich best-effort structured extraction without AI.
    Uses all metadata harvested by scrape_url() — OG tags, LD+JSON,
    Twitter cards, keyword meta, author bylines, article:section, etc.
    The admin should only need to verify / top-up a few fields.
    """
    url             = scraped["url"]
    title           = scraped["title"]
    description     = scraped["description"]
    image           = scraped["image_url"]
    site            = scraped["site_name"]
    date            = scraped.get("published_time", "")
    content_snippet = scraped.get("content_snippet", "")
    keywords        = scraped.get("keywords", [])          # list[str]
    article_section = scraped.get("article_section", "")

    # Excerpt: prefer OG description; fall back to first sentences of body text
    excerpt = _make_excerpt(description, content_snippet)

    # Social-platform hint  (set by _build_social_metadata / twitter oEmbed branch)
    social_platform = scraped.get("_social_platform")
    social_username = scraped.get("_social_username", "")

    if content_type == "press_mention":
        # For social posts, `site` is already set to the platform display name
        # (e.g. "X (Twitter)"), and `title` may be empty (Instagram/Facebook/LinkedIn)
        # or the tweet text (Twitter oEmbed).  Include social hints so the caller
        # and frontend can detect and render the appropriate form.
        result: dict[str, Any] = {
            "title":            title,
            "publication":      site,
            "publication_url":  url,
            "publication_date": date,
            "excerpt":          excerpt,
            "image_url":        image,
            "is_featured":      False,
        }
        if social_platform:
            result["_social_platform"] = social_platform
            result["_social_username"]  = social_username
        return result

    if content_type == "blog_article":
        # Infer category from title + description + keywords
        category = (
            article_section.title()
            if article_section and len(article_section) < 40
            else _infer_category(title, description, keywords)
        )
        tags_str = "; ".join(keywords[:8]) if keywords else ""
        return {
            "title":            title,
            "slug":             _slugify(title),
            "excerpt":          excerpt,
            "category":         category,
            "tags":             tags_str,
            "cover_image_url":  image,
            "is_external":      True,
            "external_url":     url,
            "external_source":  site,
        }

    # --- project ------------------------------------------------------------
    is_github = "github.com" in url
    tagline = description.strip()[:80] if description else title[:80]
    return {
        "title":       title,
        "tagline":     tagline,
        "description": excerpt,
        "github_url":  url if is_github else "",
        "live_url":    url if not is_github else "",
        "role":        "Full-Stack Developer",
        "challenges":  "",
        "solutions":   "",
        "impact":      "",
    }
