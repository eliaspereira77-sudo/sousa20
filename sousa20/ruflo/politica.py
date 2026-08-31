"""
SOUSA 2.0 — Política de governança (capacidade + alto risco)

Implementação Python alinhada ao motor de política do pacote oficial
e ao princípio de evolução por valor comprovado.

Agora consulta o Registro Formal de Capacidades quando disponível,
sem alterar o comportamento padrão da inferência existente.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


_CAPACIDADE_REGRAS = [
    (re.compile(r"auto[-_ ]?evolu|evoluir|adapta(r|ção)|lacuna|capacidade falt", re.I), "AUTO_EVOLUCAO"),
    (re.compile(r"auto[-_ ]?manuten|diagn[oó]stico|sa[uú]de do sistema|manuten[cç][aã]o", re.I), "AUTO_MANUTENCAO"),
    (re.compile(r"auto[-_ ]?corre[cç]|corrigir bug|consertar|reparar", re.I), "AUTO_CORRECAO"),
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


def capacidade_exige_autorizacao(capacidade_id: str) -> bool:
    try:
        from core.registro_capacidades import registro_capacidades
        return registro_capacidades.exige_autorizacao(capacidade_id)
    except ImportError:
        return False


def precisa_autorizacao(sinal: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if not sinal or not isinstance(sinal, dict):
        return {"necessaria": False, "motivo": None}

    capacidade = sinal.get("capacidade")
    if capacidade and capacidade_exige_autorizacao(str(capacidade)):
        return {
            "necessaria": True,
            "motivo": sinal.get("motivo") or "CAPACIDADE_EXIGE_AUTORIZACAO",
            "sinal": sinal,
        }

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


_SAUDE: Dict[str, Dict[str, Any]] = {}
_COOLDOWN: Dict[str, Dict[str, Any]] = {}


def registrar_saude(recurso_id: str, ok: bool = True, detalhe: str = "") -> Dict[str, Any]:
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


def selecionar_recurso(
    capacidade: str,
    candidatos: Optional[List[Dict[str, Any]]] = None,
    contexto: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    cap = str(capacidade or "TEXTO").upper()
    contexto = contexto or {}

    if not candidatos:
        try:
            from core.registro_capacidades import registro_capacidades
            candidatos = registro_capacidades.candidatos_para_politica(cap)
        except ImportError:
            candidatos = []

    candidatos = candidatos or []

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
    excluir = {str(x).upper() for x in (excluir_ids or [])}
    filtrados = [c for c in (candidatos or []) if str(c.get("id", "")).upper() not in excluir]
    return selecionar_recurso(capacidade, candidatos=filtrados)
