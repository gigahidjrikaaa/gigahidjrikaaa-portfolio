import re
import io
from dataclasses import dataclass
from typing import Optional

from pypdf import PdfReader


@dataclass(frozen=True)
class PdfProfileCandidate:
    full_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    resume_url: Optional[str] = None


_URL_RE = re.compile(r"https?://[^\s)\]]+", re.IGNORECASE)
_EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
_PHONE_RE = re.compile(r"(?:(?:\+?\d{1,3})[\s-]?)?(?:\(\d{2,4}\)[\s-]?)?\d{3,4}[\s-]?\d{3,4}")


def extract_text_from_pdf_bytes(pdf_bytes: bytes, max_pages: int = 3) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    texts: list[str] = []
    for i, page in enumerate(reader.pages[:max_pages]):
        try:
            page_text = page.extract_text() or ""
        except Exception:
            page_text = ""
        if page_text:
            texts.append(page_text)
    return "\n".join(texts).strip()


def _normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _first_url(text: str) -> Optional[str]:
    m = _URL_RE.search(text)
    return m.group(0) if m else None


def _guess_name(lines: list[str]) -> Optional[str]:
    # Heuristic: LinkedIn resume often starts with the person name on the first line.
    for line in lines[:5]:
        clean = _normalize_space(line)
        if not clean:
            continue
        # Skip obvious non-name headers
        if "linkedin" in clean.lower() or "curriculum" in clean.lower() or "resume" in clean.lower():
            continue
        # Likely a name if it is short and mostly letters/spaces.
        if 2 <= len(clean.split()) <= 5 and re.fullmatch(r"[A-Za-z .'-]+", clean):
            return clean
    return None


def _guess_headline(lines: list[str]) -> Optional[str]:
    # Heuristic: headline is often second line, contains roles/pipes.
    for line in lines[:8]:
        clean = _normalize_space(line)
        if not clean:
            continue
        if len(clean) < 12:
            continue
        if _EMAIL_RE.search(clean) or _PHONE_RE.search(clean):
            continue
        # Avoid section headers
        if clean.strip().lower() in {"experience", "education", "skills", "summary", "about"}:
            continue
        if "|" in clean or "•" in clean or "engineer" in clean.lower() or "developer" in clean.lower():
            return clean
    return None


def _guess_location(text: str) -> Optional[str]:
    # Very light heuristic: common pattern in resumes is "City, Country".
    for line in text.splitlines()[:20]:
        clean = _normalize_space(line)
        if "," in clean and 4 <= len(clean) <= 80 and not _EMAIL_RE.search(clean) and not _URL_RE.search(clean):
            # Avoid capturing things like "Jan 2023, ..."
            if re.search(r"\b\d{4}\b", clean):
                continue
            return clean
    return None


def parse_linkedin_resume_text(text: str) -> PdfProfileCandidate:
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    name = _guess_name(lines)
    headline = _guess_headline(lines)
    location = _guess_location(text)

    # Bio/summary: try to take the first paragraph-like chunk after "Summary"/"About".
    bio = None
    lowered = [l.lower() for l in lines]
    for marker in ("summary", "about"):
        if marker in lowered:
            idx = lowered.index(marker)
            chunk = []
            for l in lines[idx + 1 : idx + 6]:
                if l.lower() in {"experience", "education", "skills"}:
                    break
                chunk.append(l)
            joined = _normalize_space(" ".join(chunk))
            if joined:
                bio = joined
                break

    resume_url = _first_url(text)

    # Fall back: if no explicit bio, try to use first reasonably long line as summary.
    if not bio:
        for line in lines[:12]:
            clean = _normalize_space(line)
            if clean and len(clean) >= 80 and not _EMAIL_RE.search(clean) and not _URL_RE.search(clean):
                bio = clean
                break

    return PdfProfileCandidate(
        full_name=name,
        headline=headline,
        location=location,
        bio=bio,
        resume_url=resume_url,
    )
