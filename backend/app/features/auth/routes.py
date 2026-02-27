from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from app.databases.appwrite_client import get_appwrite_client
from app.features.auth.services import AuthService
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------- Schemas ----------

class AuthRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user: dict
    session: dict | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: str


# ---------- Dependencies ----------

def get_auth_service() -> AuthService:
    client = get_appwrite_client()
    return AuthService(client)


# ---------- Routes ----------

@router.post("/signup", response_model=AuthResponse)
async def signup(body: AuthRequest, service: AuthService = Depends(get_auth_service)):
    """Register a new user."""
    try:
        result = service.sign_up(body.email, body.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(body: AuthRequest, service: AuthService = Depends(get_auth_service)):
    """Sign in an existing user."""
    try:
        result = service.sign_in(body.email, body.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user
