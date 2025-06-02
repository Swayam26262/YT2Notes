from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer, VideoNotesSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from urllib.parse import unquote
from .models import VideoNotes
from .utils import process_youtube_link
from rest_framework_simplejwt.views import TokenObtainPairView
import os

# Custom Token view to ensure proper request handling
class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        try:
            # Debug the request data
            print("Token Request Data:", request.data)
            print("Content-Type:", request.META.get('CONTENT_TYPE', 'No content type provided'))
            return super().post(request, *args, **kwargs)
        except Exception as e:
            # Add better error handling
            print(f"Authentication Error: {str(e)}")
            return Response(
                {"detail": f"Authentication failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

# Create your views here.
def sample():
    return HttpResponse("Welcome to YT Notes Generator API.")

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        print("Registration attempt with data:", {
            k: v if k != 'password' else '***' for k, v in request.data.items()
        })
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Registration error:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        print("✅ User registration successful:", serializer.data.get('username', 'unknown'))
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Password reset e-mail has been sent.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Force refresh the user from the database
            user.refresh_from_db()
            return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GenerateNotesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Debug print for incoming requests
        print("===== Request received at GenerateNotesView =====")
        print(f"User: {request.user.username}")
        print(f"Request method: {request.method}")
        print(f"Request content type: {request.content_type}")
        
        try:
            # Parse request data
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return Response({
                    'error': 'Invalid JSON data',
                    'detail': 'The request body must be valid JSON'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if link exists in data
            if 'link' not in data:
                return Response({
                    'error': 'Missing YouTube link',
                    'required_fields': ['link'],
                    'received_fields': list(data.keys())
                }, status=status.HTTP_400_BAD_REQUEST)
            
            yt_link = unquote(data['link'])
            print(f"Processing YouTube link: {yt_link}")
            
            # Validate YouTube URL
            if not ('youtube.com' in yt_link or 'youtu.be' in yt_link):
                return Response({
                    'error': 'Invalid YouTube URL',
                    'detail': 'The URL must be a valid YouTube video link'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check API key configuration
            aai_key = os.getenv("ASSEMBLYAI_API_KEY")
            gemini_key = os.getenv("GOOGLE_GEMINI_API_KEY")
            cloudinary_name = os.getenv("CLOUDINARY_CLOUD_NAME")
            cloudinary_key = os.getenv("CLOUDINARY_API_KEY")
            cloudinary_secret = os.getenv("CLOUDINARY_API_SECRET")
            
            missing_keys = []
            if not aai_key: missing_keys.append('ASSEMBLYAI_API_KEY')
            if not gemini_key: missing_keys.append('GOOGLE_GEMINI_API_KEY')
            if not cloudinary_name: missing_keys.append('CLOUDINARY_CLOUD_NAME')
            if not cloudinary_key: missing_keys.append('CLOUDINARY_API_KEY')
            if not cloudinary_secret: missing_keys.append('CLOUDINARY_API_SECRET')
            
            if missing_keys:
                return Response({
                    'error': 'Server configuration error',
                    'detail': 'Missing required API keys',
                    'missing_keys': missing_keys
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                # Process the YouTube link
                print("Starting to process YouTube link...")
                result = process_youtube_link(yt_link)
                
                if 'error' in result:
                    return Response({
                        'error': 'Processing error',
                        'detail': result['notes']  # The error message is stored in notes field
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Save to database
                print("Saving to database...")
                video_note = VideoNotes.objects.create(
                    user=request.user,
                    youtube_title=result['title'],
                    youtube_link=yt_link,
                    notes_content=result['notes'],
                    transcription=result['transcription'],
                    audio_url=result['audio_url']
                )
                
                # Serialize and return the data
                serializer = VideoNotesSerializer(video_note)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Processing error: {str(e)}")
                print(error_trace)
                
                # Try to identify the specific error
                error_message = str(e)
                if "Video unavailable" in error_message:
                    return Response({
                        'error': 'Video unavailable',
                        'detail': 'The video is not available or is private'
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif "Video too long" in error_message:
                    return Response({
                        'error': 'Video too long',
                        'detail': 'The video is too long to process. Please try a shorter video.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'error': 'Processing error',
                        'detail': str(e)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            import traceback
            print(f"Unexpected error: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'Server error',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListUserNotesView(generics.ListAPIView):
    serializer_class = VideoNotesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return VideoNotes.objects.filter(user=self.request.user)

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoNotesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return VideoNotes.objects.filter(user=self.request.user)


