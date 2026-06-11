from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class QuizAnswer(BaseModel):
    question_id: str
    selected_option: str
    is_correct: bool


class QuizSubmissionRequest(BaseModel):
    user_id: str = Field(..., min_length=1, description="Unique learner identifier")
    subject: str = Field(..., min_length=1, examples=["Mathematics"])
    topic: str = Field(..., min_length=1, examples=["Algebra"])
    answers: List[QuizAnswer] = Field(..., min_length=1)
    time_taken_seconds: Optional[int] = Field(None, ge=0)


class WeakTopic(BaseModel):
    topic: str
    score_percentage: float
    severity: str = Field(..., description="low | medium | high")
    recommendation: str


class QuizAnalysis(BaseModel):
    overall_score: float
    total_questions: int
    correct_answers: int
    weak_topics: List[WeakTopic]
    strengths: List[str]
    summary: str
    ai_mode: str = Field(..., description="mock | gemini")


class QuizSubmissionResponse(BaseModel):
    success: bool = True
    submission_id: str
    user_id: str
    subject: str
    topic: str
    analysis: QuizAnalysis
    created_at: datetime
