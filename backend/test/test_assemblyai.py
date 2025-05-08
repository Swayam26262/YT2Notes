import os
import assemblyai as aai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure AssemblyAI
aai_key = os.getenv("ASSEMBLYAI_API_KEY")
print(f"API Key: {aai_key[:5]}{'*' * (len(aai_key) - 5)}")

aai.settings.api_key = aai_key

def test_transcription(audio_url):
    """Test transcription using AssemblyAI."""
    print(f"Testing transcription for audio URL: {audio_url}")
    
    try:
        # Create a transcriber
        transcriber = aai.Transcriber()
        print("Transcriber created")
        
        # Start transcription
        print("Starting transcription...")
        transcript = transcriber.transcribe(audio_url)
        print("Transcription completed")
        
        # Print results
        print("\nTranscription Text:")
        print("-" * 50)
        print(transcript.text[:500] + "..." if len(transcript.text) > 500 else transcript.text)
        print("-" * 50)
        print(f"Full transcript length: {len(transcript.text)} characters")
        
        return transcript.text
    except Exception as e:
        print(f"Error in test_transcription: {str(e)}")
        raise

if __name__ == "__main__":
    # Test with an audio file URL
    # Using a public audio sample for testing
    test_audio_url = "https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3"
    
    print("=== Testing AssemblyAI Transcription ===")
    transcription = test_transcription(test_audio_url)
    
    print("\n=== Test Complete ===")
    print(f"Transcription received with {len(transcription)} characters") 