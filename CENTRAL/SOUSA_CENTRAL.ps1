Clear-Host

while ($true) {

    Clear-Host

    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "        SOUSA CENTRAL 2.0" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1 - Operação"
    Write-Host "2 - Memória"
    Write-Host "3 - Backup"
    Write-Host "4 - Monitor"
    Write-Host "5 - Status"
    Write-Host "0 - Sair"
    Write-Host ""

    $opcao = Read-Host "Escolha"

    switch ($opcao) {

        "1" {

            .\SOUSA_REGISTRO_ATALHO.ps1

            Pause

        }

        "2" {

            .\SOUSA_VISUALIZADOR_MEMORIA.ps1

            Pause

        }

        "3" {

            sousa-backup

            Pause

        }

        "4" {

            sousa-monitor

            Pause

        }

        "5" {

            sousa-status

            Pause

        }

        "0" {

            break

        }

        default {

            Write-Host ""
            Write-Host "Opção inválida." -ForegroundColor Red

            Pause

        }

    }

}