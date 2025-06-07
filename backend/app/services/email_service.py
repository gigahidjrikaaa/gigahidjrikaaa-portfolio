import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_contact_email(name: str, email: str, message: str):
        """Send contact form email using SMTP"""
        try:
            # Create email content
            subject = f"New Contact Form Submission from {name}"
            
            # HTML template for the email
            html_template = Template("""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                            New Contact Form Submission
                        </h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Name:</strong> {{ name }}</p>
                            <p><strong>Email:</strong> {{ email }}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background: white; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px;">
                                {{ message }}
                            </div>
                        </div>
                        <hr style="border: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            <small>Sent from your portfolio website</small>
                        </p>
                    </div>
                </body>
            </html>
            """)
            
            html_content = html_template.render(name=name, email=email, message=message)
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.SMTP_USER
            msg['To'] = settings.TO_EMAIL
            msg['Reply-To'] = email
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                start_tls=True,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
            )
            
            logger.info(f"Contact email sent successfully for {name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            raise e