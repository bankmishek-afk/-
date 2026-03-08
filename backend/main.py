from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import secrets

from backend.database import engine, Base, get_db, User, Server, VPNProfile
from backend.auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from backend.vpn_manager import generate_keypair, generate_config, get_next_ip
from pydantic import BaseModel
from jose import jwt, JWTError

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VPN Service API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserCreate(BaseModel):
    username: str
    password: str

class ServerCreate(BaseModel):
    name: str
    location: str
    ip_address: str
    public_key: str

class StatusUpdate(BaseModel):
    cpu: float
    ram: float
    connections: int

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(user_data.password)
    new_user = User(username=user_data.username, hashed_password=hashed_password)

    # First registered user becomes admin
    if db.query(User).count() == 0:
        new_user.is_admin = True

    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "is_admin": user.is_admin}

@app.get("/servers")
def list_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    return servers

@app.post("/servers", status_code=201)
def add_server(server_data: ServerCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    agent_token = secrets.token_hex(32)
    new_server = Server(
        name=server_data.name,
        location=server_data.location,
        ip_address=server_data.ip_address,
        public_key=server_data.public_key,
        agent_token=agent_token
    )
    db.add(new_server)
    db.commit()
    db.refresh(new_server)
    return {"server": new_server, "agent_token": agent_token}

@app.post("/vpn/profiles")
def create_profile(server_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    ip = get_next_ip(db, server_id)
    if not ip:
        raise HTTPException(status_code=400, detail="No IPs available on this server")

    private_key, public_key = generate_keypair()

    profile = VPNProfile(
        user_id=current_user.id,
        server_id=server_id,
        private_key=private_key,
        public_key=public_key,
        internal_ip=ip
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    config_str = generate_config(profile, server)
    return {"profile_id": profile.id, "config": config_str, "location": server.location}

@app.get("/vpn/profiles")
def list_profiles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profiles = db.query(VPNProfile).filter(VPNProfile.user_id == current_user.id).all()
    return [{
        "id": p.id,
        "location": p.server.location,
        "internal_ip": p.internal_ip,
        "server_ip": p.server.ip_address,
        "created_at": p.created_at
    } for p in profiles]

@app.get("/vpn/profiles/{profile_id}/download")
def download_profile(profile_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(VPNProfile).filter(VPNProfile.id == profile_id, VPNProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    config_str = generate_config(profile, profile.server)
    filename = f"vpn-{profile.server.location.lower()}.conf"
    return {"filename": filename, "content": config_str}

# Node Agent Endpoints
@app.post("/agent/status")
def update_status(status: StatusUpdate, agent_token: str, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.agent_token == agent_token).first()
    if not server:
        raise HTTPException(status_code=401, detail="Invalid token")

    server.cpu_usage = status.cpu
    server.ram_usage = status.ram
    server.active_connections = status.connections
    server.last_seen = datetime.now(timezone.utc).replace(tzinfo=None)
    server.status = "online"
    db.commit()
    return {"message": "ok"}

@app.get("/agent/peers")
def get_peers(agent_token: str, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.agent_token == agent_token).first()
    if not server:
        raise HTTPException(status_code=401, detail="Invalid token")

    profiles = db.query(VPNProfile).filter(VPNProfile.server_id == server.id).all()
    peers = [{"public_key": p.public_key, "allowed_ips": f"{p.internal_ip}/32"} for p in profiles]
    return peers
