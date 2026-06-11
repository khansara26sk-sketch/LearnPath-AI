from functools import lru_cache

from app.services.analysis_service import AnalysisService
from app.services.chat_service import ChatService
from app.services.groq_service import GroqService
from app.services.quiz_service import QuizService
from app.services.roadmap_service import RoadmapService
from app.services.pdf_service import PDFService

@lru_cache
def get_pdf_service() -> PDFService:
    return PDFService(get_groq_service())

@lru_cache
def get_groq_service() -> GroqService:
    return GroqService()


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService(get_groq_service())


@lru_cache
def get_quiz_service() -> QuizService:
    return QuizService(get_analysis_service())


@lru_cache
def get_roadmap_service() -> RoadmapService:
    return RoadmapService(get_groq_service())


@lru_cache
def get_chat_service() -> ChatService:
    return ChatService(get_groq_service())