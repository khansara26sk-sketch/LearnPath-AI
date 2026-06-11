from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1, max_length=4000)
    subject: Optional[str] = None
    context_topics: List[str] = Field(default_factory=list)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool = True
    conversation_id: str
    user_id: str
    reply: str
    suggested_followups: List[str] = Field(default_factory=list)
    ai_mode: str
    timestamp: datetime
