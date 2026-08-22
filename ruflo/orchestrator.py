"""
SOUSA 2.0 — Camada Ruflo

Orquestrador de fluxos alinhado ao ciclo do pacote oficial:
INTENÇÃO → PLANEJAR → EXECUTAR → VERIFICAR → RECUPERAR →
CONSOLIDAR → REGISTRAR → CONCLUIR

Coordena capacidades internas, externas, multimídia, voz,
avatar e distribuição global.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
import uuid


class EstadoCiclo(str, Enum):
    RECEBIDA = "RECEBIDA"
    PLANEJANDO = "PLANEJANDO"
    EXECUTANDO = "EXECUTANDO"
    VERIFICANDO = "VERIFICANDO"
    RECUPERANDO = "RECUPERANDO"
    CONSOLIDANDO = "CONSOLIDANDO"
    REGISTRANDO = "REGISTRANDO"
    CONCLUIDA = "CONCLUIDA"
    AGUARDANDO_AUTORIZACAO = "AGUARDANDO_AUTORIZACAO"
    FALHA = "FALHA"


class RufloOrchestrator:
    """Orquestrador central da camada Ruflo."""

    ESTADOS_VALIDOS = [e.value for e in EstadoCiclo]

    def __init__(self):
        self.workflows: Dict[str, Dict[str, Any]] = {}
        self.active_agents: List[str] = []
        self.ciclos: Dict[str, Dict[str, Any]] = {}
        self.handlers: Dict[str, Callable] = {}
        self.state: Dict[str, Any] = {
            "status": "operational",
            "layer": "ruflo",
            "version": "0.3.0",
            "ready_for": [
                "workflow_definition",
                "agent_coordination",
                "state_sync",
                "capability_routing",
                "ciclo_autonomo",
            ],
        }
        self._register_default_workflows()

    # ------------------------------------------------------------------
    # Ciclo (máquina de estados alinhada ao SOUSA_CICLO_AUTONOMO)
    # ------------------------------------------------------------------

    def criar_ciclo(self, intencao: Any, contexto: Optional[Dict] = None) -> Dict[str, Any]:
        ciclo_id = f"CICLO_{uuid.uuid4().hex[:12]}"
        ciclo = {
            "id": ciclo_id,
            "estado": EstadoCiclo.RECEBIDA.value,
            "intencao": intencao,
            "contexto": contexto or {},
            "tentativas": [],
            "plano": [],
            "resultados": [],
            "autorizacoes": [],
            "inicio": datetime.now(timezone.utc).isoformat(),
            "ultimo_evento": None,
            "historico_estados": [EstadoCiclo.RECEBIDA.value],
        }
        self.ciclos[ciclo_id] = ciclo
        return ciclo

    def mudar_estado(
        self,
        ciclo: Dict[str, Any],
        estado: str,
        detalhe: Any = None,
    ) -> Dict[str, Any]:
        if estado not in self.ESTADOS_VALIDOS:
            raise ValueError(f"Estado inválido: {estado}. Válidos: {self.ESTADOS_VALIDOS}")

        ciclo["estado"] = estado
        ciclo["ultimo_evento"] = {
            "estado": estado,
            "detalhe": detalhe,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        ciclo.setdefault("historico_estados", []).append(estado)
        return ciclo

    def registrar_tentativa(self, ciclo: Dict[str, Any], tentativa: Dict[str, Any]) -> Dict[str, Any]:
        ciclo.setdefault("tentativas", []).append(tentativa or {})
        return ciclo

    def precisa_autorizacao(self, sinal: Optional[Dict] = None) -> Dict[str, Any]:
        if not sinal:
            return {"necessaria": False}
        alto_risco = (
            sinal.get("risco") == "ALTO"
            or sinal.get("irreversivel") is True
            or sinal.get("altera_nucleo") is True
            or sinal.get("exige_credencial") is True
        )
        return {
            "necessaria": bool(alto_risco),
            "motivo": (sinal.get("motivo") or "POLITICA_DE_GOVERNANCA") if alto_risco else None,
        }

    # ------------------------------------------------------------------
    # Workflows
    # ------------------------------------------------------------------

    def _register_default_workflows(self) -> None:
        self.register_workflow(
            "ciclo_padrao",
            {
                "descricao": "Ciclo autônomo padrão SOUSA (intenção → conclusão)",
                "etapas": [
                    EstadoCiclo.RECEBIDA.value,
                    EstadoCiclo.PLANEJANDO.value,
                    EstadoCiclo.EXECUTANDO.value,
                    EstadoCiclo.VERIFICANDO.value,
                    EstadoCiclo.CONSOLIDANDO.value,
                    EstadoCiclo.REGISTRANDO.value,
                    EstadoCiclo.CONCLUIDA.value,
                ],
            },
        )
        self.register_workflow(
            "status",
            {
                "descricao": "Retorna status consolidado da camada Ruflo",
                "etapas": ["status"],
            },
        )

    def register_workflow(self, name: str, definition: Dict[str, Any]) -> None:
        self.workflows[name] = definition

    def register_handler(self, etapa: str, handler: Callable) -> None:
        """Registra handler para uma etapa do ciclo (ex: EXECUTANDO)."""
        self.handlers[etapa] = handler

    def execute(
        self,
        workflow_name: str,
        context: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        context = context or {}

        if workflow_name == "status":
            return self.get_status()

        if workflow_name not in self.workflows:
            return {
                "ok": False,
                "status": "error",
                "message": f"Workflow '{workflow_name}' não registrado",
                "available": list(self.workflows.keys()),
            }

        intencao = context.get("intencao") or context.get("texto") or workflow_name
        ciclo = self.criar_ciclo(intencao, context)

        try:
            # PLANEJANDO
            self.mudar_estado(ciclo, EstadoCiclo.PLANEJANDO.value)
            plano = self._planejar(ciclo, context)
            ciclo["plano"] = plano

            # Verifica autorização de alto risco
            auth = self.precisa_autorizacao(context.get("sinal_risco"))
            if auth["necessaria"]:
                self.mudar_estado(ciclo, EstadoCiclo.AGUARDANDO_AUTORIZACAO.value, auth)
                return {
                    "ok": False,
                    "status": "AGUARDANDO_AUTORIZACAO",
                    "ciclo": ciclo,
                    "autorizacao": auth,
                }

            # EXECUTANDO
            self.mudar_estado(ciclo, EstadoCiclo.EXECUTANDO.value)
            resultado = self._executar(ciclo, context)
            self.registrar_tentativa(ciclo, {
                "ok": resultado.get("ok", False),
                "status": resultado.get("status"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            ciclo["resultados"].append(resultado)

            # VERIFICANDO
            self.mudar_estado(ciclo, EstadoCiclo.VERIFICANDO.value, resultado)
            ok = bool(resultado.get("ok"))

            if not ok and context.get("tentar_recuperacao", True):
                self.mudar_estado(ciclo, EstadoCiclo.RECUPERANDO.value)
                recuperacao = self._recuperar(ciclo, resultado)
                ciclo["resultados"].append(recuperacao)
                ok = bool(recuperacao.get("ok"))

            if ok:
                self.mudar_estado(ciclo, EstadoCiclo.CONSOLIDANDO.value)
                self._consolidar(ciclo)

                self.mudar_estado(ciclo, EstadoCiclo.REGISTRANDO.value)
                self._registrar(ciclo)

                self.mudar_estado(ciclo, EstadoCiclo.CONCLUIDA.value)
            else:
                self.mudar_estado(ciclo, EstadoCiclo.FALHA.value, resultado)

            return {
                "ok": ok,
                "status": ciclo["estado"],
                "workflow": workflow_name,
                "ciclo": ciclo,
                "resultado": resultado,
            }

        except Exception as e:
            self.mudar_estado(ciclo, EstadoCiclo.FALHA.value, {"erro": str(e)})
            return {
                "ok": False,
                "status": "FALHA",
                "error": str(e),
                "ciclo": ciclo,
            }

    # ------------------------------------------------------------------
    # Etapas internas (extensíveis via handlers)
    # ------------------------------------------------------------------

    def _planejar(self, ciclo: Dict, context: Dict) -> List[Dict]:
        if "PLANEJANDO" in self.handlers:
            return self.handlers["PLANEJANDO"](ciclo, context)
        return [
            {"etapa": "inferir_capacidade", "status": "pending"},
            {"etapa": "selecionar_recurso", "status": "pending"},
            {"etapa": "preparar_contexto", "status": "pending"},
        ]

    def _executar(self, ciclo: Dict, context: Dict) -> Dict[str, Any]:
        if "EXECUTANDO" in self.handlers:
            return self.handlers["EXECUTANDO"](ciclo, context)

        # Placeholder operacional — será ligado ao Executor Universal / SOUSA IA
        return {
            "ok": True,
            "status": "EXECUTADO_ESTRUTURA",
            "message": "Ruflo executou o ciclo em modo estrutura. Conecte handlers ou SOUSA IA para execução real.",
            "intencao": ciclo.get("intencao"),
            "contexto": context,
        }

    def _recuperar(self, ciclo: Dict, resultado_falha: Dict) -> Dict[str, Any]:
        if "RECUPERANDO" in self.handlers:
            return self.handlers["RECUPERANDO"](ciclo, resultado_falha)
        return {
            "ok": False,
            "status": "RECUPERACAO_NAO_IMPLEMENTADA",
            "message": "Handler de recuperação ainda não registrado.",
        }

    def _consolidar(self, ciclo: Dict) -> None:
        if "CONSOLIDANDO" in self.handlers:
            self.handlers["CONSOLIDANDO"](ciclo)

    def _registrar(self, ciclo: Dict) -> None:
        if "REGISTRANDO" in self.handlers:
            self.handlers["REGISTRANDO"](ciclo)

    # ------------------------------------------------------------------
    # Roteamento de capacidades
    # ------------------------------------------------------------------

    def route_capability(self, capability: str, payload: Any) -> Dict[str, Any]:
        return self.execute(
            "ciclo_padrao",
            {"intencao": capability, "payload": payload, "capacidade": capability},
        )

    # ------------------------------------------------------------------
    # Status
    # ------------------------------------------------------------------

    def get_status(self) -> Dict[str, Any]:
        return {
            **self.state,
            "workflows_registrados": list(self.workflows.keys()),
            "handlers_registrados": list(self.handlers.keys()),
            "ciclos_ativos": len([c for c in self.ciclos.values() if c["estado"] not in (EstadoCiclo.CONCLUIDA.value, EstadoCiclo.FALHA.value)]),
            "total_ciclos": len(self.ciclos),
        }

    def get_ciclo(self, ciclo_id: str) -> Optional[Dict[str, Any]]:
        return self.ciclos.get(ciclo_id)
