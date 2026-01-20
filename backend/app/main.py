from contextlib import asynccontextmanager
from collections import deque
from time import monotonic
from typing import Deque, Dict, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from .config import settings
from .init_db import init_db
import uvicorn

from .api import auth, projects, admin, experience, education, skills, contact, awards, certificates, services, blog, profile


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Initialize DB schema on startup. Placeholder seeding runs only in development.
    init_db(seed_data=settings.is_development)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)


def _get_client_ip(headers: dict, fallback: str | None) -> str:
    # If behind a proxy, prefer X-Forwarded-For (first hop).
    xff = headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return fallback or "unknown"


RateKey = Tuple[str, str]  # (ip, bucket)
rate_buckets: Dict[RateKey, Deque[float]] = {}


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

@app.get("/")
async def root():
    return {"message": "Portfolio Backend API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)