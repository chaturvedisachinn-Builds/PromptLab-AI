from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings
from app.db.database import initialize_database


def test_prompt_versioning(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test_promptlab.db"))
    get_settings.cache_clear()
    initialize_database()

    with TestClient(app) as client:
        first = client.post(
            "/api/v1/prompts",
            json={"name": "Interview helper", "content": "Act as an interviewer."},
        )
        assert first.status_code == 201
        assert first.json()["version"] == 1

        second = client.post(
            "/api/v1/prompts",
            json={"name": "Interview helper", "content": "Act as a senior interviewer."},
        )
        assert second.status_code == 201
        assert second.json()["version"] == 2

        versions = client.get(f"/api/v1/prompts/{first.json()['prompt_id']}/versions")
        assert versions.status_code == 200
        assert [item["version"] for item in versions.json()] == [2, 1]

    get_settings.cache_clear()
