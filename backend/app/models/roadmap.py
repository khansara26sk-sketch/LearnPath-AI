from typing import List, Optional

from pydantic import BaseModel, Field


class RoadmapMilestone(BaseModel):
    week: int
    title: str
    topics: List[str]
    resources: List[str]
    estimated_hours: int
    tasks: List[str] = Field(default_factory=list)
    project: Optional[str] = None


class RoadmapRequest(BaseModel):
    user_id: str = Field(..., min_length=1)

    # Universal roadmap fields
    goal: Optional[str] = Field(
        None,
        examples=["NEET Biology", "Class 10 Maths", "Python", "Data Engineer"],
    )
    level: str = Field(
        default="Beginner",
        examples=["Beginner", "Intermediate", "Advanced"],
    )
    purpose: str = Field(
        default="General Learning",
        examples=[
            "School Exam",
            "Competitive Exam",
            "College Skill",
            "Career Goal",
        ],
    )
    weekly_hours: int = Field(default=10, ge=1, le=80)

    # Old fields kept for compatibility
    subject: str = Field(default="General", min_length=1)
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
    goal: Optional[str] = None
    level: Optional[str] = None
    purpose: Optional[str] = None
    weekly_hours: Optional[int] = None