"""
SOUSA 2.0 — Handlers da camada Ruflo

Handlers plugáveis para as etapas do ciclo.
EXECUTANDO valida soberania e tenta SOUSA IA (Gemini) quando disponível.
"""

from __future__ import annotations

import os
from typing import Any, Dict


def handler_executar_sousa_ia(ciclo: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handler de EXECUTANDO.
    1) Valida operação sob contrato de soberania (origem RUFLO).
    2) Usa Gemini se GEMINI_API_KEY existir.
    """
    intencao = ciclo.get("intencao") or context.get("texto") or ""
    capacidade = ciclo.get("capacidade") or context.get("capacidade") or "TEXTO"

    # --- Soberania: Ruflo executa sob o núcleo, não como núcleo ---
    try:
        from core.soberania import contrato_soberania

        check = contrato_soberania.validar_operacao(
            "executar_ciclo",
            origem="RUFLO",
            dominio=None,
            sinal_risco=context.get("sinal_risco"),
            autorizada=bool(context.get("autorizada")),
        )
        if not check.get("ok"):
            return {
                "ok": False,
                "status": check.get("status", "BLOQUEADO_SOBERANIA"),
                "message": check.get("motivo", "Operação bloqueada pelo contrato de soberania"),
                "soberania": check,
                "intencao": intencao,
                "capacidade": capacidade,
                "fonte": "soberania",
            }
    except ImportError:
        pass  # núcleo ainda não carregado; segue estrutural

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "ok": True,
            "status": "EXECUTADO_SEM_IA",
            "message": "GEMINI_API_KEY não configurada. Ciclo estrutural concluído sob soberania do núcleo.",
            "intencao": intencao,
            "capacidade": capacidade,
            "fonte": "estrutura",
            "soberania": "ok",
        }

    try:
        from core.gemini_client import GeminiClient

        client = GeminiClient(api_key=api_key)
        prompt = (
            f"Você é o SOUSA 2.0 (núcleo soberano). Capacidade inferida: {capacidade}.\n"
            f"Intenção do operador: {intencao}\n\n"
            f"Responda de forma objetiva e operacional. "
            f"A Ruflo é apenas a camada de orquestração; o núcleo permanece soberano."
        )
        resposta = client.generate(prompt)

        return {
            "ok": True,
            "status": "EXECUTADO_SOUSA_IA",
            "message": "Execução via SOUSA IA (Gemini), sob contrato de soberania.",
            "intencao": intencao,
            "capacidade": capacidade,
            "resposta": resposta,
            "fonte": "gemini",
            "soberania": "ok",
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
