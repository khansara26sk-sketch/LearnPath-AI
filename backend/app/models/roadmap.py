from typing import List, Optional

from pydantic import BaseModel, Field


class RoadmapMilestone(BaseModel):
    week: int
    title: str
    topics: List[str]
    resources: List[str]
    estimated_hours: int


class RoadmapRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    weak_topics: List[str] = Field(default_factory=list)
    learning_goal: Optional[str] = Field(
        None,
        examples=["Prepare for board exams in 8 weeks"],
    )
    duration_weeks: int = Field(default=4, ge=1, le=52)


class RoadmapResponse(BaseModel):
    success: bool = True
    user_id: str
    subject: str
    roadmap_id: str
    title: str
    milestones: List[RoadmapMilestone]
    focus_areas: List[str]
    ai_mode: str
