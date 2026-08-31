"""
SOUSA 2.0 — Core

Núcleo soberano: identidade, memória, governança, auto-evolução,
automação 99,99% e equipe de manutenção.
"""

from .gemini_client import GeminiClient
from .sousa_ia import SousaIA
from .soberania import contrato_soberania, ContratoSoberania, ViolacaoSoberania
from .memoria import MemoriaCanonica, memoria_canonica
from .registro_capacidades import RegistroCapacidades, registro_capacidades
from .auditoria import AuditoriaAcesso, auditoria
from .auto_evolucao import MotorAutoEvolucao, motor_auto_evolucao
from .automacao import PoliticaAutomacao, politica_automacao, classificar_acao
from .equipe_manutencao import EquipeManutencao, equipe_manutencao

__all__ = [
    "GeminiClient",
    "SousaIA",
    "contrato_soberania",
    "ContratoSoberania",
    "ViolacaoSoberania",
    "MemoriaCanonica",
    "memoria_canonica",
    "RegistroCapacidades",
    "registro_capacidades",
    "AuditoriaAcesso",
    "auditoria",
    "MotorAutoEvolucao",
    "motor_auto_evolucao",
    "PoliticaAutomacao",
    "politica_automacao",
    "classificar_acao",
    "EquipeManutencao",
    "equipe_manutencao",
]
