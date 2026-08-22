"""
SOUSA 2.0 - Cliente Gemini
"""

import google.generativeai as genai
from typing import Optional


class GeminiClient:
    """Cliente simples para a API Gemini."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        self.model_name = model_name

    def generate(self, prompt: str, **kwargs) -> str:
        """Gera resposta a partir de um prompt."""
        response = self.model.generate_content(prompt, **kwargs)
        return response.text

    def chat(self, history: list, message: str) -> str:
        """Chat com histórico (simplificado)."""
        chat = self.model.start_chat(history=history)
        response = chat.send_message(message)
        return response.text
