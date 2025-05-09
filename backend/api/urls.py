from django.urls import path
from .views import (
    sample, PasswordResetView, PasswordResetConfirmView,
    GenerateNotesView, ListUserNotesView, NoteDetailView
)
from .social_auth import GoogleLoginView
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

# Simple debug view that doesn't require any processing
@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    """Simple ping endpoint to test if the server is responding."""
    return JsonResponse({'status': 'success', 'message': 'API server is working!'})

# Auth test endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_test(request):
    """Test endpoint that requires authentication."""
    return JsonResponse({
        'status': 'success', 
        'message': 'Authentication successful!',
        'user': request.user.username
    })

# YouTube link test endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def youtube_test(request):
    """Test endpoint for YouTube link submission."""
    from urllib.parse import unquote
    import json
    
    try:
        data = json.loads(request.body)
        link = unquote(data.get('link', ''))
        return JsonResponse({
            'status': 'success',
            'message': 'YouTube link received',
            'link': link,
            'user': request.user.username
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

urlpatterns = [
    path("home/", sample, name="sample"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("auth/google/", GoogleLoginView.as_view(), name="google_login"),
    path("notes/generate/", GenerateNotesView.as_view(), name="generate_notes"),
    path("notes/", ListUserNotesView.as_view(), name="list_notes"),
    path("notes/<int:pk>/", NoteDetailView.as_view(), name="note_detail"),
    
    # Debug endpoints
    path("ping/", ping, name="ping"),
    path("auth-test/", auth_test, name="auth_test"),
    path("youtube-test/", youtube_test, name="youtube_test"),
]