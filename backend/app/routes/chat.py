from fastapi import APIRouter, Depends, File, Form, UploadFile
from app.core.dependencies import get_chat_service
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.services.rag_service import RAGService

router = APIRouter(
    prefix="/chat",
    tags=["AI Tutor"],
)

# HELPER: Lazy initialization function
def get_rag_service():
    return RAGService()

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
    # Yahan initialize kar rahe hain (Lazy approach)
    rag_service = get_rag_service()
    
    # 1. Pinecone se context dhoondho
    context = rag_service.get_relevant_context(payload.message, payload.user_id)
    
    # 2. Agar context mila, toh message ke saath attach karo
    if context:
        payload.message = f"""
        Use the following notes to answer the student's question accurately. 
        If the notes don't contain the answer, use your general knowledge but mention it.
        
        CONTEXT FROM NOTES:
        {context}
        
        STUDENT QUESTION:
        {payload.message}
        """
        
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
async def learn_from_pdf(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    # Yahan initialize kar rahe hain (Lazy approach)
    rag_service = get_rag_service()
    return await rag_service.process_and_store_pdf(file, user_id)