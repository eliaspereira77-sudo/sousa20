#!/usr/bin/env python3
"""
SOUSA 2.0 — Script de execução de ciclo via Ruflo
Uso:
  python scripts/run_ciclo.py status
  python scripts/run_ciclo.py ciclo_padrao --intencao "gerar relatório"
  python scripts/run_ciclo.py listar
  python scripts/run_ciclo.py carregar CICLO_abc123
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ruflo.orchestrator import RufloOrchestrator
from ruflo.handlers import registrar_handlers_padrao
from ruflo import persistencia


def main():
    parser = argparse.ArgumentParser(description="SOUSA 2.0 — Executar ciclo Ruflo")
    parser.add_argument("workflow", nargs="?", default="status", help="Workflow, 'listar' ou 'carregar'")
    parser.add_argument("--intencao", "-i", default=None, help="Texto da intenção")
    parser.add_argument("--json", action="store_true", help="Saída em JSON puro")
    parser.add_argument("--sinal-risco", default=None, help='JSON de sinal de risco')
    parser.add_argument("--ciclo-id", default=None, help="ID do ciclo (para carregar)")
    parser.add_argument("--estado", default=None, help="Filtrar listagem por estado")
    parser.add_argument("--limite", type=int, default=20, help="Limite na listagem")
    args = parser.parse_args()

    # Comandos de consulta à persistência
    if args.workflow == "listar":
        itens = persistencia.listar_ciclos(estado=args.estado, limite=args.limite)
        out = {"total": len(itens), "ciclos": itens, "stats": persistencia.estatisticas()}
        print(json.dumps(out, ensure_ascii=False, indent=2, default=str))
        return

    if args.workflow == "carregar":
        cid = args.ciclo_id or args.intencao
        if not cid:
            print(json.dumps({"ok": False, "error": "Informe --ciclo-id"}))
            sys.exit(1)
        ciclo = persistencia.carregar_ciclo(cid)
        if not ciclo:
            print(json.dumps({"ok": False, "error": f"Ciclo {cid} não encontrado"}))
            sys.exit(1)
        print(json.dumps(ciclo, ensure_ascii=False, indent=2, default=str))
        return

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
            print(f"Persist. : data/ciclos/{c.get('id')}.json")
        if resultado.get("resultado", {}).get("resposta"):
            print("\n--- Resposta SOUSA IA ---")
            print(resultado["resultado"]["resposta"][:2000])
        print()
        print(json.dumps(resultado, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
