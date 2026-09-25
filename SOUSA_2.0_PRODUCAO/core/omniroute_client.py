"""
core/omniroute_client.py
=========================
Adaptador do OmniRoute para o SOUSA 2.0 — substituto drop-in de GeminiClient.

Protocolo: HTTP OpenAI-compatible (/v1/chat/completions)
Prioridade: recursos $0 antes de consumir quota paga do Gemini.

Contrato de Soberania: registrado como USB (pode_alterar_nucleo=False).
"""

from __future__ import annotations

import json
import os
from typing import Any, Optional

import requests


class OmniRouteConfigError(Exception):
    """Config obrigatória ausente — nunca cai em default silencioso."""


class OmniRouteUnavailableError(Exception):
    """OmniRoute local não respondeu (offline, porta fechada, erro 5xx)."""


class OmniRouteAPIError(Exception):
    """OmniRoute respondeu, mas com erro de negócio."""


class OmniRouteClient:
    """
    Substituto drop-in de core.gemini_client.GeminiClient.
    Mesma assinatura de construtor e de generate()/chat().
    """

    def __init__(
        self,
        api_key: str = "local",
        model_name: str = "auto/cheap",
        base_url: Optional[str] = None,
        timeout_seconds: int = 60,
    ):
        resolved_base_url = base_url or os.environ.get("OMNIROUTE_BASE_URL")
        if not resolved_base_url:
            raise OmniRouteConfigError(
                "base_url do OmniRoute ausente. "
                "Passe base_url= ou defina OMNIROUTE_BASE_URL no .env "
                "(ex: http://localhost:20128)."
            )
        if not api_key:
            raise OmniRouteConfigError(
                "api_key ausente. Para providers keyless, passe qualquer "
                "string não-vazia (ex: 'local')."
            )

        self.base_url = resolved_base_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds

    def generate(self, prompt: str, **kwargs) -> str:
        payload: dict[str, Any] = {
            "model": self.model_name,
            "stream": False,
            "messages": [{"role": "user", "content": prompt}],
            **kwargs,
        }
        return self._post(payload)

    def chat(self, history: list, message: str) -> str:
        messages = list(history) + [{"role": "user", "content": message}]
        payload: dict[str, Any] = {
            "model": self.model_name,
            "stream": False,
            "messages": messages,
        }
        return self._post(payload)

    def _post(self, payload: dict[str, Any]) -> str:
        url = f"{self.base_url}/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        try:
            response = requests.post(
                url, headers=headers, json=payload, timeout=self.timeout_seconds
            )
        except requests.exceptions.RequestException as exc:
            raise OmniRouteUnavailableError(
                f"OmniRoute não respondeu em {url}: {exc}"
            ) from exc

        if response.status_code >= 500:
            raise OmniRouteUnavailableError(
                f"OmniRoute retornou {response.status_code}: {response.text[:300]}"
            )
        if response.status_code >= 400:
            raise OmniRouteAPIError(
                f"OmniRoute rejeitou ({response.status_code}): {response.text[:300]}"
            )

        try:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, json.JSONDecodeError) as exc:
            raise OmniRouteAPIError(
                f"Resposta do OmniRoute em formato inesperado: {response.text[:300]}"
            ) from exc


def registrar_omniroute_como_usb(contrato=None):
    """Registra o OmniRoute no Contrato de Soberania como USB."""
    try:
        if contrato is None:
            from core.soberania import contrato_soberania as contrato
        return contrato.registrar_usb(
            "OMNIROUTE",
            tipo="camada_roteamento_llm",
            descricao=(
                "Gateway externo local que roteia chamadas de LLM entre "
                "múltiplos provedores com fallback automático."
            ),
            capacidades=["roteamento_llm", "fallback_provedor", "compressao_tokens"],
            pode_alterar_nucleo=False,
        )
    except Exception:
        return {"ok": False, "status": "soberania_indisponivel"}
