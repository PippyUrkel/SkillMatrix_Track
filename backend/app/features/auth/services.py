import httpx
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.users import Users
from appwrite.id import ID

from app.config import get_settings


class AuthService:
    def __init__(self, appwrite_client: Client):
        self.appwrite_client = appwrite_client
        self.users = Users(self.appwrite_client)
        self.settings = get_settings()

    def sign_up(self, email: str, password: str) -> dict:
        """Register a new user with Appwrite."""
        try:
            user = self.users.create(
                user_id=ID.unique(),
                email=email,
                password=password
            )
            return self.sign_in(email, password)
        except Exception as e:
            raise ValueError(str(e))

    def sign_in(self, email: str, password: str) -> dict:
        """Sign in an existing user and generate an Appwrite JWT via proxy."""
        try:
            # We must use raw HTTP to capture the Set-Cookie header 
            # because Appwrite hides the session secret in the JSON response.
            endpoint = self.settings.appwrite_endpoint
            project_id = self.settings.appwrite_project_id

            with httpx.Client() as client:
                # 1. Create email/password session
                resp = client.post(
                    f"{endpoint}/account/sessions/email",
                    headers={"X-Appwrite-Project": project_id},
                    json={"email": email, "password": password},
                    timeout=10.0
                )
                if resp.status_code >= 400:
                    raise ValueError(f"Login failed: {resp.json().get('message', 'Unknown error')}")
                
                user_info = resp.json()
                
                # 2. Extract the session cookie
                # Appwrite sets a cookie named roughly a_session_{project_id}
                session_cookie = None
                cookie_name = f"a_session_{project_id}"
                for name, value in client.cookies.items():
                    if cookie_name in name:
                        session_cookie = value
                        break
                        
                if not session_cookie:
                    # Fallback check just in case
                    session_cookie = client.cookies.get(f"a_session_{project_id}")

                if not session_cookie:
                    raise ValueError("Failed to extract Appwrite session cookie")

                # 3. Request a JWT using the captured session cookie
                jwt_resp = client.post(
                    f"{endpoint}/account/jwt",
                    headers={"X-Appwrite-Project": project_id},
                    cookies={cookie_name: session_cookie},
                    timeout=10.0
                )
                if jwt_resp.status_code >= 400:
                    raise ValueError(f"Failed to generate JWT: {jwt_resp.json()}")
                    
                jwt_data = jwt_resp.json()

            return {
                "user": {
                    "id": user_info.get("userId"),
                    "email": user_info.get("providerUid", email),
                },
                "session": {
                    "access_token": jwt_data["jwt"],
                    "refresh_token": session_cookie,
                    "expires_in": 900,  # 15 minutes
                },
            }
        except Exception as e:
            raise ValueError(str(e))

    def get_user(self, access_token: str) -> dict:
        """Get the current user from an Appwrite JWT."""
        try:
            user_client = Client()
            user_client.set_endpoint(self.settings.appwrite_endpoint)
            user_client.set_project(self.settings.appwrite_project_id)
            user_client.set_jwt(access_token)
            
            account = Account(user_client)
            user_info = account.get()
            
            return {
                "id": user_info["$id"],
                "email": user_info["email"],
                "created_at": user_info["$createdAt"],
            }
        except Exception as e:
            raise ValueError(str(e))
