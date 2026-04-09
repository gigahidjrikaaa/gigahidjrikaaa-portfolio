from __future__ import annotations

from datetime import date
from typing import Optional


_KNOWN_STATUSES = {
    "active",
    "does_not_expire",
    "in_progress",
    "expired",
}


def _parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def normalize_credential_status(
    issue_date: Optional[str],
    expiry_date: Optional[str],
    current_status: Optional[str],
) -> str:
    """Derive a canonical credential status from certificate dates.

    Rules:
    - Future issue date => in_progress
    - Expired date in the past => expired
    - Future/Today expiry => active
    - No expiry => keep known status if provided, otherwise does_not_expire
    """

    today = date.today()
    parsed_issue_date = _parse_date(issue_date)
    parsed_expiry_date = _parse_date(expiry_date)

    if parsed_issue_date and parsed_issue_date > today:
        return "in_progress"

    if parsed_expiry_date:
        if parsed_expiry_date < today:
            return "expired"
        return "active"

    if current_status in _KNOWN_STATUSES:
        return current_status

    return "does_not_expire"
