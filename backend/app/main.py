import logging
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# --- Load Environment Variables ---
# Isse ensure karo ki load_dotenv path sahi hai
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

# Debug: Print loaded env variables to verify (Security: remove this later)
print(f"DEBUG: PINECONE_API_KEY from os.environ: {os.getenv('PINECONE_API_KEY')}")

from app.config import get_settings
from app.core.exceptions import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
)
from app.database.connection import (
    close_mongo_connection,
    connect_to_mongo,
)
from app.routes import chat, quiz, roadmap, pdf_tools, dashboard
from app.services.groq_service import GroqService

# --- Request Model ---
class QuizRequest(BaseModel):
    class_name: str = Field(..., alias="class")
    subject: str
    topic: str
    count: int
    model_config = ConfigDict(populate_by_name=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    try:
        await connect_to_mongo()
        logger.info("Connected to MongoDB: %s", settings.mongodb_db_name)
    except Exception as exc:
        logger.error("MongoDB connection failed: %s", exc)
        raise
    yield
    await close_mongo_connection()
    logger.info("MongoDB connection closed")

def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description="AI-powered education platform API — quizzes, roadmaps, tutor chat, and PDF notes.",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    @app.post(f"{settings.api_prefix}/generate-quiz")
    async def generate_quiz(req: QuizRequest):
        service = GroqService()
        prompt = f"Generate {req.count} MCQs for a {req.class_name} student on topic '{req.topic}' in subject '{req.subject}'. Return JSON with key 'questions' containing list of objects (question, options, correct index)."
        questions = await service.generate_questions(prompt)
        return {"questions": questions}

    app.include_router(quiz.router, prefix=settings.api_prefix)
    app.include_router(roadmap.router, prefix=settings.api_prefix)
    app.include_router(chat.router, prefix=settings.api_prefix)
    app.include_router(pdf_tools.router, prefix=settings.api_prefix)
    app.include_router(dashboard.router, prefix=settings.api_prefix)
    return app

app = create_app()