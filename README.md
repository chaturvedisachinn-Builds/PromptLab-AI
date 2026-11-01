# PromptLab AI 2.0

PromptLab AI is a prompt-engineering workspace built with a vanilla JavaScript frontend and a FastAPI backend. Version 2.0 begins adding a persistent prompt library with version history.

## Current features

- Generate, improve, explain, and optimize prompts using the Gemini API.
- FastAPI backend with request IDs and health endpoint.
- SQLite-backed prompt library: save named prompts and automatically create numbered versions.
- Browse saved prompts and retrieve their version history through the API.

## Project structure

```text
PromptLab-AI-2.0/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   └── services/
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
├── .gitignore
└── README.md
```

## Local setup (Windows PowerShell)

1. Open a terminal in the `backend` folder.
2. Create and activate a virtual environment:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

4. Create your local environment file:

```powershell
Copy-Item .env.example .env
```

5. Open `backend/.env` and add your own Gemini API key to `GEMINI_API_KEY`.
6. Start the API:

```powershell
uvicorn app.main:app --reload
```

API documentation: http://127.0.0.1:8000/docs

Open the frontend using the VS Code Live Server extension (typically http://127.0.0.1:5500). The frontend currently calls the local API at http://127.0.0.1:8000/api/v1.

## Prompt versioning API

Save a prompt. Repeating the same name creates the next version:

```http
POST /api/v1/prompts
Content-Type: application/json

{"name":"Interview helper","content":"Act as a technical interviewer."}
```

List saved prompts:

```http
GET /api/v1/prompts
```

List versions of a prompt:

```http
GET /api/v1/prompts/1/versions
```

Interactive docs at `/docs` let you try these endpoints without writing frontend code first.

## Tests

From the `backend` folder:

```powershell
python -m pytest
```

## Security

- Never commit `.env`, API keys, or credentials.
- `.env.example` contains placeholders only.
- The database is local and ignored by Git.
- If an API key has ever been committed or shared in an archive, revoke it and create a new one.

## Cost

The application code, SQLite database, FastAPI, and local development workflow are free. Gemini API free-tier availability and quotas are controlled by Google and can change. A paid API key is not required to test the prompt-library endpoints.

## Version 2.0 — first milestone

The first 2.0 milestone adds a persistent prompt library:

- Save the prompt currently in the editor under a name.
- Saving the same name creates a new numbered version.
- Browse saved prompts after restarting the browser or backend.
- Load the latest saved version back into the editor.

The library is stored in a local SQLite database at `backend/data/promptlab.db` by default. It does not require an LLM API call, so this feature can be tested without spending money or configuring a Gemini key.

### Test the prompt library

Start the backend, open `http://127.0.0.1:8000/docs`, and try:

- `POST /api/v1/prompts` with `{"name":"Research assistant","content":"Act as a careful research assistant."}`
- `GET /api/v1/prompts`
- `GET /api/v1/prompts/1/versions`

In the frontend, enter a prompt, give it a name under **Prompt library**, and select **Save prompt**. Save it again with the same name to create version 2.
