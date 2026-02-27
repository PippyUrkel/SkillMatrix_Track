from appwrite.client import Client
from app.config import get_settings


def get_appwrite_client() -> Client:
    """Get an Appwrite client using the API key."""
    settings = get_settings()
    client = Client()
    # The SDK usually expects: API Endpoint, Project ID, API Key
    client.set_endpoint(settings.appwrite_endpoint)
    client.set_project(settings.appwrite_project_id)
    client.set_key(settings.appwrite_api_key)
    return client
