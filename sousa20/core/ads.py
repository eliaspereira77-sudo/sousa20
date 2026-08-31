"""
SOUSA 2.0 — Módulo ADS (Analista e Desenvolvedor de Sistemas)

Núcleo de engenharia para diagnóstico, planejamento, validação e memória técnica.
Alterações de código e operações externas continuam sujeitas à soberania e à aprovação.
"""

from __future__ import annotations

import ast
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid


VERSAO_ADS = "0.1.0-nucleo"


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class ADS:
    """Analista e Desenvolvedor de Sistemas da SOUSA IA."""

    nome = "ADS"
    identidade = (
        "Analista de Sistemas, cientista da computação, arquiteto e desenvolvedor "
        "de software, profissional de TI e instrutor de hardware."
    )

    def __init__(self) -> None:
        self.versao = VERSAO_ADS
        self.historico_local: List[Dict[str, Any]] = []

    def status(self) -> Dict[str, Any]:
        return {
            "modulo": self.nome,
            "versao": self.versao,
            "identidade": self.identidade,
            "capacidades": [
                "analise_de_sistemas",
                "arquitetura_de_software",
                "desenvolvimento",
                "diagnostico",
                "correcao_supervisionada",
                "autorreparo_com_rollback",
                "autoconstrução_governada",
                "memoria_tecnica",
                "escrita_e_edicao",
                "preparacao_editorial",
                "hardware_e_ti",
            ],
            "historico_local": len(self.historico_local),
            "limite": "Alterações sensíveis exigem soberania, validação e autorização.",
        }

    def diagnosticar(self) -> Dict[str, Any]:
        """Executa o diagnóstico oficial já existente e o identifica como ADS."""
        try:
            from core.auto_evolucao import motor_auto_evolucao

            resultado = motor_auto_evolucao.diagnosticar()
        except Exception as exc:
            resultado = {
                "ok": False,
                "tipo": "DIAGNOSTICO_ADS",
                "saude_geral": "FALHA",
                "erro": str(exc),
            }
        resultado = {**resultado, "modulo_responsavel": self.nome}
        self._registrar_local("DIAGNOSTICO", resultado)
        return resultado

    def planejar_correcao(
        self,
        componente: str,
        problema: str,
        *,
        evidencias: Optional[List[str]] = None,
        risco: str = "MEDIO",
        comando_usuario: str = "",
    ) -> Dict[str, Any]:
        """Cria um plano rastreável; não altera arquivos nem executa ações."""
        componente_n = str(componente or "").strip()
        problema_n = str(problema or "").strip()
        if not componente_n or not problema_n:
            return {"ok": False, "status": "DADOS_INSUFICIENTES"}
        risco_n = str(risco or "MEDIO").upper()
        if risco_n not in {"BAIXO", "MEDIO", "ALTO"}:
            risco_n = "MEDIO"
        plano = {
            "ok": True,
            "status": "PLANO_CRIADO",
            "plano_id": f"ADS_{uuid.uuid4().hex[:10]}",
            "modulo": self.nome,
            "componente": componente_n,
            "problema": problema_n,
            "evidencias": list(evidencias or []),
            "risco": risco_n,
            "comando_usuario": comando_usuario or None,
            "etapas": [
                "reproduzir_falha",
                "identificar_causa_raiz",
                "criar_snapshot",
                "implementar_em_isolamento",
                "validar_sintaxe_e_testes",
                "submeter_para_revisao_e_autorizacao",
                "promover_ou_fazer_rollback",
                "registrar_memoria_tecnica",
            ],
            "criado_em": _utcnow(),
        }
        self._registrar_local("PLANO_CORRECAO", plano)
        self._persistir_memoria("plano:" + plano["plano_id"], plano, "planejamento")
        return plano

    def validar_sintaxe(self, caminho: str) -> Dict[str, Any]:
        """Valida sintaxe Python/JSON sem executar o arquivo analisado."""
        path = Path(caminho)
        resultado: Dict[str, Any] = {
            "ok": False,
            "modulo": self.nome,
            "arquivo": str(path),
            "verificacao": "sintaxe_sem_execucao",
        }
        if not path.is_file():
            resultado["status"] = "ARQUIVO_NAO_ENCONTRADO"
            return resultado
        try:
            conteudo = path.read_text(encoding="utf-8")
            if path.suffix.lower() == ".py":
                ast.parse(conteudo, filename=str(path))
            elif path.suffix.lower() == ".json":
                json.loads(conteudo)
            else:
                resultado.update({"ok": True, "status": "NAO_APLICAVEL", "extensao": path.suffix})
                self._registrar_local("VALIDACAO_SINTAXE", resultado)
                return resultado
            resultado.update({"ok": True, "status": "SINTAXE_OK", "linhas": conteudo.count("\n") + 1})
        except (SyntaxError, json.JSONDecodeError) as exc:
            resultado.update({"status": "SINTAXE_INVALIDA", "erro": str(exc)})
        except (OSError, UnicodeError) as exc:
            resultado.update({"status": "FALHA_LEITURA", "erro": str(exc)})
        self._registrar_local("VALIDACAO_SINTAXE", resultado)
        return resultado

    def registrar_memoria_tecnica(
        self,
        titulo: str,
        conteudo: Any,
        *,
        tags: Optional[List[str]] = None,
        origem: str = "ads",
    ) -> Dict[str, Any]:
        """Registra uma decisão, incidente ou evolução na memória canônica."""
        chave = f"tecnica:{str(titulo or 'sem_titulo').strip()}"
        payload = {
            "titulo": titulo,
            "conteudo": conteudo,
            "tags": list(tags or []),
            "registrado_em": _utcnow(),
            "modulo": self.nome,
        }
        return self._persistir_memoria(chave, payload, origem)

    def _persistir_memoria(self, chave: str, payload: Dict[str, Any], origem: str) -> Dict[str, Any]:
        try:
            from core.memoria import memoria_canonica

            salvo = memoria_canonica.guardar(
                chave,
                payload,
                namespace="memoria_tecnica",
                origem=origem,
            )
            return {"ok": True, "status": "MEMORIA_REGISTRADA", "chave": chave, "resultado": salvo}
        except Exception as exc:
            return {"ok": False, "status": "MEMORIA_INDISPONIVEL", "chave": chave, "erro": str(exc)}

    def _registrar_local(self, tipo: str, detalhe: Dict[str, Any]) -> None:
        self.historico_local.append({"tipo": tipo, "timestamp": _utcnow(), "detalhe": detalhe})
        if len(self.historico_local) > 100:
            self.historico_local = self.historico_local[-100:]


ads = ADS()
