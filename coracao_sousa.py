# ==============================================================
# CORAÇÃO EXECUTOR — SOUSA 2.0
# LÊ AS ORDENS • CUMPRE • RELATA
# ==============================================================
import os
import time
from datetime import datetime

PASTA_AGENTES = "./agentes"

def ler_agentes():
    """Lê todos os agentes e suas missões"""
    agentes = {}
    if not os.path.exists(PASTA_AGENTES):
        return {}
    for arq in os.listdir(PASTA_AGENTES):
        if arq.endswith(".txt"):
            with open(f"{PASTA_AGENTES}/{arq}", "r", encoding="utf-8") as f:
                agentes[arq] = f.read()
    return agentes

def verificar_ordens():
    """Verifica se tudo está no lugar certo"""
    print(f"\n{'='*50}")
    print(f"   SOUSA 2.0 — VERIFICAÇÃO ATIVA")
    print(f"   {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"{'='*50}")
    
    agentes = ler_agentes()
    
    nomes_chave = {
        "00_SOUSA_IA_CONSELHO.txt": "👑 NÚCLEO SUPREMO",
        "CAO_DE_GUARDA.txt": "🐾 CÃO DE GUARDA — Vigilância",
        "SOUSAILEON.txt": "🦾 SOUSAILEON — BRAÇO ROBÓTICO"
    }
    
    for arq, nome in nomes_chave.items():
        if arq in agentes:
            print(f"   ✅ {nome} — ATIVO E PRESENTE")
        else:
            print(f"   ❌ {nome} — AUSENTE")
    
    print(f"\n   Total de agentes carregados: {len(agentes)}")
    print(f"{'='*50}")
    print("   'Ordens recebidas. Identidade íntegra. Aguardando sua voz.'")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    verificar_ordens()
