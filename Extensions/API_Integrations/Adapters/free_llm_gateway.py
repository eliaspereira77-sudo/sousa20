# SOUSA 2.0 - LiteLLM Gateway (prioridade modelos gratuitos)
import os
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

class FreeLLMGateway:
    """Gateway unificado priorizando modelos gratuitos com cotas generosas"""

    def __init__(self):
        self.preferred_models = [
            "groq/llama-3.1-8b-instant",
            "groq/llama-3.3-70b-versatile",
            "openrouter/meta-llama/llama-3.3-70b-instruct:free",
            "openrouter/google/gemini-2.0-flash-exp:free",
            "ollama/llama3.2",
        ]

    def chat(self, messages: list, model: str = None, **kwargs):
        model = model or self.preferred_models[0]
        response = completion(
            model=model,
            messages=messages,
            api_key=os.getenv("GROQ_API_KEY") or os.getenv("OPENROUTER_API_KEY"),
            **kwargs
        )
        return response.choices[0].message.content
