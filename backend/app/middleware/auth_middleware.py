from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.databases.appwrite_client import get_appwrite_client
from app.features.auth.services import AuthService

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that extracts and validates the Appwrite JWT
    from the Authorization: Bearer <token> header.
    """
    token = credentials.credentials
    try:
        client = get_appwrite_client()
        service = AuthService(client)
        user = service.get_user(token)
        return user
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
