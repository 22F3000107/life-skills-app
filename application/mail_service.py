from smtplib import SMTP_SSL
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from .email_config import SMTP_HOST, SMTP_PORT, SENDER_EMAIL, SENDER_PASSWORD

EMAIL_FROM_NAME = 'Life Skills'
EMAIL_SUBJECT_PREFIX = '[Life Skills] '

def send_message(to_email, subject, html_content, attachment_bytes=None, attachment_filename=None):
    try:
        if SENDER_EMAIL == 'your_email@gmail.com' or SENDER_PASSWORD == 'your_app_password':
            print("Please update your email credentials in application/email_config.py")
            return False

        msg = MIMEMultipart()
        msg['Subject'] = f"{EMAIL_SUBJECT_PREFIX}{subject}"
        msg['From'] = f"{EMAIL_FROM_NAME} <{SENDER_EMAIL}>"
        msg['To'] = to_email

        msg.attach(MIMEText(html_content, 'html'))

        if attachment_bytes and attachment_filename:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment_bytes)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename=\"{attachment_filename}\"')
            msg.attach(part)

        with SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)

        print(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False