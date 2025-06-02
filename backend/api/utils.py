import os
import json
import time
from urllib.parse import unquote
import yt_dlp
from django.conf import settings
import cloudinary
import cloudinary.uploader
import assemblyai as aai
from dotenv import load_dotenv
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('django')

# Load environment variables
load_dotenv()

# Try different import methods for Google Generative AI
try:
    import google.generativeai as genai
    genai_client = genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))
except ImportError:
    try:
        # Alternative import method
        from google.generativeai import genai
        genai_client = genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))
    except ImportError:
        print("WARNING: Google Generative AI import failed. Note generation will not work.")
        genai = None
        genai_client = None

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Configure AssemblyAI
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

# Custom exception handler for REST framework
def custom_exception_handler(exc, context):
    """Custom exception handler to ensure proper JSON responses for authentication errors."""
    # Call REST framework's default exception handler first to get the standard error response
    response = exception_handler(exc, context)
    
    # Log the exception details
    logger.error(f"Exception in {context['view'].__class__.__name__}: {str(exc)}")
    logger.error(f"Request method: {context['request'].method}, path: {context['request'].path}")
    
    # If this is a 400 error from dj-rest-auth or authentication
    if response is not None and response.status_code == 400:
        if 'login' in context['request'].path.lower() or 'token' in context['request'].path.lower():
            logger.info(f"Authentication error response data: {response.data}")
            
            # Ensure we're returning JSON, not HTML
            if isinstance(response.data, str) and '<!doctype html>' in response.data.lower():
                # This is an HTML response, convert to proper JSON
                return Response(
                    {'error': 'Authentication failed', 'detail': 'Invalid credentials'},
                    status=status.HTTP_400_BAD_REQUEST,
                    content_type='application/json'
                )
    
    # For all other cases, return the original response
    return response

def yt_title(link):
    """Fetch the YouTube video title."""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'no_color': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Sec-Fetch-Mode': 'navigate',
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # Extract video information
            info = ydl.extract_info(link, download=False)
            return info.get('title')
        except Exception as e:
            print(f"Error in yt_title: {str(e)}")
            raise

def download_audio(link):
    """Download audio from YouTube video link."""
    try:
        # Set temporary directory based on debug mode
        temp_dir = '/tmp' if not settings.DEBUG else settings.MEDIA_ROOT
        os.makedirs(temp_dir, exist_ok=True)

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
            'no_color': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-us,en;q=0.5',
                'Sec-Fetch-Mode': 'navigate',
            }
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("Starting download...")
            info = ydl.extract_info(link, download=True)
            
            # Check video duration
            duration = info.get('duration', 0)
            if duration > 3600:  # More than 1 hour
                raise Exception("Video too long. Please use a video under 1 hour in length.")
            
            temp_file_path = os.path.join(temp_dir, f"{info['id']}.mp3")
            
            if not os.path.exists(temp_file_path):
                raise Exception(f"Audio file not found at {temp_file_path}")
            
            print(f"Audio file downloaded successfully: {temp_file_path}")
            print(f"File size: {os.path.getsize(temp_file_path) / (1024*1024):.2f} MB")
            
            # Upload to Cloudinary
            print("Uploading to Cloudinary...")
            result = cloudinary.uploader.upload(
                temp_file_path, 
                resource_type="auto",
                folder="youtube_audio"
            )
            
            # Clean up the temporary file
            os.remove(temp_file_path)
            print("Temporary file cleaned up")
            
            # Return the Cloudinary URL
            return result['url']
            
    except Exception as e:
        print(f"Error in download_audio: {str(e)}")
        raise

def get_transcription_from_audio(audio_url):
    """Get transcription using AssemblyAI."""
    try:
        # Create a transcriber
        transcriber = aai.Transcriber()
        
        # Start transcription
        transcript = transcriber.transcribe(audio_url)
        
        # Wait for completion and return text
        return transcript.text
    except Exception as e:
        print(f"Error in get_transcription_from_audio: {str(e)}")
        raise

def generate_notes_from_transcript(transcript, title):
    """Generate notes from transcript using Google Gemini."""
    try:
        if genai is None:
            return "Note generation is currently unavailable. Please check the Google Generative AI configuration."
            
        # Create prompt for Gemini
        prompt = f"""You are an expert note-taker. Create comprehensive, organized notes from the following transcript of a YouTube video titled: "{title}".
        
The notes should:
1. Have a clear, hierarchical structure with headings and subheadings
2. Include key concepts, ideas, and important information
3. Be organized in a logical manner that makes the content easy to understand and review
4. Use bullet points for detailed information under each section
5. Be written in a clear, concise academic style

Transcript:
{transcript}
"""
        
        # Try with different Gemini models
        try:
            # For newer genai library
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text
        except (AttributeError, NameError, TypeError):
            try:
                # For older genai library
                response = genai.generate_text(
                    model="gemini-pro",
                    prompt=prompt
                )
                return response.text
            except Exception as e:
                print(f"Error with alternative model: {str(e)}")
                return "Note generation failed. Please try again later."
                
    except Exception as e:
        print(f"Error in generate_notes_from_transcript: {str(e)}")
        return "Note generation failed. Please try again later."

def process_youtube_link(link):
    """Process YouTube link to get transcription and notes."""
    try:
        print("Starting YouTube link processing...")
        
        # Get title
        print("Fetching video title...")
        title = yt_title(link)
        print(f"Video title: {title}")
        
        # Download audio
        print("Downloading audio...")
        audio_url = download_audio(link)
        print("Audio download complete")
        
        # Get transcription
        print("Getting transcription...")
        transcription = get_transcription_from_audio(audio_url)
        print("Transcription complete")
        
        # Generate notes
        print("Generating notes...")
        notes = generate_notes_from_transcript(transcription, title)
        print("Notes generation complete")
        
        return {
            'title': title,
            'audio_url': audio_url,
            'transcription': transcription,
            'notes': notes
        }
    except Exception as e:
        error_message = f"Error in process_youtube_link: {str(e)}"
        print(error_message)
        return {
            'title': 'Error processing video',
            'audio_url': '',
            'transcription': 'Transcription failed. Please try again.',
            'notes': error_message,
            'error': True
        } 