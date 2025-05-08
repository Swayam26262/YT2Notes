"""
Test the full YouTube to Notes process.
"""
import os
import sys
import django
import json

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.utils import process_youtube_link

def test_full_process(youtube_url):
    """Test the full process: download, transcribe, and generate notes."""
    print(f"Testing full process for YouTube URL: {youtube_url}")
    
    try:
        print("\n--- Starting YouTube processing ---")
        result = process_youtube_link(youtube_url)
        
        print("\n--- Process completed successfully ---")
        print(f"Title: {result['title']}")
        print(f"Audio URL: {result['audio_url']}")
        
        print("\n--- Transcription (excerpt) ---")
        transcription = result['transcription']
        print(transcription[:500] + "..." if len(transcription) > 500 else transcription)
        
        print("\n--- Generated Notes (excerpt) ---")
        notes = result['notes']
        print(notes[:500] + "..." if len(notes) > 500 else notes)
        
        # Save the results to a file for reference
        output_file = "test_result.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"\nFull results saved to {output_file}")
        return True
        
    except Exception as e:
        import traceback
        print(f"\n--- Process failed ---")
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Get YouTube URL from command line or use default
    if len(sys.argv) > 1:
        youtube_url = sys.argv[1]
    else:
        # Default to a short YouTube video for testing
        youtube_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Astley - Never Gonna Give You Up
    
    print("===== Full YouTube to Notes Process Test =====")
    success = test_full_process(youtube_url)
    print("\n===== Test Complete =====")
    print(f"Result: {'SUCCESS' if success else 'FAILURE'}")
    sys.exit(0 if success else 1) 