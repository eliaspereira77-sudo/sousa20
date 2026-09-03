# =====================================================================
# SOUSA 2.0 — FECHAR PENDÊNCIAS (PR OmniRoute + Módulo ADS)
# =====================================================================
# Faz duas coisas, nesta ordem:
#   1) Mescla o Pull Request feature/omniroute-integration
#   2) Adiciona/commita/sobe os 2 arquivos do Módulo ADS (se existirem
#      localmente na pasta do projeto)
#
# Requer: gh CLI instalado (https://cli.github.com) e rodar DENTRO da
# pasta do repositório clonado (SOUSA 2.0 PRODUÇÃO / sousa20).
#
# Login: se ainda não estiver autenticado, o comando abaixo abre o
# navegador e pede um código de 8 dígitos — sem copiar/colar token.
# =====================================================================

$Repo = "eliaspereira77-sudo/sousa20"

Write-Host "`n=== SOUSA 2.0 — Fechar Pendências ===`n" -ForegroundColor Cyan

# 0) Login (só roda o navegador se ainda não estiver logado) -----------
$statusAuth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Não autenticado. Abrindo login no navegador..." -ForegroundColor Yellow
    gh auth login --web --git-protocol https
} else {
    Write-Host "[OK] Já autenticado no GitHub." -ForegroundColor Green
}

# 1) MESCLAR O PR DO OMNIROUTE ------------------------------------------
Write-Host "`n1) Mesclando PR feature/omniroute-integration..." -ForegroundColor Yellow
gh pr merge feature/omniroute-integration --repo $Repo --merge --delete-branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] PR mesclado (branch remota apagada)." -ForegroundColor Green
} else {
    Write-Host "[FALHA] Não consegui mesclar automaticamente — confira se o PR já foi mesclado antes, ou mescle manualmente pelo link:" -ForegroundColor Red
    Write-Host "        https://github.com/$Repo/pull/new/feature/omniroute-integration" -ForegroundColor Red
}

# 2) SUBIR OS 2 ARQUIVOS DO MÓDULO ADS ----------------------------------
Write-Host "`n2) Verificando arquivos do Módulo ADS na pasta local..." -ForegroundColor Yellow

# Garante que estamos na branch principal e atualizados antes de commitar
git checkout main 2>&1 | Out-Null
git pull origin main 2>&1 | Out-Null

$arquivo1 = "core\modulo_ads.py"
$arquivo2 = "test_modulo_ads_harness.py"

$existe1 = Test-Path $arquivo1
$existe2 = Test-Path $arquivo2

if (-not $existe1 -or -not $existe2) {
    Write-Host "[FALHA] Não encontrei os arquivos na pasta atual:" -ForegroundColor Red
    if (-not $existe1) { Write-Host "        faltando: $arquivo1" -ForegroundColor Red }
    if (-not $existe2) { Write-Host "        faltando: $arquivo2" -ForegroundColor Red }
    Write-Host "        Confirme se está na pasta raiz do repositório clonado." -ForegroundColor Red
} else {
    git add $arquivo1 $arquivo2
    git commit -m "feat: adiciona Modulo ADS (diagnosticar + harness 10/10)"
    git push origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Módulo ADS commitado e enviado pro GitHub." -ForegroundColor Green
    } else {
        Write-Host "[FALHA] git push falhou — verifique a mensagem de erro acima (auth, conflito, etc.)." -ForegroundColor Red
    }
}

Write-Host "`n=== FIM ===`n" -ForegroundColor Cyan
