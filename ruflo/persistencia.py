"""
SOUSA 2.0 — Persistência de ciclos (Ruflo)

Armazena ciclos em JSON no disco para sobreviver entre execuções.
Estrutura pronta para futura sincronização com Drive / memória SOUSA.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


# Diretório padrão: data/ciclos/ na raiz do repo (ou SOUSA_DATA_DIR)
def _data_dir() -> Path:
    base = os.getenv("SOUSA_DATA_DIR")
    if base:
        root = Path(base)
    else:
        # ruflo/ -> repo root
        root = Path(__file__).resolve().parent.parent / "data"
    path = root / "ciclos"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _ciclo_path(ciclo_id: str) -> Path:
    # Sanitiza ID para nome de arquivo seguro
    safe = "".join(c for c in ciclo_id if c.isalnum() or c in "_-.")
    return _data_dir() / f"{safe}.json"


def _index_path() -> Path:
    return _data_dir() / "_index.json"


def _load_index() -> Dict[str, Any]:
    p = _index_path()
    if not p.exists():
        return {"ciclos": [], "atualizado": None}
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {"ciclos": [], "atualizado": None}


def _save_index(index: Dict[str, Any]) -> None:
    index["atualizado"] = datetime.now(timezone.utc).isoformat()
    with open(_index_path(), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2, default=str)


def salvar_ciclo(ciclo: Dict[str, Any]) -> Dict[str, Any]:
    """Persiste um ciclo completo. Retorna metadados do save."""
    if not ciclo or not ciclo.get("id"):
        return {"ok": False, "status": "CICLO_INVALIDO"}

    ciclo_id = ciclo["id"]
    path = _ciclo_path(ciclo_id)

    # Snapshot serializável
    snapshot = dict(ciclo)
    snapshot["_persistido_em"] = datetime.now(timezone.utc).isoformat()

    with open(path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2, default=str)

    # Atualiza índice
    index = _load_index()
    entrada = {
        "id": ciclo_id,
        "estado": ciclo.get("estado"),
        "capacidade": ciclo.get("capacidade"),
        "inicio": ciclo.get("inicio"),
        "arquivo": path.name,
    }
    # Remove entrada antiga do mesmo id e reinsere
    index["ciclos"] = [c for c in index.get("ciclos", []) if c.get("id") != ciclo_id]
    index["ciclos"].insert(0, entrada)
    # Mantém índice enxuto (últimos 500)
    index["ciclos"] = index["ciclos"][:500]
    _save_index(index)

    return {
        "ok": True,
        "status": "PERSISTIDO",
        "id": ciclo_id,
        "path": str(path),
    }


def carregar_ciclo(ciclo_id: str) -> Optional[Dict[str, Any]]:
    """Carrega um ciclo pelo ID."""
    path = _ciclo_path(ciclo_id)
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def listar_ciclos(
    estado: Optional[str] = None,
    limite: int = 50,
) -> List[Dict[str, Any]]:
    """Lista ciclos do índice (mais recentes primeiro)."""
    index = _load_index()
    itens = index.get("ciclos", [])
    if estado:
        itens = [c for c in itens if c.get("estado") == estado]
    return itens[: max(1, limite)]


def carregar_todos_em_memoria(limite: int = 100) -> Dict[str, Dict[str, Any]]:
    """
    Carrega os N ciclos mais recentes para a memória do orquestrador.
    Útil no __init__ para retomar contexto.
    """
    resultado: Dict[str, Dict[str, Any]] = {}
    for meta in listar_ciclos(limite=limite):
        cid = meta.get("id")
        if not cid:
            continue
        ciclo = carregar_ciclo(cid)
        if ciclo:
            resultado[cid] = ciclo
    return resultado


def estatisticas() -> Dict[str, Any]:
    """Resumo da persistência."""
    index = _load_index()
    ciclos = index.get("ciclos", [])
    por_estado: Dict[str, int] = {}
    for c in ciclos:
        e = c.get("estado") or "DESCONHECIDO"
        por_estado[e] = por_estado.get(e, 0) + 1

    return {
        "total_indexados": len(ciclos),
        "por_estado": por_estado,
        "diretorio": str(_data_dir()),
        "atualizado": index.get("atualizado"),
    }
