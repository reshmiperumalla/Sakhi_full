from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException

from app.core.dependencies import get_optional_user
from app.services.voice_service import VoiceService

router = APIRouter(prefix="/voice", tags=["Voice Interaction"])


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Accepts raw audio recorded via browser or mobile microphone.
    Returns transcribed text for voice-to-text pipeline.
    """
    try:
        content = await audio.read()
        target_lang = language
        if not target_lang and current_user:
            target_lang = current_user.get("preferred_language", "en")

        result = await VoiceService.transcribe_audio(
            file_bytes=content,
            filename=audio.filename or "recording.webm",
            language=target_lang
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice transcription failed: {str(e)}")
