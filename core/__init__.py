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

__all__ = [
    "GeminiClient",
    "SousaIA",
    "ContratoSoberania",
    "ViolacaoSoberania",
    "contrato_soberania",
    "DOMINIOS_NUCLEO",
    "ACOES_PROTEGIDAS",
    "VERSAO_CONTRATO",
]
