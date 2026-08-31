"""
SOUSA 2.0 — Memória Canônica Persistente

Domínio protegido do núcleo (memoria_canonica).
Torna a memória durável sem alterar a interface existente de SousaIA.
USBs e Ruflo podem ler/escrever apenas sob validação de soberania.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Caminho padrão (relativo à raiz do projeto)
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "memoria.db"


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class MemoriaCanonica:
    """
    Memória canônica do SOUSA 2.0.

    - Persistência em SQLite (WAL)
    - Busca por chave exata e busca textual (FTS5)
    - Namespaces (ex.: ciclo, usb, sistema, padroes)
    - Compatível com remember/recall existentes e com app.py (status/lembrar)
    """

    def __init__(self, db_path: Optional[Path | str] = None):
        self.db_path = Path(db_path) if db_path else DEFAULT_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn: Optional[sqlite3.Connection] = None
        self._ensure_schema()

    # ------------------------------------------------------------------
    # Conexão e schema
    # ------------------------------------------------------------------

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(
                str(self.db_path),
                check_same_thread=False,
                isolation_level=None,  # autocommit
            )
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA synchronous=NORMAL")
        return self._conn

    def _ensure_schema(self) -> None:
        conn = self._get_conn()
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS memoria (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                namespace   TEXT NOT NULL DEFAULT 'default',
                chave       TEXT NOT NULL,
                valor       TEXT NOT NULL,
                tipo        TEXT NOT NULL DEFAULT 'json',
                origem      TEXT,
                ciclo_id    TEXT,
                criado_em   TEXT NOT NULL,
                atualizado_em TEXT NOT NULL,
                UNIQUE(namespace, chave)
            );

            CREATE INDEX IF NOT EXISTS idx_memoria_ns_chave
                ON memoria(namespace, chave);

            CREATE INDEX IF NOT EXISTS idx_memoria_ciclo
                ON memoria(ciclo_id);

            CREATE VIRTUAL TABLE IF NOT EXISTS memoria_fts USING fts5(
                namespace,
                chave,
                valor,
                content='memoria',
                content_rowid='id'
            );

            -- Triggers para manter FTS sincronizado
            CREATE TRIGGER IF NOT EXISTS memoria_ai AFTER INSERT ON memoria BEGIN
                INSERT INTO memoria_fts(rowid, namespace, chave, valor)
                VALUES (new.id, new.namespace, new.chave, new.valor);
            END;

            CREATE TRIGGER IF NOT EXISTS memoria_ad AFTER DELETE ON memoria BEGIN
                INSERT INTO memoria_fts(memoria_fts, rowid, namespace, chave, valor)
                VALUES ('delete', old.id, old.namespace, old.chave, old.valor);
            END;

            CREATE TRIGGER IF NOT EXISTS memoria_au AFTER UPDATE ON memoria BEGIN
                INSERT INTO memoria_fts(memoria_fts, rowid, namespace, chave, valor)
                VALUES ('delete', old.id, old.namespace, old.chave, old.valor);
                INSERT INTO memoria_fts(rowid, namespace, chave, valor)
                VALUES (new.id, new.namespace, new.chave, new.valor);
            END;
            """
        )

    # ------------------------------------------------------------------
    # API principal
    # ------------------------------------------------------------------

    def guardar(
        self,
        chave: str,
        valor: Any,
        *,
        namespace: str = "default",
        origem: Optional[str] = None,
        ciclo_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Persiste ou atualiza um item de memória."""
        agora = _utcnow()
        payload = json.dumps(valor, ensure_ascii=False, default=str)

        conn = self._get_conn()
        conn.execute(
            """
            INSERT INTO memoria (namespace, chave, valor, tipo, origem, ciclo_id, criado_em, atualizado_em)
            VALUES (?, ?, ?, 'json', ?, ?, ?, ?)
            ON CONFLICT(namespace, chave) DO UPDATE SET
                valor = excluded.valor,
                origem = COALESCE(excluded.origem, memoria.origem),
                ciclo_id = COALESCE(excluded.ciclo_id, memoria.ciclo_id),
                atualizado_em = excluded.atualizado_em
            """,
            (namespace, chave, payload, origem, ciclo_id, agora, agora),
        )

        return {
            "ok": True,
            "namespace": namespace,
            "chave": chave,
            "atualizado_em": agora,
        }

    def lembrar(
        self,
        chave: str,
        valor: Any = None,
        *,
        tags: Optional[List[str]] = None,
        namespace: str = "default",
        origem: Optional[str] = None,
        ciclo_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Alias compatível com app.py e interfaces legadas.
        Se valor for fornecido → guarda.
        Se valor for None → recupera (e envolve em dict).
        tags são embutidas no payload quando presentes.
        """
        if valor is None:
            recuperado = self.recuperar(chave, namespace=namespace, default=None)
            return {
                "ok": recuperado is not None,
                "chave": chave,
                "namespace": namespace,
                "valor": recuperado,
            }

        payload = valor
        if tags:
            if isinstance(valor, dict):
                payload = {**valor, "_tags": list(tags)}
            else:
                payload = {"valor": valor, "_tags": list(tags)}

        return self.guardar(
            chave,
            payload,
            namespace=namespace,
            origem=origem or "api",
            ciclo_id=ciclo_id,
        )

    def registrar_padrao(
        self,
        chave: str,
        contexto: Optional[Dict[str, Any]] = None,
        *,
        origem: str = "ruflo_consolidacao",
        ciclo_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Registra um padrão consolidado de ciclo (usado por handler_consolidar).
        Namespace fixo: 'padroes'.
        """
        ctx = contexto or {}
        # Extrai ciclo_id da chave se no formato ciclo:ID:...
        if ciclo_id is None and isinstance(chave, str) and chave.startswith("ciclo:"):
            partes = chave.split(":")
            if len(partes) >= 2:
                ciclo_id = partes[1]

        return self.guardar(
            chave=chave,
            valor={
                "tipo": "padrao_ciclo",
                "contexto": ctx,
                "registrado_em": _utcnow(),
            },
            namespace="padroes",
            origem=origem,
            ciclo_id=ciclo_id,
        )

    def recuperar(
        self,
        chave: str,
        *,
        namespace: str = "default",
        default: Any = None,
    ) -> Any:
        """Recupera valor por chave exata."""
        conn = self._get_conn()
        row = conn.execute(
            "SELECT valor FROM memoria WHERE namespace = ? AND chave = ?",
            (namespace, chave),
        ).fetchone()

        if row is None:
            return default

        try:
            return json.loads(row["valor"])
        except (json.JSONDecodeError, TypeError):
            return row["valor"]

    def buscar(
        self,
        consulta: str,
        *,
        namespace: Optional[str] = None,
        limite: int = 20,
    ) -> List[Dict[str, Any]]:
        """Busca textual (FTS5) na memória."""
        if not consulta or not consulta.strip():
            return []

        conn = self._get_conn()
        # Escape básico para FTS
        termo = consulta.strip().replace('"', '""')

        if namespace:
            rows = conn.execute(
                """
                SELECT m.namespace, m.chave, m.valor, m.origem, m.ciclo_id, m.atualizado_em
                FROM memoria_fts f
                JOIN memoria m ON m.id = f.rowid
                WHERE memoria_fts MATCH ? AND m.namespace = ?
                ORDER BY rank
                LIMIT ?
                """,
                (termo, namespace, limite),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT m.namespace, m.chave, m.valor, m.origem, m.ciclo_id, m.atualizado_em
                FROM memoria_fts f
                JOIN memoria m ON m.id = f.rowid
                WHERE memoria_fts MATCH ?
                ORDER BY rank
                LIMIT ?
                """,
                (termo, limite),
            ).fetchall()

        resultados = []
        for r in rows:
            try:
                valor = json.loads(r["valor"])
            except (json.JSONDecodeError, TypeError):
                valor = r["valor"]
            resultados.append(
                {
                    "namespace": r["namespace"],
                    "chave": r["chave"],
                    "valor": valor,
                    "origem": r["origem"],
                    "ciclo_id": r["ciclo_id"],
                    "atualizado_em": r["atualizado_em"],
                }
            )
        return resultados

    def listar(
        self,
        *,
        namespace: Optional[str] = None,
        ciclo_id: Optional[str] = None,
        limite: int = 100,
    ) -> List[Dict[str, Any]]:
        """Lista itens de memória com filtros opcionais."""
        conn = self._get_conn()
        clauses = []
        params: List[Any] = []

        if namespace:
            clauses.append("namespace = ?")
            params.append(namespace)
        if ciclo_id:
            clauses.append("ciclo_id = ?")
            params.append(ciclo_id)

        where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        params.append(limite)

        rows = conn.execute(
            f"""
            SELECT namespace, chave, valor, origem, ciclo_id, criado_em, atualizado_em
            FROM memoria
            {where}
            ORDER BY atualizado_em DESC
            LIMIT ?
            """,
            params,
        ).fetchall()

        out = []
        for r in rows:
            try:
                valor = json.loads(r["valor"])
            except (json.JSONDecodeError, TypeError):
                valor = r["valor"]
            out.append(
                {
                    "namespace": r["namespace"],
                    "chave": r["chave"],
                    "valor": valor,
                    "origem": r["origem"],
                    "ciclo_id": r["ciclo_id"],
                    "criado_em": r["criado_em"],
                    "atualizado_em": r["atualizado_em"],
                }
            )
        return out

    def remover(
        self,
        chave: str,
        *,
        namespace: str = "default",
    ) -> Dict[str, Any]:
        """Remove um item de memória."""
        conn = self._get_conn()
        cur = conn.execute(
            "DELETE FROM memoria WHERE namespace = ? AND chave = ?",
            (namespace, chave),
        )
        return {
            "ok": True,
            "removido": cur.rowcount > 0,
            "namespace": namespace,
            "chave": chave,
        }

    def estatisticas(self) -> Dict[str, Any]:
        """Resumo da memória canônica."""
        conn = self._get_conn()
        total = conn.execute("SELECT COUNT(*) AS n FROM memoria").fetchone()["n"]
        namespaces = conn.execute(
            "SELECT namespace, COUNT(*) AS n FROM memoria GROUP BY namespace"
        ).fetchall()
        return {
            "total_itens": total,
            "namespaces": {r["namespace"]: r["n"] for r in namespaces},
            "db_path": str(self.db_path),
        }

    def status(self) -> Dict[str, Any]:
        """Alias de estatisticas() para compatibilidade com app.py e endpoints."""
        return self.estatisticas()

    def fechar(self) -> None:
        if self._conn is not None:
            self._conn.close()
            self._conn = None


# Instância singleton pronta para uso pelo núcleo
memoria_canonica = MemoriaCanonica()
