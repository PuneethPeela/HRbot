"""
Comprehensive Pytest Suite for HRBot Backend
Tests: Agent Classification, Compliance Safety, API Endpoints, Edge Cases
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

AUTH_HEADERS = {"Authorization": "Bearer mock_token_for_testing"}


# ────────────────────────────────────────────────────────────────────
# 1. ROUTER AGENT — Topic Classification Tests
# ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_classify_payroll():
    from main import async_classify_topic
    assert await async_classify_topic("I need to check my payslip") == "PAYROLL"
    assert await async_classify_topic("When will I get my salary?") == "PAYROLL"
    assert await async_classify_topic("Where can I download Form 16?") == "PAYROLL"
    assert await async_classify_topic("I have a deduction query") == "PAYROLL"

@pytest.mark.asyncio
async def test_classify_leave():
    from main import async_classify_topic
    assert await async_classify_topic("How many sick leaves do I have?") == "LEAVE"
    assert await async_classify_topic("I want to apply for maternity leave") == "LEAVE"
    assert await async_classify_topic("What is the holiday list?") == "LEAVE"

@pytest.mark.asyncio
async def test_classify_onboarding():
    from main import async_classify_topic
    assert await async_classify_topic("What documents do I need to submit for onboarding?") == "ONBOARDING"
    assert await async_classify_topic("What should I do on my first day?") == "ONBOARDING"

@pytest.mark.asyncio
async def test_classify_policy():
    from main import async_classify_topic
    assert await async_classify_topic("What is the dress code?") == "POLICY"
    assert await async_classify_topic("Can I work from home?") == "POLICY"
    assert await async_classify_topic("What is the POSH policy?") == "POLICY"

@pytest.mark.asyncio
async def test_classify_benefits():
    from main import async_classify_topic
    assert await async_classify_topic("Tell me about health insurance") == "BENEFITS"
    assert await async_classify_topic("What is the gratuity policy?") == "BENEFITS"

@pytest.mark.asyncio
async def test_classify_general():
    from main import async_classify_topic
    assert await async_classify_topic("Hello, how are you?") == "GENERAL"
    assert await async_classify_topic("What is the weather today?") == "GENERAL"


# ────────────────────────────────────────────────────────────────────
# 2. COMPLIANCE AGENT — Sensitive Query Detection Tests
# ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_sensitive_harassment():
    from main import async_is_sensitive
    assert await async_is_sensitive("I feel I am being harassed") == True
    assert await async_is_sensitive("I want to report harassment") == True

@pytest.mark.asyncio
async def test_sensitive_resignation():
    from main import async_is_sensitive
    assert await async_is_sensitive("I want to resign") == True
    assert await async_is_sensitive("Where do I submit my resignation?") == True
    assert await async_is_sensitive("I quit") == True

@pytest.mark.asyncio
async def test_sensitive_legal():
    from main import async_is_sensitive
    assert await async_is_sensitive("I want to sue the company") == True
    assert await async_is_sensitive("Should I talk to a lawyer?") == True
    assert await async_is_sensitive("Is this legal?") == True

@pytest.mark.asyncio
async def test_sensitive_termination():
    from main import async_is_sensitive
    assert await async_is_sensitive("I have been terminated unfairly") == True

@pytest.mark.asyncio
async def test_sensitive_bullying():
    from main import async_is_sensitive
    assert await async_is_sensitive("My manager is bullying me") == True
    assert await async_is_sensitive("There is a hostile work environment") == True

@pytest.mark.asyncio
async def test_non_sensitive_queries():
    from main import async_is_sensitive
    assert await async_is_sensitive("How many leaves do I get?") == False
    assert await async_is_sensitive("What is the dress code?") == False
    assert await async_is_sensitive("When is payday?") == False


# ────────────────────────────────────────────────────────────────────
# 3. SIMULTANEOUS AGENT EXECUTION TEST
# ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_simultaneous_agents():
    """Verify that Router + Compliance agents execute concurrently."""
    import asyncio
    from main import async_classify_topic, async_is_sensitive

    topic_task = asyncio.create_task(async_classify_topic("I want to resign"))
    compliance_task = asyncio.create_task(async_is_sensitive("I want to resign"))
    topic, is_sensitive = await asyncio.gather(topic_task, compliance_task)

    assert topic == "GENERAL"  # "resign" is not in topic keywords
    assert is_sensitive == True  # "resign" IS a sensitive word


# ────────────────────────────────────────────────────────────────────
# 4. API ENDPOINT TESTS — Config, Chat, Tickets
# ────────────────────────────────────────────────────────────────────

def test_get_config():
    response = client.get("/config", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "confidence_threshold" in data
    assert isinstance(data["confidence_threshold"], float)

def test_update_config():
    response = client.post("/config", json={"confidence_threshold": 0.75}, headers=AUTH_HEADERS)
    assert response.status_code == 200
    assert response.json()["confidence_threshold"] == 0.75
    # Reset
    client.post("/config", json={"confidence_threshold": 0.6}, headers=AUTH_HEADERS)

def test_get_tickets():
    response = client.get("/tickets", headers=AUTH_HEADERS)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_chat_offline_fallback():
    """Tests the chat endpoint handles requests gracefully without an API key."""
    response = client.post("/chat", json={
        "query": "What is the policy on remote work?",
        "employee_id": "EMP001",
        "employee_name": "John Doe"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "confidence" in data
    assert data["topic"] == "POLICY"
    assert data["policy_gap"] is False or data["policy_gap"] is True

def test_chat_sensitive_escalation():
    """Sensitive queries must be auto-escalated with ticket."""
    response = client.post("/chat", json={
        "query": "I am being harassed by my manager",
        "employee_id": "EMP002",
        "employee_name": "Jane Doe"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] == 0.4  # Low confidence forces escalation
    assert data["ticket_id"] is not None
    assert data["ticket_id"].startswith("TKT-")

def test_chat_explicit_escalation():
    """User requesting HR should trigger escalation."""
    response = client.post("/chat", json={
        "query": "I need to speak to HR immediately",
        "employee_id": "EMP003",
        "employee_name": "Alex Smith"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_id"] is not None


# ────────────────────────────────────────────────────────────────────
# 5. SECURITY TESTS — Unauthorized Access
# ────────────────────────────────────────────────────────────────────

def test_unauthorized_chat():
    """Requests without auth token should be rejected."""
    response = client.post("/chat", json={
        "query": "Hello",
        "employee_id": "EMP001",
        "employee_name": "Test"
    })
    assert response.status_code == 403 or response.status_code == 401

def test_unauthorized_config():
    response = client.get("/config")
    assert response.status_code == 403 or response.status_code == 401

def test_unauthorized_tickets():
    response = client.get("/tickets")
    assert response.status_code == 403 or response.status_code == 401


# ────────────────────────────────────────────────────────────────────
# 6. EDGE CASES & VALIDATION
# ────────────────────────────────────────────────────────────────────

def test_chat_empty_query():
    """Empty queries should still return a structured response."""
    response = client.post("/chat", json={
        "query": "",
        "employee_id": "EMP001",
        "employee_name": "Test User"
    }, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert data["topic"] == "GENERAL"

def test_config_invalid_payload():
    """Missing fields should return validation error."""
    response = client.post("/config", json={}, headers=AUTH_HEADERS)
    assert response.status_code == 422  # Pydantic validation error

def test_chat_missing_fields():
    """Incomplete request body should fail validation."""
    response = client.post("/chat", json={"query": "hello"}, headers=AUTH_HEADERS)
    assert response.status_code == 422
