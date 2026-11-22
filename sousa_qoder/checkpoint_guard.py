"""
Checkpoint Guard & Quality Gate (Clean-Room Qoder Checkpoints + Vibe Coding Gate).
Cria snapshots SHA-256 antes de alterações, permite rollback instantâneo (/revert)
e valida MAX_LINES <= 350, sintaxe Python e ausência de segredos expostos.
"""

import ast
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


SECRET_PATTERNS = [
    re.compile(r"AIza[0-9A-Za-z\-_]{35}"),
    re.compile(r"sk-[0-9A-Za-z]{20,}"),
    re.compile(r"ghp_[0-9A-Za-z]{30,}"),
]


class CheckpointGuard:
    """Gerenciador de checkpoints, rollback e Quality Gates (SOUSA_GUARDIAN)."""

    def __init__(self, root_dir: str, max_lines: int = 350):
        self.root = Path(root_dir).resolve()
        self.max_lines = max_lines
        self.cp_dir = self.root / ".sousa_checkpoints"

    def create_checkpoint(self, rel_paths: List[str], label: str = "auto") -> str:
        cp_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + f"_{label}"
        target_dir = self.cp_dir / cp_id
        target_dir.mkdir(parents=True, exist_ok=True)
        manifest: Dict[str, Dict[str, str]] = {}

        for rel in rel_paths:
            src = self.root / rel
            if not src.exists() or not src.is_file():
                manifest[rel] = {"state": "absent"}
                continue
            backup = target_dir / rel
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, backup)
            sha = hashlib.sha256(src.read_bytes()).hexdigest()
            manifest[rel] = {"state": "saved", "sha256": sha}

        (target_dir / "manifest.json").write_text(
            json.dumps({"cp_id": cp_id, "files": manifest}, indent=2),
            encoding="utf-8",
        )
        return cp_id

    def revert(self, cp_id: str) -> Dict[str, List[str]]:
        target_dir = self.cp_dir / cp_id
        manifest_path = target_dir / "manifest.json"
        if not manifest_path.exists():
            raise FileNotFoundError(f"Checkpoint não encontrado: {cp_id}")

        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        restored, removed = [], []
        for rel, meta in data["files"].items():
            dest = self.root / rel
            if meta["state"] == "absent":
                if dest.exists():
                    dest.unlink()
                    removed.append(rel)
            else:
                src = target_dir / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dest)
                restored.append(rel)
        return {"restored": restored, "removed": removed}

    def audit_file(self, rel_path: str) -> Dict[str, object]:
        fpath = self.root / rel_path
        if not fpath.exists():
            return {"file": rel_path, "ok": False, "errors": ["Arquivo inexistente"]}

        text = fpath.read_text(encoding="utf-8", errors="ignore")
        lines = len(text.splitlines())
        errors: List[str] = []

        if lines > self.max_lines:
            errors.append(f"Excede MAX_LINES ({lines} > {self.max_lines})")

        if fpath.suffix == ".py":
            try:
                ast.parse(text)
            except SyntaxError as exc:
                errors.append(f"Erro de sintaxe na linha {exc.lineno}: {exc.msg}")

        for pat in SECRET_PATTERNS:
            if pat.search(text):
                errors.append("Possível credencial ou chave de API exposta")
                break

        return {"file": rel_path, "lines": lines, "ok": len(errors) == 0, "errors": errors}
