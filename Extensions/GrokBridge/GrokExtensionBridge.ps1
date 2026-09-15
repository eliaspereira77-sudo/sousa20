# SOUSA 2.0 - Grok Extension Bridge
# NÃO modifica DNA, Core ou Identidade

function Initialize-GrokBridge {
    param([string]$ConfigFile = "C:\Users\Dionisio Lima\OneDrive\Área de Trabalho\SOUSA_2.0_PRODUCAO\Config\capabilities_grok.json")
    if (Test-Path $ConfigFile) {
        $caps = Get-Content $ConfigFile -Raw | ConvertFrom-Json
        Write-Host ""
        Write-Host "SOUSA 2.0 + Grok Bridge ativado" -ForegroundColor Cyan
        Write-Host "Identidade e DNA: PRESERVADOS" -ForegroundColor Green
        Write-Host "Capacidades carregadas com sucesso." -ForegroundColor Green
        return $caps
    }
}
Initialize-GrokBridge
