from django.contrib.auth.models import User  # Import the built-in User model from Django's authentication system
from rest_framework import serializers  # Import serializers from Django REST framework
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from .models import VideoNotes
import os
from dotenv import load_dotenv

# Define a serializer for the User model
class UserSerializer(serializers.ModelSerializer):
    """
    This serializer is used to convert the User model instances into JSON format and vice versa.
    """
    class Meta:
        model = User  # Specify the model to serialize (Django's User model)
        fields = ["id", "username", "email", "password"]  # Specify the fields to include in the serialized output
        extra_kwargs = {"password": {"write_only": True}}  # Make the password field write-only (not included in responses)

    # Override the create method to handle user creation
    def create(self, validated_data):
        # Use Django's create_user method to create a new user with the validated data
        user = User.objects.create_user(**validated_data)
        return user  # Return the created user instance

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is associated with this email address.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.filter(email=email).first()
        if not user:
            return
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Fix the URL by ensuring no double slash
        frontend_url = settings.FRONTEND_URL
        if frontend_url.endswith('/'):
            frontend_url = frontend_url[:-1]  # Remove trailing slash
            
        reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
        
        subject = "Password Reset Request - YT2Notes"
        
        # HTML version of the email with better styling
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .email-container {{
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }}
        .header {{
            background: linear-gradient(to right, #7c4dff, #4a148c);
            color: white;
            padding: 20px;
            text-align: center;
        }}
        .content {{
            padding: 20px;
            background-color: #fff;
        }}
        .footer {{
            background-color: #f9f9f9;
            padding: 15px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(to right, #7c4dff, #4a148c);
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }}
        .note {{
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>YT2Notes Password Reset</h1>
        </div>
        <div class="content">
            <p>Hello {user.username},</p>
            
            <p>We received a request to reset your password for your <strong>YT2Notes</strong> account. Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="{reset_url}" class="button">Reset Your Password</a>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 14px;">
                {reset_url}
            </p>
            
            <div class="note">
                <p><strong>Note:</strong> This link is valid for 24 hours. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {2025} YT2Notes. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

        # Plain text version as fallback
        plain_message = f"""
Hello {user.username},

You have requested to reset your password for your YT2Notes account. Please click on the link below to reset your password:

{reset_url}

If you did not request this password reset, please ignore this email and your password will remain unchanged.

This link will expire in 24 hours.

Best regards,
YT2Notes Team
"""
        print(f"Attempting to send password reset email to {email} using direct SMTP...")
        
        try:
            # Direct SMTP implementation
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            # Email credentials - hardcoded to ensure they work
            smtp_server = "smtp.gmail.com"
            port = 587
            sender_email = os.getenv('EMAIL_HOST_USER')
            password = os.getenv('EMAIL_HOST_PASSWORD')
            
            # Create message
            smtp_message = MIMEMultipart("alternative")
            smtp_message["From"] = sender_email
            smtp_message["To"] = email
            smtp_message["Subject"] = subject
            
            # Attach both plain-text and HTML versions
            part1 = MIMEText(plain_message, "plain")
            part2 = MIMEText(html_message, "html")
            
            # The email client will try to render the last part first
            smtp_message.attach(part1)
            smtp_message.attach(part2)
            
            # Create SMTP session
            server = smtplib.SMTP(smtp_server, port)
            server.set_debuglevel(1)  # Enable debugging
            
            # Start TLS
            print("Starting TLS...")
            server.starttls()
            
            # Login
            print(f"Attempting login with {sender_email}...")
            server.login(sender_email, password)
            
            # Send email
            print(f"Sending email to {email}...")
            server.sendmail(sender_email, email, smtp_message.as_string())
            server.quit()
            print("Password reset email sent successfully via direct SMTP!")
                
        except Exception as e:
            print(f"Failed to send password reset email: {str(e)}")
            # Don't raise the exception, as we still want to return "success" to avoid
            # leaking information about which emails are registered
        
        return user

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        try:
            uid = urlsafe_base64_decode(attrs['uid']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            raise serializers.ValidationError({'uid': 'Invalid UID'})
        
        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired token'})
        
        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']
        
        # Use Django's set_password method which properly hashes the password
        user.set_password(new_password)
        # Save the user and force update
        user.save(force_update=True)
        
        # Print confirmation for debugging (remove in production)
        print(f"Password reset successful for user: {user.username}")
        
        return user

class VideoNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoNotes
        fields = ['id', 'youtube_title', 'youtube_link', 'notes_content', 
                 'transcription', 'audio_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)