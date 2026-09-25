#!/bin/bash
# SOUSA 2.0 — Sincronização Local ↔ Nuvem (Linux/macOS)

set -e
REMOTE="SOUSA_DRIVE:SOUSA_2.0_PRODUCAO"
FILTER="./regras_nuvem.txt"

echo "============================================================"
echo "   SOUSA 2.0 — Sincronização Local ↔ Nuvem"
echo "============================================================"
echo
echo "Pasta oficial na nuvem: SOUSA_2.0_PRODUCAO"
echo

DIRECTION="${1:-}"

if [ -z "$DIRECTION" ]; then
  echo "Escolha a direção:"
  echo "  1. Enviar local → nuvem  (push)"
  echo "  2. Baixar nuvem → local  (pull)"
  echo
  read -p "Opção [1/2]: " OPCAO
  case "$OPCAO" in
    2) DIRECTION="pull" ;;
    *) DIRECTION="push" ;;
  esac
fi

if [ "$DIRECTION" = "pull" ]; then
  echo
  echo "[PULL] Baixando atualizações da nuvem..."
  rclone sync "$REMOTE" . --filter-from "$FILTER" --progress
  echo
  echo "✓ Pull concluído."
else
  echo
  echo "[PUSH] Enviando atualizações para a nuvem..."
  rclone sync . "$REMOTE" --filter-from "$FILTER" --progress
  echo
  echo "✓ Push concluído."
fi

echo
echo "============================================================"
