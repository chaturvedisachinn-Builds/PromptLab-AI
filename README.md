# PromptLab AI 2.0

**An AI-powered prompt engineering workspace built with FastAPI, Google Gemini, and vanilla JavaScript.**

PromptLab AI 2.0 helps users create, improve, explain, optimize, and evaluate AI prompts through a clean developer-focused interface. It also includes a persistent prompt library with SQLite-based version history.

## Features

- **Prompt Generation:** Generate AI prompts from user instructions.
- **Prompt Improvement:** Refine prompts for better clarity, structure, and results.
- **Prompt Explanation:** Understand the purpose and structure of a prompt.
- **Prompt Optimization:** Optimize prompts for more effective AI interactions.
- **Prompt Evaluation:** Evaluate prompts across clarity, specificity, context, and structure, with scores and improvement suggestions.
- **Prompt Library:** Save and manage named prompts.
- **Version History:** Automatically create numbered versions when saving prompts under the same name.
- **Persistent Storage:** Store prompts locally using SQLite.
- **REST API:** FastAPI endpoints with request IDs and health monitoring.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| AI Integration | Google Gemini API |
| Database | SQLite |
| Data Validation | Pydantic |
| API Documentation | Swagger UI |
| Testing | Pytest |

## Project Structure

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
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .gitignore
├── check_models.py
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or later (use a version supported by the project dependencies).
- A Google Gemini API key for AI-powered features.
- VS Code with the Live Server extension.

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd PromptLab-AI-2.0
```

### 2. Set up the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 3. Configure environment variables

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your actual `.env` file or API key.

### 4. Start the backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

Backend API:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 5. Start the frontend

Open `frontend/index.html` using VS Code Live Server.

The frontend typically runs at:

`http://127.0.0.1:5500`

The frontend connects to the local backend at:

`http://127.0.0.1:8000/api/v1`

## Prompt Library API

The prompt library supports persistent storage and version history.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/prompts` | Save a prompt or create a new version |
| GET | `/api/v1/prompts` | Retrieve saved prompts |
| GET | `/api/v1/prompts/{prompt_id}/versions` | Retrieve prompt version history |

Example request:

```json
{
  "name": "Interview Assistant",
  "content": "Act as a technical interviewer."
}
```

Saving another prompt with the same name creates the next numbered version.

## Testing

From the `backend` directory:

```powershell
python -m pytest
```

Check installed dependencies:

```powershell
python -m pip check
```

## Database

The application uses SQLite for local prompt storage.

Default database location:

`backend/data/promptlab.db`

The database persists saved prompts and their version history across backend restarts.

The prompt library does not require a Gemini API call.

## Security

- API keys are stored in local environment variables.
- `.env` files are excluded through `.gitignore`.
- `.env.example` contains configuration placeholders only.
- Local database files and virtual environments are excluded from Git.
- Never expose or commit API credentials.

## Cost

The application and its local development stack use free, open-source technologies. Gemini API usage is subject to Google's current free-tier quotas, availability, and pricing.

## Project Status

**Version 2.0 — Core features implemented.**

The current milestone includes AI-powered prompt operations, prompt evaluation, persistent prompt storage, and automatic version history.

Future development can include prompt comparison, expanded automated testing, and additional evaluation capabilities.