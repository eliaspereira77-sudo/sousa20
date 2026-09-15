# SOUSA 2.0 - Base Adapter (Stack Gratuita)
from abc import ABC
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv
import os

load_dotenv()

class BaseAPIAdapter(ABC):
    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _request(self, method: str, endpoint: str, **kwargs):
        url = f"{self.base_url.rstrip('/')}{endpoint}"
        headers = kwargs.pop("headers", {})
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        response = await self.client.request(method, url, headers=headers, **kwargs)
        response.raise_for_status()
        return response

    async def close(self):
        await self.client.aclose()
