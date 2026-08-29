from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import create_engine
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/vpn_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    is_disabled = Column(Boolean, default=False)
    profiles = relationship("VPNProfile", back_populates="owner")

class Server(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    ip_address = Column(String)
    public_key = Column(String)
    agent_token = Column(String, unique=True, index=True)
    status = Column(String, default="offline")
    cpu_usage = Column(Float, default=0.0)
    ram_usage = Column(Float, default=0.0)
    active_connections = Column(Integer, default=0)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

class VPNProfile(Base):
    __tablename__ = "vpn_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    server_id = Column(Integer, ForeignKey("servers.id"))
    private_key = Column(String)
    public_key = Column(String)
    internal_ip = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="profiles")
    server = relationship("Server")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
