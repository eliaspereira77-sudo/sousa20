"""
core/omniroute_client.py
=========================
Adaptador do OmniRoute para o SOUSA 2.0 — SUBSTITUTO DROPIN de GeminiClient.

CONFIRMADO contra o código real do repositório (core/gemini_client.py,
core/sousa_ia.py, app.py, ruflo/handlers.py, usb/enriquecimento.py):

    client = GeminiClient(api_key=api_key)
    resposta = client.generate(prompt)   # -> str

Este módulo expõe a MESMA assinatura. Em qualquer lugar do código que hoje
faz `from core.gemini_client import GeminiClient`, basta trocar por
`from core.omniroute_client import OmniRouteClient as GeminiClient` (ou
registrar os dois e a SousaIA escolher qual injetar).

CONTRATO DE SOBERANIA (core/soberania.py):
O OmniRoute é uma capacidade nova, então entra como USB registrada — igual
o RUFLO já faz no fim de soberania.py — nunca como substituição do núcleo.
Ver `registrar_omniroute_como_usb()` no fim deste arquivo.

CONTEXTO (radar tecnológico):
OmniRoute é tratado como SERVIÇO EXTERNO local (HTTP), não como código
importado pro repositório — mantém o princípio "SOUSA 2.0 não deve virar
depósito de código externo".

LIÇÃO APLICADA (aprendizado coletivo do executor universal de APIs):
"ausência de dado tratada como ausência de necessidade" foi causa raiz de
dois bugs reais já corrigidos no cofre de APIs. Por isso base_url nunca cai
num default silencioso — falta de config é erro explícito, não é ignorada.
"""

from __future__ import annotations

import json
import os
from typing import Any, Optional

import requests


class OmniRouteConfigError(Exception):
    """Config obrigatória ausente — nunca cai num default silencioso."""


class OmniRouteUnavailableError(Exception):
    """OmniRoute local não respondeu (offline, porta fechada, erro 5xx)."""


class OmniRouteAPIError(Exception):
    """OmniRoute respondeu, mas com erro (todos os provedores da combo falharam etc.)."""


class OmniRouteClient:
    """
    Substituto dropin de core.gemini_client.GeminiClient.

    Mesma assinatura de construtor e de generate() — quem chama não precisa
    saber se a resposta veio do Gemini direto ou via OmniRoute.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "auto",
        base_url: Optional[str] = None,
        timeout_seconds: int = 60,
    ):
        """
        api_key: mantido com esse nome (não "omniroute_key") só pra bater
        exatamente com a chamada GeminiClient(api_key=api_key) já usada em
        app.py, ruflo/handlers.py e usb/enriquecimento.py.

        base_url: se None, lê de OMNIROUTE_BASE_URL. Se não achar em
        nenhum dos dois lugares, levanta erro na hora — não assume
        localhost:20128 silenciosamente.
        """
        resolved_base_url = base_url or os.environ.get("OMNIROUTE_BASE_URL")
        if not resolved_base_url:
            raise OmniRouteConfigError(
                "base_url do OmniRoute ausente. Passe base_url= explicitamente "
                "ou defina OMNIROUTE_BASE_URL no .env (ex: http://localhost:20128)."
            )
        if not api_key:
            raise OmniRouteConfigError(
                "api_key ausente. Para providers keyless do OmniRoute, passe "
                "qualquer string não-vazia (ex: 'local') — nunca deixe em branco."
            )

        self.base_url = resolved_base_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Mesma assinatura de GeminiClient.generate(prompt, **kwargs) -> str.
        kwargs extras (temperature, max_tokens etc.) são repassados no
        payload quando presentes, ignorados quando o OmniRoute/provedor
        de destino não os suportar.
        """
        payload: dict[str, Any] = {
            "model": self.model_name,
            "stream": False,
            "messages": [{"role": "user", "content": prompt}],
            **kwargs,
        }
        return self._post(payload)

    def chat(self, history: list, message: str) -> str:
        """
        Mesma assinatura de GeminiClient.chat(history, message) -> str.
        Não é chamado em lugar nenhum do código atual (confirmado via grep),
        mas mantido pra paridade total de interface. Espera history no
        formato [{"role": "user"|"assistant", "content": "..."}], mais
        portável entre provedores do que o formato nativo do genai.
        """
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
                f"OmniRoute rejeitou a requisição ({response.status_code}): {response.text[:300]}"
            )

        try:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, json.JSONDecodeError) as exc:
            raise OmniRouteAPIError(
                f"Resposta do OmniRoute em formato inesperado: {response.text[:300]}"
            ) from exc


def registrar_omniroute_como_usb():
    """
    Registra o OmniRoute no Contrato de Soberania do núcleo, igual o RUFLO
    já é registrado no fim de core/soberania.py. Chamar uma vez na
    inicialização (ex: junto com a inicialização da SousaIA em app.py).
    """
    from core.soberania import contrato_soberania

    return contrato_soberania.registrar_usb(
        "OMNIROUTE",
        tipo="camada_roteamento_llm",
        descricao=(
            "Gateway externo local que roteia chamadas de LLM entre múltiplos "
            "provedores com fallback automático — substituto dropin opcional "
            "de GeminiClient para geração de texto."
        ),
        capacidades=["roteamento_llm", "fallback_provedor", "compressao_tokens"],
        pode_alterar_nucleo=False,
    )


if __name__ == "__main__":
    # Teste manual rápido — requer OmniRoute rodando localmente
    # (npx omniroute) e OMNIROUTE_BASE_URL no ambiente.
    client = OmniRouteClient(api_key="local")
    print(client.generate("Responda só 'OK' pra confirmar que está no ar."))
