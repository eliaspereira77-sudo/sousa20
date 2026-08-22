"""SOUSA 2.0 — Camada Ruflo (Orquestração + Política)"""

from .orchestrator import RufloOrchestrator, EstadoCiclo
from .politica import (
    inferir_capacidade,
    precisa_autorizacao,
    selecionar_recurso,
    proximo_fallback,
    registrar_saude,
    consultar_saude,
    em_cooldown,
    aplicar_cooldown,
)

__all__ = [
    "RufloOrchestrator",
    "EstadoCiclo",
    "inferir_capacidade",
    "precisa_autorizacao",
    "selecionar_recurso",
    "proximo_fallback",
    "registrar_saude",
    "consultar_saude",
    "em_cooldown",
    "aplicar_cooldown",
]
