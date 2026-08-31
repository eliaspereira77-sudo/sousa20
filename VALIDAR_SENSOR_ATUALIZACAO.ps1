$arquivo = ".\SOUSA_2.0_PAINEL_OPERACIONAL.html"

$texto = Get-Content $arquivo -Raw -Encoding UTF8

$alvos = @(
    "const ENDPOINT = APPS_SCRIPT_URL;",
    "function atualizarIndicadorTunel(estado, textoExtra) {",
    "const ConnectionManager = (() => {"
)

foreach ($alvo in $alvos) {
    if ($texto.IndexOf($alvo) -lt 0) {
        Write-Host "ERRO: trecho não encontrado: $alvo" -ForegroundColor Red
        exit 1
    }
}

Write-Host "VALIDAÇÃO: todos os pontos encontrados." -ForegroundColor Green
Write-Host "Nenhuma alteração foi feita ainda."
