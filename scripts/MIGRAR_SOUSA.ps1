# SOUSA 2.0 - Script de Migração Universal
# Este script permite migrar o SOUSA para qualquer ambiente

param(
    [string]$Origem = ".",
    [string]$Destino = ""
)

Write-Host "`n=== MIGRACAO SOUSA 2.0 ===" -Fore Cyan

# 1. Validar origem
if (-not (Test-Path "$Origem/00_GOVERNANCA/SOUSA_SOURCE_OF_TRUTH.json")) {
    Write-Host "[ERRO] Origem inválida - SOUSA_SOURCE_OF_TRUTH.json não encontrado" -Fore Red
    exit 1
}

Write-Host "[OK] Origem validada" -Fore Green

# 2. Criar backup
$backup = "BACKUP_MIGRACAO_$(Get-Date -Format yyyyMMdd_HHmmss).zip"
Compress-Archive -Path "$Origem/*" -DestinationPath $backup -Force
Write-Host "[OK] Backup criado: $backup" -Fore Green

# 3. Copiar para destino (se especificado)
if ($Destino -ne "") {
    Copy-Item -Path "$Origem/*" -Destination $Destino -Recurse -Force
    Write-Host "[OK] Copiado para: $Destino" -Fore Green
}

# 4. Validar destino
if ($Destino -ne "" -and -not (Test-Path "$Destino/00_GOVERNANCA/SOUSA_SOURCE_OF_TRUTH.json")) {
    Write-Host "[ERRO] Falha na migração" -Fore Red
    exit 1
}

Write-Host "`n=== MIGRACAO CONCLUIDA ===" -Fore Green
Write-Host "O SOUSA 2.0 agora está disponível no novo ambiente" -Fore White
