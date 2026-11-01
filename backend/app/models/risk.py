"""Pydantic models for risk profiling."""

from enum import Enum
from pydantic import BaseModel, Field


class RiskProfile(str, Enum):
    """Computed risk category."""
    CONSERVATIVE = "Conservative"
    MODERATE = "Moderate"
    AGGRESSIVE = "Aggressive"


class RiskAnswer(BaseModel):
    """A single questionnaire answer (question id → chosen option index)."""
    question_id: int = Field(..., ge=1, le=7)
    answer: int = Field(..., ge=0, le=4, description="0-indexed option choice")


class RiskProfileRequest(BaseModel):
    """Full questionnaire submission."""
    answers: list[RiskAnswer] = Field(..., min_length=7, max_length=7)


class RiskProfileResponse(BaseModel):
    """Scored risk profile result."""
    score: int
    profile: RiskProfile
    description: str
