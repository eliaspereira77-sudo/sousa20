"""
SOUSA 2.0 - Cliente genérico de API externa (padrão USB)

Toda integração externa entra como USB sob o Contrato de Soberania:
- pode_alterar_nucleo = False
- timeout explícito
- erros tipados (config / unavailable / api)
- sem defaults silenciosos para URLs ou chaves obrigatórias
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import requests


class APIConfigError(Exception):
    """Configuração obrigatória ausente."""


class APIUnavailableError(Exception):
    """Serviço externo offline ou erro de rede/5xx."""


class APIError(Exception):
    """Serviço respondeu com erro de negócio (4xx)."""


@dataclass
class APIStatus:
    """Status de uma integração externa."""

    name: str
    tipo: str
    ativo: bool
    base_url: Optional[str] = None
    capacidades: List[str] = field(default_factory=list)
    detalhe: str = ""


class ExternalAPIClient:
    """
    Cliente HTTP genérico para APIs externas.

    Uso:
        client = ExternalAPIClient(
            name="MEU_SERVICO",
            base_url_env="MEU_SERVICO_URL",
            api_key_env="MEU_SERVICO_KEY",
            capacidades=["busca", "resumo"],
        )
        data = client.get("/endpoint")
        data = client.post("/endpoint", json={"q": "..."})
    """

    def __init__(
        self,
        name: str,
        *,
        base_url: Optional[str] = None,
        base_url_env: Optional[str] = None,
        api_key: Optional[str] = None,
        api_key_env: Optional[str] = None,
        timeout_seconds: int = 30,
        capacidades: Optional[List[str]] = None,
        require_api_key: bool = False,
    ):
        self.name = name.upper()
        self.capacidades = capacidades or []
        self.timeout_seconds = timeout_seconds

        resolved_url = base_url or (os.getenv(base_url_env) if base_url_env else None)
        if not resolved_url:
            raise APIConfigError(
                f"[{self.name}] base_url ausente. "
                f"Passe base_url= ou defina {base_url_env or 'URL'} no ambiente."
            )
        self.base_url = resolved_url.rstrip("/")

        resolved_key = api_key or (os.getenv(api_key_env) if api_key_env else None)
        if require_api_key and not resolved_key:
            raise APIConfigError(
                f"[{self.name}] api_key obrigatória ausente "
                f"({api_key_env or 'api_key'})."
            )
        self.api_key = resolved_key

    def _headers(self, extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        if extra:
            headers.update(extra)
        return headers

    def get(self, path: str, **kwargs) -> Any:
        return self._request("GET", path, **kwargs)

    def post(self, path: str, json: Optional[dict] = None, **kwargs) -> Any:
        return self._request("POST", path, json=json, **kwargs)

    def _request(self, method: str, path: str, **kwargs) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        headers = self._headers(kwargs.pop("headers", None))
        timeout = kwargs.pop("timeout", self.timeout_seconds)

        try:
            response = requests.request(
                method, url, headers=headers, timeout=timeout, **kwargs
            )
        except requests.exceptions.RequestException as exc:
            raise APIUnavailableError(
                f"[{self.name}] não respondeu em {url}: {exc}"
            ) from exc

        if response.status_code >= 500:
            raise APIUnavailableError(
                f"[{self.name}] {response.status_code}: {response.text[:300]}"
            )
        if response.status_code >= 400:
            raise APIError(
                f"[{self.name}] {response.status_code}: {response.text[:300]}"
            )

        if not response.content:
            return None
        try:
            return response.json()
        except ValueError:
            return response.text

    def status(self) -> APIStatus:
        """Verifica se o serviço está alcançável (HEAD ou GET leve)."""
        try:
            requests.head(
                self.base_url, timeout=min(5, self.timeout_seconds), allow_redirects=True
            )
            ativo = True
            detalhe = "alcançável"
        except Exception as exc:
            ativo = False
            detalhe = str(exc)[:120]

        return APIStatus(
            name=self.name,
            tipo="http_externo",
            ativo=ativo,
            base_url=self.base_url,
            capacidades=self.capacidades,
            detalhe=detalhe,
        )

    def registrar_como_usb(self, contrato) -> dict:
        return contrato.registrar_usb(
            self.name,
            tipo="api_externa",
            descricao=f"Cliente HTTP genérico para {self.name}",
            capacidades=self.capacidades,
            pode_alterar_nucleo=False,
        )
