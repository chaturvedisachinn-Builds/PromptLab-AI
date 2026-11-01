from enum import StrEnum
from pydantic import BaseModel, Field


class Action(StrEnum):
    GENERATE = "generate"
    IMPROVE = "improve"
    EXPLAIN = "explain"
    OPTIMIZE = "optimize"


class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1)


class PromptResponse(BaseModel):
    action: Action
    result: str
    model: str
    request_id: str


class PromptSaveRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1, max_length=20000)


class PromptVersionResponse(BaseModel):
    prompt_id: int
    name: str
    version: int
    content: str
    created_at: str


class PromptSummaryResponse(BaseModel):
    prompt_id: int
    name: str
    latest_version: int
    updated_at: str

class PromptEvaluationRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=12000)


class EvaluationDimension(BaseModel):
    score: int = Field(..., ge=0, le=100)
    feedback: str


class PromptEvaluationResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    clarity: EvaluationDimension
    specificity: EvaluationDimension
    context: EvaluationDimension
    structure: EvaluationDimension
    suggestions: list[str]
    summary: str
    model: str
    request_id: str