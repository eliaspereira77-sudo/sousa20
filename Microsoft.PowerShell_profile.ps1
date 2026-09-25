# ==========================================================
# Perfil personalizado SOUSA 2.0 - Elias
# Ambiente PowerShell + Cão de Guarda
# ==========================================================

$Desktop = [Environment]::GetFolderPath("Desktop")

$SOUSA_CORE_PATH = Join-Path $Desktop "SOUSA_2.0_PRODUCAO"
$SOUSA_INSTALLER_PATH = Join-Path $Desktop "SOUSA_INSTALLER"


function sousa-core {
    Set-Location $SOUSA_CORE_PATH
    Write-Host "Você esta em: sousa2-core (Google Apps Script)" -ForegroundColor Cyan
}


function sousa-installer {
    Set-Location $SOUSA_INSTALLER_PATH
    Write-Host "Voce esta em: SOUSA_INSTALLER (Electron)" -ForegroundColor Cyan
}


function sousa-monitor {
    Set-Location $SOUSA_CORE_PATH

    Write-Host "===== SOUSA MONITOR SINTAXE =====" -ForegroundColor Yellow
    Write-Host "🐕 Iniciando Cão de Guarda SOUSA 2.0..." -ForegroundColor Cyan

    node MonitorSintaxe.js
}


function sousa-push {
    $pastaAtual = Get-Location

    Set-Location $SOUSA_CORE_PATH

    Write-Host "===== SOUSA PUSH =====" -ForegroundColor Yellow
    Write-Host "Isso vai enviar o codigo local para o Google Apps Script."

    $confirmacao = Read-Host "Confirma o push? (s/n)"

    if ($confirmacao -eq "s") {

        Write-Host "🐕 Executando Cão de Guarda antes do envio..." -ForegroundColor Cyan

        node MonitorSintaxe.js

        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Push bloqueado. Corrija os erros." -ForegroundColor Red
            Set-Location $pastaAtual
            return
        }

        clasp push

        Write-Host "Push concluido." -ForegroundColor Green

    }
    else {

        Write-Host "Push cancelado." -ForegroundColor Red

    }

    Set-Location $pastaAtual
}


function sousa-deploy {

    $pastaAtual = Get-Location

    Set-Location $SOUSA_CORE_PATH

    $agora = Get-Date -Format "yyyy-MM-dd HH:mm"

    Write-Host "===== SOUSA DEPLOY =====" -ForegroundColor Yellow

    clasp deploy --description "Deploy $agora"

    Set-Location $pastaAtual
}


function sousa-backup {

    $pastaAtual = Get-Location

    Set-Location $SOUSA_INSTALLER_PATH

    Write-Host "===== SOUSA BACKUP =====" -ForegroundColor Yellow

    node iniciar.js

    Set-Location $pastaAtual
}


function sousa-status {

    $pastaAtual = Get-Location

    Set-Location $SOUSA_CORE_PATH

    Write-Host "===== SOUSA STATUS =====" -ForegroundColor Cyan
    Write-Host "🐕 Executando Cão de Guarda..." -ForegroundColor Yellow

    node MonitorSintaxe.js

    Write-Host ""
    Write-Host "⚙️ Executando Núcleo Orquestrador..." -ForegroundColor Yellow

    node NucleoOrquestrador.js

    Write-Host ""
    Write-Host "📱 Painel atualizado." -ForegroundColor Green

    Set-Location $pastaAtual
}


function sousa-painel {

    $pastaAtual = Get-Location

    Set-Location $SOUSA_CORE_PATH

    Write-Host "===== SOUSA PAINEL =====" -ForegroundColor Cyan

    Write-Host "🐕 Atualizando Cão de Guarda..." -ForegroundColor Yellow
    node MonitorSintaxe.js

    Write-Host ""
    Write-Host "⚙️ Atualizando Núcleo Orquestrador..." -ForegroundColor Yellow
    node NucleoOrquestrador.js

    Write-Host ""
    Write-Host "🌐 Abrindo painel HTML..." -ForegroundColor Green

    Start-Process "PAINEL_SOUSA.html"

    Set-Location $pastaAtual
}

function sousa-registro {
    .\SOUSA_REGISTRO_ATALHO.ps1
}

