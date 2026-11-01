
import uuid
from fastapi import APIRouter, Depends, Request
from typing import Annotated

from app.core.config import Settings, get_settings
from app.models import (
    PromptEvaluationRequest,
    PromptEvaluationResponse,
)
from app.services.evaluation import PromptEvaluationService


router = APIRouter(prefix="/api/v1", tags=["prompt-evaluation"])

SettingsDep = Annotated[Settings, Depends(get_settings)]


@router.post("/evaluate", response_model=PromptEvaluationResponse)
def evaluate_prompt(
    payload: PromptEvaluationRequest,
    request: Request,
    settings: SettingsDep,
):
    prompt = payload.prompt.strip()

    if not prompt:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Prompt cannot be blank.")

    if len(prompt) > settings.max_prompt_length:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=422,
            detail=f"Prompt exceeds {settings.max_prompt_length} characters."
        )

    result = PromptEvaluationService(settings).evaluate(prompt)

    return PromptEvaluationResponse(
        **result,
        model=settings.gemini_model,
        request_id=getattr(
            request.state,
            "request_id",
            str(uuid.uuid4())
        ),
    )
