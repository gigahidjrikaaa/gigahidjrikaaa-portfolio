import unittest
from datetime import date, timedelta

from app.utils.certificate_status import normalize_credential_status


class CertificateStatusNormalizationTests(unittest.TestCase):
    def test_future_issue_date_becomes_in_progress(self) -> None:
        future_issue = (date.today() + timedelta(days=15)).isoformat()
        status = normalize_credential_status(issue_date=future_issue, expiry_date=None, current_status=None)
        self.assertEqual(status, "in_progress")

    def test_past_expiry_becomes_expired(self) -> None:
        past_expiry = (date.today() - timedelta(days=1)).isoformat()
        status = normalize_credential_status(issue_date=None, expiry_date=past_expiry, current_status="active")
        self.assertEqual(status, "expired")

    def test_future_expiry_becomes_active(self) -> None:
        future_expiry = (date.today() + timedelta(days=60)).isoformat()
        status = normalize_credential_status(issue_date=None, expiry_date=future_expiry, current_status="expired")
        self.assertEqual(status, "active")

    def test_without_expiry_defaults_to_does_not_expire(self) -> None:
        status = normalize_credential_status(issue_date=None, expiry_date=None, current_status=None)
        self.assertEqual(status, "does_not_expire")

    def test_unknown_status_is_ignored(self) -> None:
        status = normalize_credential_status(issue_date=None, expiry_date=None, current_status="custom")
        self.assertEqual(status, "does_not_expire")


if __name__ == "__main__":
    unittest.main()
