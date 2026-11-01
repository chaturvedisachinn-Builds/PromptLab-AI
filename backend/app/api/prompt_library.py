import sqlite3
from fastapi import APIRouter, HTTPException
from app.db.database import get_connection
from app.models import (
    PromptSaveRequest,
    PromptSummaryResponse,
    PromptVersionResponse,
)

router = APIRouter(prefix="/api/v1/prompts", tags=["prompt-library"])


@router.post("", response_model=PromptVersionResponse, status_code=201)
def save_prompt(payload: PromptSaveRequest):
    """Create a named prompt or save a new version of an existing prompt."""
    name = payload.name.strip()
    content = payload.content.strip()
    if not name or not content:
        raise HTTPException(status_code=422, detail="Name and content cannot be blank.")

    try:
        with get_connection() as connection:
            existing = connection.execute(
                "SELECT id FROM prompts WHERE name = ?", (name,)
            ).fetchone()

            if existing:
                prompt_id = existing["id"]
                latest = connection.execute(
                    "SELECT COALESCE(MAX(version), 0) AS version "
                    "FROM prompt_versions WHERE prompt_id = ?",
                    (prompt_id,),
                ).fetchone()["version"]
                version = latest + 1
                connection.execute(
                    "UPDATE prompts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (prompt_id,),
                )
            else:
                cursor = connection.execute(
                    "INSERT INTO prompts (name) VALUES (?)", (name,)
                )
                prompt_id = cursor.lastrowid
                version = 1

            cursor = connection.execute(
                "INSERT INTO prompt_versions (prompt_id, version, content) "
                "VALUES (?, ?, ?)",
                (prompt_id, version, content),
            )
            row = connection.execute(
                "SELECT created_at FROM prompt_versions WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()

        return PromptVersionResponse(
            prompt_id=prompt_id,
            name=name,
            version=version,
            content=content,
            created_at=row["created_at"],
        )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Could not save this prompt version.")


@router.get("", response_model=list[PromptSummaryResponse])
def list_prompts():
    """List saved prompts with their latest version number."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT p.id AS prompt_id, p.name,
                   COALESCE(MAX(v.version), 0) AS latest_version,
                   p.updated_at
            FROM prompts p
            LEFT JOIN prompt_versions v ON v.prompt_id = p.id
            GROUP BY p.id, p.name, p.updated_at
            ORDER BY p.updated_at DESC, p.id DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]


@router.get("/{prompt_id}/versions", response_model=list[PromptVersionResponse])
def list_prompt_versions(prompt_id: int):
    """Return every saved version for one prompt."""
    with get_connection() as connection:
        prompt = connection.execute(
            "SELECT id, name FROM prompts WHERE id = ?", (prompt_id,)
        ).fetchone()
        if not prompt:
            raise HTTPException(status_code=404, detail="Prompt not found.")
        rows = connection.execute(
            """
            SELECT prompt_id, version, content, created_at
            FROM prompt_versions
            WHERE prompt_id = ?
            ORDER BY version DESC
            """,
            (prompt_id,),
        ).fetchall()
    return [
        PromptVersionResponse(name=prompt["name"], **dict(row))
        for row in rows
    ]
