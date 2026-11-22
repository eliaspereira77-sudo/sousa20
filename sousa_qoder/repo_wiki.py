"""
Repo Wiki & Codebase Graph Indexer (Clean-Room Qoder Repo Wiki REA).
Analisa automaticamente o repositório (AST Python, imports, linhas, módulos)
e gera REPO_WIKI.md + índice pesquisável de arquitetura sem depender de nuvem paga.
"""

import ast
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List


IGNORE_DIRS = {".git", "__pycache__", "node_modules", ".venv", "venv", ".sousa_checkpoints"}
CODE_EXTS = {".py", ".js", ".ts", ".gs", ".md", ".json", ".sh", ".ps1"}


@dataclass
class ModuleInfo:
    rel_path: str
    language: str
    lines: int
    symbols: List[str] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)
    summary: str = ""


class RepoWikiEngine:
    """Indexador automático de arquitetura e gerador de Repo Wiki."""

    def __init__(self, root_dir: str):
        self.root = Path(root_dir).resolve()
        self.modules: List[ModuleInfo] = []

    def scan(self) -> List[ModuleInfo]:
        self.modules = []
        for dirpath, dirnames, filenames in os.walk(self.root):
            dirnames[:] = sorted(d for d in dirnames if d not in IGNORE_DIRS)
            for fname in sorted(filenames):
                fpath = Path(dirpath) / fname
                if fpath.suffix.lower() not in CODE_EXTS:
                    continue
                self.modules.append(self._analyze_file(fpath))
        return self.modules

    def _analyze_file(self, fpath: Path) -> ModuleInfo:
        rel = str(fpath.relative_to(self.root))
        try:
            text = fpath.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return ModuleInfo(rel_path=rel, language=fpath.suffix, lines=0)

        lines = len(text.splitlines())
        symbols: List[str] = []
        imports: List[str] = []
        summary = ""

        if fpath.suffix == ".py":
            try:
                tree = ast.parse(text)
                doc = ast.get_docstring(tree)
                if doc:
                    summary = doc.strip().splitlines()[0][:120]
                for node in ast.walk(tree):
                    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                        symbols.append(node.name)
                    elif isinstance(node, ast.Import):
                        imports.extend(alias.name for alias in node.names)
                    elif isinstance(node, ast.ImportFrom) and node.module:
                        imports.append(node.module)
            except SyntaxError:
                summary = "Aviso: erro de sintaxe Python detectado"

        return ModuleInfo(
            rel_path=rel,
            language=fpath.suffix.lstrip(".") or "txt",
            lines=lines,
            symbols=sorted(set(symbols))[:20],
            imports=sorted(set(imports))[:15],
            summary=summary,
        )

    def build_markdown(self) -> str:
        if not self.modules:
            self.scan()
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        total_lines = sum(m.lines for m in self.modules)
        oversized = [m.rel_path for m in self.modules if m.language == "py" and m.lines > 350]

        out = [
            f"# REPO WIKI — {self.root.name}",
            f"_Gerado automaticamente pelo SOUSA-QODER em {ts} (Regra 0800)_",
            "",
            "## Visão Geral da Arquitetura",
            f"- **Arquivos indexados:** {len(self.modules)}",
            f"- **Total de linhas:** {total_lines}",
            f"- **Violação MAX_LINES (350):** {len(oversized)} ({', '.join(oversized) if oversized else 'Nenhuma'})",
            "",
            "## Mapa de Módulos e Símbolos",
            "| Arquivo | Linguagem | Linhas | Símbolos Principais | Dependências |",
            "| :--- | :---: | :---: | :--- | :--- |",
        ]
        for m in self.modules:
            syms = ", ".join(m.symbols[:6]) if m.symbols else "—"
            imps = ", ".join(m.imports[:5]) if m.imports else "—"
            out.append(f"| `{m.rel_path}` | {m.language} | {m.lines} | {syms} | {imps} |")
        return "\n".join(out) + "\n"

    def save_wiki(self, filename: str = "REPO_WIKI.md") -> Path:
        content = self.build_markdown()
        target = self.root / filename
        target.write_text(content, encoding="utf-8")
        return target

    def query(self, question: str) -> Dict[str, object]:
        if not self.modules:
            self.scan()
        terms = [t.lower() for t in question.split() if len(t) > 2]
        scored = []
        for m in self.modules:
            haystack = f"{m.rel_path} {' '.join(m.symbols)} {' '.join(m.imports)} {m.summary}".lower()
            score = sum(1 for t in terms if t in haystack)
            if score > 0:
                scored.append((score, m))
        scored.sort(key=lambda x: x[0], reverse=True)
        matches = [
            {
                "file": m.rel_path,
                "lines": m.lines,
                "symbols": m.symbols[:8],
                "summary": m.summary,
                "score": s,
            }
            for s, m in scored[:5]
        ]
        return {"question": question, "matches": matches, "total_indexed": len(self.modules)}
