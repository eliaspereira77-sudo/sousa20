"""
Ponte Oficial SOUSA-QODER <-> Agente ADS (Contrato USB Soberano).
Permite ao Agente ADS acionar Repo Wiki, Ask, Agent, Quest Mode e Rollback SHA-256
mantendo a trava de soberania (nunca altera núcleo sem aprovação 0,01%).
"""

from typing import Dict, List

from .modes import SousaQoderEngine


class AgenteADSQoderBridge:
    """Adaptador USB que entrega o SOUSA-QODER nas mãos do Agente ADS."""

    def __init__(self, workspace_dir: str):
        self.engine = SousaQoderEngine(workspace_dir=workspace_dir, yolo=False)
        self.pode_alterar_nucleo = False

    def registrar_como_usb(self, contrato_soberania) -> dict:
        return contrato_soberania.registrar_usb(
            "AGENTE_ADS_SOUSA_QODER",
            tipo="engenharia_codigo",
            descricao="SOUSA-QODER integrado ao Agente ADS (Repo Wiki, Quest, Checkpoints)",
            capacidades=["repo_wiki", "ask_mode", "agent_mode", "quest_mode", "revert_sha256"],
            pode_alterar_nucleo=self.pode_alterar_nucleo,
        )

    def mapear_projeto(self) -> str:
        return str(self.engine.wiki.save_wiki())

    def diagnosticar_arquitetura(self, pergunta: str) -> Dict[str, object]:
        return self.engine.ask_mode(pergunta)

    def preparar_edicao_segura(self, objetivo: str, arquivos: List[str]) -> Dict[str, object]:
        return self.engine.agent_mode(objetivo, arquivos)

    def executar_quest_spec(self, titulo: str, objetivo: str) -> Dict[str, object]:
        return self.engine.quest_mode(titulo, objetivo, write_files=True)
