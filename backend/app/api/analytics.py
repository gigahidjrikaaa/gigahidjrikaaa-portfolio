"""
Analytics API — tracks portfolio visits and returns aggregated stats.

Each visitor session sends:
  POST /analytics/visit  { "session_id": "<uuid>" }  on page load + every 60 s

The backend:
  1. Hashes the IP (SHA-256) for privacy
  2. Geo-locates the IP via ip-api.com (cached 24 h per IP hash)
  3. Upserts the session row (insert once, update last_seen after)
  4. Returns a GET /analytics/stats endpoint consumed by the frontend globe

"Online now" = sessions whose last_seen is within the last 2 minutes.
"""

from __future__ import annotations

import hashlib
import time
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Any

import httpx
from fastapi import APIRouter, BackgroundTasks, Request
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.models import PageVisit
from fastapi import Depends

router = APIRouter()

# ─── Geo-lookup cache (ip_hash → geo dict, expired after 24 h) ─────────────────

_geo_cache: dict[str, tuple[float, dict]] = {}  # ip_hash → (timestamp, geo)
_GEO_TTL = 86_400  # 24 hours


def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()


def _is_private_ip(ip: str) -> bool:
    """Return True for loopback / private ranges we cannot geolocate."""
    return ip.startswith(("127.", "10.", "192.168.", "::1", "localhost", "unknown"))


async def _lookup_geo(ip: str) -> dict[str, Any]:
    """
    Call ip-api.com to resolve the geographic location for an IP.
    Returns a dict with keys: country_code, country_name, region, city, lat, lon.
    Falls back to all-None on any error.
    """
    empty: dict[str, Any] = {
        "country_code": None, "country_name": None,
        "region": None, "city": None, "lat": None, "lon": None,
    }

    if _is_private_ip(ip):
        return empty

    ip_hash = _hash_ip(ip)

    # Cache hit?
    cached = _geo_cache.get(ip_hash)
    if cached and (time.monotonic() - cached[0]) < _GEO_TTL:
        return cached[1]

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,country,countryCode,regionName,city,lat,lon"},
            )
            data = resp.json()
    except Exception:
        return empty

    if data.get("status") != "success":
        return empty

    geo: dict[str, Any] = {
        "country_code": data.get("countryCode"),
        "country_name": data.get("country"),
        "region": data.get("regionName"),
        "city": data.get("city"),
        "lat": data.get("lat"),
        "lon": data.get("lon"),
    }
    _geo_cache[ip_hash] = (time.monotonic(), geo)
    return geo


def _get_client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
    if request.client:
        return request.client.host
    return "unknown"


# ─── Background task: upsert session + geo ──────────────────────────────────────

def _upsert_visit(db: Session, session_id: str, ip: str, geo: dict[str, Any]) -> None:
    try:
        ip_hash = _hash_ip(ip)
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        existing = db.query(PageVisit).filter(PageVisit.session_id == session_id).first()
        if existing:
            setattr(existing, "last_seen", now)
        else:
            db.add(PageVisit(
                session_id=session_id,
                ip_hash=ip_hash,
                country_code=geo.get("country_code"),
                country_name=geo.get("country_name"),
                region=geo.get("region"),
                city=geo.get("city"),
                lat=geo.get("lat"),
                lon=geo.get("lon"),
                created_at=now,
                last_seen=now,
            ))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


# ─── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/visit", status_code=204)
async def record_visit(
    request: Request,
    background_tasks: BackgroundTasks,
    body: dict,
    db: Session = Depends(get_db),
):
    """
    Called by the frontend on page load and every ~60 s as a heartbeat.
    Body: { "session_id": "<uuid-string>" }
    """
    session_id = str(body.get("session_id", ""))[:64]
    if not session_id:
        return

    ip = _get_client_ip(request)
    geo = await _lookup_geo(ip)

    # Upsert in background so the response is instant
    background_tasks.add_task(_upsert_visit, db, session_id, ip, geo)


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated analytics stats for the public globe section.
    """
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        online_cutoff = now - timedelta(minutes=2)

        # Total unique sessions
        total = db.query(func.count(PageVisit.id)).scalar() or 0

        # Today's unique sessions
        today = (
            db.query(func.count(PageVisit.id))
            .filter(PageVisit.created_at >= today_start)
            .scalar()
        ) or 0

        # Online now (heartbeat in last 2 min)
        online_now = (
            db.query(func.count(PageVisit.id))
            .filter(PageVisit.last_seen >= online_cutoff)
            .scalar()
        ) or 0

        # Unique countries
        countries_count = (
            db.query(func.count(func.distinct(PageVisit.country_code)))
            .filter(PageVisit.country_code.isnot(None))
            .scalar()
        ) or 0

        # Region breakdown — group country_code into world regions
        # We bucket by region stored in DB; fall back to "Others"
        region_rows = (
            db.query(PageVisit.region, func.count(PageVisit.id).label("cnt"))
            .filter(PageVisit.region.isnot(None))
            .group_by(PageVisit.region)
            .order_by(text("cnt DESC"))
            .limit(20)
            .all()
        )

        # Bucket into the 5 high-level zones
        ZONE_MAP = {
            # Asia-Pacific keywords
            "asia": "Asia Pacific", "pacific": "Asia Pacific",
            "southeast": "Asia Pacific", "east asia": "Asia Pacific",
            "indonesia": "Asia Pacific", "singapore": "Asia Pacific",
            "malaysia": "Asia Pacific", "australia": "Asia Pacific",
            "new zealand": "Asia Pacific", "japan": "Asia Pacific",
            "korea": "Asia Pacific", "china": "Asia Pacific",
            "india": "Asia Pacific", "bangladesh": "Asia Pacific",
            # Americas
            "north america": "Americas", "south america": "Americas",
            "central america": "Americas", "caribbean": "Americas",
            "california": "Americas", "new york": "Americas",
            "texas": "Americas", "ontario": "Americas", "quebec": "Americas",
            "brazil": "Americas", "colombia": "Americas",
            # Europe
            "europe": "Europe", "england": "Europe", "germany": "Europe",
            "france": "Europe", "netherlands": "Europe", "spain": "Europe",
            "italy": "Europe", "poland": "Europe", "sweden": "Europe",
            "norway": "Europe", "switzerland": "Europe",
            # Middle East & Africa
            "middle east": "Middle East & Africa", "africa": "Middle East & Africa",
            "dubai": "Middle East & Africa", "saudi": "Middle East & Africa",
            "uae": "Middle East & Africa", "nigeria": "Middle East & Africa",
            "kenya": "Middle East & Africa", "egypt": "Middle East & Africa",
        }

        zone_counts: dict[str, int] = {}
        for region, cnt in region_rows:
            zone = "Others"
            r_lower = (region or "").lower()
            for keyword, z in ZONE_MAP.items():
                if keyword in r_lower:
                    zone = z
                    break
            zone_counts[zone] = zone_counts.get(zone, 0) + cnt

        total_zoned = sum(zone_counts.values()) or 1
        ZONE_ORDER = ["Asia Pacific", "Americas", "Europe", "Middle East & Africa", "Others"]
        ZONE_COLORS = {
            "Asia Pacific": "#0ea5e9",
            "Americas": "#6366f1",
            "Europe": "#8b5cf6",
            "Middle East & Africa": "#f59e0b",
            "Others": "#6b7280",
        }

        regions = []
        for zone in ZONE_ORDER:
            cnt = zone_counts.get(zone, 0)
            pct = round((cnt / total_zoned) * 100) if total_zoned > 0 else 0
            regions.append({
                "region": zone,
                "count": cnt,
                "pct": pct,
                "color": ZONE_COLORS[zone],
            })

        # Top cities for the origin tags
        city_rows = (
            db.query(PageVisit.city, PageVisit.country_code, func.count(PageVisit.id).label("cnt"))
            .filter(PageVisit.city.isnot(None), PageVisit.country_code.isnot(None))
            .group_by(PageVisit.city, PageVisit.country_code)
            .order_by(text("cnt DESC"))
            .limit(12)
            .all()
        )
        top_cities = [
            {"label": f"{city}, {code}", "city": city, "country_code": code, "count": cnt}
            for city, code, cnt in city_rows
        ]

        # 7-day sparkline (visits per day, last 7 days)
        seven_days_ago = now - timedelta(days=7)
        sparkline_rows = db.execute(
            text("""
                SELECT DATE(created_at) as day, COUNT(*) as cnt
                FROM page_visits
                WHERE created_at >= :cutoff
                GROUP BY DATE(created_at)
                ORDER BY day ASC
            """),
            {"cutoff": seven_days_ago},
        ).fetchall()

        # Build a 7-slot array filling in zeros for missing days
        spark_map = {str(row[0]): int(row[1]) for row in sparkline_rows}
        sparkline = []
        for i in range(6, -1, -1):
            day = (now - timedelta(days=i)).date()
            sparkline.append(spark_map.get(str(day), 0))

        return {
            "total": total,
            "today": today,
            "online_now": max(online_now, 1),  # at least 1 (the current visitor)
            "countries_count": max(countries_count, 1),
            "regions": regions,
            "top_cities": top_cities,
            "sparkline": sparkline,
        }
    except Exception as e:
        # Graceful fallback — never break the public site
        return {
            "total": 0,
            "today": 0,
            "online_now": 1,
            "countries_count": 1,
            "regions": [],
            "top_cities": [],
            "sparkline": [0, 0, 0, 0, 0, 0, 0],
        }
