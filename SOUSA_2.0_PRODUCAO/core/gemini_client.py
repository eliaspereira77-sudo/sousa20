"""
SOUSA 2.0 - Cliente Gemini (SDK moderno google-genai)

Usa o pacote oficial recomendado pela Google (google-genai).
Modelo padrão: gemini-3.8-flash (setembro/2026).
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Union

from google import genai
from google.genai import types


# System instruction oficial do SOUSA 2.0
SOUSA_SYSTEM_INSTRUCTION = """
Você é o SOUSA 2.0 — Sistema de IA Pessoal Avançado, soberano e orientado a utilidade.

Princípios:
1. Soberania do núcleo: você protege identidade, memória canônica, política e arquitetura.
2. Maximizar recursos de custo zero antes de consumir quota paga.
3. Respostas claras, diretas e acionáveis em português do Brasil, a menos que o usuário peça outro idioma.
4. Transparência: indique quando estiver usando raciocínio, ferramentas ou dados externos.
5. Segurança: nunca execute ações destrutivas sem confirmação explícita.

Você opera sob o Contrato de Soberania do SOUSA. Camadas e USBs (incluindo Ruflo) são ferramentas sob sua governança, nunca substitutos do núcleo.
""".strip()


class GeminiClient:
    """Cliente Gemini usando o SDK oficial google-genai."""

    DEFAULT_MODEL = "gemini-3.8-flash"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = DEFAULT_MODEL,
        system_instruction: Optional[str] = None,
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY não configurada. "
                "Defina a variável de ambiente ou passe api_key=..."
            )

        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name
        self.system_instruction = system_instruction or SOUSA_SYSTEM_INSTRUCTION

    def generate(
        self,
        prompt: str,
        *,
        temperature: float = 0.7,
        max_output_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
        **kwargs: Any,
    ) -> str:
        """Gera resposta a partir de um prompt de texto."""
        config_kwargs: Dict[str, Any] = {
            "temperature": temperature,
            "system_instruction": self.system_instruction,
        }
        if max_output_tokens is not None:
            config_kwargs["max_output_tokens"] = max_output_tokens
        if top_p is not None:
            config_kwargs["top_p"] = top_p
        config_kwargs.update(kwargs)

        config = types.GenerateContentConfig(**config_kwargs)

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=config,
        )
        return (response.text or "").strip()

    def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        *,
        temperature: float = 0.7,
        **kwargs: Any,
    ) -> str:
        """
        Chat multi-turno.

        history: lista de dicts no formato {"role": "user"|"model", "content": "..."}
        """
        contents: List[types.Content] = []

        if history:
            for turn in history:
                role = turn.get("role", "user")
                # O SDK espera "user" ou "model"
                if role in ("assistant", "ai", "gemini"):
                    role = "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part(text=turn["content"])],
                    )
                )

        contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text=message)],
            )
        )

        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=self.system_instruction,
            **kwargs,
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=config,
        )
        return (response.text or "").strip()

    def generate_stream(
        self,
        prompt: str,
        *,
        temperature: float = 0.7,
        **kwargs: Any,
    ):
        """Gera resposta em streaming (generator de chunks de texto)."""
        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=self.system_instruction,
            **kwargs,
        )

        for chunk in self.client.models.generate_content_stream(
            model=self.model_name,
            contents=prompt,
            config=config,
        ):
            if chunk.text:
                yield chunk.text
