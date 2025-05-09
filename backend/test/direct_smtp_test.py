import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email credentials
smtp_server = "smtp.gmail.com"
port = 587
sender_email = "Vflair.service@gmail.com"
password = "hcpq rehe qbny xnln"  # App password
receiver_email = "patilswayam96@gmail.com"  # Your email

# Create message
message = MIMEMultipart()
message["From"] = sender_email
message["To"] = receiver_email
message["Subject"] = "SMTP Test Email"

# Add body to email
body = "This is a test email sent directly via SMTP to verify email functionality."
message.attach(MIMEText(body, "plain"))

print(f"Attempting to connect to {smtp_server}:{port}...")

try:
    # Create SMTP session
    server = smtplib.SMTP(smtp_server, port)
    server.set_debuglevel(1)  # Enable debugging
    
    # Start TLS for security
    print("Starting TLS...")
    server.starttls()
    
    # Authentication
    print(f"Attempting login with {sender_email}...")
    server.login(sender_email, password)
    
    # Send email
    print("Sending email...")
    text = message.as_string()
    server.sendmail(sender_email, receiver_email, text)
    
    print("Email sent successfully!")
    
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    try:
        server.quit()
        print("SMTP connection closed.")
    except:
        print("Failed to close SMTP connection properly.") 