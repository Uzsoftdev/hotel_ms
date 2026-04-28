"""
Integration tests for the authentication flow.

These tests hit a real Postgres + Redis instance (via testcontainers) through
the full FastAPI stack. They verify the happy path and the token blacklist.
"""

import pytest
from fastapi.testclient import TestClient


# ── Helpers ───────────────────────────────────────────────────────────────────

def _register(client: TestClient, email: str, password: str = "SecureP@ss1") -> dict:
    resp = client.post("/api/v1/public/auth/register", json={
        "full_name": "Test User",
        "email": email,
        "password": password,
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


def _login(client: TestClient, email: str, password: str = "SecureP@ss1") -> dict:
    resp = client.post("/api/v1/public/auth/login", json={
        "email": email,
        "password": password,
    })
    assert resp.status_code == 200, resp.text
    return resp.json()


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_register_returns_user_fields(client):
    data = _register(client, "reg_basic@example.com")
    assert data["email"] == "reg_basic@example.com"
    assert data["role"] == "guest"
    assert "id" in data


def test_register_duplicate_email_rejected(client):
    _register(client, "dup@example.com")
    resp = client.post("/api/v1/public/auth/register", json={
        "full_name": "Another",
        "email": "dup@example.com",
        "password": "SecureP@ss1",
    })
    assert resp.status_code in (400, 409, 422)


def test_register_weak_password_rejected(client):
    resp = client.post("/api/v1/public/auth/register", json={
        "full_name": "Weak Pass",
        "email": "weak@example.com",
        "password": "abc",
    })
    assert resp.status_code == 422


def test_login_returns_tokens(client):
    _register(client, "login_ok@example.com")
    tokens = _login(client, "login_ok@example.com")
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"


def test_login_wrong_password_rejected(client):
    _register(client, "wrongpw@example.com")
    resp = client.post("/api/v1/public/auth/login", json={
        "email": "wrongpw@example.com",
        "password": "WrongP@ss99",
    })
    assert resp.status_code == 401


def test_login_unknown_email_rejected(client):
    resp = client.post("/api/v1/public/auth/login", json={
        "email": "nobody@example.com",
        "password": "SecureP@ss1",
    })
    assert resp.status_code == 401


def test_refresh_token_issues_new_access_token(client):
    _register(client, "refresh_ok@example.com")
    tokens = _login(client, "refresh_ok@example.com")

    resp = client.post(
        "/api/v1/public/auth/refresh",
        params={"refresh_token": tokens["refresh_token"]},
    )
    assert resp.status_code == 200
    new_tokens = resp.json()
    assert "access_token" in new_tokens
    # New access token must differ from the old one (new jti)
    assert new_tokens["access_token"] != tokens["access_token"]


def test_logout_blacklists_access_token(client):
    """After logout, the same access token must be rejected."""
    _register(client, "logout_test@example.com")
    tokens = _login(client, "logout_test@example.com")
    access = tokens["access_token"]

    # Logout
    resp = client.post(
        "/api/v1/public/auth/logout",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert resp.status_code == 204

    # A protected endpoint must now reject the revoked token.
    resp = client.get(
        "/api/v1/user/profile/",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert resp.status_code == 401


def test_logout_with_both_tokens_blacklists_refresh(client):
    """Passing both tokens to logout revokes both."""
    _register(client, "logout_both@example.com")
    tokens = _login(client, "logout_both@example.com")
    access = tokens["access_token"]
    refresh = tokens["refresh_token"]

    resp = client.post(
        "/api/v1/public/auth/logout",
        params={"refresh_token": refresh},
        headers={"Authorization": f"Bearer {access}"},
    )
    assert resp.status_code == 204

    # Refresh token must now be rejected.
    resp = client.post(
        "/api/v1/public/auth/refresh",
        params={"refresh_token": refresh},
    )
    assert resp.status_code == 401


def test_logout_is_idempotent(client):
    """Calling logout twice with the same (now expired) token returns 204 both times."""
    _register(client, "logout_idem@example.com")
    tokens = _login(client, "logout_idem@example.com")
    access = tokens["access_token"]
    headers = {"Authorization": f"Bearer {access}"}

    assert client.post("/api/v1/public/auth/logout", headers=headers).status_code == 204
    assert client.post("/api/v1/public/auth/logout", headers=headers).status_code == 204
