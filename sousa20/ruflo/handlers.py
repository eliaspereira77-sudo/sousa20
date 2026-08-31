"""
SOUSA 2.0 — Handlers da camada Ruflo

Handlers plugáveis para as etapas do ciclo.
EXECUTANDO valida soberania e roteia para auto-evolução, USB Enriquecimento ou SOUSA IA.
"""

from __future__ import annotations

import os
from typing import Any, Dict


def handler_executar(ciclo: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handler de EXECUTANDO.
    1) Valida soberania (origem RUFLO).
    2) Se capacidade AUTO_* → motor de auto-evolução.
    3) Prefere USB Enriquecimento se disponível.
    4) Fallback para Gemini direto ou estrutura.
    """
    intencao = ciclo.get("intencao") or context.get("texto") or ""
    capacidade = str(ciclo.get("capacidade") or context.get("capacidade") or "TEXTO").upper()

    try:
        from core.soberania import contrato_soberania

        check = contrato_soberania.validar_operacao(
            "executar_ciclo",
            origem="RUFLO",
            dominio=None,
            sinal_risco=context.get("sinal_risco"),
            autorizada=bool(context.get("autorizada")),
            ciclo_id=ciclo.get("id"),
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
        pass

    # --- Auto-evolução / manutenção / correção sob comando ---
    if capacidade in ("AUTO_EVOLUCAO", "AUTO_MANUTENCAO", "AUTO_CORRECAO"):
        try:
            from core.auto_evolucao import motor_auto_evolucao

            acao = context.get("acao_evolucao") or "diagnosticar"
            # Inferência leve a partir da intenção
            t = str(intencao).lower()
            if "propor" in t or "plano" in t or "lacuna" in t:
                acao = "propor"
            elif "aplicar" in t or "executar plano" in t:
                acao = "aplicar_plano"
            elif "corrig" in t or "consert" in t:
                acao = "marcar_saude"
            elif "manuten" in t or "diagn" in t or "saúde" in t or "saude" in t:
                acao = "diagnosticar"

            resultado = motor_auto_evolucao.executar_sob_comando(
                acao=acao,
                capacidade_alvo=context.get("capacidade_alvo") or context.get("alvo"),
                plano_id=context.get("plano_id"),
                comando=intencao,
                autorizada=bool(context.get("autorizada")),
                auth_id=context.get("auth_id"),
                ciclo_id=ciclo.get("id"),
            )
            return {
                "ok": bool(resultado.get("ok")),
                "status": resultado.get("status", "AUTO_EVOLUCAO"),
                "message": "Execução via motor de auto-evolução sob comando",
                "intencao": intencao,
                "capacidade": capacidade,
                "resultado_evolucao": resultado,
                "fonte": "auto_evolucao",
                "soberania": "ok" if resultado.get("ok") else resultado.get("status"),
            }
        except Exception as e:
            return {
                "ok": False,
                "status": "FALHA_AUTO_EVOLUCAO",
                "message": str(e),
                "intencao": intencao,
                "capacidade": capacidade,
                "fonte": "auto_evolucao",
            }

    # Preferência: USB Enriquecimento
    try:
        from usb.enriquecimento import enriquecer

        resultado = enriquecer(
            intencao,
            capacidade=capacidade,
            contexto=context,
            ciclo=ciclo,
        )
        return {
            "ok": bool(resultado.get("ok")),
            "status": resultado.get("status", "EXECUTADO_USB"),
            "message": "Execução via USB Enriquecimento sob Ruflo",
            "intencao": intencao,
            "capacidade": capacidade,
            "resultado_usb": resultado,
            "fonte": resultado.get("fonte", "usb_enriquecimento"),
            "soberania": "ok",
        }
    except ImportError:
        pass

    # Fallback: Gemini direto
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            from core.gemini_client import GeminiClient

            client = GeminiClient(api_key=api_key)
            prompt = (
                f"Você é o SOUSA 2.0. Capacidade: {capacidade}.\n"
                f"Intenção: {intencao}\n\n"
                "Responda de forma objetiva e operacional."
            )
            resposta = client.generate(prompt)
            return {
                "ok": True,
                "status": "EXECUTADO_SOUSA_IA",
                "message": "Execução via SOUSA IA (Gemini)",
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

    return {
        "ok": True,
        "status": "EXECUTADO_ESTRUTURAL",
        "message": "Ciclo estrutural concluído (sem IA configurada).",
        "intencao": intencao,
        "capacidade": capacidade,
        "fonte": "estrutura",
        "soberania": "ok",
    }


def handler_recuperar(ciclo: Dict[str, Any], resultado_falha: Dict[str, Any]) -> Dict[str, Any]:
    intencao = ciclo.get("intencao") or ""
    return {
        "ok": True,
        "status": "RECUPERADO_ESTRUTURAL",
        "message": "Recuperação mínima aplicada. Ciclo marcado para consolidação.",
        "intencao": intencao,
        "falha_original": resultado_falha.get("status"),
        "fonte": "recuperacao",
    }


def handler_consolidar(ciclo: Dict[str, Any]) -> None:
    try:
        from core.memoria import memoria_canonica

        resultados = ciclo.get("resultados") or []
        if not resultados:
            return
        ultimo = resultados[-1]
        if ultimo.get("ok"):
            resumo = ultimo.get("resposta") or ultimo.get("message") or str(ultimo.get("status"))
            memoria_canonica.registrar_padrao(
                f"ciclo:{ciclo.get('id')}:{ciclo.get('capacidade')}",
                contexto={
                    "intencao": ciclo.get("intencao"),
                    "status": ultimo.get("status"),
                    "resumo": str(resumo)[:500],
                },
            )
    except Exception:
        pass


def registrar_handlers_padrao(orchestrator) -> None:
    orchestrator.register_handler("EXECUTANDO", handler_executar)
    orchestrator.register_handler("RECUPERANDO", handler_recuperar)
    orchestrator.register_handler("CONSOLIDANDO", handler_consolidar)
