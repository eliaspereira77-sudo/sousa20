"""
SOUSA 2.0 — USB de Enriquecimento

Camada USB (não núcleo). Opera sob soberania do núcleo e sob orquestração Ruflo.
Não altera identidade, política, governança nem arquitetura soberana.
Maximiza recursos da Ruflo: ciclo, estados, política, persistência, handlers.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

USB_ID = "ENRIQUECIMENTO"
USB_TIPO = "camada_enriquecimento"
USB_CAPACIDADES = [
    "TEXTO",
    "ANALISE",
    "BUSCA_MEMORIA",
    "enriquecer",
    "contextualizar",
    "resumir",
]


def registrar_no_contrato() -> Dict[str, Any]:
    """Registra esta USB no contrato de soberania (pode_alterar_nucleo=False)."""
    from core.soberania import contrato_soberania

    return contrato_soberania.registrar_usb(
        USB_ID,
        tipo=USB_TIPO,
        descricao=(
            "USB de enriquecimento do SOUSA 2.0. "
            "Amplifica contexto e resposta sob Ruflo; não altera o núcleo."
        ),
        capacidades=USB_CAPACIDADES,
        pode_alterar_nucleo=False,
    )


def enriquecer(
    intencao: str,
    *,
    capacidade: str = "TEXTO",
    contexto: Optional[Dict[str, Any]] = None,
    ciclo: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Enriquecimento operacional sob Ruflo.

    - Não escreve em domínios do núcleo.
    - Usa apenas intenção, capacidade e contexto do ciclo.
    - Pode chamar SOUSA IA se disponível (recurso externo, não soberania).
    """
    contexto = contexto or {}
    ciclo = ciclo or {}

    # Validação sob soberania: origem = esta USB, domínio nenhum do núcleo
    try:
        from core.soberania import contrato_soberania

        check = contrato_soberania.validar_operacao(
            "enriquecer",
            origem=USB_ID,
            dominio=None,
            sinal_risco=contexto.get("sinal_risco"),
            autorizada=bool(contexto.get("autorizada")),
            ciclo_id=ciclo.get("id"),
        )
        if not check.get("ok"):
            return {
                "ok": False,
                "status": check.get("status", "BLOQUEADO"),
                "message": check.get("motivo", "Bloqueado pelo contrato de soberania"),
                "usb": USB_ID,
                "soberania": check,
            }
    except ImportError:
        check = {"ok": True, "status": "SEM_CONTRATO"}

    base = {
        "usb": USB_ID,
        "tipo": USB_TIPO,
        "intencao": intencao,
        "capacidade": capacidade,
        "ciclo_id": ciclo.get("id"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "soberania": check.get("status", "ok"),
        "papel": "USB de enriquecimento — não núcleo",
    }

    # Tentativa de enriquecimento via SOUSA IA (recurso, não núcleo)
    api_key = __import__("os").getenv("GEMINI_API_KEY")
    if api_key:
        try:
            from core.gemini_client import GeminiClient

            client = GeminiClient(api_key=api_key)
            prompt = (
                "Você é um módulo USB de enriquecimento do SOUSA 2.0. "
                "Não é o núcleo. Não altera identidade, política nem soberania. "
                "A Ruflo orquestra; você apenas enriquece a resposta.\n\n"
                f"Capacidade: {capacidade}\n"
                f"Intenção: {intencao}\n"
                f"Contexto ciclo: estado={ciclo.get('estado')}, id={ciclo.get('id')}\n\n"
                "Entregue enriquecimento objetivo e operacional (resumo, contexto, próximos passos)."
            )
            texto = client.generate(prompt)
            return {
                **base,
                "ok": True,
                "status": "ENRIQUECIDO_IA",
                "enriquecimento": texto,
                "fonte": "gemini",
            }
        except Exception as e:
            return {
                **base,
                "ok": True,
                "status": "ENRIQUECIDO_ESTRUTURAL",
                "enriquecimento": _enriquecimento_estrutural(intencao, capacidade, ciclo),
                "fonte": "estrutura",
                "aviso_ia": str(e),
            }

    return {
        **base,
        "ok": True,
        "status": "ENRIQUECIDO_ESTRUTURAL",
        "enriquecimento": _enriquecimento_estrutural(intencao, capacidade, ciclo),
        "fonte": "estrutura",
    }


def _enriquecimento_estrutural(
    intencao: str,
    capacidade: str,
    ciclo: Dict[str, Any],
) -> Dict[str, Any]:
    """Enriquecimento sem IA: metadados e alinhamento SOUSA 2.0 / Ruflo."""
    return {
        "resumo_intencao": intencao,
        "capacidade_inferida": capacidade,
        "alinhamento": {
            "nucleo": "intocado",
            "ruflo": "ciclo orquestrado e persistido",
            "usb": USB_ID,
            "principio": "valor comprovado; soberania preservada",
        },
        "ciclo": {
            "id": ciclo.get("id"),
            "estado": ciclo.get("estado"),
            "historico": ciclo.get("historico_estados", []),
        },
        "sugestao": (
            "Enriquecimento estrutural concluído. "
            "Com GEMINI_API_KEY, o mesmo caminho usa SOUSA IA sem alterar o núcleo."
        ),
    }


def handler_executar_enriquecimento(
    ciclo: Dict[str, Any],
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Handler Ruflo (etapa EXECUTANDO) que delega a esta USB.
    Maximiza Ruflo: recebe ciclo completo, devolve resultado no contrato do ciclo.
    """
    intencao = str(ciclo.get("intencao") or context.get("texto") or "")
    capacidade = str(ciclo.get("capacidade") or context.get("capacidade") or "TEXTO")

    resultado = enriquecer(
        intencao,
        capacidade=capacidade,
        contexto=context,
        ciclo=ciclo,
    )

    return {
        "ok": bool(resultado.get("ok")),
        "status": resultado.get("status", "ENRIQUECIMENTO"),
        "message": "USB ENRIQUECIMENTO sob Ruflo (núcleo intacto)",
        "intencao": intencao,
        "capacidade": capacidade,
        "usb": USB_ID,
        "resultado_usb": resultado,
        "fonte": resultado.get("fonte", "usb_enriquecimento"),
    }


def registrar_handler_na_ruflo(orchestrator) -> None:
    """Liga esta USB ao handler EXECUTANDO da Ruflo (substitui ou compõe)."""
    orchestrator.register_handler("EXECUTANDO", handler_executar_enriquecimento)
