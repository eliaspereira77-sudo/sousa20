Write-Host "================================"
Write-Host " SOUSA REGISTRO ATALHO"
Write-Host "================================"

$script = ".\SOUSA_REGISTRAR_EVENTO.ps1"

if (Test-Path $script) {

    & $script

}
else {

    Write-Host "SOUSA_REGISTRAR_EVENTO.ps1 nao encontrado."

}