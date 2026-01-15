import aiosmtplib
from email.mime.text import MIMEText
import html
from ..config import settings

def _sanitize_email_header(value: str, max_len: int = 200) -> str:
    # Prevent CRLF injection into headers
    cleaned = (value or "").replace("\r", " ").replace("\n", " ").strip()
    return cleaned[:max_len]

async def send_email(to_email: str, subject: str, body: str):
    message = MIMEText(body, "html")
    message["Subject"] = _sanitize_email_header(subject)
    message["From"] = settings.FROM_EMAIL
    message["To"] = to_email

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        use_tls=True,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
    )

async def send_contact_email(name: str, email: str, message: str):
    safe_name = html.escape(name or "")
    safe_email = html.escape(email or "")
    safe_message = html.escape(message or "")
    subject = f"New Contact Form Submission from {name}"
    body = f"<p>Name: {safe_name}</p><p>Email: {safe_email}</p><p>Message: {safe_message}</p>"
    await send_email(settings.TO_EMAIL, subject, body)