"""
Oficina de Usinagem, Autoconserto, Autorreparo e Autosoldagem (SOUSA 2.0).
Integra o Monitor de Sintaxe 100% Atento, o Mecânico/Faxineiro 100% Atento (Zero Resíduo)
e o Cão de Guarda 100% Atento contra códigos quebrados ou maliciosos.
"""

import ast
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

from .checkpoint_guard import CheckpointGuard, SECRET_PATTERNS


MALICIOUS_PATTERNS = [
    (re.compile(r"\beval\s*\("), "Uso perigoso de eval()"),
    (re.compile(r"\bexec\s*\("), "Uso perigoso de exec()"),
    (re.compile(r"\bos\.system\s*\("), "Chamada direta insegura os.system()"),
    (re.compile(r"shell\s*=\s*True"), "Execução de subprocesso com shell=True"),
    (re.compile(r"rm\s+-rf\s+/"), "Comando destrutivo rm -rf /"),
    (re.compile(r"__import__\s*\("), "Importação dinâmica ofuscada __import__()"),
]


@dataclass
class DiagnosticoUsinagem:
    arquivo: str
    sintaxe_ok: bool
    cao_de_guarda_ok: bool
    delimitadores_balanceados: bool
    alertas: List[str]


class MonitorDeSintaxe:
    """Monitor de Sintaxe 100% atento: valida AST e delimitadores."""

    @staticmethod
    def inspecionar(codigo: str, extensao: str = ".py") -> Dict[str, object]:
        alertas: List[str] = []
        delimitadores_ok = (
            codigo.count("{") == codigo.count("}")
            and codigo.count("[") == codigo.count("]")
            and codigo.count("(") == codigo.count(")")
        )
        if not delimitadores_ok:
            alertas.append("Delimitadores desbalanceados ({}, [] ou ())")

        sintaxe_ok = True
        if extensao == ".py":
            try:
                ast.parse(codigo)
            except SyntaxError as exc:
                sintaxe_ok = False
                alertas.append(f"Quebra de sintaxe na linha {exc.lineno}: {exc.msg}")

        return {
            "sintaxe_ok": sintaxe_ok,
            "delimitadores_ok": delimitadores_ok,
            "alertas": alertas,
        }


class CaoDeGuardaSeguranca:
    """Cão de Guarda 100% atento: barra código malicioso, danoso ou vazamentos."""

    @staticmethod
    def blindar(codigo: str) -> Dict[str, object]:
        bloqueios: List[str] = []
        for pat, desc in MALICIOUS_PATTERNS:
            if pat.search(codigo):
                bloqueios.append(f"BLOQUEIO CÃO DE GUARDA: {desc}")
        for pat in SECRET_PATTERNS:
            if pat.search(codigo):
                bloqueios.append("BLOQUEIO CÃO DE GUARDA: Credencial/chave exposta")
                break
        return {"seguro": len(bloqueios) == 0, "bloqueios": bloqueios}


class MecanicoFaxineiro:
    """Mecânico/Faxineiro 100% atento: varre resíduos, temporários e caches órfãos."""

    RESIDUE_EXTS = {".tmp", ".bak", ".swp"}

    def __init__(self, workspace_dir: str):
        self.root = Path(workspace_dir).resolve()

    def faxinar_residuos(self) -> Dict[str, List[str]]:
        removidos: List[str] = []
        for p in sorted(self.root.rglob("*")):
            if ".sousa_checkpoints" in p.parts or ".git" in p.parts:
                continue
            if p.is_dir() and p.name == "__pycache__":
                shutil.rmtree(p, ignore_errors=True)
                removidos.append(str(p.relative_to(self.root)))
            elif p.is_file() and p.suffix.lower() in self.RESIDUE_EXTS:
                p.unlink(missing_ok=True)
                removidos.append(str(p.relative_to(self.root)))
        return {"removidos": removidos}


class UsinagemAutosoldagemEngine:
    """Motor de autoconserto, autorreparo, autosoldagem e usinagem de código."""

    def __init__(self, workspace_dir: str):
        self.root = Path(workspace_dir).resolve()
        self.guard = CheckpointGuard(str(self.root))
        self.faxineiro = MecanicoFaxineiro(str(self.root))

    def inspecionar_arquivo(self, rel_path: str) -> DiagnosticoUsinagem:
        fpath = self.root / rel_path
        codigo = fpath.read_text(encoding="utf-8", errors="ignore")
        mon = MonitorDeSintaxe.inspecionar(codigo, fpath.suffix.lower())
        cao = CaoDeGuardaSeguranca.blindar(codigo)
        alertas = list(mon["alertas"]) + list(cao["bloqueios"])
        return DiagnosticoUsinagem(
            arquivo=rel_path,
            sintaxe_ok=bool(mon["sintaxe_ok"]),
            cao_de_guarda_ok=bool(cao["seguro"]),
            delimitadores_balanceados=bool(mon["delimitadores_ok"]),
            alertas=alertas,
        )

    def autosoldar_codigo_quebrado(self, rel_path: str, codigo_corrigido: str) -> Dict[str, object]:
        """Executa snapshot SHA-256, valida no Cão de Guarda + Monitor de Sintaxe e solda o reparo."""
        cao = CaoDeGuardaSeguranca.blindar(codigo_corrigido)
        if not cao["seguro"]:
            return {"status": "BLOQUEADO_CAO_DE_GUARDA", "bloqueios": cao["bloqueios"]}

        fpath = self.root / rel_path
        mon = MonitorDeSintaxe.inspecionar(codigo_corrigido, fpath.suffix.lower())
        if not mon["sintaxe_ok"] or not mon["delimitadores_ok"]:
            return {"status": "REJEITADO_MONITOR_SINTAXE", "alertas": mon["alertas"]}

        cp_id = self.guard.create_checkpoint([rel_path], label="autosoldagem")
        fpath.write_text(codigo_corrigido, encoding="utf-8")
        limpeza = self.faxineiro.faxinar_residuos()
        return {
            "status": "AUTOSOLDAGEM_CONCLUIDA",
            "arquivo": rel_path,
            "checkpoint_id": cp_id,
            "usinagem_ok": True,
            "residuos_removidos": limpeza["removidos"],
        }
