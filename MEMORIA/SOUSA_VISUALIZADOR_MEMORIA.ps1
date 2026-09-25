Clear-Host

$arquivo = "SOUSA_MEMORIA_AUTOMATICA.json"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SOUSA VISUALIZADOR MEMORIA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $arquivo)) {

    Write-Host "Memoria nao encontrada." -ForegroundColor Red
    exit

}

$memoria = Get-Content $arquivo -Raw | ConvertFrom-Json

Write-Host "Projeto :" $memoria.projeto
Write-Host "Modulo  :" $memoria.modulo
Write-Host ""

$total = $memoria.eventos.Count

Write-Host "Eventos registrados:" $total -ForegroundColor Yellow
Write-Host ""

if ($total -gt 0) {

    $ultimo = $memoria.eventos[-1]

    Write-Host "ULTIMO EVENTO" -ForegroundColor Green
    Write-Host "------------------------------"
    Write-Host "Data      :" $ultimo.data
    Write-Host "Modulo    :" $ultimo.modulo
    Write-Host "Acao      :" $ultimo.acao
    Write-Host "Resultado :" $ultimo.resultado
    Write-Host ""

}

Write-Host "Memoria operacional OK." -ForegroundColor Green