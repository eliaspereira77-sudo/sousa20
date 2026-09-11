# SOUSA 2.0 - Instalacao/validacao dos contratos de estado e operacao remota
# Coloque este arquivo e os dois JSON na raiz do SOUSA 2.0 e execute no PowerShell.
$ErrorActionPreference = "Stop"

$contratos = @(
  (Join-Path $PSScriptRoot "SOUSA_CONTRATO_ESTADO_OPERACIONAL_2026-09-09.json"),
  (Join-Path $PSScriptRoot "SOUSA_REMOTE_SYNC_ANDROID_WINDOWS.json")
)

foreach ($arquivo in $contratos) {
  if (!(Test-Path -LiteralPath $arquivo)) {
    throw "Contrato nao encontrado: $arquivo"
  }
  Get-Content -LiteralPath $arquivo -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null
  Write-Host "VALIDADO: $arquivo"
}

Write-Host ""
Write-Host "SOUSA 2.0 - contratos validados com sucesso." -ForegroundColor Green
Write-Host "Estado operacional: ESPECIFICADO"
Write-Host "Sincronizacao Android/Windows: ESPECIFICADA"
Write-Host ""
Write-Host "IMPORTANTE: esta etapa instala/valida os contratos. Ela NAO ativa sozinha um agente remoto no PC, nem cria credenciais." -ForegroundColor Yellow
