function Invoke-Internal360Scan {
    param([string]$RepoPath)
    Write-Host "[VISAO_INTERNA] Varredura cirúrgica blindada iniciada..." -ForegroundColor Red
    
    # Exclusão total de ambientes e dependências
    $ExcludePatterns = @('*\.venv\*', '*\node_modules\*', '*\.git\*', '*__pycache__\*', '*\dist\*', '*\build\*')
    
    $Files = Get-ChildItem -Path $RepoPath -Recurse -File -Include *.ps1, *.psm1, *.js, *.json -ErrorAction SilentlyContinue | 
             Where-Object { 
                 $path = $_.FullName
                 $isExcluded = $false
                 foreach ($pattern in $ExcludePatterns) {
                     if ($path -like $pattern) { $isExcluded = $true; break }
                 }
                 return -not $isExcluded
             }

    $Flaws = @()
    foreach ($f in $Files) {
        # 1. Arquivos de código vazios (Lixo)
        if ($f.Length -eq 0 -and $f.Extension -match '\.(ps1|psm1|js)$') { 
            $Flaws += "CRITICO_VAZIO: $($f.Name)" 
        }
        # 2. Detecção REAL de BOM (UTF-8: EF BB BF) - Mesma lógica do Mecânico
        elseif ($f.Extension -match '\.(ps1|psm1|js)$' -and $f.Length -ge 3) {
            $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
            if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                $Flaws += "BOM_EM_SCRIPT: $($f.Name)"
            }
        }
    }
    return [PSCustomObject]@{ TotalFiles = $Files.Count; FlawsFound = $Flaws.Count; FlawDetails = $Flaws; Timestamp = (Get-Date).ToUniversalTime().ToString("o") }
}

function Get-CodeHealthMetrics {
    param([PSCustomObject]$ScanResult)
    $HealthScore = if ($ScanResult.FlawsFound -eq 0) { 100 } else { [math]::Max(0, 100 - ($ScanResult.FlawsFound * 2)) }
    $Color = if ($HealthScore -ge 90) { "Green" } elseif ($HealthScore -ge 70) { "Yellow" } else { "Red" }
    Write-Host "[VISAO_INTERNA] Saúde do Código: $HealthScore% | Falhas Reais: $($ScanResult.FlawsFound)" -ForegroundColor $Color
    return $HealthScore
}

function Save-InternalAuditReport {
    param([PSCustomObject]$Report, [string]$SoTPath)
    $Dest = Join-Path $SoTPath "internal_audit\audit_final_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $Dir = Split-Path $Dest -Parent; if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir -Force | Out-Null }
    $Report | ConvertTo-Json -Depth 5 | Set-Content -Path $Dest -Encoding UTF8
    Write-Host "[VISAO_INTERNA] Relatório final salvo na SoT." -ForegroundColor Green
}

Export-ModuleMember -Function Invoke-Internal360Scan, Get-CodeHealthMetrics, Save-InternalAuditReport
