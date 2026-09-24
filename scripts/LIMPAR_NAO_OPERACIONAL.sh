#!/usr/bin/env bash
# SOUSA 2.0 — Remove do Git tudo que NAO e operacional
# Uso:
#   cd ~/sousa20 && bash scripts/LIMPAR_NAO_OPERACIONAL.sh
#   bash scripts/LIMPAR_NAO_OPERACIONAL.sh --force
#   git push origin main
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

KEEP_REGEX='^(\.clasp\.json|\.claspignore|\.gitignore|\.env\.example|appsscript\.json|README\.md|package\.json|package-lock\.json|SOUSA_APIS_CASCATA\.js|SOUSA_API_EXECUTOR_UNIVERSAL\.js|SOUSA_USB_ADAPTERS\.js|SOUSA_USB_REGISTRY\.js|SOUSA_USB_CONTRATO\.js|SOUSA_USB_TRANSPORTES\.js|SOUSA_USB_BOOT\.js|SOUSA_VALIDACAO_CASCATA\.js|SOUSA_VALIDADOR_UNIVERSAL\.js|SOUSA_ADAPTER_ANTHROPIC_MESSAGES\.js|SOUSA_COFRE_CHAVES\.json|SOUSA_API_MANAGER\.js|01_CORE/|00_GOVERNANCA/|docs/VALIDACAO|docs/VALIDADOR|scripts/LIMPAR)'

echo "=== SOUSA 2.0 limpeza nao-operacional ==="
mapfile -t ALL < <(git ls-files)
REMOVE=()
for f in "${ALL[@]}"; do
  if echo "$f" | grep -qE "$KEEP_REGEX"; then
    continue
  fi
  REMOVE+=("$f")
done

echo "Manter: $(git ls-files | grep -E "$KEEP_REGEX" | wc -l)"
echo "Remover: ${#REMOVE[@]}"
if [ "${1:-}" != "--force" ]; then
  printf '%s\n' "${REMOVE[@]}" | head -50
  echo "..."
  echo "Rode: bash scripts/LIMPAR_NAO_OPERACIONAL.sh --force && git push origin main"
  exit 0
fi

for f in "${REMOVE[@]}"; do
  git rm -f --ignore-unmatch "$f" 2>/dev/null || true
done

git commit -m "chore: remover arquivos nao operacionais do SOUSA 2.0

Mantidos: Core, cascata, USB, executor, validacao, clasp, governanca, docs validacao." || echo "Nada a commitar"
echo "Proximo: git push origin main"
