import aiosmtplib
from email.mime.text import MIMEText
from ..config import settings

async def send_email(to_email: str, subject: str, body: str):
    message = MIMEText(body, "html")
    message["Subject"] = subject
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
    subject = f"New Contact Form Submission from {name}"
    body = f"<p>Name: {name}</p><p>Email: {email}</p><p>Message: {message}</p>"
    await send_email(settings.TO_EMAIL, subject, body)