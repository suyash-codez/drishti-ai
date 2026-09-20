import os
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from pydantic import BaseModel

from backend.services.sarvam import speech_to_text, text_to_speech
from backend.services.voice_parser import extract_fields
from backend.services.agri_agent import ask_agri_assistant

router = APIRouter(prefix="/voice", tags=["voice"])

class SpeakRequest(BaseModel):
    text: str
    language: str = "hi"

class ChatRequest(BaseModel):
    message: str
    language: str = "hi"

@router.post("/chat")
async def chat_with_agri_ai(req: ChatRequest):
    """
    Takes farmer question or voice query, generates intelligent agricultural
    answer or feature navigation with deep links.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")
        
    response = ask_agri_assistant(req.message, language=req.language)
    
    # Also extract any field parameters if user happened to speak numeric metrics
    fields_result = extract_fields(req.message)
    if fields_result.get("extracted_fields"):
        response["extracted_fields"] = fields_result["extracted_fields"]
        
    return response

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("hi")
):
    """
    Accepts an audio file, sends to Sarvam STT, parses transcript,
    and returns DRISHTI form fields.
    """
    if not file:
        raise HTTPException(status_code=422, detail="No file provided")
        
    # Basic mime type validation
    if not file.content_type or not file.content_type.startswith("audio/"):
         # Accept video/webm because some browsers record audio as webm
         if not file.content_type or not file.content_type.startswith("video/webm"):
             if not file.content_type or not file.content_type.startswith("application/octet-stream"):
                 raise HTTPException(status_code=422, detail="File must be an audio file")
    
    # Read file bytes
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=422, detail="Failed to read file")
        
    if len(content) == 0:
        raise HTTPException(status_code=422, detail="Audio file is empty")
        
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file is too large (max 25MB)")

    # Map language
    lang_map = {"hi": "hi-IN", "en": "en-IN", "mr": "mr-IN"}
    lang_code = lang_map.get(language, "hi-IN")
    
    # 1. Transcribe using Sarvam
    transcript = speech_to_text(content, lang_code)
    
    # 2. Extract fields
    parsed_result = extract_fields(transcript)
    
    # 3. Conversational AI agent response
    ai_response = ask_agri_assistant(transcript, language=language)
    
    return {
        "success": True,
        "language": lang_code,
        "transcript": transcript,
        "ai_answer": ai_response.get("answer"),
        "action": ai_response.get("action"),
        "action_label": ai_response.get("action_label"),
        **parsed_result
    }

@router.post("/speak")
async def speak_text(req: SpeakRequest):
    """
    Accepts text and language, returns TTS audio bytes from Sarvam.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=422, detail="Text is required")
        
    if len(req.text) > 2500:
        req.text = req.text[:2500]

    # Map language
    lang_map = {"hi": "hi-IN", "en": "en-IN", "mr": "mr-IN"}
    lang_code = lang_map.get(req.language, "hi-IN")
    
    audio_bytes = text_to_speech(req.text, lang_code)
    
    return Response(content=audio_bytes, media_type="audio/wav")
