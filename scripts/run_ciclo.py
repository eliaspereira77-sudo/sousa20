#!/usr/bin/env python3
"""
SOUSA 2.0 — Script de execução de ciclo via Ruflo
Uso:
  python scripts/run_ciclo.py
  python scripts/run_ciclo.py "status"
  python scripts/run_ciclo.py "ciclo_padrao" --intencao "gerar relatório"
"""

import argparse
import json
import sys
from pathlib import Path

# Garante que o root do repo está no path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ruflo.orchestrator import RufloOrchestrator


def main():
    parser = argparse.ArgumentParser(description="SOUSA 2.0 — Executar ciclo Ruflo")
    parser.add_argument("workflow", nargs="?", default="status", help="Nome do workflow")
    parser.add_argument("--intencao", "-i", default=None, help="Texto da intenção")
    parser.add_argument("--json", action="store_true", help="Saída em JSON puro")
    args = parser.parse_args()

    ruflo = RufloOrchestrator()

    context = {}
    if args.intencao:
        context["intencao"] = args.intencao
        context["texto"] = args.intencao

    resultado = ruflo.execute(args.workflow, context)

    if args.json:
        print(json.dumps(resultado, ensure_ascii=False, indent=2, default=str))
    else:
        print("=== SOUSA 2.0 / Ruflo ===")
        print(f"Workflow : {args.workflow}")
        print(f"Status   : {resultado.get('status')}")
        print(f"OK       : {resultado.get('ok', resultado.get('status') == 'operational')}")
        if "ciclo" in resultado:
            c = resultado["ciclo"]
            print(f"Ciclo ID : {c.get('id')}")
            print(f"Estado   : {c.get('estado')}")
            print(f"Histórico: {' → '.join(c.get('historico_estados', []))}")
        print()
        print(json.dumps(resultado, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
