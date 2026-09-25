Write-Host "================================"
Write-Host " SOUSA GERENCIADOR DE MEMORIA"
Write-Host "================================"

$arquivo = "SOUSA_MEMORIA_AUTOMATICA.json"

if (!(Test-Path $arquivo)) {

    Write-Host "Memoria nao encontrada."
    exit

}

$memoria = Get-Content $arquivo -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "Projeto:" $memoria.projeto
Write-Host "Versao:" $memoria.versao
Write-Host "Eventos registrados:" $memoria.eventos.Count
Write-Host ""

Write-Host "Status: MEMORIA OPERACIONAL"