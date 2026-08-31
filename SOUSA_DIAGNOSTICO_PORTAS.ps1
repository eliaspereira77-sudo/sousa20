# ==========================================================
# SOUSA 2.0 — DIAGNOSTICO DE PORTAS E COMUNICACAO (WINDOWS)
# ==========================================================
# Objetivo: identificar exatamente qual porta/processo/regra
# de firewall esta envolvida no contratempo de comunicacao,
# SEM alterar nada — apenas diagnostico.
#
# Cole este bloco inteiro no PowerShell (nao precisa rodar
# como Administrador para a maior parte, mas para a secao de
# Firewall o ideal e abrir o PowerShell como Administrador).
# ==========================================================

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SOUSA 2.0 - DIAGNOSTICO DE PORTAS" -ForegroundColor Cyan
Write-Host "Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ----------------------------------------------------------
# 1. Portas conhecidas do ecossistema SOUSA 2.0
# ----------------------------------------------------------
$portasSousa = @(5000, 3000, 8080, 8000, 4000)

Write-Host "--- 1. Portas conhecidas do SOUSA 2.0 ---" -ForegroundColor Yellow
foreach ($porta in $portasSousa) {
    $conexoes = Get-NetTCPConnection -LocalPort $porta -ErrorAction SilentlyContinue
    if ($conexoes) {
        foreach ($c in $conexoes) {
            $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
            $nomeProc = if ($proc) { $proc.ProcessName } else { "desconhecido" }
            Write-Host "Porta $porta -> EM USO | Estado: $($c.State) | PID: $($c.OwningProcess) | Processo: $nomeProc"
        }
    } else {
        Write-Host "Porta $porta -> LIVRE (nenhum processo escutando)"
    }
}

Write-Host ""

# ----------------------------------------------------------
# 2. Todas as portas em LISTEN no momento (visao geral)
# ----------------------------------------------------------
Write-Host "--- 2. Todas as portas em LISTEN agora ---" -ForegroundColor Yellow
Get-NetTCPConnection -State Listen |
    Select-Object LocalAddress, LocalPort, OwningProcess |
    Sort-Object LocalPort |
    ForEach-Object {
        $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        $nomeProc = if ($proc) { $proc.ProcessName } else { "desconhecido" }
        Write-Host "$($_.LocalAddress):$($_.LocalPort) | PID: $($_.OwningProcess) | Processo: $nomeProc"
    }

Write-Host ""

# ----------------------------------------------------------
# 3. Regras de Firewall relacionadas a Node/Python (SOUSA roda em ambos)
# ----------------------------------------------------------
Write-Host "--- 3. Regras de Firewall (Node/Python) ---" -ForegroundColor Yellow
try {
    Get-NetFirewallRule -ErrorAction Stop |
        Where-Object { $_.DisplayName -match "node|python|sousa" -or $_.ApplicationName -match "node|python" } |
        Select-Object DisplayName, Direction, Action, Enabled |
        Format-Table -AutoSize
} catch {
    Write-Host "Nao foi possivel ler regras de Firewall. Rode o PowerShell como Administrador para esta secao." -ForegroundColor Red
}

Write-Host ""

# ----------------------------------------------------------
# 4. Teste de acesso local (loopback) ao backend Flask
# ----------------------------------------------------------
Write-Host "--- 4. Teste de acesso local (127.0.0.1:5000/health) ---" -ForegroundColor Yellow
try {
    $resposta = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "Status: $($resposta.StatusCode) | Resposta: $($resposta.Content)" -ForegroundColor Green
} catch {
    Write-Host "Falha ao acessar 127.0.0.1:5000/health -> $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ----------------------------------------------------------
# 5. Teste de acesso pela rede local (IP da maquina)
# ----------------------------------------------------------
Write-Host "--- 5. Teste de acesso pela rede local (192.168.1.4:5000/health) ---" -ForegroundColor Yellow
try {
    $resposta2 = Invoke-WebRequest -Uri "http://192.168.1.4:5000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "Status: $($resposta2.StatusCode) | Resposta: $($resposta2.Content)" -ForegroundColor Green
} catch {
    Write-Host "Falha ao acessar 192.168.1.4:5000/health -> $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO CONCLUIDO" -ForegroundColor Cyan
Write-Host "Nada foi alterado. Este script apenas leu o estado atual." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
