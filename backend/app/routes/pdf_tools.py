from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile

from app.core.dependencies import get_pdf_service
from app.services.pdf_service import PDFService

router = APIRouter(
    prefix="/pdf",
    tags=["PDF Notes Generator"],
)


@router.post("/summary")
async def pdf_summary(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()

    result = await service.generate_summary(
        pdf_bytes
    )

    return {
        "summary": result
    }


@router.post("/notes")
async def pdf_notes(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()

    result = await service.generate_notes(
        pdf_bytes
    )

    return {
        "notes": result
    }


@router.post("/mcqs")
async def pdf_mcqs(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()

    result = await service.generate_mcqs(
        pdf_bytes
    )

    return {
        "mcqs": result
    }


@router.post("/flashcards")
async def pdf_flashcards(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()

    result = await service.generate_flashcards(
        pdf_bytes
    )

    return {
        "flashcards": result
    }
@router.post("/quiz")
async def pdf_quiz(
    file: UploadFile = File(...),
    service: PDFService = Depends(get_pdf_service),
):
    pdf_bytes = await file.read()
    return await service.generate_quiz(pdf_bytes)