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

async def send_testimonial_thank_you(name: str, to_email: str):
    """Send a thank-you email to someone who submitted a testimonial."""
    safe_name = html.escape(name or "")
    subject = "Thanks for your kind words!"
    body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f7f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:40px 16px;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:#0f172a;padding:32px 40px;text-align:center;">
                <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Giga Hidjrika</p>
                <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#ffffff;">Thank you, {safe_name}!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
                  Your testimonial has been received and means a lot. I personally review every submission before it goes live on my portfolio.
                </p>
                <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#6b7280;">
                  I'll send you a quick note once it's published. If you have any questions or want to make any changes, just reply to this email.
                </p>
                <div style="border-top:1px solid #f3f4f6;padding-top:24px;">
                  <p style="margin:0;font-size:13px;color:#9ca3af;">
                    This email was sent because you submitted a testimonial at <strong>gigahidjrikaaa.my.id</strong>.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """
    await send_email(to_email, subject, body)

async def send_testimonial_notification(name: str, role: str, company: str | None):
    """Notify the portfolio owner that a new testimonial is pending review."""
    safe_name = html.escape(name or "")
    safe_role = html.escape(role or "")
    safe_company = html.escape(company or "")
    desc = f"{safe_role}{(' at ' + safe_company) if safe_company else ''}"
    subject = f"New testimonial pending review from {safe_name}"
    body = f"""
    <p>A new testimonial was submitted and is waiting for your approval.</p>
    <p><strong>From:</strong> {safe_name} ({desc})</p>
    <p>Log in to your <a href="https://gigahidjrikaaa.my.id/admin/testimonials">admin dashboard</a> to approve or reject it.</p>
    """
    if settings.TO_EMAIL:
        await send_email(settings.TO_EMAIL, subject, body)