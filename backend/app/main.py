from contextlib import asynccontextmanager
from collections import deque
from time import monotonic
from typing import Deque, Dict, Tuple
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from .config import settings
from .init_db import init_db
import uvicorn

from .api import auth, projects, admin, experience, education, skills, contact, awards, certificates, services, blog, profile, testimonials, comments, seo, scraper, press_mentions, clients, stories, currently_working_on


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS protection in browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Force HTTPS for one year (only in production)
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Control referrer information leakage
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Content Security Policy (only in production)
        if settings.ENVIRONMENT == "production":
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https://res.cloudinary.com https://encrypted-tbn0.gstatic.com https://kompaspedia.kompas.id; "
                "frame-src 'self' https://www.youtube.com https://youtu.be; "
                "connect-src 'self' https://api.cloudinary.com; "
                "font-src 'self' data:; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none'; "
            )
            response.headers["Content-Security-Policy"] = csp

        return response


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Initialize DB schema on startup. Placeholder seeding runs only in development.
    init_db(seed_data=settings.is_development)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)


def _get_scalar_html(openapi_url: str) -> str:
    return f"""<!doctype html>
<html>
    <head>
        <title>{settings.PROJECT_NAME} — API Reference</title>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    </head>
    <body>
        <div id=\"app\"></div>
        <script src=\"https://cdn.jsdelivr.net/npm/@scalar/api-reference\"></script>
        <script>
            Scalar.createApiReference('#app', {{
                url: '{openapi_url}',
            }})
        </script>
    </body>
</html>"""


def _get_client_ip(headers: dict, fallback: str | None) -> str:
    # If behind a proxy, prefer X-Forwarded-For (first hop).
    xff = headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return fallback or "unknown"


RateKey = Tuple[str, str]  # (ip, bucket)
rate_buckets: Dict[RateKey, Deque[float]] = {}

app.add_middleware(SecurityHeadersMiddleware)

@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    path = request.url.path
    method = request.method.upper()

    window = max(1, settings.RATE_LIMIT_WINDOW_SECONDS)
    now = monotonic()

    # Apply to login endpoints (brute force) and contact form (spam)
    bucket: str | None = None
    limit: int | None = None

    if path.endswith(f"{settings.API_V1_STR}/auth/login") or path.endswith(f"{settings.API_V1_STR}/auth/login-json"):
        bucket = "auth_login"
        limit = settings.RATE_LIMIT_LOGIN_PER_WINDOW
    elif path.rstrip("/") == f"{settings.API_V1_STR}/contact" and method == "POST":
        bucket = "contact_post"
        limit = settings.RATE_LIMIT_CONTACT_PER_WINDOW

    if bucket and limit and limit > 0:
        client_ip = _get_client_ip({k.lower(): v for k, v in request.headers.items()}, getattr(request.client, "host", None))
        key: RateKey = (client_ip, bucket)
        q = rate_buckets.get(key)
        if q is None:
            q = deque()
            rate_buckets[key] = q

        # Drop old entries
        cutoff = now - window
        while q and q[0] < cutoff:
            q.popleft()

        if len(q) >= limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
            )

        q.append(now)

    return await call_next(request)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(experience.router, prefix=f"{settings.API_V1_STR}/experience", tags=["experience"])
app.include_router(education.router, prefix=f"{settings.API_V1_STR}/education", tags=["education"])
app.include_router(skills.router, prefix=f"{settings.API_V1_STR}/skills", tags=["skills"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["profile"])
app.include_router(awards.router, prefix=f"{settings.API_V1_STR}/awards", tags=["awards"])
app.include_router(certificates.router, prefix=f"{settings.API_V1_STR}/certificates", tags=["certificates"])
app.include_router(services.router, prefix=f"{settings.API_V1_STR}/services", tags=["services"])
app.include_router(blog.router, prefix=f"{settings.API_V1_STR}/blog", tags=["blog"])
app.include_router(contact.router, prefix=f"{settings.API_V1_STR}/contact", tags=["contact"])
app.include_router(testimonials.router, prefix=f"{settings.API_V1_STR}/testimonials", tags=["testimonials"])
app.include_router(comments.router, prefix=f"{settings.API_V1_STR}/comments", tags=["comments"])
app.include_router(seo.router, prefix=f"{settings.API_V1_STR}", tags=["seo"])
app.include_router(scraper.router, prefix=f"{settings.API_V1_STR}/admin", tags=["scraper"])
app.include_router(press_mentions.router, prefix=f"{settings.API_V1_STR}/admin/press-mentions", tags=["press-mentions"])
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/admin/clients", tags=["clients"])
app.include_router(stories.router, prefix=f"{settings.API_V1_STR}/admin/stories", tags=["stories"])
app.include_router(currently_working_on.router, prefix=f"{settings.API_V1_STR}/admin/currently-working-on", tags=["currently-working-on"])


@app.get("/docs", include_in_schema=False)
async def scalar_docs():
    openapi_url = app.openapi_url or "/openapi.json"
    return HTMLResponse(_get_scalar_html(openapi_url))

@app.get("/")
async def root():
    return {"message": "Portfolio Backend API"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)