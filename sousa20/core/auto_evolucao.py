"""
SOUSA 2.0 — Motor de Auto-Manutenção, Auto-Correção e Evolução

Integrado à política de automação 99,99%:
- Diagnóstico/proposta/marcar_saude → AUTO
- Aplicar plano estrutural / registrar capacidade → SUPERVISIONADO
- Alteração de núcleo → AUTORIZADO (humano)
"""

from __future__ import annotations

import importlib
import inspect
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

VERSAO_MOTOR = "1.1.0-auto99"

_MODULOS_NUCLEO = [
    ("core.memoria", "memoria_canonica"),
    ("core.soberania", "contrato_soberania"),
    ("core.auditoria", "auditoria"),
    ("core.registro_capacidades", "registro_capacidades"),
    ("core.sousa_ia", "SousaIA"),
    ("core.gemini_client", "GeminiClient"),
    ("core.automacao", "politica_automacao"),
    ("core.equipe_manutencao", "equipe_manutencao"),
    ("ruflo.orchestrator", "RufloOrchestrator"),
    ("ruflo.politica", "inferir_capacidade"),
    ("usb.enriquecimento", "enriquecer"),
]

_CAPACIDADES_ESTRUTURAIS = {
    "TEXTO": {"implementado": True, "modulo": "core.gemini_client / usb.enriquecimento"},
    "ANALISE": {"implementado": True, "modulo": "core.sousa_ia"},
    "CODIGO": {"implementado": "parcial", "modulo": "core.sousa_ia (via Gemini)"},
    "BUSCA_MEMORIA": {"implementado": True, "modulo": "core.memoria"},
    "IMAGEM": {"implementado": False, "modulo": None},
    "VIDEO": {"implementado": False, "modulo": None},
    "AUDIO": {"implementado": False, "modulo": "voice (stub)"},
    "DOCUMENTO_PDF": {"implementado": False, "modulo": None},
    "PRODUCAO_LIVRO": {"implementado": "parcial", "modulo": "core.sousa_ia"},
    "VOZ_CLONADA": {"implementado": False, "modulo": "voice.clone (stub)"},
    "AVATAR": {"implementado": False, "modulo": "avatar.multilingual (stub)"},
    "DISTRIBUICAO": {"implementado": False, "modulo": "distribution.global_publish (stub)"},
    "AUTO_MANUTENCAO": {"implementado": True, "modulo": "core.auto_evolucao"},
    "AUTO_CORRECAO": {"implementado": True, "modulo": "core.auto_evolucao"},
    "AUTO_EVOLUCAO": {"implementado": True, "modulo": "core.auto_evolucao"},
}


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class MotorAutoEvolucao:
    def __init__(self):
        self.versao = VERSAO_MOTOR
        self.historico_local: List[Dict[str, Any]] = []

    def diagnosticar(self) -> Dict[str, Any]:
        modulos = self._checar_modulos()
        lacunas = self.detectar_lacunas()
        soberania = self._status_soberania()
        memoria = self._status_memoria()

        saude_geral = "OK"
        if any(m.get("status") == "FALHA" for m in modulos):
            saude_geral = "DEGRADADO"
        if lacunas.get("criticas"):
            saude_geral = "COM_LACUNAS"

        relatorio = {
            "ok": True,
            "tipo": "DIAGNOSTICO",
            "timestamp": _utcnow(),
            "versao_motor": self.versao,
            "saude_geral": saude_geral,
            "modulos": modulos,
            "lacunas": lacunas,
            "soberania": soberania,
            "memoria": memoria,
            "principio": "Diagnóstico AUTO. Correção estrutural SUPERVISIONADA. Núcleo AUTORIZADO.",
        }
        self._registrar_historico("DIAGNOSTICO", relatorio)
        return relatorio

    def detectar_lacunas(self) -> Dict[str, Any]:
        ausentes: List[Dict[str, Any]] = []
        parciais: List[Dict[str, Any]] = []
        ativas: List[str] = []
        try:
            from core.registro_capacidades import registro_capacidades
            for cap in registro_capacidades.listar(apenas_ativas=True):
                cid = cap["id"]
                meta = _CAPACIDADES_ESTRUTURAIS.get(cid, {})
                impl = meta.get("implementado", False)
                implementadores = cap.get("implementadores") or []
                if impl is True and implementadores:
                    ativas.append(cid)
                elif impl == "parcial" or (impl is True and not implementadores):
                    parciais.append({
                        "id": cid, "descricao": cap.get("descricao"),
                        "motivo": "implementação parcial ou só via LLM", "modulo": meta.get("modulo"),
                    })
                else:
                    ausentes.append({
                        "id": cid, "descricao": cap.get("descricao"), "risco": cap.get("risco"),
                        "motivo": "sem implementador real (stub ou vazio)", "modulo": meta.get("modulo"),
                    })
        except Exception as e:
            return {"ok": False, "erro": str(e), "ausentes": [], "parciais": [], "ativas": [], "criticas": []}

        criticas = [a for a in ausentes if a.get("risco") == "ALTO"]
        return {
            "ok": True, "ausentes": ausentes, "parciais": parciais,
            "ativas": ativas, "criticas": criticas,
            "total_lacunas": len(ausentes) + len(parciais),
        }

    def propor_adaptacao(self, capacidade_alvo: str, *, comando: str = "",
                         contexto: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        cid = str(capacidade_alvo or "").upper().strip()
        if not cid:
            return {"ok": False, "status": "CAPACIDADE_INVALIDA"}

        lacunas = self.detectar_lacunas()
        alvo = None
        for lista in (lacunas.get("ausentes") or [], lacunas.get("parciais") or []):
            for item in lista:
                if item["id"] == cid:
                    alvo = item
                    break

        plano_id = f"PLANO_{uuid.uuid4().hex[:10]}"
        passos = self._gerar_passos_plano(cid, alvo, comando)
        plano = {
            "ok": True, "status": "PROPOSTA", "plano_id": plano_id,
            "capacidade_alvo": cid, "comando_operador": comando or None,
            "lacuna": alvo, "passos": passos,
            "exige_autorizacao": False,  # estrutural pode ser SUPERVISIONADO
            "risco": "MEDIO",
            "aviso": "Proposta gerada. aplicar_plano roda em SUPERVISIONADO (política 99,99%).",
            "criado_em": _utcnow(),
        }
        try:
            from core.memoria import memoria_canonica
            memoria_canonica.guardar(f"plano:{plano_id}", plano, namespace="evolucao", origem="auto_evolucao")
        except Exception:
            pass
        self._registrar_historico("PROPOSTA", plano)
        return plano

    def executar_sob_comando(
        self, *,
        acao: str,
        capacidade_alvo: Optional[str] = None,
        plano_id: Optional[str] = None,
        comando: str = "",
        autorizada: bool = False,
        auth_id: Optional[str] = None,
        ciclo_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        acao_n = str(acao or "").lower().strip()

        if acao_n in ("diagnosticar", "diagnostico"):
            return self.diagnosticar()
        if acao_n in ("propor", "propor_adaptacao"):
            return self.propor_adaptacao(capacidade_alvo or "", comando=comando)

        # Política 99,99%: libera AUTO/SUPERVISIONADO sem humano
        if not autorizada:
            try:
                from core.automacao import politica_automacao
                dec = politica_automacao.decidir(
                    acao_n,
                    risco="MEDIO" if acao_n in ("aplicar_plano", "registrar_capacidade_stub") else "BAIXO",
                    autorizada_humana=False,
                    auth_id=auth_id,
                    ciclo_id=ciclo_id,
                )
                if dec.get("executar"):
                    autorizada = True
            except Exception:
                pass

        try:
            from core.soberania import contrato_soberania
            check = contrato_soberania.validar_operacao(
                acao=f"auto_evolucao:{acao_n}",
                origem="AUTO_EVOLUCAO",
                dominio=None,  # estrutural não toca domínio protegido
                sinal_risco={
                    "risco": "MEDIO" if acao_n in ("aplicar_plano", "registrar_capacidade_stub") else "BAIXO",
                    "altera_nucleo": False,
                    "capacidade": "AUTO_EVOLUCAO",
                    "motivo": "EVOLUCAO_AUTOMATIZADA",
                },
                autorizada=autorizada,
                auth_id=auth_id,
                ciclo_id=ciclo_id,
            )
            if not check.get("ok"):
                return {
                    "ok": False,
                    "status": check.get("status", "AGUARDANDO_AUTORIZACAO"),
                    "motivo": check.get("motivo"),
                    "soberania": check,
                    "dica": "Ação AUTORIZADA: use POST /autorizar ou autorizada=true",
                }
        except ImportError:
            if not autorizada:
                return {"ok": False, "status": "SEM_CONTRATO", "motivo": "autorizada=False"}

        if acao_n == "consolidar_diagnostico":
            return self._persistir_evolucao("consolidar_diagnostico", self.diagnosticar(), comando)
        if acao_n == "registrar_capacidade_stub":
            return self._registrar_capacidade_estrutural(capacidade_alvo or "", comando=comando)
        if acao_n == "marcar_saude":
            return self._marcar_saude_modulos()
        if acao_n == "aplicar_plano":
            return self._aplicar_plano_estrutural(
                plano_id=plano_id, capacidade_alvo=capacidade_alvo, comando=comando
            )

        return {
            "ok": False, "status": "ACAO_DESCONHECIDA", "acao": acao_n,
            "acoes_suportadas": [
                "diagnosticar", "propor", "consolidar_diagnostico",
                "registrar_capacidade_stub", "marcar_saude", "aplicar_plano",
            ],
        }

    def _checar_modulos(self) -> List[Dict[str, Any]]:
        resultados = []
        for modulo, simbolo in _MODULOS_NUCLEO:
            entrada: Dict[str, Any] = {"modulo": modulo, "simbolo": simbolo, "status": "OK"}
            try:
                mod = importlib.import_module(modulo)
                obj = getattr(mod, simbolo, None)
                if obj is None:
                    entrada["status"] = "SIMBOLO_AUSENTE"
                else:
                    entrada["tipo"] = type(obj).__name__
                    if inspect.isclass(obj):
                        entrada["instanciavel"] = True
            except Exception as e:
                entrada["status"] = "FALHA"
                entrada["erro"] = str(e)
            resultados.append(entrada)
        return resultados

    def _status_soberania(self) -> Dict[str, Any]:
        try:
            from core.soberania import contrato_soberania
            return contrato_soberania.status()
        except Exception as e:
            return {"ok": False, "erro": str(e)}

    def _status_memoria(self) -> Dict[str, Any]:
        try:
            from core.memoria import memoria_canonica
            return memoria_canonica.estatisticas()
        except Exception as e:
            return {"ok": False, "erro": str(e)}

    def _gerar_passos_plano(self, cid: str, lacuna: Optional[Dict], comando: str) -> List[Dict[str, Any]]:
        passos = [
            {"ordem": 1, "acao": "classificar_regime", "descricao": "AUTO / SUPERVISIONADO / AUTORIZADO"},
            {"ordem": 2, "acao": "mapear_implementadores", "descricao": f"Candidatos para {cid}"},
            {"ordem": 3, "acao": "definir_contrato_usb", "descricao": "USB sob pode_alterar_nucleo=False"},
            {"ordem": 4, "acao": "registrar_capacidade", "descricao": "Atualizar registro formal"},
            {"ordem": 5, "acao": "testar_ciclo", "descricao": "Ciclo Ruflo de validação"},
            {"ordem": 6, "acao": "consolidar_memoria", "descricao": "Memória canônica namespace=evolucao"},
        ]
        if comando:
            passos.insert(1, {"ordem": 1.5, "acao": "comando", "descricao": comando[:200]})
        return passos

    def _registrar_capacidade_estrutural(self, capacidade_id: str, *, comando: str = "") -> Dict[str, Any]:
        cid = str(capacidade_id or "").upper().strip()
        if not cid:
            return {"ok": False, "status": "CAPACIDADE_INVALIDA"}
        try:
            from core.registro_capacidades import registro_capacidades
            r = registro_capacidades.registrar(
                cid,
                descricao=f"Registrada via auto-evolução: {comando or cid}",
                risco="MEDIO", exige_autorizacao=False,
                implementadores=["auto_evolucao"],
                tags=["evolucao", "auto"], origem="auto_evolucao",
            )
            return self._persistir_evolucao("registrar_capacidade_stub", r, comando)
        except Exception as e:
            return {"ok": False, "status": "FALHA_REGISTRO", "erro": str(e)}

    def _marcar_saude_modulos(self) -> Dict[str, Any]:
        try:
            from ruflo.politica import registrar_saude
            modulos = self._checar_modulos()
            for m in modulos:
                ok = m.get("status") == "OK"
                registrar_saude(
                    m["modulo"].replace(".", "_").upper(),
                    ok=ok, detalhe=m.get("erro") or m.get("status", ""),
                )
            return {"ok": True, "status": "SAUDE_ATUALIZADA", "modulos": modulos}
        except Exception as e:
            return {"ok": False, "status": "FALHA_SAUDE", "erro": str(e)}

    def _aplicar_plano_estrutural(self, *, plano_id: Optional[str] = None,
                                  capacidade_alvo: Optional[str] = None,
                                  comando: str = "") -> Dict[str, Any]:
        plano = None
        if plano_id:
            try:
                from core.memoria import memoria_canonica
                plano = memoria_canonica.recuperar(f"plano:{plano_id}", namespace="evolucao")
            except Exception:
                pass
        cid = (capacidade_alvo or (plano or {}).get("capacidade_alvo") or "").upper()
        resultados = []
        if cid:
            resultados.append({"passo": "registrar_capacidade",
                               "resultado": self._registrar_capacidade_estrutural(cid, comando=comando)})
        resultados.append({"passo": "marcar_saude", "resultado": self._marcar_saude_modulos()})
        resumo = {
            "ok": True, "status": "PLANO_APLICADO_ESTRUTURAL",
            "plano_id": plano_id, "capacidade_alvo": cid or None,
            "comando": comando or None, "resultados": resultados,
            "limite": "Estrutural apenas. Código-fonte do repo continua sob PR humano.",
            "timestamp": _utcnow(),
        }
        return self._persistir_evolucao("aplicar_plano", resumo, comando)

    def _persistir_evolucao(self, acao: str, payload: Dict[str, Any], comando: str = "") -> Dict[str, Any]:
        registro = {**payload, "acao_evolucao": acao, "comando_operador": comando or None,
                    "persistido_em": _utcnow()}
        try:
            from core.memoria import memoria_canonica
            memoria_canonica.guardar(
                f"evolucao:{acao}:{uuid.uuid4().hex[:8]}", registro,
                namespace="evolucao", origem="auto_evolucao",
            )
        except Exception:
            pass
        self._registrar_historico(acao.upper(), registro)
        return registro

    def _registrar_historico(self, tipo: str, detalhe: Dict[str, Any]) -> None:
        self.historico_local.append({
            "tipo": tipo, "timestamp": _utcnow(),
            "resumo": {k: detalhe.get(k) for k in ("status", "saude_geral", "plano_id", "ok") if k in detalhe},
        })
        if len(self.historico_local) > 100:
            self.historico_local = self.historico_local[-100:]

    def status(self) -> Dict[str, Any]:
        return {
            "motor": "AUTO_EVOLUCAO",
            "versao": self.versao,
            "historico_local": len(self.historico_local),
            "principio": "99,99% AUTO/SUPERVISIONADO. Núcleo soberano no 0,01%.",
        }


motor_auto_evolucao = MotorAutoEvolucao()
