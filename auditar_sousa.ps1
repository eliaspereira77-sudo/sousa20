<#
.SYNOPSIS
    Auditor de Operacionalidade e Integracao - SOUSA 2.0
#>
[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Curto,
    [switch]$Salvar,
    [switch]$Abrir
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }
Set-Location $Root

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "      SOUSA 2.0 - AUDITOR DE OPERACIONALIDADE" -ForegroundColor Cyan
Write-Host "      $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# --- 1) Localizar Python ---
$python = $null
$candidatos = @(
    (Join-Path $Root ".venv\Scripts\python.exe"),
    "python",
    "python3",
    "py"
)

foreach ($c in $candidatos) {
    try {
        if (Test-Path $c) {
            $python = $c
            break
        } else {
            $cmd = Get-Command $c -ErrorAction Stop
            $python = $cmd.Source
            break
        }
    } catch { continue }
}

if (-not $python) {
    Write-Host "[X] Python nao encontrado no PATH nem em .venv\" -ForegroundColor Red
    exit 1
}

Write-Host "  Python: $python" -ForegroundColor DarkGray
$ver = & $python --version 2>&1
Write-Host "  Versao: $ver" -ForegroundColor DarkGray
Write-Host ""

# --- 2) Validar auditor_sousa.py ---
$auditor = Join-Path $Root "auditor_sousa.py"
if (-not (Test-Path $auditor)) {
    Write-Host "[X] auditor_sousa.py nao encontrado em $Root" -ForegroundColor Red
    Write-Host "    Crie o arquivo antes de rodar." -ForegroundColor Yellow
    exit 1
}

# --- 3) Montar argumentos ---
$pyArgs = @($auditor)
if ($Json)   { $pyArgs += "--json" }
if ($Curto)  { $pyArgs += "--curto" }
if ($Salvar) { $pyArgs += "--salvar" }

# --- 4) Executar ---
Write-Host ">> Executando auditoria..." -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

$inicio = Get-Date
& $python @pyArgs
$exit = $LASTEXITCODE
$duracao = (Get-Date) - $inicio

Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Tempo total: $([math]::Round($duracao.TotalSeconds, 2))s" -ForegroundColor DarkGray

switch ($exit) {
    0 { Write-Host "  Status: OK - OPERACIONAL (exit 0)" -ForegroundColor Green }
    1 { Write-Host "  Status: ATENCAO - PENDENCIAS (exit 1)" -ForegroundColor Yellow }
    default { Write-Host "  Status: ERRO (exit $exit)" -ForegroundColor Red }
}

if ($Abrir) {
    $logs = Join-Path $Root "logs"
    if (Test-Path $logs) {
        Start-Process explorer.exe $logs
        Write-Host "  logs/ aberto no Explorer." -ForegroundColor Cyan
    }
}

Write-Host ""
exit $exit
