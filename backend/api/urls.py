from django.urls import path
from .views import (
    sample, PasswordResetView, PasswordResetConfirmView,
    GenerateNotesView, ListUserNotesView, NoteDetailView
)
from .social_auth import GoogleLoginView
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
import json

# Simple debug view that doesn't require any processing
@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    """Simple ping endpoint to test if the server is responding."""
    return JsonResponse({'status': 'success', 'message': 'API server is working!'})

# Debug endpoint for CORS testing
@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def cors_test(request):
    """Test endpoint for CORS and preflight requests."""
    if request.method == 'OPTIONS':
        return JsonResponse({'status': 'success', 'message': 'CORS preflight accepted'})
    
    return JsonResponse({
        'status': 'success',
        'message': 'CORS test successful',
        'headers': {k: v for k, v in request.headers.items()},
        'method': request.method,
        'content_type': request.content_type,
    })

# Debug endpoint for login testing
@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def login_test(request):
    """Test endpoint that simulates login without actual authentication."""
    if request.method == 'OPTIONS':
        return JsonResponse({'status': 'success', 'message': 'Preflight request accepted'})
    
    try:
        data = json.loads(request.body) if request.body else {}
        return JsonResponse({
            'status': 'success',
            'message': 'Login test endpoint reached successfully',
            'received_data': data,
            'headers': {k: v for k, v in request.headers.items()},
            'cookies': request.COOKIES,
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)

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
    path("cors-test/", cors_test, name="cors_test"),
    path("login-test/", login_test, name="login_test"),
]