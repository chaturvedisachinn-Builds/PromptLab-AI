import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.config import Settings, get_settings
from app.models import Action, PromptRequest, PromptResponse
from app.services.prompts import PromptService

router = APIRouter(prefix="/api/v1", tags=["prompts"])
SettingsDep = Annotated[Settings, Depends(get_settings)]

def handle(action: Action, payload: PromptRequest, request: Request, settings: Settings) -> PromptResponse:
    prompt = payload.prompt.strip()
    if not prompt: raise HTTPException(422, "Prompt cannot be blank.")
    if len(prompt) > settings.max_prompt_length: raise HTTPException(422, f"Prompt exceeds {settings.max_prompt_length} characters.")
    return PromptResponse(action=action, result=PromptService(settings).process(action, prompt), model=settings.gemini_model, request_id=getattr(request.state, "request_id", str(uuid.uuid4())))

@router.post("/generate", response_model=PromptResponse)
def generate(payload: PromptRequest, request: Request, settings: SettingsDep): return handle(Action.GENERATE, payload, request, settings)
@router.post("/improve", response_model=PromptResponse)
def improve(payload: PromptRequest, request: Request, settings: SettingsDep): return handle(Action.IMPROVE, payload, request, settings)
@router.post("/explain", response_model=PromptResponse)
def explain(payload: PromptRequest, request: Request, settings: SettingsDep): return handle(Action.EXPLAIN, payload, request, settings)
@router.post("/optimize", response_model=PromptResponse)
def optimize(payload: PromptRequest, request: Request, settings: SettingsDep): return handle(Action.OPTIMIZE, payload, request, settings)
@router.post("/actions/{action}", response_model=PromptResponse)
def run_action(action: Action, payload: PromptRequest, request: Request, settings: SettingsDep): return handle(action, payload, request, settings)
