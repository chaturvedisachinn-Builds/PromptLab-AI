# PromptLab AI Backend

FastAPI backend for PromptLab AI. See the repository-root README for full setup instructions.

## Main endpoints

- `GET /health` — health check
- `POST /api/v1/generate` — generate a prompt
- `POST /api/v1/improve` — improve a prompt
- `POST /api/v1/explain` — explain a prompt
- `POST /api/v1/optimize` — optimize a prompt
- `POST /api/v1/prompts` — save a prompt or create a new version
- `GET /api/v1/prompts` — list saved prompts
- `GET /api/v1/prompts/{prompt_id}/versions` — list prompt versions

Start locally from this directory with `uvicorn app.main:app --reload`.
