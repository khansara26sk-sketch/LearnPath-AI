from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.dependencies import get_chat_service
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(
    prefix="/chat",
    tags=["AI Tutor"],
)


@router.get("/history/{user_id}")
async def get_chat_history(
    user_id: str,
    service: ChatService = Depends(get_chat_service),
):
    return await service.get_user_conversations(user_id)


@router.get("/conversation/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    service: ChatService = Depends(get_chat_service),
):
    return await service.get_conversation(conversation_id)


@router.post("", response_model=ChatResponse)
async def chat_with_tutor(
    payload: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    return await service.chat(payload)


@router.post("/upload", response_model=ChatResponse)
async def chat_with_file(
    user_id: str = Form(...),
    message: str = Form(""),
    subject: str = Form("General"),
    conversation_id: str = Form(""),
    file: UploadFile | None = File(None),
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    return await service.chat_with_file(
        user_id=user_id,
        message=message,
        subject=subject,
        conversation_id=conversation_id or None,
        file=file,
    )


@router.post("/learn-pdf")
async def learn_from_pdf_disabled():
    return {
        "success": False,
        "message": "PDF memory training is temporarily disabled for deployment.",
    }