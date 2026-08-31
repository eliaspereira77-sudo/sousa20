#!/usr/bin/env python3
"""
SOUSA 2.0 — CLI de auto-manutenção / evolução sob comando
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from core.auto_evolucao import motor_auto_evolucao
from core.soberania import contrato_soberania


def main():
    parser = argparse.ArgumentParser(description="SOUSA 2.0 — Auto-evolução sob comando")
    parser.add_argument(
        "comando",
        choices=["diagnostico", "propor", "aplicar", "saude", "status", "autorizar"],
        help="Ação principal",
    )
    parser.add_argument("--capacidade", "-c", default=None, help="Capacidade alvo (ex: IMAGEM)")
    parser.add_argument("--plano-id", default=None)
    parser.add_argument("--comando-txt", "--cmd", default="", help="Comando do operador")
    parser.add_argument("--autorizada", action="store_true", help="Marca execução como autorizada")
    parser.add_argument("--auth-id", default=None)
    parser.add_argument("--acao-auth", default="auto_evolucao:aplicar_plano", help="Ação a autorizar")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    if args.comando == "status":
        out = motor_auto_evolucao.status()
    elif args.comando == "diagnostico":
        out = motor_auto_evolucao.diagnosticar()
    elif args.comando == "propor":
        if not args.capacidade:
            print(json.dumps({"ok": False, "error": "--capacidade obrigatório"}))
            sys.exit(1)
        out = motor_auto_evolucao.propor_adaptacao(
            args.capacidade, comando=args.comando_txt
        )
    elif args.comando == "saude":
        out = motor_auto_evolucao.executar_sob_comando(
            acao="marcar_saude",
            autorizada=args.autorizada,
            auth_id=args.auth_id,
            comando=args.comando_txt,
        )
    elif args.comando == "autorizar":
        out = contrato_soberania.conceder_autorizacao(
            acao=args.acao_auth,
            concedida_por="operador_cli",
            motivo=args.comando_txt or "CLI_AUTORIZACAO",
            valida_por_segundos=3600,
        )
    elif args.comando == "aplicar":
        out = motor_auto_evolucao.executar_sob_comando(
            acao="aplicar_plano",
            capacidade_alvo=args.capacidade,
            plano_id=args.plano_id,
            comando=args.comando_txt,
            autorizada=args.autorizada,
            auth_id=args.auth_id,
        )
    else:
        out = {"ok": False, "error": "comando desconhecido"}

    print(json.dumps(out, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
