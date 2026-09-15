# SOUSA 2.0 - Tavily Search Adapter (1.000 créditos/mês grátis)
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

class TavilySearchAdapter:
    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")
        self.base_url = "https://api.tavily.com"

    async def search(self, query: str, max_results: int = 5):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/search",
                json={
                    "api_key": self.api_key,
                    "query": query,
                    "max_results": max_results,
                    "include_answer": True
                },
                timeout=20.0
            )
            response.raise_for_status()
            return response.json()
