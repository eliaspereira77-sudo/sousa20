# =========================================================
# SOUSA_STRUCTURE_SCANNER_v0.1
# Função: Mapeamento não intrusivo da estrutura SOUSA 2.0
# Modo: SOMENTE LEITURA
# =========================================================

$root = Get-Location

$report = @{
    metadata = @{
        scan_timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        root_path = $root.Path
        scanner_version = "0.1"
    }

    folders = @()
    files = @()
    extensions = @{}
}

# Coleta pastas
Get-ChildItem -Path $root -Directory -Recurse -ErrorAction SilentlyContinue |
Where-Object {
    $_.Name -notin @("node_modules",".git")
} |
ForEach-Object {

    $report.folders += $_.FullName

}


# Coleta arquivos
Get-ChildItem -Path $root -File -Recurse -ErrorAction SilentlyContinue |
Where-Object {

    $_.Name -notmatch "^\.env"

} |
ForEach-Object {

    $ext = $_.Extension

    if ($ext -eq "") {
        $ext = "SEM_EXTENSAO"
    }

    if ($report.extensions.ContainsKey($ext)) {
        $report.extensions[$ext]++
    }
    else {
        $report.extensions[$ext] = 1
    }

    $report.files += @{
        name = $_.Name
        path = $_.FullName
        extension = $ext
        size = $_.Length
    }

}


# Gera relatório
$report |
ConvertTo-Json -Depth 6 |
Out-File ".\SOUSA_DISCOVERY_REPORT.json" -Encoding UTF8


Write-Host "========================================================="
Write-Host " SCAN DE ESTRUTURA CONCLUIDO"
Write-Host " Relatorio:"
Write-Host "$root\SOUSA_DISCOVERY_REPORT.json"
Write-Host "========================================================="