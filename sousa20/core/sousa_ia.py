"""
SOUSA 2.0 - Núcleo de Enriquecimento SOUSA IA

Este módulo é o coração do enriquecimento contínuo do sistema.
Aqui entram memória de longo prazo, planejamento, auto-melhoria e
integração com a camada Ruflo.

A memória canônica persistente (core/memoria.py) é usada de forma
transparente: remember/recall continuam funcionando e agora persistem.
"""

from typing import Any, Dict, Optional

from .gemini_client import GeminiClient
from .memoria import memoria_canonica


class SousaIA:
    """Núcleo principal de inteligência e enriquecimento do SOUSA 2.0."""

    def __init__(self, gemini_client: Optional[GeminiClient] = None):
        self.client = gemini_client
        # Mantido por compatibilidade (cache em RAM + espelho da canônica)
        self.memory: Dict[str, Any] = {}
        self.context: Dict[str, Any] = {}
        self._memoria = memoria_canonica

    def enrich(self, input_data: Any) -> Dict[str, Any]:
        """
        Ponto de entrada para enriquecimento.
        Será expandido com memória, raciocínio e integração Ruflo.
        """
        return {
            "status": "enrichment_ready",
            "input_received": True,
            "message": "SOUSA IA enrichment layer is structured and ready for full integration.",
            "memoria": self._memoria.estatisticas(),
        }

    def plan(self, goal: str) -> Dict[str, Any]:
        """Planejamento de alto nível (placeholder)."""
        return {
            "goal": goal,
            "status": "planning_structure_ready",
            "next": "Integrate with Ruflo orchestrator",
        }

    def remember(
        self,
        key: str,
        value: Any,
        *,
        namespace: str = "default",
        origem: Optional[str] = None,
        ciclo_id: Optional[str] = None,
    ) -> None:
        """
        Memória de curto e longo prazo.
        - Mantém cache em RAM (compatibilidade)
        - Persiste na Memória Canônica (domínio protegido)
        """
        self.memory[key] = value
        self._memoria.guardar(
            key,
            value,
            namespace=namespace,
            origem=origem or "sousa_ia",
            ciclo_id=ciclo_id,
        )

    def recall(
        self,
        key: str,
        *,
        namespace: str = "default",
        default: Any = None,
    ) -> Any:
        """
        Recupera memória.
        Prioridade: cache RAM → memória canônica persistente.
        """
        if key in self.memory:
            return self.memory[key]
        return self._memoria.recuperar(key, namespace=namespace, default=default)

    def buscar_memoria(
        self,
        consulta: str,
        *,
        namespace: Optional[str] = None,
        limite: int = 20,
    ) -> list:
        """Busca textual na memória canônica."""
        return self._memoria.buscar(consulta, namespace=namespace, limite=limite)

    def status_memoria(self) -> Dict[str, Any]:
        """Status da memória canônica."""
        return self._memoria.estatisticas()
