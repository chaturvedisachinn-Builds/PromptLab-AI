"""Small local Gemini connectivity check. Reads the API key from environment."""
import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise SystemExit("Set GEMINI_API_KEY in your environment before running this check.")

client = genai.Client(api_key=api_key)
response = client.models.generate_content(
    model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    contents="Say hello in one sentence.",
)
print(response.text)
