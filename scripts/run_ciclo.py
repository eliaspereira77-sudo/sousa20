#!/usr/bin/env python3
"""
SOUSA 2.0 — Executar ciclo Ruflo (+ USB enriquecimento opcional)
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ruflo.orchestrator import RufloOrchestrator
from ruflo import persistencia


def main():
    parser = argparse.ArgumentParser(description="SOUSA 2.0 — Ciclo Ruflo")
    parser.add_argument("workflow", nargs="?", default="status")
    parser.add_argument("--intencao", "-i", default=None)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--sinal-risco", default=None)
    parser.add_argument("--ciclo-id", default=None)
    parser.add_argument("--estado", default=None)
    parser.add_argument("--limite", type=int, default=20)
    parser.add_argument(
        "--usb",
        choices=["enriquecimento", "ia", "nenhuma"],
        default="enriquecimento",
        help="USB na etapa EXECUTANDO (padrão: enriquecimento)",
    )
    args = parser.parse_args()

    if args.workflow == "listar":
        itens = persistencia.listar_ciclos(estado=args.estado, limite=args.limite)
        print(json.dumps({"total": len(itens), "ciclos": itens, "stats": persistencia.estatisticas()}, ensure_ascii=False, indent=2, default=str))
        return

    if args.workflow == "carregar":
        cid = args.ciclo_id or args.intencao
        if not cid:
            print(json.dumps({"ok": False, "error": "Informe --ciclo-id"}))
            sys.exit(1)
        ciclo = persistencia.carregar_ciclo(cid)
        print(json.dumps(ciclo or {"ok": False, "error": "não encontrado"}, ensure_ascii=False, indent=2, default=str))
        return

    ruflo = RufloOrchestrator()

    # USB de enriquecimento (padrão) — não mexe no núcleo
    if args.usb == "enriquecimento":
        from usb.enriquecimento import registrar_no_contrato, registrar_handler_na_ruflo

        registrar_no_contrato()
        registrar_handler_na_ruflo(ruflo)
    elif args.usb == "ia":
        from ruflo.handlers import registrar_handlers_padrao

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
        print("=== SOUSA 2.0 / Ruflo + USB ===")
        print(f"Workflow : {args.workflow}")
        print(f"USB      : {args.usb}")
        print(f"Status   : {resultado.get('status')}")
        print(f"OK       : {resultado.get('ok', resultado.get('status') == 'operational')}")
        if "ciclo" in resultado:
            c = resultado["ciclo"]
            print(f"Ciclo ID : {c.get('id')}")
            print(f"Estado   : {c.get('estado')}")
            print(f"Capacid. : {c.get('capacidade')}")
            print(f"Histórico: {' → '.join(c.get('historico_estados', []))}")
        print()
        print(json.dumps(resultado, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
