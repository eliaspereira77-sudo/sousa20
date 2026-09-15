# BOOT SOUSA 2.0 - Comando Único Simplificado
# Execute: .\boot_sousa.ps1

$ErrorActionPreference = "Continue"
$SCRIPT_ROOT = if ($PSScriptRoot) { $PSScriptRoot } else { $PWD.Path }
$LOG_DIR = Join-Path $SCRIPT_ROOT "logs"

if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "🚀 SOUSA 2.0 v2.0.1 - INICIANDO" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

Write-Host "📁 Local: $SCRIPT_ROOT" -ForegroundColor Gray
Write-Host "📁 Logs: $LOG_DIR`n" -ForegroundColor Gray

$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) { Write-Host "✅ Python: $($python.Source)" -ForegroundColor Green }
else { Write-Host "⚠️ Python: NÃO ENCONTRADO" -ForegroundColor Yellow }

Write-Host "`n🤖 AGENTES CONFIGURADOS:" -ForegroundColor Cyan
foreach ($a in @("SOUSAILEON", "CÂ£O DE GUARDA", "MONITOR DE SYNTAXE", "MEC‚NICO/FAXINEIRO")) {
    Write-Host "  ⚙️  $a" -ForegroundColor Gray
}

Write-Host "`n🛠️  AUTOMANUTEN€‹O..." -ForegroundColor Cyan
$tempFiles = Get-ChildItem -Path $LOG_DIR -Filter "*.log" -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
$count = 0; foreach ($f in $tempFiles) { Remove-Item -Path $f.FullName -Force; $count++ }
Write-Host "  🧹 Limpeza: $count arquivos removidos" -ForegroundColor Green
[System.GC]::Collect()
Write-Host "  ⚡ Otimiza€‹o: cache limpo" -ForegroundColor Green

try {
    $os = (Get-WmiObject Win32_OperatingSystem).Caption
    $ram = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    Write-Host "`n💻 SISTEMA: $os | RAM: $ram GB`n" -ForegroundColor Gray
} catch { Write-Host "`n⚠️ Info do sistema indispon€­vel`n" -ForegroundColor Yellow }

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ SOUSA 2.0 PRONTO PARA OPERA€‡‹O" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Cyan