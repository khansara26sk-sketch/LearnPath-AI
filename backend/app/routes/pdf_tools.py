from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Any

from app.services.rag_service import RAGService
from app.core.dependencies import get_pdf_service
from app.services.pdf_service import PDFService
from app.database.connection import get_database

router = APIRouter(
    prefix="/pdf",
    tags=["PDF Notes Generator"],
)

# ==========================================
# DATA MODEL
# ==========================================
class PDFHistoryItem(BaseModel):
    user_id: str
    file_name: str
    content_type: str
    content: Any

# ==========================================
# HISTORY ENDPOINTS (MongoDB)
# ==========================================
@router.post("/history")
async def save_pdf_history(item: PDFHistoryItem):
    try:
        db = get_database()
        history_doc = item.model_dump()
        history_doc["timestamp"] = datetime.now(timezone.utc)
        
        # Save to MongoDB 'pdf_history' collection
        result = await db.pdf_history.insert_one(history_doc)
        
        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_pdf_history(user_id: str):
    try:
        db = get_database()
        cursor = db.pdf_history.find({"user_id": user_id}).sort("timestamp", -1).limit(20)
        history = await cursor.to_list(length=20)
        
        for item in history:
            item["_id"] = str(item["_id"])
            
        # 🔥 FIX 1: Frontend ko exactly wahi format do jo wo expect kar raha hai
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# HELPER: AUTO-SAVE TO HISTORY
# ==========================================
# 🔥 FIX 2: Yeh function background mein chupchap notes save kar dega
async def _save_to_history(user_id: str, filename: str, doc_type: str, content: str):
    if user_id and user_id != "guest":
        try:
            db = get_database()
            await db.pdf_history.insert_one({
                "user_id": user_id,
                "filename": filename,
                "type": doc_type,
                "content": content,
                "timestamp": datetime.now(timezone.utc)
            })
            print(f"✅ History saved for {filename} ({doc_type})")
        except Exception as e:
            print(f"⚠️ Failed to save history: {e}")

# ==========================================
# AI GENERATION ENDPOINTS
# ==========================================
@router.post("/summary")
async def pdf_summary(
    file: UploadFile = File(...),
    user_id: str = Form("guest"), # 🔥 FIX 3: Frontend se user_id catch karo
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_summary(pdf_bytes)
    
    # Generate hone ke baad turant save karo
    await _save_to_history(user_id, file.filename, "Summary", result)
    return {"summary": result}

@router.post("/notes")
async def pdf_notes(
    file: UploadFile = File(...),
    user_id: str = Form("guest"),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_notes(pdf_bytes)
    
    # Generate hone ke baad turant save karo
    await _save_to_history(user_id, file.filename, "Notes", result)
    return {"notes": result}

@router.post("/mcqs")
async def pdf_mcqs(
    file: UploadFile = File(...),
    user_id: str = Form("guest"),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_mcqs(pdf_bytes)
    return {"mcqs": result}

@router.post("/flashcards")
async def pdf_flashcards(
    file: UploadFile = File(...),
    user_id: str = Form("guest"),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_flashcards(pdf_bytes)
    return {"flashcards": result}

@router.post("/quiz")
async def pdf_quiz(
    file: UploadFile = File(...),
    user_id: str = Form("guest"),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    return await service.generate_quiz(pdf_bytes)

# ==========================================
# AI TRAINING (RAG) ENDPOINT
# ==========================================
@router.post("/learn-pdf")
async def learn_from_pdf(
    user_id: str = Form(...), 
    file: UploadFile = File(...)
):
    rag = RAGService()
    return await rag.process_and_store_pdf(file, user_id)