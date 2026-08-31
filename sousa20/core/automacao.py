"""
SOUSA 2.0 — Política de Automação 99,99%

Camadas:
  AUTO          → executa sozinho (risco BAIXO, reversível, interno)
  SUPERVISIONADO → executa com autorização permanente de política
  AUTORIZADO    → exige comando explícito do operador (risco ALTO / irreversível)

Meta operacional: 99,99% das operações internas de manutenção e a maioria
das externas seguras rodam sem intervenção humana. O 0,01% restante
(alteração de núcleo, irreversível, credencial) permanece sob soberania.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
import uuid

VERSAO_POLITICA = "2.0.0-auto"

# Ações classificadas como AUTO (executam sem auth humana por ciclo)
ACOES_AUTO: Set[str] = {
    "diagnosticar",
    "diagnostico",
    "marcar_saude",
    "limpar_cooldown",
    "consolidar_diagnostico",
    "verificar_modulos",
    "sincronizar_status",
    "recuperar_ciclo_estrutural",
    "registrar_saude_recurso",
    "heartbeat",
    "listar_lacunas",
    "propor",  # proposta não altera estado
    "propor_adaptacao",
    "operacao_externa_leitura",
    "operacao_externa_baixa",
}

# Ações SUPERVISIONADO: política concede auth automática de curta duração
ACOES_SUPERVISIONADO: Set[str] = {
    "registrar_capacidade_stub",
    "aplicar_plano_estrutural_seguro",
    "aplicar_plano",  # estrutural apenas
    "reiniciar_handler",
    "operacao_externa_media",
    "publicar_canal_seguro",
}

# Tudo que não estiver acima e tocar domínio protegido = AUTORIZADO


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def classificar_acao(acao: str, *,
                     risco: Optional[str] = None,
                     irreversivel: bool = False,
                     altera_nucleo: bool = False,
                     externa: bool = False) -> str:
    """Retorna AUTO | SUPERVISIONADO | AUTORIZADO."""
    a = str(acao or "").lower().strip()

    if irreversivel or altera_nucleo or (risco or "").upper() == "ALTO":
        return "AUTORIZADO"

    if a in ACOES_AUTO or a.startswith("auto_evolucao:diagnostic") or a.startswith("auto_evolucao:propor"):
        return "AUTO"

    # prefixos de evolução seguros
    if a in (
        "auto_evolucao:marcar_saude",
        "auto_evolucao:consolidar_diagnostico",
        "auto_evolucao:registrar_capacidade_stub",
        "auto_evolucao:aplicar_plano",
    ):
        if a.endswith("aplicar_plano") or a.endswith("registrar_capacidade_stub"):
            return "SUPERVISIONADO"
        return "AUTO"

    if a in ACOES_SUPERVISIONADO:
        return "SUPERVISIONADO"

    if externa and (risco or "BAIXO").upper() in ("BAIXO", "MEDIO"):
        return "SUPERVISIONADO" if (risco or "").upper() == "MEDIO" else "AUTO"

    return "AUTORIZADO"


class PoliticaAutomacao:
    """
    Motor de decisão de automação.
    Concede autorização standing para AUTO e SUPERVISIONADO via soberania.
    """

    def __init__(self):
        self.versao = VERSAO_POLITICA
        self.metricas = {
            "auto_executadas": 0,
            "supervisionadas": 0,
            "autorizadas_humanas": 0,
            "bloqueadas": 0,
        }
        self._ensure_standing_auth()

    def _ensure_standing_auth(self) -> None:
        """Garante autorizações permanentes de política para ações AUTO/SUPERVISIONADO."""
        try:
            from core.soberania import contrato_soberania

            for acao in list(ACOES_AUTO) + list(ACOES_SUPERVISIONADO):
                # Auth de longa duração (30 dias) renovável — política do sistema
                contrato_soberania.conceder_autorizacao(
                    acao=acao if not acao.startswith("auto_evolucao") else acao,
                    concedida_por="POLITICA_AUTOMACAO",
                    origem="AUTOMACAO",
                    motivo="STANDING_AUTH_99_99",
                    valida_por_segundos=30 * 24 * 3600,
                )
                # Também cobre prefixo auto_evolucao:
                if not acao.startswith("auto_evolucao:"):
                    contrato_soberania.conceder_autorizacao(
                        acao=f"auto_evolucao:{acao}",
                        concedida_por="POLITICA_AUTOMACAO",
                        origem="AUTOMACAO",
                        motivo="STANDING_AUTH_99_99",
                        valida_por_segundos=30 * 24 * 3600,
                    )
        except Exception:
            pass

    def decidir(
        self,
        acao: str,
        *,
        risco: Optional[str] = None,
        irreversivel: bool = False,
        altera_nucleo: bool = False,
        externa: bool = False,
        autorizada_humana: bool = False,
        auth_id: Optional[str] = None,
        ciclo_id: Optional[str] = None,
        origem: str = "AUTOMACAO",
    ) -> Dict[str, Any]:
        """Decide se a ação pode rodar e sob qual regime."""
        nivel = classificar_acao(
            acao,
            risco=risco,
            irreversivel=irreversivel,
            altera_nucleo=altera_nucleo,
            externa=externa,
        )

        if nivel == "AUTO":
            self.metricas["auto_executadas"] += 1
            return {
                "ok": True,
                "nivel": "AUTO",
                "executar": True,
                "autorizada": True,
                "motivo": "POLITICA_AUTO_99_99",
                "acao": acao,
            }

        if nivel == "SUPERVISIONADO":
            # Tenta consumir standing auth; se não houver, concede na hora via política
            try:
                from core.soberania import contrato_soberania

                cons = contrato_soberania.consumir_autorizacao(
                    acao if acao.startswith("auto_evolucao") else f"auto_evolucao:{acao}"
                    if acao in ACOES_SUPERVISIONADO or acao in ACOES_AUTO
                    else acao,
                    origem="AUTOMACAO",
                    ciclo_id=ciclo_id,
                )
                if not cons.get("ok"):
                    # Renova standing e consome
                    contrato_soberania.conceder_autorizacao(
                        acao=acao,
                        concedida_por="POLITICA_AUTOMACAO",
                        origem="AUTOMACAO",
                        motivo="RENOVA_STANDING_SUPERVISIONADO",
                        valida_por_segundos=3600,
                    )
                    cons = contrato_soberania.consumir_autorizacao(
                        acao, origem="AUTOMACAO", ciclo_id=ciclo_id
                    )
                self.metricas["supervisionadas"] += 1
                return {
                    "ok": True,
                    "nivel": "SUPERVISIONADO",
                    "executar": True,
                    "autorizada": True,
                    "motivo": "STANDING_AUTH_POLITICA",
                    "acao": acao,
                    "auth": cons,
                }
            except Exception as e:
                if autorizada_humana:
                    self.metricas["autorizadas_humanas"] += 1
                    return {
                        "ok": True,
                        "nivel": "SUPERVISIONADO",
                        "executar": True,
                        "autorizada": True,
                        "motivo": "FALLBACK_HUMANO",
                        "acao": acao,
                    }
                self.metricas["bloqueadas"] += 1
                return {
                    "ok": False,
                    "nivel": "SUPERVISIONADO",
                    "executar": False,
                    "motivo": str(e),
                    "acao": acao,
                }

        # AUTORIZADO — precisa humano
        if autorizada_humana or auth_id:
            self.metricas["autorizadas_humanas"] += 1
            return {
                "ok": True,
                "nivel": "AUTORIZADO",
                "executar": True,
                "autorizada": True,
                "motivo": "AUTORIZACAO_HUMANA",
                "acao": acao,
                "auth_id": auth_id,
            }

        self.metricas["bloqueadas"] += 1
        return {
            "ok": False,
            "nivel": "AUTORIZADO",
            "executar": False,
            "motivo": "EXIGE_AUTORIZACAO_OPERADOR",
            "acao": acao,
            "dica": "POST /autorizar com a ação desejada",
        }

    def taxa_automacao(self) -> Dict[str, Any]:
        total = sum(self.metricas.values()) or 1
        auto = self.metricas["auto_executadas"] + self.metricas["supervisionadas"]
        taxa = round(100.0 * auto / total, 4)
        return {
            "taxa_pct": taxa,
            "meta_pct": 99.99,
            "metricas": dict(self.metricas),
            "total_eventos": total,
            "versao": self.versao,
        }

    def status(self) -> Dict[str, Any]:
        return {
            "politica": "AUTOMACAO_99_99",
            "versao": self.versao,
            "acoes_auto": sorted(ACOES_AUTO),
            "acoes_supervisionado": sorted(ACOES_SUPERVISIONADO),
            "taxa": self.taxa_automacao(),
            "principio": (
                "99,99% das operações internas seguras e externas de baixo/médio risco "
                "correm em AUTO ou SUPERVISIONADO. Núcleo e irreversíveis permanecem AUTORIZADO."
            ),
        }


politica_automacao = PoliticaAutomacao()
