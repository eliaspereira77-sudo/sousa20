"""
SOUSA 2.0 — Registro Formal de Capacidades

Catálogo único e auditável. Inclui meta-capacidades de expansão externa.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


_CAPACIDADES_BASE: Dict[str, Dict[str, Any]] = {
    "TEXTO": {
        "id": "TEXTO",
        "descricao": "Geração e processamento de texto",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": ["sousa_ia", "usb_enriquecimento", "gemini"],
        "tags": ["linguagem", "chat"],
    },
    "ANALISE": {
        "id": "ANALISE",
        "descricao": "Análise, comparação e decisão",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": ["sousa_ia", "usb_enriquecimento"],
        "tags": ["raciocinio", "decisao"],
    },
    "CODIGO": {
        "id": "CODIGO",
        "descricao": "Geração, revisão e correção de código",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["sousa_ia"],
        "tags": ["programacao", "dev"],
    },
    "BUSCA_MEMORIA": {
        "id": "BUSCA_MEMORIA",
        "descricao": "Consulta à memória canônica",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": ["memoria_canonica", "sousa_ia"],
        "tags": ["memoria", "recall"],
    },
    "IMAGEM": {
        "id": "IMAGEM",
        "descricao": "Geração ou análise de imagem",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": [],
        "tags": ["multimidia", "visual"],
    },
    "VIDEO": {
        "id": "VIDEO",
        "descricao": "Geração ou edição de vídeo",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": [],
        "tags": ["multimidia", "video"],
    },
    "AUDIO": {
        "id": "AUDIO",
        "descricao": "Áudio, voz e narração",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["voice"],
        "tags": ["multimidia", "voz"],
    },
    "DOCUMENTO_PDF": {
        "id": "DOCUMENTO_PDF",
        "descricao": "Geração de documentos e relatórios",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": [],
        "tags": ["documento"],
    },
    "PRODUCAO_LIVRO": {
        "id": "PRODUCAO_LIVRO",
        "descricao": "Escrita longa e narrativa",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": ["sousa_ia"],
        "tags": ["escrita", "longo"],
    },
    "VOZ_CLONADA": {
        "id": "VOZ_CLONADA",
        "descricao": "Síntese com voz clonada do fundador",
        "risco": "ALTO",
        "exige_autorizacao": True,
        "implementadores": ["voice"],
        "tags": ["voz", "identidade"],
    },
    "AVATAR": {
        "id": "AVATAR",
        "descricao": "Geração e controle de avatar multilíngue",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["avatar"],
        "tags": ["avatar", "multimidia"],
    },
    "DISTRIBUICAO": {
        "id": "DISTRIBUICAO",
        "descricao": "Publicação multi-canal / multi-região",
        "risco": "MEDIO",
        "exige_autorizacao": True,
        "implementadores": ["distribution"],
        "tags": ["publicacao", "canais"],
    },
    "AUTO_MANUTENCAO": {
        "id": "AUTO_MANUTENCAO",
        "descricao": "Diagnóstico e manutenção interna sob política de automação",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["auto_evolucao", "equipe_manutencao"],
        "tags": ["manutencao", "saude", "evolucao"],
    },
    "AUTO_CORRECAO": {
        "id": "AUTO_CORRECAO",
        "descricao": "Detecção e correção estrutural de falhas",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["auto_evolucao", "equipe_manutencao"],
        "tags": ["correcao", "bugs", "evolucao"],
    },
    "AUTO_EVOLUCAO": {
        "id": "AUTO_EVOLUCAO",
        "descricao": "Adaptação e evolução estrutural de capacidades",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["auto_evolucao"],
        "tags": ["evolucao", "adaptacao", "lacunas"],
    },
    # Meta-capacidades de expansão externa (adaptadas ao SOUSA)
    "DESCOBERTA_CAPACIDADE": {
        "id": "DESCOBERTA_CAPACIDADE",
        "descricao": "Descoberta de fontes externas para capacidades SOUSA",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": ["operacoes_externas"],
        "tags": ["expansao", "externo", "descoberta"],
    },
    "AMPLIACAO_CAPACIDADE": {
        "id": "AMPLIACAO_CAPACIDADE",
        "descricao": "Ampliação de capacidade existente com novo implementador externo",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["operacoes_externas"],
        "tags": ["expansao", "externo", "ampliacao"],
    },
    "ADAPTACAO_EXTERNA": {
        "id": "ADAPTACAO_EXTERNA",
        "descricao": "Contrato de adaptação de fonte externa ao modelo USB do SOUSA",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["operacoes_externas"],
        "tags": ["expansao", "externo", "adaptacao", "usb"],
    },
    "INTEGRACAO_CAPACIDADE": {
        "id": "INTEGRACAO_CAPACIDADE",
        "descricao": "Registro e integração de capacidade nova via fonte externa",
        "risco": "MEDIO",
        "exige_autorizacao": False,
        "implementadores": ["operacoes_externas"],
        "tags": ["expansao", "externo", "integracao"],
    },
    "MAPEAR_LACUNAS": {
        "id": "MAPEAR_LACUNAS",
        "descricao": "Mapeamento de lacunas de capacidade e oportunidades externas",
        "risco": "BAIXO",
        "exige_autorizacao": False,
        "implementadores": ["operacoes_externas", "auto_evolucao"],
        "tags": ["expansao", "lacunas", "diagnostico"],
    },
}


class RegistroCapacidades:
    """Catálogo formal de capacidades do SOUSA 2.0."""

    def __init__(self):
        self._capacidades: Dict[str, Dict[str, Any]] = {}
        self._historico: List[Dict[str, Any]] = []
        for cap_id, meta in _CAPACIDADES_BASE.items():
            self._capacidades[cap_id] = {
                **meta,
                "registrada_em": _utcnow(),
                "origem": "nucleo",
                "ativa": True,
            }

    def registrar(
        self,
        capacidade_id: str,
        *,
        descricao: str = "",
        risco: str = "BAIXO",
        exige_autorizacao: bool = False,
        implementadores: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        origem: str = "usb",
    ) -> Dict[str, Any]:
        cid = str(capacidade_id or "").upper().strip()
        if not cid:
            return {"ok": False, "status": "ID_INVALIDO"}

        risco_n = str(risco or "BAIXO").upper()
        if risco_n not in ("BAIXO", "MEDIO", "ALTO"):
            risco_n = "BAIXO"

        entrada = {
            "id": cid,
            "descricao": descricao or cid,
            "risco": risco_n,
            "exige_autorizacao": bool(exige_autorizacao),
            "implementadores": list(implementadores or []),
            "tags": list(tags or []),
            "registrada_em": _utcnow(),
            "origem": origem,
            "ativa": True,
        }

        if cid in self._capacidades and self._capacidades[cid].get("origem") == "nucleo":
            atual = self._capacidades[cid]
            novos_impl = set(atual.get("implementadores") or []) | set(implementadores or [])
            novas_tags = set(atual.get("tags") or []) | set(tags or [])
            atual["implementadores"] = sorted(novos_impl)
            atual["tags"] = sorted(novas_tags)
            atual["atualizada_em"] = _utcnow()
            self._log("CAPACIDADE_ATUALIZADA", {"id": cid, "origem": origem})
            return {"ok": True, "status": "ATUALIZADA", "capacidade": atual}

        self._capacidades[cid] = entrada
        self._log("CAPACIDADE_REGISTRADA", {"id": cid, "origem": origem})
        return {"ok": True, "status": "REGISTRADA", "capacidade": entrada}

    def obter(self, capacidade_id: str) -> Optional[Dict[str, Any]]:
        return self._capacidades.get(str(capacidade_id or "").upper())

    def listar(
        self,
        *,
        apenas_ativas: bool = True,
        risco: Optional[str] = None,
        tag: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        out = []
        for cap in self._capacidades.values():
            if apenas_ativas and not cap.get("ativa", True):
                continue
            if risco and str(cap.get("risco", "")).upper() != str(risco).upper():
                continue
            if tag and tag.lower() not in [t.lower() for t in (cap.get("tags") or [])]:
                continue
            out.append(cap)
        return sorted(out, key=lambda c: c["id"])

    def exige_autorizacao(self, capacidade_id: str) -> bool:
        cap = self.obter(capacidade_id)
        if not cap:
            return False
        return bool(cap.get("exige_autorizacao")) or str(cap.get("risco", "")).upper() == "ALTO"

    def implementadores(self, capacidade_id: str) -> List[str]:
        cap = self.obter(capacidade_id)
        return list(cap.get("implementadores") or []) if cap else []

    def candidatos_para_politica(
        self,
        capacidade_id: str,
        recursos_disponiveis: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        cap = self.obter(capacidade_id)
        if not cap:
            return recursos_disponiveis or []

        implementadores = set(cap.get("implementadores") or [])
        if not recursos_disponiveis:
            return [
                {"id": impl.upper(), "prioridade": 50, "capacidades": [cap["id"]]}
                for impl in implementadores
            ]

        filtrados = []
        for r in recursos_disponiveis:
            rid = str(r.get("id") or "").upper()
            caps = [str(c).upper() for c in (r.get("capacidades") or [])]
            if cap["id"] in caps or "*" in caps or rid in {i.upper() for i in implementadores}:
                filtrados.append(r)
        return filtrados

    def desativar(self, capacidade_id: str, motivo: str = "") -> Dict[str, Any]:
        cid = str(capacidade_id or "").upper()
        if cid not in self._capacidades:
            return {"ok": False, "status": "NAO_ENCONTRADA"}
        if self._capacidades[cid].get("origem") == "nucleo":
            return {"ok": False, "status": "CAPACIDADE_DO_NUCLEO_NAO_DESATIVAVEL"}
        self._capacidades[cid]["ativa"] = False
        self._capacidades[cid]["desativada_em"] = _utcnow()
        self._capacidades[cid]["motivo_desativacao"] = motivo or "POLITICA"
        self._log("CAPACIDADE_DESATIVADA", {"id": cid, "motivo": motivo})
        return {"ok": True, "capacidade": self._capacidades[cid]}

    def status(self) -> Dict[str, Any]:
        ativas = [c for c in self._capacidades.values() if c.get("ativa", True)]
        return {
            "total": len(self._capacidades),
            "ativas": len(ativas),
            "por_risco": {
                "BAIXO": sum(1 for c in ativas if c.get("risco") == "BAIXO"),
                "MEDIO": sum(1 for c in ativas if c.get("risco") == "MEDIO"),
                "ALTO": sum(1 for c in ativas if c.get("risco") == "ALTO"),
            },
            "capacidades": [c["id"] for c in sorted(ativas, key=lambda x: x["id"])],
            "expansao_externa": [
                c["id"] for c in ativas
                if "expansao" in [t.lower() for t in (c.get("tags") or [])]
            ],
        }

    def _log(self, tipo: str, detalhe: Dict[str, Any]) -> None:
        self._historico.append(
            {"tipo": tipo, "detalhe": detalhe, "timestamp": _utcnow()}
        )
        if len(self._historico) > 100:
            self._historico = self._historico[-100:]


registro_capacidades = RegistroCapacidades()
