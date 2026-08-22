#!/usr/bin/env python3
"""
SOUSA 2.0 — Script de execução de ciclo via Ruflo
Uso:
  python scripts/run_ciclo.py
  python scripts/run_ciclo.py status
  python scripts/run_ciclo.py ciclo_padrao --intencao "gerar relatório"
  python scripts/run_ciclo.py ciclo_padrao -i "teste" --json
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ruflo.orchestrator import RufloOrchestrator
from ruflo.handlers import registrar_handlers_padrao


def main():
    parser = argparse.ArgumentParser(description="SOUSA 2.0 — Executar ciclo Ruflo")
    parser.add_argument("workflow", nargs="?", default="status", help="Nome do workflow")
    parser.add_argument("--intencao", "-i", default=None, help="Texto da intenção")
    parser.add_argument("--json", action="store_true", help="Saída em JSON puro")
    parser.add_argument(
        "--sinal-risco",
        default=None,
        help='JSON de sinal de risco, ex: {"risco":"ALTO"}',
    )
    args = parser.parse_args()

    ruflo = RufloOrchestrator()
    registrar_handlers_padrao(ruflo)

    context = {}
    if args.intencao:
        context["intencao"] = args.intencao
        context["texto"] = args.intencao

    if args.sinal_risco:
        try:
            context["sinal_risco"] = json.loads(args.sinal_risco)
        except json.JSONDecodeError:
            context["sinal_risco"] = {"risco": args.sinal_risco}

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
            print(f"Capacid. : {c.get('capacidade')}")
            print(f"Histórico: {' → '.join(c.get('historico_estados', []))}")
        if resultado.get("resultado", {}).get("resposta"):
            print("\n--- Resposta SOUSA IA ---")
            print(resultado["resultado"]["resposta"][:2000])
        print()
        print(json.dumps(resultado, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
