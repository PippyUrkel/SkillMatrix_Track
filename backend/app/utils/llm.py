"""
Shared LLM client that calls the local Ollama HTTP API.

Usage:
    from app.utils.llm import generate_text
    text = await generate_text("Your prompt here")
"""

import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "alibayram/smollm3"


async def generate_text(
    prompt: str,
    *,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.3,
    timeout: float = 120,
) -> str | None:
    """
    Send a prompt to the local Ollama instance and return the generated text.

    Returns None if the call fails for any reason.
    """
    settings = get_settings()
    ollama_model = getattr(settings, "ollama_model", None) or model
    ollama_url = f"{settings.ollama_endpoint.rstrip('/')}/api/generate"

    payload = {
        "model": ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 4096,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(ollama_url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "")
    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama at %s – is it running?", ollama_url)
        return None
    except httpx.HTTPStatusError as e:
        logger.error("Ollama HTTP error %s: %s", e.response.status_code, e.response.text[:200])
        return None
    except Exception as e:
        logger.error("Ollama call failed: %s", e)
        return None
