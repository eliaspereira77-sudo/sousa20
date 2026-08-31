"""
SOUSA 2.0 — Auditoria de Acesso

Trilha persistente de acessos ao núcleo e às camadas.
Complementa o histórico em memória da soberania; não o substitui.
Domínio: governanca / soberania (protegido).
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "auditoria.db"

# Tipos de evento padronizados
EVENTO_ACESSO = "ACESSO"
EVENTO_PERMITIDO = "PERMITIDO"
EVENTO_BLOQUEADO = "BLOQUEADO"
EVENTO_VIOLACAO = "VIOLACAO"
EVENTO_AUTORIZACAO = "AUTORIZACAO"
EVENTO_USB = "USB"
EVENTO_MEMORIA = "MEMORIA"
EVENTO_CAPACIDADE = "CAPACIDADE"
EVENTO_SISTEMA = "SISTEMA"


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class AuditoriaAcesso:
    """
    Auditoria de acesso do SOUSA 2.0.

    - Persistência em SQLite (WAL)
    - Consulta por origem, ação, resultado, ciclo, intervalo
    - Não altera decisões de soberania — apenas registra
    """

    def __init__(self, db_path: Optional[Path | str] = None):
        self.db_path = Path(db_path) if db_path else DEFAULT_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn: Optional[sqlite3.Connection] = None
        self._ensure_schema()

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(
                str(self.db_path),
                check_same_thread=False,
                isolation_level=None,
            )
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA synchronous=NORMAL")
        return self._conn

    def _ensure_schema(self) -> None:
        conn = self._get_conn()
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS auditoria (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                evento      TEXT NOT NULL,
                acao        TEXT,
                origem      TEXT,
                dominio     TEXT,
                resultado   TEXT NOT NULL,
                ciclo_id    TEXT,
                detalhe     TEXT,
                timestamp   TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_aud_timestamp ON auditoria(timestamp);
            CREATE INDEX IF NOT EXISTS idx_aud_origem ON auditoria(origem);
            CREATE INDEX IF NOT EXISTS idx_aud_acao ON auditoria(acao);
            CREATE INDEX IF NOT EXISTS idx_aud_resultado ON auditoria(resultado);
            CREATE INDEX IF NOT EXISTS idx_aud_ciclo ON auditoria(ciclo_id);
            CREATE INDEX IF NOT EXISTS idx_aud_evento ON auditoria(evento);
            """
        )

    def registrar(
        self,
        *,
        evento: str = EVENTO_ACESSO,
        acao: Optional[str] = None,
        origem: Optional[str] = None,
        dominio: Optional[str] = None,
        resultado: str = "REGISTRADO",
        ciclo_id: Optional[str] = None,
        detalhe: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Registra um evento de auditoria."""
        agora = _utcnow()
        payload = json.dumps(detalhe or {}, ensure_ascii=False, default=str)

        conn = self._get_conn()
        cur = conn.execute(
            """
            INSERT INTO auditoria (evento, acao, origem, dominio, resultado, ciclo_id, detalhe, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(evento).upper(),
                (str(acao).lower().strip() if acao else None),
                (str(origem).upper() if origem else None),
                (str(dominio).lower() if dominio else None),
                str(resultado).upper(),
                ciclo_id,
                payload,
                agora,
            ),
        )

        return {
            "ok": True,
            "id": cur.lastrowid,
            "evento": str(evento).upper(),
            "resultado": str(resultado).upper(),
            "timestamp": agora,
        }

    def registrar_validacao(self, resultado_validacao: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atalho para registrar o resultado de contrato_soberania.validar_operacao.
        """
        ok = bool(resultado_validacao.get("ok"))
        status = str(resultado_validacao.get("status") or "").upper()

        if ok:
            evento = EVENTO_PERMITIDO
            resultado = "PERMITIDA"
        elif status in ("VIOLACAO_SOBERANIA",):
            evento = EVENTO_VIOLACAO
            resultado = status
        else:
            evento = EVENTO_BLOQUEADO
            resultado = status or "BLOQUEADO"

        return self.registrar(
            evento=evento,
            acao=resultado_validacao.get("acao"),
            origem=resultado_validacao.get("origem"),
            dominio=resultado_validacao.get("dominio"),
            resultado=resultado,
            ciclo_id=resultado_validacao.get("ciclo_id"),
            detalhe={
                "motivo": resultado_validacao.get("motivo"),
                "autorizada": resultado_validacao.get("autorizada"),
                "exige_autorizacao": resultado_validacao.get("exige_autorizacao"),
                "sinal_risco": resultado_validacao.get("sinal_risco"),
            },
        )

    def consultar(
        self,
        *,
        evento: Optional[str] = None,
        origem: Optional[str] = None,
        acao: Optional[str] = None,
        resultado: Optional[str] = None,
        ciclo_id: Optional[str] = None,
        desde: Optional[str] = None,
        ate: Optional[str] = None,
        limite: int = 100,
    ) -> List[Dict[str, Any]]:
        """Consulta a trilha de auditoria com filtros."""
        clauses: List[str] = []
        params: List[Any] = []

        if evento:
            clauses.append("evento = ?")
            params.append(str(evento).upper())
        if origem:
            clauses.append("origem = ?")
            params.append(str(origem).upper())
        if acao:
            clauses.append("acao = ?")
            params.append(str(acao).lower().strip())
        if resultado:
            clauses.append("resultado = ?")
            params.append(str(resultado).upper())
        if ciclo_id:
            clauses.append("ciclo_id = ?")
            params.append(ciclo_id)
        if desde:
            clauses.append("timestamp >= ?")
            params.append(desde)
        if ate:
            clauses.append("timestamp <= ?")
            params.append(ate)

        where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        params.append(max(1, min(limite, 1000)))

        conn = self._get_conn()
        rows = conn.execute(
            f"""
            SELECT id, evento, acao, origem, dominio, resultado, ciclo_id, detalhe, timestamp
            FROM auditoria
            {where}
            ORDER BY id DESC
            LIMIT ?
            """,
            params,
        ).fetchall()

        out = []
        for r in rows:
            try:
                detalhe = json.loads(r["detalhe"] or "{}")
            except (json.JSONDecodeError, TypeError):
                detalhe = {}
            out.append(
                {
                    "id": r["id"],
                    "evento": r["evento"],
                    "acao": r["acao"],
                    "origem": r["origem"],
                    "dominio": r["dominio"],
                    "resultado": r["resultado"],
                    "ciclo_id": r["ciclo_id"],
                    "detalhe": detalhe,
                    "timestamp": r["timestamp"],
                }
            )
        return out

    def estatisticas(self) -> Dict[str, Any]:
        conn = self._get_conn()
        total = conn.execute("SELECT COUNT(*) AS n FROM auditoria").fetchone()["n"]
        por_resultado = conn.execute(
            "SELECT resultado, COUNT(*) AS n FROM auditoria GROUP BY resultado"
        ).fetchall()
        por_evento = conn.execute(
            "SELECT evento, COUNT(*) AS n FROM auditoria GROUP BY evento"
        ).fetchall()
        bloqueios = conn.execute(
            "SELECT COUNT(*) AS n FROM auditoria WHERE resultado IN ('BLOQUEADO', 'VIOLACAO_SOBERANIA', 'AGUARDANDO_AUTORIZACAO')"
        ).fetchone()["n"]

        return {
            "total_eventos": total,
            "bloqueios_e_violacoes": bloqueios,
            "por_resultado": {r["resultado"]: r["n"] for r in por_resultado},
            "por_evento": {r["evento"]: r["n"] for r in por_evento},
            "db_path": str(self.db_path),
        }

    def fechar(self) -> None:
        if self._conn is not None:
            self._conn.close()
            self._conn = None


# Instância singleton do núcleo
auditoria = AuditoriaAcesso()
