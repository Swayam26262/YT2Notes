import os
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Google Gemini
gemini_key = os.getenv("GOOGLE_GEMINI_API_KEY")
print(f"API Key: {gemini_key[:5]}{'*' * (len(gemini_key) - 5)}")

client = genai.Client(api_key=gemini_key)

def test_generate_notes(transcript, title):
    """Test generating notes using Google Gemini."""
    print(f"Testing note generation for transcript of length: {len(transcript)} characters")
    print(f"Title: {title}")
    
    try:
        # Set up the model - try different models
        model_name = "gemini-1.5-flash"
        print(f"Using model: {model_name}")
        
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
        print("Prompt created")
        
        # Generate response
        print(f"Generating notes using model {model_name}...")
        response = client.models.generate_content(
            model=model_name,
            contents=prompt
        )
        print("Note generation completed")
        
        # Print results
        print("\nGenerated Notes:")
        print("-" * 50)
        notes = response.text
        print(notes[:500] + "..." if len(notes) > 500 else notes)
        print("-" * 50)
        print(f"Full notes length: {len(notes)} characters")
        
        return notes
    except Exception as e:
        print(f"Error in test_generate_notes: {str(e)}")
        # Try with a different model
        try:
            print("Trying with gemini-pro model...")
            model_name = "gemini-pro"
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            print("Note generation completed with alternative model")
            notes = response.text
            return notes
        except Exception as e2:
            print(f"Error with fallback model: {str(e2)}")
            raise

if __name__ == "__main__":
    # Test transcript and title
    test_transcript = """
    Common sports injuries include runner's knee, which is characterized by pain behind or around the kneecap.
    It's caused by overuse, muscle imbalance, and inadequate stretching.
    Symptoms include pain under or around the kneecap and pain when walking.
    
    Sprained ankles occur when the ligaments of the ankle are stretched beyond their limits and tear.
    Symptoms include pain, swelling, bruising, and inability to bear weight.
    
    Tennis elbow is an overuse injury caused by repetitive wrist and arm motions.
    It results in inflammation of the tendons that join the forearm muscles to the outside of the elbow.
    Symptoms include pain and tenderness on the outside of the elbow.
    
    Shin splints refer to pain along the shin bone (tibia) — the large bone in the front of your lower leg.
    They're caused by excessive force on the shin bone and connective tissues.
    Symptoms include tenderness, soreness or pain along the inner part of the lower leg.
    
    Groin pulls occur when the muscles in the inner thigh get overstretched or torn.
    Symptoms include pain and tenderness in the groin and the inside of the thigh.
    """
    
    test_title = "5 Common Sports Injuries and Their Symptoms"
    
    print("=== Testing Google Gemini Note Generation ===")
    notes = test_generate_notes(test_transcript, test_title)
    
    print("\n=== Test Complete ===")
    print(f"Notes generated with {len(notes)} characters") 