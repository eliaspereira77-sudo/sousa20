Clear-Host

$configArquivo = "SOUSA_MENU_CONFIG.json"
$memoriaArquivo = "SOUSA_MEMORIA_AUTOMATICA.json"

if (!(Test-Path $configArquivo)) {
    Write-Host "Arquivo de configuracao nao encontrado." -ForegroundColor Red
    exit
}

$config = Get-Content $configArquivo -Raw | ConvertFrom-Json

$dataHora = Get-Date -Format "dd/MM/yyyy HH:mm:ss"


function Registrar-SOUSA {

    param(
        $Modulo,
        $Acao,
        $Resultado
    )

    if (Test-Path $memoriaArquivo) {

        $memoria = Get-Content $memoriaArquivo -Raw | ConvertFrom-Json

    }
    else {

        $memoria = @{
            projeto = "SOUSA 2.0"
            eventos = @()
        }

    }


    $evento = @{
        data = $dataHora
        modulo = $Modulo
        acao = $Acao
        resultado = $Resultado
    }


    $memoria.eventos += $evento


    $memoria | ConvertTo-Json -Depth 10 | Out-File $memoriaArquivo -Encoding UTF8

}



Write-Host "================================" -ForegroundColor Cyan
Write-Host "        SOUSA 2.0 MENU V1.5" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Execucao: $dataHora"
Write-Host ""


foreach ($item in $config.menu) {

    Write-Host "$($item.opcao) - $($item.nome) [$($item.status)]"

}


Write-Host "0 - Sair"
Write-Host ""


$opcao = Read-Host "Escolha uma opcao"


if ($opcao -eq "0") {

    Registrar-SOUSA "SOUSA_MENU_V1.5" "Encerramento" "Executado"

    Write-Host "SOUSA 2.0 encerrado." -ForegroundColor Green
    exit

}


$item = $config.menu | Where-Object {$_.opcao -eq $opcao}


if ($null -eq $item) {

    Registrar-SOUSA "SOUSA_MENU_V1.5" "Opcao invalida" "Falha"

    Write-Host "Opcao invalida." -ForegroundColor Red
    exit

}


Write-Host ""
Write-Host "Executando: $($item.nome)" -ForegroundColor Yellow


switch ($item.acao) {


    "SOUSA_REGISTRO_ATALHO.ps1" {

        .\SOUSA_REGISTRO_ATALHO.ps1
        Registrar-SOUSA $item.nome $item.acao "Sucesso"

    }


    "sousa-backup" {

        sousa-backup
        Registrar-SOUSA $item.nome $item.acao "Sucesso"

    }


    "sousa-monitor" {

        sousa-monitor
        Registrar-SOUSA $item.nome $item.acao "Sucesso"

    }


    "sousa-status" {

        sousa-status
        Registrar-SOUSA $item.nome $item.acao "Sucesso"

    }


}