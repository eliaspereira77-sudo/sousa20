Clear-Host

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "     SOUSA ORGANIZADOR V1.0" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$pastas = @(
    "CENTRAL",
    "OPERACAO",
    "MEMORIA",
    "CONFIG"
)

foreach ($p in $pastas){

    if(!(Test-Path $p)){
        New-Item -ItemType Directory -Name $p | Out-Null
    }

}

Write-Host "Movendo arquivos..." -ForegroundColor Yellow

Move-Item "SOUSA_CENTRAL.ps1" "CENTRAL\" -Force -ErrorAction SilentlyContinue

Move-Item "SOUSA_REGISTRAR_EVENTO.ps1" "OPERACAO\" -Force -ErrorAction SilentlyContinue
Move-Item "SOUSA_REGISTRO_ATALHO.ps1" "OPERACAO\" -Force -ErrorAction SilentlyContinue
Move-Item "SOUSA_REGISTRO_AUTOMATICO.ps1" "OPERACAO\" -Force -ErrorAction SilentlyContinue

Move-Item "SOUSA_VISUALIZADOR_MEMORIA.ps1" "MEMORIA\" -Force -ErrorAction SilentlyContinue
Move-Item "SOUSA_GERENCIADOR_MEMORIA.ps1" "MEMORIA\" -Force -ErrorAction SilentlyContinue
Move-Item "SOUSA_MEMORIA_AUTOMATICA.json" "MEMORIA\" -Force -ErrorAction SilentlyContinue

Move-Item "SOUSA_MENU_CONFIG.json" "CONFIG\" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host " ORGANIZACAO CONCLUIDA" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "CENTRAL     OK"
Write-Host "OPERACAO    OK"
Write-Host "MEMORIA     OK"
Write-Host "CONFIG      OK"

Write-Host ""
Write-Host "SOUSA 2.0 organizado." -ForegroundColor Cyan