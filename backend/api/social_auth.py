from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.contrib.auth.models import User
from django.conf import settings
import random
import string
import requests
import json

User = get_user_model()

def generate_username(email):
    """Generate a unique username from email"""
    base_username = email.split('@')[0]
    username = base_username
    counter = 1
    
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username

class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "postmessage"  # This is crucial for Google One Tap / Sign-in With Google
    client_class = OAuth2Client

    def get(self, request, *args, **kwargs):
        """Handle GET requests by returning a helpful error message."""
        return Response({
            'error': 'This endpoint requires a POST request',
            'message': 'Please use the Google Sign-In button on the website instead of accessing this URL directly.'
        }, status=405)
    
    def get_client(self, request, app):
        return self.client_class(
            request=request,
            consumer_key=app.client_id,
            consumer_secret=app.secret,
            access_token_method=self.adapter_class.access_token_method,
            access_token_url=self.adapter_class.access_token_url,
            callback_url=self.callback_url,
        )
    
    def get_google_user_info(self, access_token):
        """Manually fetch user info from Google API."""
        headers = {'Authorization': f'Bearer {access_token}'}
        resp = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers=headers)
        
        if resp.status_code == 200:
            return resp.json()
        else:
            resp.raise_for_status()

    def post(self, request, *args, **kwargs):
        try:
            # Get the authorization code from the request
            code = request.data.get('code')
            if not code:
                return Response({'error': 'Authorization code is required'}, status=400)

            # Get the Google OAuth2 adapter
            adapter = self.adapter_class(request)
            
            # Get the social app configuration
            from allauth.socialaccount.models import SocialApp
            try:
                app = SocialApp.objects.get(provider='google')
            except SocialApp.DoesNotExist:
                return Response({
                    'error': 'Google OAuth configuration not found. Please run the setup_oauth.bat script.',
                    'details': 'The Google OAuth app is not configured in the database.'
                }, status=500)
            
            try:
                # Exchange the code for tokens
                client = self.get_client(request, app)
                token_data = client.get_access_token(code)
                
                if isinstance(token_data, str):
                    # Some versions return just the token as a string
                    access_token = token_data
                else:
                    # Others return a dictionary with access_token key
                    access_token = token_data.get('access_token')
                
                if not access_token:
                    return Response({
                        'error': 'Failed to obtain access token from Google',
                        'details': 'No access token in response'
                    }, status=400)
            except Exception as e:
                return Response({
                    'error': 'Failed to exchange authorization code for token',
                    'details': str(e)
                }, status=400)
            
            try:
                # Get user info directly from Google API
                user_info = self.get_google_user_info(access_token)
                email = user_info.get('email')
                
                if not email:
                    return Response({'error': 'Email not provided by Google'}, status=400)
            except Exception as e:
                return Response({
                    'error': 'Failed to get user info from Google',
                    'details': str(e)
                }, status=400)

            # Get or create user
            if not User.objects.filter(email=email).exists():
                username = generate_username(email)
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=User.objects.make_random_password()
                )
            else:
                user = User.objects.get(email=email)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            })
        except SocialApp.DoesNotExist:
            return Response({'error': 'Google OAuth configuration not found'}, status=500)
        except Exception as e:
            return Response({'error': str(e), 'details': str(type(e))}, status=500) 