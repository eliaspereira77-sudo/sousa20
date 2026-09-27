# ==============================================================
# CORAÇÃO EXECUTOR — SOUSA 2.0
# LÊ AS ORDENS • CUMPRE • RELATA
# ==============================================================
import json
from datetime import datetime
from pathlib import Path

RAIZ_PROJETO = Path(__file__).resolve().parent
PASTA_AGENTES = RAIZ_PROJETO / "agentes"
REGISTRO_EQUIPE = RAIZ_PROJETO / "MEMORIA" / "core" / "capabilities" / "SOUSA_TEAM_REGISTRY.json"


def ler_agentes():
    """Lê todos os agentes e suas missões."""
    if not PASTA_AGENTES.exists():
        return {}
    return {
        arquivo.name: arquivo.read_text(encoding="utf-8")
        for arquivo in PASTA_AGENTES.glob("*.txt")
    }


def carregar_registro_equipe():
    with REGISTRO_EQUIPE.open("r", encoding="utf-8") as arquivo:
        return json.load(arquivo)


def verificar_ordens():
    """Verifica o registro canônico e os agentes especializados."""
    print(f"\n{'=' * 50}")
    print("   SOUSA 2.0 — VERIFICAÇÃO ATIVA")
    print(f"   {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"{'=' * 50}")

    agentes = ler_agentes()
    registro = carregar_registro_equipe()
    membros = registro["members"]
    coordenador = next(membro for membro in membros if membro["id"] == registro["coordinator_id"])

    print(f"   OK {coordenador['name']} — COORDENAÇÃO ÚNICA")

    especializados = [
        membro
        for membro in membros
        if membro["type"] == "SPECIALIZED_AGENT"
    ]

    for membro in especializados:
        arquivo = Path(membro["definition_file"]).name
        if arquivo in agentes:
            print(f"   OK {membro['name']} — ATIVO E PRESENTE")
        else:
            print(f"   AUSENTE {membro['name']} — {arquivo}")

    print(f"\n   Agentes especializados registrados: {len(especializados)}")
    print(f"   Total de definições carregadas: {len(agentes)}")
    print(f"{'=' * 50}")
    print("   'Ordens recebidas. Identidade íntegra. Aguardando sua voz.'")
    print(f"{'=' * 50}\n")


if __name__ == "__main__":
    verificar_ordens()
