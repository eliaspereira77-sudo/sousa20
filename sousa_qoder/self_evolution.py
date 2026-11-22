"""
Motor de Auto-Evolução Soberana Transversal — Todo o Ecossistema SOUSA 2.0 e Todos os Agentes.
Implementa o ciclo: Diagnosticar (Repo Wiki) -> Propor Evolução -> Testar em Sandbox
-> Aguardar Aprovação 0,01% -> Aplicar com Checkpoint SHA-256 -> Registrar LTM.
Permanece latente e embarcado no Instalador Oficial do SOUSA 2.0.
"""

import json
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

from .checkpoint_guard import CheckpointGuard
from .repo_wiki import RepoWikiEngine


AGENTES_ECOSSISTEMA_SOUSA_20 = (
    "SOUSA_IA",
    "AGENTE_ADS",
    "AGENTE_PRODUTOR",
    "AGENTE_ESTRATEGISTA",
    "AGENTE_FINANCEIRO_QUANTUM",
    "AGENTE_MARKETING_AFILIADOS_DROP",
    "AGENTE_OSINT_GUARDIAN",
    "ROBO_SOUSAILEON",
    "JARVIS_REGISTRY",
)


@dataclass
class PropostaDeEvolucao:
    alvo: str
    agente_destino: str
    diagnostico: str
    acao_proposta: str
    aprovada: bool = field(default=False, init=False)
    sandbox_ok: bool = False
    checkpoint_id: str = ""

    def autorizar_soberano(self, token_guardian: str) -> bool:
        """Trava 0,01%: somente o Fundador autoriza alteração no núcleo."""
        if token_guardian == "SOUSA_GUARDIAN_001":
            self.aprovada = True
            return True
        return False


class AutoEvolutionEngine:
    """Capacidade latente de auto-evolução segura para todo o SOUSA 2.0 e seus agentes."""

    def __init__(self, workspace_dir: str):
        self.root = Path(workspace_dir).resolve()
        self.wiki = RepoWikiEngine(str(self.root))
        self.guard = CheckpointGuard(str(self.root))
        self.ltm_path = self.root / "SOUSA_AUTO_EVOLUCAO_LTM.jsonl"

    def escanear_oportunidades(self, agente_destino: str = "ECOSSISTEMA_GLOBAL") -> List[PropostaDeEvolucao]:
        """Identifica arquivos fora do padrão MAX_LINES<=350 em qualquer agente do ecossistema."""
        modules = self.wiki.scan()
        propostas: List[PropostaDeEvolucao] = []
        for m in modules:
            if m.language == "py" and m.lines > self.guard.max_lines:
                propostas.append(
                    PropostaDeEvolucao(
                        alvo=m.rel_path,
                        agente_destino=agente_destino,
                        diagnostico=f"Excede MAX_LINES ({m.lines} > {self.guard.max_lines})",
                        acao_proposta="Decompor módulo por responsabilidade única mantendo contrato público",
                    )
                )
        return propostas

    def validar_em_sandbox(self, test_target: str) -> Dict[str, object]:
        """Executa suíte de testes isolada antes de qualquer evolução."""
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", test_target],
            cwd=str(self.root),
            capture_output=True,
            text=True,
            timeout=60,
        )
        return {
            "ok": proc.returncode == 0,
            "returncode": proc.returncode,
            "summary": (proc.stderr or proc.stdout).strip().splitlines()[-1:] or ["ok"],
        }

    def preparar_evolucao_segura(self, proposta: PropostaDeEvolucao, test_target: str) -> PropostaDeEvolucao:
        """Tira snapshot SHA-256 e valida o sandbox antes de liberar para aprovação 0,01%."""
        proposta.checkpoint_id = self.guard.create_checkpoint([proposta.alvo], label="autoevol")
        res = self.validar_em_sandbox(test_target)
        proposta.sandbox_ok = bool(res["ok"])
        self.registrar_ltm(
            acao=f"[{proposta.agente_destino}] Preparar evolução em {proposta.alvo}",
            resultado="SUCESSO" if proposta.sandbox_ok else "FALHA_SANDBOX",
            licao=proposta.diagnostico,
        )
        return proposta

    def registrar_ltm(self, acao: str, resultado: str, licao: str) -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acao": acao,
            "resultado": resultado,
            "licao": licao,
        }
        with self.ltm_path.open("a", encoding="utf-8") as fp:
            fp.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def exportar_manifesto_instalador(self) -> Dict[str, object]:
        """Contrato latente para o Instalador Oficial Inteligente cobrindo todos os agentes."""
        return {
            "modulo": "SOUSA_QODER_AUTO_EVOLUCAO_GLOBAL",
            "escopo": "Todo o ecossistema SOUSA 2.0 e todos os agentes",
            "agentes_cobertos": list(AGENTES_ECOSSISTEMA_SOUSA_20),
            "latente_no_instalador": True,
            "trava_soberana": "0.01% SOUSA_GUARDIAN (aprovada=False por padrao)",
            "regra_0800": True,
            "max_lines": self.guard.max_lines,
            "ltm_file": self.ltm_path.name,
        }
