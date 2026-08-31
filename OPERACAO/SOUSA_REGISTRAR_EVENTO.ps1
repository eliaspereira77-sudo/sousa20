Write-Host "================================"
Write-Host " SOUSA REGISTRAR EVENTO"
Write-Host "================================"

$arquivo = "SOUSA_MEMORIA_AUTOMATICA.json"

if (!(Test-Path $arquivo)) {

    Write-Host "Arquivo de memoria nao encontrado."
    exit

}

$memoria = Get-Content $arquivo -Raw | ConvertFrom-Json

if ($null -eq $memoria.eventos) {
    $memoria | Add-Member -MemberType NoteProperty -Name eventos -Value @()
}

$novoEvento = [PSCustomObject]@{

    data = (Get-Date).ToString("dd/MM/yyyy")

    hora = (Get-Date).ToString("HH:mm:ss")

    modulo = "SOUSA_ADS_ACADEMICO"

    acao = "Teste de registro automatico"

    resultado = "Evento registrado com sucesso"

}


$memoria.eventos += $novoEvento


$memoria | ConvertTo-Json -Depth 10 | Out-File $arquivo -Encoding UTF8


Write-Host ""
Write-Host "Evento registrado."
Write-Host "Arquivo atualizado:"
Write-Host $arquivo