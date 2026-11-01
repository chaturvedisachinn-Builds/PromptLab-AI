# PromptLab AI

Static frontend for the existing FastAPI API.

## Run

1. Start the backend at `http://127.0.0.1:8000`.
2. Serve this folder with any static server, or open `index.html`.

The frontend sends `POST` requests to `/api/v1/generate`, `/improve`, `/explain`, and `/optimize` with `{ "prompt": "..." }`.
