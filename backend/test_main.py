import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Set dummy env vars for testing
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DATABASE_URL"] = "sqlite:///./test_app.db"

from backend.main import app
from backend.database import Base, get_db

# Create test database
engine = create_engine("sqlite:///./test_app.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_register_user():
    response = client.post("/register", json={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"

def test_login_user():
    client.post("/register", json={"username": "testuser", "password": "testpassword"})
    response = client.post("/token", data={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_add_server_forbidden_for_regular_user():
    # First user is admin, second is regular
    client.post("/register", json={"username": "admin", "password": "adminpassword"})
    client.post("/register", json={"username": "user", "password": "userpassword"})

    login_res = client.post("/token", data={"username": "user", "password": "userpassword"})
    token = login_res.json()["access_token"]

    response = client.post(
        "/servers",
        json={"name": "US-1", "location": "USA", "ip_address": "1.1.1.1", "public_key": "abc"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

def test_add_server_admin():
    client.post("/register", json={"username": "admin", "password": "adminpassword"})
    login_res = client.post("/token", data={"username": "admin", "password": "adminpassword"})
    token = login_res.json()["access_token"]

    response = client.post(
        "/servers",
        json={"name": "US-1", "location": "USA", "ip_address": "1.1.1.1", "public_key": "abc"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert "agent_token" in response.json()
