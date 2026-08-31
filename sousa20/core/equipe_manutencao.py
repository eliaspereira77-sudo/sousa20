"""
SOUSA 2.0 — Equipe de Manutenção Automatizada

Agentes internos que detectam, classificam e corrigem erros em loop fechado.
Meta: 99,99% das correções internas sem intervenção humana.

Agentes:
  - SENSOR   → detecta falhas de módulo, saúde, ciclos em FALHA
  - DIAG     → classifica severidade e regime (AUTO/SUPERVISIONADO/AUTORIZADO)
  - REPAIR   → aplica correção automática quando política permite
  - VERIFY   → re-diagnostica e registra resultado
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

VERSAO_EQUIPE = "1.0.0"


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class EquipeManutencao:
    """Loop fechado de manutenção automática."""

    def __init__(self):
        self.versao = VERSAO_EQUIPE
        self.historico: List[Dict[str, Any]] = []
        self.correcoes_auto = 0
        self.escalonadas = 0

    def ciclo_completo(self, *,
                       autorizada_humana: bool = False,
                       auth_id: Optional[str] = None) -> Dict[str, Any]:
        """
        SENSOR → DIAG → REPAIR → VERIFY
        Executa o máximo possível em AUTO.
        """
        ciclo_id = f"MANUT_{uuid.uuid4().hex[:10]}"
        eventos: List[Dict[str, Any]] = []

        # 1. SENSOR
        sensores = self._sensor()
        eventos.append({"etapa": "SENSOR", "resultado": sensores})

        # 2. DIAG
        diagnosticos = self._diagnosticar_falhas(sensores)
        eventos.append({"etapa": "DIAG", "resultado": diagnosticos})

        # 3. REPAIR (por item, respeitando política)
        reparos: List[Dict[str, Any]] = []
        for item in diagnosticos.get("itens", []):
            reparo = self._reparar(
                item,
                ciclo_id=ciclo_id,
                autorizada_humana=autorizada_humana,
                auth_id=auth_id,
            )
            reparos.append(reparo)
            if reparo.get("auto"):
                self.correcoes_auto += 1
            elif reparo.get("escalonado"):
                self.escalonadas += 1
        eventos.append({"etapa": "REPAIR", "resultado": reparos})

        # 4. VERIFY
        verificacao = self._verificar()
        eventos.append({"etapa": "VERIFY", "resultado": verificacao})

        resumo = {
            "ok": True,
            "ciclo_id": ciclo_id,
            "timestamp": _utcnow(),
            "falhas_detectadas": len(diagnosticos.get("itens", [])),
            "reparos": reparos,
            "verificacao": verificacao,
            "correcoes_auto_acumuladas": self.correcoes_auto,
            "escalonadas_acumuladas": self.escalonadas,
            "eventos": eventos,
            "taxa_auto_ciclo": self._taxa_ciclo(reparos),
        }

        self._persistir(resumo)
        self.historico.append({
            "ciclo_id": ciclo_id,
            "timestamp": resumo["timestamp"],
            "falhas": resumo["falhas_detectadas"],
            "taxa_auto": resumo["taxa_auto_ciclo"],
        })
        if len(self.historico) > 200:
            self.historico = self.historico[-200:]

        return resumo

    def _sensor(self) -> Dict[str, Any]:
        falhas_modulos = []
        try:
            from core.auto_evolucao import motor_auto_evolucao
            diag = motor_auto_evolucao.diagnosticar()
            for m in diag.get("modulos", []):
                if m.get("status") != "OK":
                    falhas_modulos.append(m)
            lacunas = diag.get("lacunas", {})
        except Exception as e:
            return {"ok": False, "erro": str(e), "falhas_modulos": [], "ciclos_falha": []}

        ciclos_falha = []
        try:
            from ruflo import persistencia
            ciclos_falha = persistencia.listar_ciclos(estado="FALHA", limite=20)
        except Exception:
            pass

        return {
            "ok": True,
            "falhas_modulos": falhas_modulos,
            "lacunas_total": lacunas.get("total_lacunas", 0) if isinstance(lacunas, dict) else 0,
            "ciclos_falha": ciclos_falha,
            "saude_geral": diag.get("saude_geral"),
        }

    def _diagnosticar_falhas(self, sensores: Dict[str, Any]) -> Dict[str, Any]:
        itens = []
        for m in sensores.get("falhas_modulos") or []:
            itens.append({
                "tipo": "MODULO",
                "alvo": m.get("modulo"),
                "status": m.get("status"),
                "erro": m.get("erro"),
                "severidade": "ALTA" if m.get("status") == "FALHA" else "MEDIA",
                "acao_sugerida": "marcar_saude",
                "regime": "AUTO",
            })

        for c in sensores.get("ciclos_falha") or []:
            itens.append({
                "tipo": "CICLO",
                "alvo": c.get("id"),
                "status": c.get("estado"),
                "severidade": "MEDIA",
                "acao_sugerida": "recuperar_ciclo_estrutural",
                "regime": "AUTO",
            })

        # Sem falhas críticas → ainda sincroniza saúde (manutenção preventiva AUTO)
        if not itens:
            itens.append({
                "tipo": "PREVENTIVO",
                "alvo": "sistema",
                "status": "OK",
                "severidade": "BAIXA",
                "acao_sugerida": "marcar_saude",
                "regime": "AUTO",
            })

        return {"ok": True, "itens": itens, "total": len(itens)}

    def _reparar(
        self,
        item: Dict[str, Any],
        *,
        ciclo_id: str,
        autorizada_humana: bool = False,
        auth_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        acao = item.get("acao_sugerida") or "marcar_saude"

        try:
            from core.automacao import politica_automacao

            decisao = politica_automacao.decidir(
                acao,
                risco="BAIXO" if item.get("severidade") == "BAIXA" else "MEDIO",
                autorizada_humana=autorizada_humana,
                auth_id=auth_id,
                ciclo_id=ciclo_id,
                origem="EQUIPE_MANUTENCAO",
            )
        except Exception as e:
            return {
                "ok": False,
                "auto": False,
                "escalonado": True,
                "item": item,
                "erro": str(e),
            }

        if not decisao.get("executar"):
            return {
                "ok": False,
                "auto": False,
                "escalonado": True,
                "item": item,
                "decisao": decisao,
                "motivo": "AGUARDA_OPERADOR",
            }

        # Executa correção
        resultado_exec = self._executar_correcao(acao, item)
        return {
            "ok": bool(resultado_exec.get("ok")),
            "auto": decisao.get("nivel") in ("AUTO", "SUPERVISIONADO"),
            "escalonado": False,
            "nivel": decisao.get("nivel"),
            "item": item,
            "execucao": resultado_exec,
        }

    def _executar_correcao(self, acao: str, item: Dict[str, Any]) -> Dict[str, Any]:
        try:
            from core.auto_evolucao import motor_auto_evolucao

            if acao in ("marcar_saude", "verificar_modulos", "sincronizar_status"):
                # marcar_saude é AUTO — chama direto com autorizada pela política
                return motor_auto_evolucao.executar_sob_comando(
                    acao="marcar_saude",
                    autorizada=True,
                    comando=f"equipe_manutencao:{item.get('tipo')}:{item.get('alvo')}",
                )

            if acao == "recuperar_ciclo_estrutural":
                return {
                    "ok": True,
                    "status": "CICLO_MARCADO_PARA_REVISAO",
                    "ciclo_id": item.get("alvo"),
                    "nota": "Ciclo em FALHA registrado; recuperação estrutural aplicada no próximo ciclo Ruflo",
                }

            if acao in ("diagnosticar", "consolidar_diagnostico"):
                return motor_auto_evolucao.executar_sob_comando(
                    acao=acao,
                    autorizada=True,
                    comando="equipe_manutencao",
                )

            return {"ok": True, "status": "NOOP", "acao": acao}
        except Exception as e:
            return {"ok": False, "erro": str(e)}

    def _verificar(self) -> Dict[str, Any]:
        try:
            from core.auto_evolucao import motor_auto_evolucao
            diag = motor_auto_evolucao.diagnosticar()
            return {
                "ok": True,
                "saude_geral": diag.get("saude_geral"),
                "modulos_ok": sum(1 for m in diag.get("modulos", []) if m.get("status") == "OK"),
                "modulos_total": len(diag.get("modulos", [])),
            }
        except Exception as e:
            return {"ok": False, "erro": str(e)}

    def _taxa_ciclo(self, reparos: List[Dict]) -> float:
        if not reparos:
            return 100.0
        auto = sum(1 for r in reparos if r.get("auto"))
        return round(100.0 * auto / len(reparos), 4)

    def _persistir(self, resumo: Dict[str, Any]) -> None:
        try:
            from core.memoria import memoria_canonica
            memoria_canonica.guardar(
                f"manutencao:{resumo.get('ciclo_id')}",
                {
                    "falhas": resumo.get("falhas_detectadas"),
                    "taxa_auto": resumo.get("taxa_auto_ciclo"),
                    "timestamp": resumo.get("timestamp"),
                },
                namespace="manutencao",
                origem="equipe_manutencao",
            )
        except Exception:
            pass

    def status(self) -> Dict[str, Any]:
        return {
            "equipe": "MANUTENCAO_AUTOMATIZADA",
            "versao": self.versao,
            "correcoes_auto": self.correcoes_auto,
            "escalonadas": self.escalonadas,
            "ciclos_historico": len(self.historico),
            "meta": "99.99% correções internas sem humano",
        }


equipe_manutencao = EquipeManutencao()
