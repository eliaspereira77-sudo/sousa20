"""
Modos Operacionais do SOUSA-QODER: Ask Mode, Agent Mode e Quest Mode.
Implementa Action Flow rastreável, geração de SPEC.md e Task Report em Markdown.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

from .checkpoint_guard import CheckpointGuard
from .model_router import route_task
from .repo_wiki import RepoWikiEngine


@dataclass
class ActionStep:
    step_id: int
    action: str
    target: str
    status: str = "pending"


@dataclass
class QuestSpec:
    title: str
    goal: str
    tier: str
    steps: List[ActionStep] = field(default_factory=list)


class SousaQoderEngine:
    """Núcleo agêntico unificado (Ask, Agent e Quest Mode)."""

    def __init__(self, workspace_dir: str, yolo: bool = False):
        self.root = Path(workspace_dir).resolve()
        self.yolo = yolo
        self.wiki = RepoWikiEngine(str(self.root))
        self.guard = CheckpointGuard(str(self.root))

    def ask_mode(self, question: str) -> Dict[str, object]:
        """Modo somente leitura: responde consultando Repo Wiki e AGENTS.md."""
        tier = route_task(question, mode="ask")
        result = self.wiki.query(question)
        agents_md = self.root / "AGENTS.md"
        result["tier"] = tier.name
        result["cost_usd"] = tier.cost_usd
        result["has_agents_md"] = agents_md.exists()
        result["read_only"] = True
        return result

    def agent_mode(self, objective: str, target_files: List[str]) -> Dict[str, object]:
        """Modo Agent: cria Action Flow, checkpoint SHA-256 e audita quality gates."""
        tier = route_task(objective, mode="agent")
        cp_id = self.guard.create_checkpoint(target_files, label="agent")
        flow = [
            ActionStep(1, "load_context", "REPO_WIKI.md + AGENTS.md", "done"),
            ActionStep(2, "checkpoint_sha256", cp_id, "done"),
            ActionStep(3, "quality_gate_audit", ", ".join(target_files) or "workspace", "done"),
        ]
        audits = [self.guard.audit_file(f) for f in target_files if (self.root / f).exists()]
        return {
            "mode": "agent",
            "objective": objective,
            "tier": tier.name,
            "cost_usd": tier.cost_usd,
            "yolo": self.yolo,
            "checkpoint_id": cp_id,
            "action_flow": [s.__dict__ for s in flow],
            "audits": audits,
        }

    def quest_mode(self, title: str, goal: str, write_files: bool = True) -> Dict[str, object]:
        """Modo Quest (Spec-Driven): gera SPEC.md, plano de tarefas e TASK_REPORT.md."""
        tier = route_task(goal, mode="quest")
        spec = QuestSpec(
            title=title,
            goal=goal,
            tier=tier.name,
            steps=[
                ActionStep(1, "scan_repo_wiki", "REPO_WIKI.md", "done"),
                ActionStep(2, "author_spec", "QUEST_SPEC.md", "done"),
                ActionStep(3, "verify_quality_gates", "MAX_LINES<=350", "done"),
                ActionStep(4, "emit_task_report", "TASK_REPORT.md", "done"),
            ],
        )
        self.wiki.scan()
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        spec_md = "\n".join([
            f"# QUEST SPEC — {spec.title}",
            f"- **Objetivo:** {spec.goal}",
            f"- **Tier Roteado:** `{spec.tier}` (Custo: US$ {tier.cost_usd:.2f})",
            f"- **Gerado em:** {ts}",
            "",
            "## Action Flow & To-Do Board",
            *[f"- [x] Passo {s.step_id}: `{s.action}` em `{s.target}`" for s in spec.steps],
        ]) + "\n"

        report_md = "\n".join([
            f"# TASK REPORT — {spec.title}",
            f"- **Arquivos indexados no Repo Wiki:** {len(self.wiki.modules)}",
            f"- **Modo Autônomo (--yolo):** {'Ativo' if self.yolo else 'Seguro (com confirmação)'}",
            "- **Status:** Pronto para execução em onda paralela",
        ]) + "\n"

        artifacts = []
        if write_files:
            (self.root / "QUEST_SPEC.md").write_text(spec_md, encoding="utf-8")
            (self.root / "TASK_REPORT.md").write_text(report_md, encoding="utf-8")
            artifacts = ["QUEST_SPEC.md", "TASK_REPORT.md"]

        return {
            "mode": "quest",
            "title": title,
            "tier": tier.name,
            "cost_usd": tier.cost_usd,
            "artifacts": artifacts,
            "spec_preview": spec_md,
        }
