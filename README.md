# PromptLab AI 2.0

An AI-powered prompt engineering workspace built with **FastAPI, Google Gemini, and Vanilla JavaScript**.

PromptLab AI 2.0 helps users generate, improve, explain, optimize, and evaluate AI prompts through a developer-focused interface. It also provides a persistent prompt library with SQLite-based storage and automatic version history.

## Features

- **Prompt Generation:** Generate AI prompts from user instructions.
- **Prompt Improvement:** Refine prompts for better clarity, structure, and results.
- **Prompt Explanation:** Understand the purpose and structure of a prompt.
- **Prompt Optimization:** Optimize prompts for more effective AI interactions.
- **Prompt Evaluation:** Evaluate prompts based on clarity, specificity, context, and structure, with scores and improvement suggestions.
- **Prompt Library:** Save and manage named prompts.
- **Version History:** Automatically create numbered versions when saving prompts under the same name.
- **Persistent Storage:** Store prompts locally using SQLite.
- **REST API:** FastAPI endpoints with request IDs and health monitoring.
- **API Documentation:** Interactive API documentation through Swagger UI.

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
PromptLab-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   └── services/
│   ├── data/
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
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

- Python 3.10 or later, compatible with the project dependencies.
- Google Gemini API key.
- Visual Studio Code.
- VS Code Live Server extension.

### 1. Clone the repository

```bash
git clone https://github.com/chaturvedisachinn-Builds/PromptLab-AI.git
cd PromptLab-AI
```

### 2. Set up the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 3. Configure environment variables

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and configure your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

Keep your actual API key private. Never commit your `.env` file to GitHub.

### 4. Start the backend

Make sure you are inside the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

Backend:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 5. Start the frontend

Open `frontend/index.html` using the VS Code Live Server extension.

The frontend typically runs at:

`http://127.0.0.1:5500`

The frontend communicates with the local backend through:

`http://127.0.0.1:8000/api/v1`

## Prompt Library API

The prompt library supports persistent storage and automatic version history.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/prompts` | Save a prompt or create a new version |
| GET | `/api/v1/prompts` | Retrieve saved prompts |
| GET | `/api/v1/prompts/{prompt_id}/versions` | Retrieve prompt version history |

### Example Request

```json
{
  "name": "Interview Assistant",
  "content": "Act as a technical interviewer."
}
```

Saving another prompt with the same name creates the next numbered version.

## Testing

Run the following commands from the `backend` directory.

Run tests:

```powershell
python -m pytest
```

Check dependency consistency:

```powershell
python -m pip check
```

## Database

PromptLab AI 2.0 uses SQLite for local prompt storage.

Default database location:

`backend/data/promptlab.db`

The database stores saved prompts and their version history across backend restarts.

The prompt library operates independently of Gemini API calls.

## Security

- API keys are stored in local environment variables.
- `.env` files are excluded through `.gitignore`.
- `.env.example` contains configuration placeholders only.
- Local database files and virtual environments are excluded from Git.
- API credentials should never be committed to the repository.

## Cost and Usage

The application can be developed and run locally without separate paid hosting.

Google Gemini API usage is subject to Google's current quotas, availability, and pricing.

## Project Status

**Version 2.0 — Core features implemented.**

The current version includes AI-powered prompt operations, prompt evaluation, persistent prompt storage, and automatic version history.

### Future Improvements

- Prompt comparison.
- Expanded automated testing.
- Additional prompt evaluation capabilities.
- Further improvements to the user interface.

---

**Built as a hands-on project exploring Generative AI, prompt engineering, Python backend development, and API integration.**