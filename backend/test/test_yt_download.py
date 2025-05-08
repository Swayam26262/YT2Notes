import os
import yt_dlp
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_yt_title(link):
    """Test fetching YouTube video title."""
    print(f"Testing title fetch for: {link}")
    ydl_opts = {
        'quiet': False,  # Set to False to see output
        'no_warnings': False,
        'extract_flat': True,
        'no_color': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # Extract video information
            print("Extracting video info...")
            info = ydl.extract_info(link, download=False)
            title = info.get('title')
            print(f"Title: {title}")
            return title
        except Exception as e:
            print(f"Error in test_yt_title: {str(e)}")
            raise

def test_download_audio(link):
    """Test downloading audio from YouTube video link."""
    print(f"Testing audio download for: {link}")
    try:
        # Set temporary directory
        temp_dir = './temp'
        os.makedirs(temp_dir, exist_ok=True)

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
            'quiet': False,  # Set to False to see output
            'no_warnings': False,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("Starting download...")
            info = ydl.extract_info(link, download=True)
            temp_file_path = os.path.join(temp_dir, f"{info['id']}.mp3")
            
            if not os.path.exists(temp_file_path):
                print(f"Audio file not found at {temp_file_path}")
                raise Exception(f"Audio file not found at {temp_file_path}")
            
            print(f"Audio file downloaded successfully to: {temp_file_path}")
            print(f"File size: {os.path.getsize(temp_file_path) / (1024*1024):.2f} MB")
            
            # We won't delete the file for testing purposes
            return temp_file_path
            
    except Exception as e:
        print(f"Error in test_download_audio: {str(e)}")
        raise

if __name__ == "__main__":
    # Test with a short YouTube video
    test_link = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Astley - Never Gonna Give You Up
    
    print("=== Testing YouTube Title Fetch ===")
    title = test_yt_title(test_link)
    
    print("\n=== Testing YouTube Audio Download ===")
    audio_file = test_download_audio(test_link)
    
    print("\n=== Test Complete ===")
    print(f"Title: {title}")
    print(f"Audio file: {audio_file}") 