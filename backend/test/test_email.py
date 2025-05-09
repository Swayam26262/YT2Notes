import os
import sys
import django
from django.core.mail import send_mail
from smtplib import SMTPException

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Email details
sender = 'Vflair.service@gmail.com'
recipient = 'patilswayam96@gmail.com'  # Replace with your email address
subject = 'Test Email from YT2Notes'
message = """
Hello,

This is a test email to verify that email sending is working correctly.

Best regards,
YT2Notes Team
"""

print(f"Attempting to send email from {sender} to {recipient}...")

try:
    # Attempt to send email
    result = send_mail(
        subject,
        message,
        sender,
        [recipient],
        fail_silently=False,
    )
    
    if result == 1:
        print("Email sent successfully!")
    else:
        print(f"Failed to send email. Result: {result}")
        
except SMTPException as e:
    print(f"SMTP Exception occurred: {e}")
except Exception as e:
    print(f"An error occurred: {e}") 