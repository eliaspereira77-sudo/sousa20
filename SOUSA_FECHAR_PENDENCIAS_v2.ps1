# =====================================================================
# SOUSA 2.0 - FECHAR PENDENCIAS (PR OmniRoute + Modulo ADS)
# =====================================================================
# Faz duas coisas, nesta ordem:
#   1) Mescla o Pull Request feature/omniroute-integration
#   2) Adiciona/commita/sobe os 2 arquivos do Modulo ADS (se existirem
#      localmente na pasta do projeto)
#
# Requer: gh CLI instalado (https://cli.github.com) e rodar DENTRO da
# pasta do repositorio clonado (SOUSA 2.0 PRODUCAO / sousa20).
#
# Login: se ainda nao estiver autenticado, o comando abaixo abre o
# navegador e pede um codigo de 8 digitos - sem copiar/colar token.
# =====================================================================

$Repo = "eliaspereira77-sudo/sousa20"

Write-Host ""
Write-Host "=== SOUSA 2.0 - Fechar Pendencias ===" -ForegroundColor Cyan
Write-Host ""

# 0) Login (so roda o navegador se ainda nao estiver logado) -----------
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nao autenticado. Abrindo login no navegador..." -ForegroundColor Yellow
    gh auth login --web --git-protocol https
} else {
    Write-Host "[OK] Ja autenticado no GitHub." -ForegroundColor Green
}

# 1) MESCLAR O PR DO OMNIROUTE ------------------------------------------
Write-Host ""
Write-Host "1) Mesclando PR feature/omniroute-integration..." -ForegroundColor Yellow
gh pr merge feature/omniroute-integration --repo $Repo --merge --delete-branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] PR mesclado (branch remota apagada)." -ForegroundColor Green
} else {
    Write-Host "[FALHA] Nao consegui mesclar automaticamente. Confira se o PR ja foi mesclado antes, ou mescle manualmente pelo link:" -ForegroundColor Red
    Write-Host "        https://github.com/$Repo/pull/new/feature/omniroute-integration" -ForegroundColor Red
}

# 2) SUBIR OS 2 ARQUIVOS DO MODULO ADS ----------------------------------
Write-Host ""
Write-Host "2) Verificando arquivos do Modulo ADS na pasta local..." -ForegroundColor Yellow

git checkout main 2>&1 | Out-Null
git pull origin main 2>&1 | Out-Null

$arquivo1 = "core\modulo_ads.py"
$arquivo2 = "test_modulo_ads_harness.py"

$existe1 = Test-Path $arquivo1
$existe2 = Test-Path $arquivo2

if ((-not $existe1) -or (-not $existe2)) {
    Write-Host "[FALHA] Nao encontrei os arquivos na pasta atual:" -ForegroundColor Red
    if (-not $existe1) { Write-Host "        faltando: $arquivo1" -ForegroundColor Red }
    if (-not $existe2) { Write-Host "        faltando: $arquivo2" -ForegroundColor Red }
    Write-Host "        Confirme se esta na pasta raiz do repositorio clonado." -ForegroundColor Red
} else {
    git add $arquivo1 $arquivo2
    git commit -m "feat: adiciona Modulo ADS (diagnosticar + harness 10 de 10)"
    git push origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Modulo ADS commitado e enviado pro GitHub." -ForegroundColor Green
    } else {
        Write-Host "[FALHA] git push falhou. Verifique a mensagem de erro acima (auth, conflito, etc)." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== FIM ===" -ForegroundColor Cyan
Write-Host ""
