from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile
from fastapi import HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Any

from app.core.dependencies import get_pdf_service
from app.services.pdf_service import PDFService
from app.database.connection import get_database  # Yahan fix kiya hai

router = APIRouter(
    prefix="/pdf",
    tags=["PDF Notes Generator"],
)

# ==========================================
# NEW: Data Model for PDF History
# ==========================================
class PDFHistoryItem(BaseModel):
    user_id: str
    file_name: str
    content_type: str
    content: Any

# ==========================================
# NEW: History Endpoints (Save & Fetch)
# ==========================================
@router.post("/history")
async def save_pdf_history(item: PDFHistoryItem):
    try:
        db = get_database()  # Yahan database fetch kiya hai
        history_doc = item.model_dump()
        history_doc["timestamp"] = datetime.utcnow()
        
        # Save to MongoDB 'pdf_history' collection
        result = await db.pdf_history.insert_one(history_doc)
        
        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_pdf_history(user_id: str):
    try:
        db = get_database()  # Yahan database fetch kiya hai
        # Fetch the 20 most recent generated items for this user
        cursor = db.pdf_history.find({"user_id": user_id}).sort("timestamp", -1).limit(20)
        history = await cursor.to_list(length=20)
        
        # Convert MongoDB ObjectId to string for JSON
        for item in history:
            item["_id"] = str(item["_id"])
            
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# EXISTING: Generation Endpoints (Unchanged)
# ==========================================
@router.post("/summary")
async def pdf_summary(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_summary(pdf_bytes)
    return {"summary": result}


@router.post("/notes")
async def pdf_notes(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_notes(pdf_bytes)
    return {"notes": result}


@router.post("/mcqs")
async def pdf_mcqs(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_mcqs(pdf_bytes)
    return {"mcqs": result}


@router.post("/flashcards")
async def pdf_flashcards(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    result = await service.generate_flashcards(pdf_bytes)
    return {"flashcards": result}


@router.post("/quiz")
async def pdf_quiz(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    return await service.generate_quiz(pdf_bytes)