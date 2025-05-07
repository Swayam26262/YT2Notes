import os
import sys
import django

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from django.conf import settings

def setup_google_oauth():
    """Set up Google OAuth configuration."""
    
    # Get the first site
    try:
        site = Site.objects.get(id=settings.SITE_ID)
    except Site.DoesNotExist:
        site = Site.objects.create(domain='example.com', name='example.com')
        print(f"Created site: {site}")
    
    # Check if Google provider already exists
    if SocialApp.objects.filter(provider='google').exists():
        google_app = SocialApp.objects.get(provider='google')
        print(f"Google OAuth already configured with client_id: {google_app.client_id}")
        return
    
    # Create Google provider
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        print("Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables are not set.")
        print("Please make sure you have a .env file with these variables in the backend directory.")
        return
    
    google_app = SocialApp.objects.create(
        provider='google',
        name='Google OAuth',
        client_id=client_id,
        secret=client_secret
    )
    google_app.sites.add(site)
    print(f"Successfully created Google OAuth configuration with client_id: {client_id}")

if __name__ == '__main__':
    setup_google_oauth() 