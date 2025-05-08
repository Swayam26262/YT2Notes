import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Google Gemini
gemini_key = os.getenv("GOOGLE_GEMINI_API_KEY")
print(f"API Key: {gemini_key[:5]}{'*' * (len(gemini_key) - 5)}")

genai.configure(api_key=gemini_key)

def list_available_models():
    """List available models."""
    print("Available models:")
    try:
        for m in genai.list_models():
            print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {str(e)}")

def test_generate_notes(transcript, title):
    """Test generating notes using Google Gemini."""
    print(f"Testing note generation for transcript of length: {len(transcript)} characters")
    print(f"Title: {title}")
    
    try:
        # List available models first
        list_available_models()
        
        # Set up the model - try gemini-1.5-pro if available, fallback to others
        model_name = 'gemini-1.5-pro'
        print(f"Attempting to use model: {model_name}")
        
        try:
            model = genai.GenerativeModel(model_name)
        except:
            print(f"Model {model_name} not available, trying gemini-1.0-pro")
            try:
                model = genai.GenerativeModel('gemini-1.0-pro')
            except:
                print("Falling back to default model")
                all_models = list(genai.list_models())
                text_models = [m for m in all_models if 'generateContent' in m.supported_generation_methods]
                if text_models:
                    model = genai.GenerativeModel(text_models[0].name)
                    print(f"Using model: {text_models[0].name}")
                else:
                    raise Exception("No suitable text generation models found")
                
        print("Model initialized")
        
        # Create prompt for Gemini
        prompt = f"""
        You are an expert note-taker. Create comprehensive, organized notes from the following transcript of a YouTube video titled: "{title}".
        
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
        print("Generating notes...")
        response = model.generate_content(prompt)
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