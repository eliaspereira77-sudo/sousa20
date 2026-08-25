"""SOUSA 2.0 — Core module (núcleo soberano)"""

from .gemini_client import GeminiClient
from .sousa_ia import SousaIA
from .soberania import (
    ContratoSoberania,
    ViolacaoSoberania,
    contrato_soberania,
    DOMINIOS_NUCLEO,
    ACOES_PROTEGIDAS,
    VERSAO_CONTRATO,
)

try:
    # Capacidade opcional (radar tecnológico): roteamento LLM via OmniRoute.
    # Import isolado em try/except pra nunca derrubar o núcleo se o pacote
    # 'requests' não estiver instalado no ambiente.
    from .omniroute_client import (
        OmniRouteClient,
        OmniRouteConfigError,
        OmniRouteUnavailableError,
        OmniRouteAPIError,
        registrar_omniroute_como_usb,
    )
except ImportError:
    OmniRouteClient = None
    OmniRouteConfigError = None
    OmniRouteUnavailableError = None
    OmniRouteAPIError = None
    registrar_omniroute_como_usb = None

__all__ = [
    "GeminiClient",
    "SousaIA",
    "ContratoSoberania",
    "ViolacaoSoberania",
    "contrato_soberania",
    "DOMINIOS_NUCLEO",
    "ACOES_PROTEGIDAS",
    "VERSAO_CONTRATO",
    "OmniRouteClient",
    "OmniRouteConfigError",
    "OmniRouteUnavailableError",
    "OmniRouteAPIError",
    "registrar_omniroute_como_usb",
]
