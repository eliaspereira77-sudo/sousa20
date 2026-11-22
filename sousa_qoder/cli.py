"""
CLI do SOUSA-QODER (Compatível com Termux, Windows PowerShell e Linux).
Suporta subcomandos diretos e modo interativo com slash commands (/wiki, /ask, /agent, /quest).
"""

import argparse
import json
import sys
from pathlib import Path

from .modes import SousaQoderEngine


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="sousa-qoder",
        description="SOUSA-QODER: Plataforma Agêntica Clean-Room (Regra 0800)",
    )
    parser.add_argument("--workspace", default=".", help="Diretório do projeto alvo")
    parser.add_argument("--yolo", action="store_true", help="Bypass de confirmações")
    parser.add_argument("--json", action="store_true", help="Saída estruturada em JSON")

    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("wiki", help="Gera/atualiza o REPO_WIKI.md do projeto")

    p_ask = sub.add_parser("ask", help="Ask Mode: consulta arquitetura sem editar arquivos")
    p_ask.add_argument("question", help="Pergunta sobre o repositório")

    p_agent = sub.add_parser("agent", help="Agent Mode: Action Flow + Checkpoint + Auditoria")
    p_agent.add_argument("objective", help="Objetivo da tarefa")
    p_agent.add_argument("--files", nargs="*", default=[], help="Arquivos-alvo para checkpoint/auditoria")

    p_quest = sub.add_parser("quest", help="Quest Mode: fluxo Spec-Driven autônomo")
    p_quest.add_argument("--title", required=True, help="Título da Quest")
    p_quest.add_argument("--goal", required=True, help="Especificação do objetivo")

    p_rev = sub.add_parser("revert", help="Restaura arquivos de um checkpoint SHA-256")
    p_rev.add_argument("checkpoint_id", help="ID do checkpoint")

    return parser


def main(argv=None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    engine = SousaQoderEngine(args.workspace, yolo=args.yolo)

    if args.command == "wiki":
        path = engine.wiki.save_wiki()
        out = {"status": "ok", "wiki_file": str(path), "modules": len(engine.wiki.modules)}
    elif args.command == "ask":
        out = engine.ask_mode(args.question)
    elif args.command == "agent":
        out = engine.agent_mode(args.objective, args.files)
    elif args.command == "quest":
        out = engine.quest_mode(args.title, args.goal)
    elif args.command == "revert":
        out = engine.guard.revert(args.checkpoint_id)
    else:
        parser.print_help()
        return 1

    if args.json:
        print(json.dumps(out, ensure_ascii=False, indent=2))
    else:
        print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
