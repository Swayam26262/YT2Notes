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

# Create your views here.
def sample():
    return HttpResponse("Welcome to YT Notes Generator API.")

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
        print(f"Request headers: {request.headers}")
        
        # Simplify request handling for now to test if the view is even being called
        try:
            print(f"Request body: {request.body}")
            
            # Handle various content types
            if request.content_type == 'application/json':
                try:
                    data = json.loads(request.body)
                except json.JSONDecodeError:
                    print("JSON parsing failed, trying to read body directly")
                    # Try to handle the request directly
                    body_str = request.body.decode('utf-8')
                    # Simple parsing to extract the link parameter
                    if 'link' in body_str:
                        link_part = body_str.split('link')[1]
                        if ':' in link_part:
                            link_part = link_part.split(':')[1]
                        if ',' in link_part:
                            link_part = link_part.split(',')[0]
                        if '"' in link_part:
                            link_part = link_part.replace('"', '')
                        if "'" in link_part:
                            link_part = link_part.replace("'", '')
                        link_part = link_part.strip()
                        data = {'link': link_part}
                    else:
                        return Response({'error': 'Could not parse request body'}, status=status.HTTP_400_BAD_REQUEST)
            elif request.content_type == 'application/x-www-form-urlencoded':
                data = request.POST
            else:
                # Try to parse as JSON anyway
                try:
                    data = json.loads(request.body)
                except:
                    # If all else fails, try to access POST data
                    data = request.POST
            
            print(f"Parsed data: {data}")
            
            # Check if link exists in data
            if 'link' not in data:
                print("Error: 'link' key not found in request data")
                return Response({
                    'error': 'Missing YouTube link',
                    'required_fields': ['link'],
                    'received_fields': list(data.keys())
                }, status=status.HTTP_400_BAD_REQUEST)
            
            yt_link = unquote(data['link'])
            print(f"Processing YouTube link: {yt_link}")
            
            # For testing, return a simple success response first
            # This way we can confirm the route works before doing the full processing
            if yt_link.startswith('test'):
                print("Test link detected, returning dummy response")
                return Response({
                    'youtube_title': 'Test Video',
                    'youtube_link': yt_link,
                    'notes_content': 'These are test notes for debugging',
                    'transcription': 'This is a test transcription',
                    'audio_url': 'https://example.com/test.mp3',
                    'created_at': '2023-01-01T00:00:00Z',
                    'updated_at': '2023-01-01T00:00:00Z'
                }, status=status.HTTP_201_CREATED)
            
            # Validate YouTube URL
            if not ('youtube.com' in yt_link or 'youtu.be' in yt_link):
                print(f"Error: Invalid YouTube URL: {yt_link}")
                return Response({'error': 'Invalid YouTube URL'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Rest of your existing code...
            try:
                # Check API key configuration
                from django.conf import settings
                import os
                aai_key = os.getenv("ASSEMBLYAI_API_KEY")
                gemini_key = os.getenv("GOOGLE_GEMINI_API_KEY")
                cloudinary_name = os.getenv("CLOUDINARY_CLOUD_NAME")
                
                print(f"AssemblyAI API Key: {'Set' if aai_key else 'Not set'}")
                print(f"Google Gemini API Key: {'Set' if gemini_key else 'Not set'}")
                print(f"Cloudinary Name: {'Set' if cloudinary_name else 'Not set'}")
                
                if not (aai_key and gemini_key and cloudinary_name):
                    print("Error: Missing API keys")
                    return Response({
                        'error': 'Server configuration error: Missing API keys',
                        'missing_keys': [
                            'ASSEMBLYAI_API_KEY' if not aai_key else None,
                            'GOOGLE_GEMINI_API_KEY' if not gemini_key else None,
                            'CLOUDINARY_CLOUD_NAME' if not cloudinary_name else None
                        ]
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Process the YouTube link
                print("Starting to process YouTube link...")
                result = process_youtube_link(yt_link)
                print("YouTube link processed successfully")
                
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
                print(f"Saved to database with ID: {video_note.id}")
                
                # Serialize and return the data
                serializer = VideoNotesSerializer(video_note)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                import traceback
                print(f"Processing error: {str(e)}")
                print(traceback.format_exc())
                return Response({
                    'error': f"Error: {str(e)}",
                    'traceback': traceback.format_exc()
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


