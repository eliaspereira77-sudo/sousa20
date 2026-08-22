"""
SOUSA 2.0 — Política de governança (capacidade + alto risco)

Implementação Python alinhada ao motor de política do pacote oficial
e ao princípio de evolução por valor comprovado.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Inferência de capacidade
# ---------------------------------------------------------------------------

_CAPACIDADE_REGRAS = [
    (re.compile(r"c[oó]digo|code|fun[cç][aã]o|bug|script|\bjs\b|python", re.I), "CODIGO"),
    (re.compile(r"cap[ií]tulo|livro|romance|escreva|continue a hist[oó]ria", re.I), "PRODUCAO_LIVRO"),
    (re.compile(r"imagem|ilustr|capa|desenho", re.I), "IMAGEM"),
    (re.compile(r"v[ií]deo|video|roteiro|cena", re.I), "VIDEO"),
    (re.compile(r"[aá]udio|audio|voz|narra[cç][aã]o", re.I), "AUDIO"),
    (re.compile(r"pdf|relat[oó]rio|documento oficial", re.I), "DOCUMENTO_PDF"),
    (re.compile(r"analis|compar|decid|estrat[eé]g", re.I), "ANALISE"),
    (re.compile(r"mem[oó]ria|buscar|lembrar|embedding", re.I), "BUSCA_MEMORIA"),
]


def inferir_capacidade(texto: str) -> str:
    """Infere a capacidade a partir do texto da intenção."""
    t = str(texto or "")
    for padrao, capacidade in _CAPACIDADE_REGRAS:
        if padrao.search(t):
            return capacidade
    return "TEXTO"


# ---------------------------------------------------------------------------
# Alto risco / autorização
# ---------------------------------------------------------------------------

def precisa_autorizacao(sinal: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Avalia se a ação exige autorização de governança.

    Sinais de alto risco:
      - risco == "ALTO"
      - irreversivel == True
      - altera_nucleo == True
      - exige_credencial == True
    """
    if not sinal or not isinstance(sinal, dict):
        return {"necessaria": False, "motivo": None}

    alto_risco = (
        sinal.get("risco") == "ALTO"
        or sinal.get("irreversivel") is True
        or sinal.get("altera_nucleo") is True
        or sinal.get("exige_credencial") is True
    )

    return {
        "necessaria": bool(alto_risco),
        "motivo": (sinal.get("motivo") or "POLITICA_DE_GOVERNANCA") if alto_risco else None,
        "sinal": sinal if alto_risco else None,
    }


# ---------------------------------------------------------------------------
# Saúde e cooldown (estrutura pronta para conectores)
# ---------------------------------------------------------------------------

_SAUDE: Dict[str, Dict[str, Any]] = {}
_COOLDOWN: Dict[str, Dict[str, Any]] = {}


def registrar_saude(recurso_id: str, ok: bool = True, detalhe: str = "") -> Dict[str, Any]:
    """Atualiza o registro de saúde de um recurso/USB."""
    rid = str(recurso_id).upper()
    atual = _SAUDE.get(rid, {"falhas_consecutivas": 0})
    if ok:
        falhas = 0
    else:
        falhas = atual.get("falhas_consecutivas", 0) + 1

    registro = {
        "ok": ok,
        "falhas_consecutivas": falhas,
        "ultima_checagem": datetime.now(timezone.utc).isoformat(),
        "detalhe": detalhe or ("OK" if ok else "Falha registrada"),
    }
    _SAUDE[rid] = registro
    return registro


def consultar_saude(recurso_id: str) -> Dict[str, Any]:
    rid = str(recurso_id).upper()
    return _SAUDE.get(rid, {"ok": True, "falhas_consecutivas": 0, "status": "SAUDE_DESCONHECIDA"})


def em_cooldown(recurso_id: str) -> bool:
    """Retorna True se o recurso ainda está em cooldown."""
    rid = str(recurso_id).upper()
    cd = _COOLDOWN.get(rid)
    if not cd:
        return False
    ate = cd.get("ate")
    if ate and datetime.now(timezone.utc).timestamp() < ate:
        return True
    _COOLDOWN.pop(rid, None)
    return False


def aplicar_cooldown(recurso_id: str, duracao_segundos: int = 60, motivo: str = "") -> None:
    rid = str(recurso_id).upper()
    _COOLDOWN[rid] = {
        "ate": datetime.now(timezone.utc).timestamp() + max(0, duracao_segundos),
        "motivo": motivo or "COOLDOWN",
        "desde": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Seleção de recurso (estrutura; lista real virá do registry de USBs)
# ---------------------------------------------------------------------------

def selecionar_recurso(
    capacidade: str,
    candidatos: Optional[List[Dict[str, Any]]] = None,
    contexto: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Seleciona o melhor recurso disponível para a capacidade.

    candidatos: lista de dicts com pelo menos {id, prioridade?, capacidades?}
    Se não houver candidatos, retorna SEM_RECURSO (estrutura pronta para registry).
    """
    cap = str(capacidade or "TEXTO").upper()
    candidatos = candidatos or []
    contexto = contexto or {}

    validos = []
    for c in candidatos:
        cid = str(c.get("id") or "").upper()
        if not cid:
            continue
        if em_cooldown(cid):
            continue
        saude = consultar_saude(cid)
        if saude.get("ok") is False and saude.get("falhas_consecutivas", 0) >= 3:
            continue
        caps = [str(x).upper() for x in (c.get("capacidades") or [])]
        if caps and cap not in caps and "*" not in caps:
            continue
        validos.append(c)

    if not validos:
        return {
            "ok": False,
            "status": "SEM_RECURSO",
            "capacidade": cap,
            "mensagem": "Nenhum recurso disponível (ou todos em cooldown/indisponíveis) para a capacidade solicitada.",
        }

    validos.sort(key=lambda x: x.get("prioridade", 100))
    escolhido = validos[0]

    return {
        "ok": True,
        "origem": "POLITICA",
        "capacidade": cap,
        "recurso_escolhido": escolhido.get("id"),
        "recurso": escolhido,
        "politica": "PRIORIDADE_SAUDE_COOLDOWN",
    }


def proximo_fallback(
    capacidade: str,
    excluir_ids: Optional[List[str]] = None,
    candidatos: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Retorna o próximo recurso válido excluindo os já tentados."""
    excluir = {str(x).upper() for x in (excluir_ids or [])}
    filtrados = [c for c in (candidatos or []) if str(c.get("id", "")).upper() not in excluir]
    return selecionar_recurso(capacidade, candidatos=filtrados)
