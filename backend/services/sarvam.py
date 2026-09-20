import os
import base64
from fastapi import HTTPException
from sarvamai import SarvamAI
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

# Initialize SarvamAI client
api_key = os.getenv("SARVAM_API_KEY")
client = None

if api_key:
    try:
        client = SarvamAI(api_subscription_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize SarvamAI client: {e}")
else:
    print("Warning: SARVAM_API_KEY not found in environment.")

def get_client():
    if not client:
        raise HTTPException(
            status_code=500,
            detail="Voice service is temporarily unavailable. Please check the API configuration."
        )
    return client

def speech_to_text(file_bytes: bytes, language_code: str = "hi-IN") -> str:
    """
    Transcribes audio bytes to text using Sarvam Saaras model.
    """
    try:
        sarvam_client = get_client()
        
        # Save temporary file because SDK currently expects a file path/object
        # The exact implementation depends on the SDK, but typical for SDKs is a file-like object or bytes.
        # Since the prompt says client.speech_to_text.transcribe(file=...), we'll write to a temp file and read it.
        import tempfile
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(file_bytes)
            tmp_file_path = tmp_file.name

        try:
            with open(tmp_file_path, "rb") as audio_file:
                # The documentation states:
                # response = client.speech_to_text.transcribe(file=open("audio.wav", "rb"), model="saaras:v4")
                response = sarvam_client.speech_to_text.transcribe(
                    file=audio_file,
                    model="saaras:v4",
                    # Some versions might require mode or language_code if it's not strictly saaras:v4,
                    # but saaras:v4 auto-detects or translates depending on params. 
                    # We'll pass them safely if they are supported, or rely on defaults.
                )
            
            # Typically response is an object with a transcript attribute
            transcript = getattr(response, "transcript", None)
            if transcript is None and isinstance(response, dict):
                transcript = response.get("transcript")
                
            if not transcript:
                 raise ValueError("Empty transcript returned from Sarvam API.")
                 
            return transcript

        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

    except HTTPException:
        raise
    except Exception as e:
        # Avoid leaking raw errors to frontend.
        err_str = str(e).lower()
        if "403" in err_str or "unauthorized" in err_str or "auth" in err_str:
             raise HTTPException(status_code=403, detail="Voice service authentication failed. Please check the API configuration.")
        elif "429" in err_str or "rate limit" in err_str:
             raise HTTPException(status_code=429, detail="Voice service is temporarily busy. Please try again.")
        else:
             print(f"Sarvam STT Error: {e}")
             raise HTTPException(status_code=500, detail="Voice service is temporarily unavailable. Please use the manual form.")

def text_to_speech(text: str, language_code: str = "hi-IN", speaker: str = "shubh") -> bytes:
    """
    Synthesizes text to speech using Sarvam Bulbul model.
    Returns raw WAV bytes.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")
        
    try:
        sarvam_client = get_client()
        
        response = sarvam_client.text_to_speech.convert(
            text=text[:2500], # Max 2500 chars limit
            model="bulbul:v3",
            language_code=language_code,
            speaker=speaker
        )
        
        # Depending on SDK, audios might be an attribute or dict key
        audios = getattr(response, "audios", None)
        if audios is None and isinstance(response, dict):
            audios = response.get("audios")
            
        if not audios or not isinstance(audios, list):
            raise ValueError("Invalid response format from Sarvam TTS API.")
            
        # Join base64 strings and decode
        audio_base64 = "".join(audios)
        audio_bytes = base64.b64decode(audio_base64)
        
        return audio_bytes
        
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        err_str = str(e).lower()
        if "403" in err_str or "unauthorized" in err_str or "auth" in err_str:
             raise HTTPException(status_code=403, detail="Voice service authentication failed. Please check the API configuration.")
        elif "429" in err_str or "rate limit" in err_str:
             raise HTTPException(status_code=429, detail="Voice service is temporarily busy. Please try again.")
        else:
             print(f"Sarvam TTS Error: {e}")
             raise HTTPException(status_code=500, detail="Voice service is temporarily unavailable.")
