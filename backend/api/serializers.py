from django.contrib.auth.models import User  # Import the built-in User model from Django's authentication system
from rest_framework import serializers  # Import serializers from Django REST framework
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from .models import VideoNotes

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
        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"  # Adjust frontend URL as needed
        send_mail(
            'Password Reset',
            f'Click the link to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
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