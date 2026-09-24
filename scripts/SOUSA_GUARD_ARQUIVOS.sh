#!/usr/bin/env bash
# SOUSA 2.0 — Guardiao de arquivos (Git + clasp)
# Uso:
#   bash scripts/SOUSA_GUARD_ARQUIVOS.sh status
#   bash scripts/SOUSA_GUARD_ARQUIVOS.sh git-add
#   bash scripts/SOUSA_GUARD_ARQUIVOS.sh clasp-push
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

PERMITIDOS=(
  ".clasp.json" ".claspignore" ".gitignore" ".env.example" "appsscript.json"
  "README.md" "package.json" "package-lock.json" "SOUSA_MANIFESTO_ARQUIVOS.json"
  "SOUSA_APIS_CASCATA.js" "SOUSA_API_EXECUTOR_UNIVERSAL.js"
  "SOUSA_USB_ADAPTERS.js" "SOUSA_USB_REGISTRY.js" "SOUSA_USB_CONTRATO.js"
  "SOUSA_USB_TRANSPORTES.js" "SOUSA_USB_BOOT.js"
  "SOUSA_VALIDACAO_CASCATA.js" "SOUSA_VALIDADOR_UNIVERSAL.js"
  "SOUSA_ADAPTER_ANTHROPIC_MESSAGES.js" "SOUSA_COFRE_CHAVES.json"
  "SOUSA_API_MANAGER.js"
  "01_CORE/SOUSA_Core.js" "01_CORE/SOUSA_Gemini_CLIENT.js"
  "docs/VALIDACAO_CASCATA.md" "docs/VALIDADOR_UNIVERSAL.md"
  "scripts/LIMPAR_NAO_OPERACIONAL.sh" "scripts/SOUSA_GUARD_ARQUIVOS.sh"
)

eh_permitido() {
  local f="$1"
  [[ "$f" == 00_GOVERNANCA/* ]] && return 0
  for p in "${PERMITIDOS[@]}"; do
    [[ "$f" == "$p" ]] && return 0
  done
  return 1
}

eh_proibido() {
  local f="$1"
  case "$f" in
    *.BACKUP*|*.BK_*|*_BACKUP*|BACKUP_*/*|Backups/*) return 0 ;;
    TESTE_*|*/TESTE_*|SOUSA_TESTE_*|*_TESTE_*) return 0 ;;
    *.pdf|*.docx|*.zip|.env|.sousa_redes_credenciais.json) return 0 ;;
    07_LOG/*|Extensions/*|EXTENSOES/*|node_modules/*|.venv/*) return 0 ;;
    CAMPAIGN_*|index.html.LEGACY*) return 0 ;;
  esac
  return 1
}

CMD="${1:-status}"
SUJOS=()
LIMPOS=()

while IFS= read -r f; do
  [ -z "$f" ] && continue
  if eh_proibido "$f"; then
    SUJOS+=("$f")
  elif eh_permitido "$f"; then
    LIMPOS+=("$f")
  else
    SUJOS+=("$f")
  fi
done < <(git ls-files 2>/dev/null || true)

echo "SOUSA 2.0 — Guardiao de arquivos"
echo "Operacionais: ${#LIMPOS[@]} | Sujos/fora: ${#SUJOS[@]}"

case "$CMD" in
  status|audita)
    if [ ${#SUJOS[@]} -gt 0 ]; then
      echo "--- SUJOS ---"
      printf '  %s\n' "${SUJOS[@]}" | head -40
      echo "ESTADO: COM SUJEIRA"
      exit 1
    fi
    echo "ESTADO: LIMPO"
    exit 0
    ;;
  git-add)
    for f in "${LIMPOS[@]}"; do [ -f "$f" ] && git add -- "$f"; done
    for p in "${PERMITIDOS[@]}"; do [ -f "$p" ] && git add -- "$p"; done
    [ -d 00_GOVERNANCA ] && git add -- 00_GOVERNANCA/ 2>/dev/null || true
    echo "OK git add so identidade"
    ;;
  clasp-push)
    if [ ${#SUJOS[@]} -gt 0 ]; then
      echo "ABORTADO: limpe sujeira antes (LIMPAR_NAO_OPERACIONAL.sh --force)"
      exit 1
    fi
    command -v clasp >/dev/null || { echo "clasp ausente"; exit 1; }
    clasp push
    ;;
  *)
    echo "Uso: $0 {status|git-add|clasp-push}"
    exit 1
    ;;
esac
