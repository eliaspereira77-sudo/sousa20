"""
SOUSA 2.0 - Núcleo de Enriquecimento SOUSA IA

Camada de inteligência e enriquecimento contínuo.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from .gemini_client import GeminiClient


class SousaIA:
    """Núcleo principal de inteligência e enriquecimento do SOUSA 2.0."""

    def __init__(self, gemini_client: Optional[GeminiClient] = None):
        self.client = gemini_client
        self.memory: Dict[str, Any] = {}
        self.context: Dict[str, Any] = {}

    def enrich(self, input_data: Any) -> Dict[str, Any]:
        """Ponto de entrada para enriquecimento."""
        if self.client and isinstance(input_data, str):
            try:
                enriched = self.client.generate(
                    f"Enriqueça e contextualize a seguinte entrada de forma útil e concisa:\n\n{input_data}"
                )
                return {
                    "status": "enriched",
                    "original": input_data,
                    "enriched": enriched,
                }
            except Exception as e:
                return {
                    "status": "enrichment_error",
                    "error": str(e),
                    "original": input_data,
                }

        return {
            "status": "enrichment_ready",
            "input_received": True,
            "message": "SOUSA IA enrichment layer is structured and ready.",
        }

    def plan(self, goal: str) -> Dict[str, Any]:
        """Planejamento de alto nível."""
        if self.client:
            try:
                plan = self.client.generate(
                    f"Crie um plano de ação curto e prático para o objetivo: {goal}"
                )
                return {"goal": goal, "status": "planned", "plan": plan}
            except Exception as e:
                return {"goal": goal, "status": "planning_error", "error": str(e)}

        return {
            "goal": goal,
            "status": "planning_structure_ready",
            "next": "Integrate with Ruflo orchestrator",
        }

    def remember(self, key: str, value: Any) -> None:
        self.memory[key] = value

    def recall(self, key: str) -> Any:
        return self.memory.get(key)
