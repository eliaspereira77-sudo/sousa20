"""
SOUSA 2.0 — Handlers da camada Ruflo

Handlers plugáveis para as etapas do ciclo.
O handler de EXECUTANDO tenta usar SOUSA IA (Gemini) quando disponível.
"""

from __future__ import annotations

import os
from typing import Any, Dict


def handler_executar_sousa_ia(ciclo: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handler de EXECUTANDO.
    Usa Gemini (core.gemini_client) se GEMINI_API_KEY estiver configurada.
    Caso contrário, retorna execução estrutural (sem falhar o ciclo).
    """
    intencao = ciclo.get("intencao") or context.get("texto") or ""
    capacidade = ciclo.get("capacidade") or context.get("capacidade") or "TEXTO"

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "ok": True,
            "status": "EXECUTADO_SEM_IA",
            "message": "GEMINI_API_KEY não configurada. Ciclo estrutural concluído.",
            "intencao": intencao,
            "capacidade": capacidade,
            "fonte": "estrutura",
        }

    try:
        from core.gemini_client import GeminiClient

        client = GeminiClient(api_key=api_key)
        prompt = (
            f"Você é o SOUSA 2.0. Capacidade inferida: {capacidade}.\n"
            f"Intenção do operador: {intencao}\n\n"
            f"Responda de forma objetiva e operacional."
        )
        resposta = client.generate(prompt)

        return {
            "ok": True,
            "status": "EXECUTADO_SOUSA_IA",
            "message": "Execução via SOUSA IA (Gemini).",
            "intencao": intencao,
            "capacidade": capacidade,
            "resposta": resposta,
            "fonte": "gemini",
        }
    except Exception as e:
        return {
            "ok": False,
            "status": "FALHA_SOUSA_IA",
            "message": str(e),
            "intencao": intencao,
            "capacidade": capacidade,
            "fonte": "gemini",
        }


def registrar_handlers_padrao(orchestrator) -> None:
    """Registra os handlers padrão no orquestrador."""
    orchestrator.register_handler("EXECUTANDO", handler_executar_sousa_ia)
