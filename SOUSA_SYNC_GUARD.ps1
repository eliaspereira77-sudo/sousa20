# =================================================================================================
# SOUSA_SYNC_GUARD.ps1
# -------------------------------------------------------------------------------------------------
# Extensão de SOUSA_AUTOGESTAO_ELO (versão PowerShell nativa)
# Caminho feliz mínimo de sincronização — MODO OBSERVAÇÃO (v0.1.0)
#
# Princípios permanentes aplicados:
# - Automação 99,99% / Soberania 0,01%
# - Source of Truth único e autoritativo (manifesto canônico)
# - Runtime NUNCA promove estado divergente a novo Source of Truth
# - Reutilizar > Aprimorar > Integrar > Reparar > Isolar
# - Nenhuma mutação de produção nesta versão
# - Wolverine como comportamento transversal
# - SOUSA cuida do próprio SOUSA
#
# Fluxo obrigatório desta versão:
#   1. Ler manifesto canônico (Source of Truth)
#   2. Inventariar estado real da pasta
#   3. Diff (esperado × encontrado)
#   4. Classificar divergências
#   5. Consolidar (registro + memória)
#   6. Relatório soberano ao Fundador
#
# Proibido nesta versão:
#   - Qualquer exclusão ou alteração de arquivos de produção
#   - Qualquer promoção automática de estado local a SoT
#
# Uso:
#   .\SOUSA_SYNC_GUARD.ps1
#   ou
#   .\SOUSA_SYNC_GUARD.ps1 -Pasta "C:\caminho\para\SOUSA_2.0_PRODUCAO"
# =================================================================================================

param(
    [string]$Pasta = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$Version = "0.1.0-observation"
$Mode    = "OBSERVATION"

# ================================================================================================
# CONSTANTES E CATEGORIAS
# ================================================================================================

$CATEGORIES = @{
    REUTILIZAR = "REUTILIZAR"
    APRIMORAR  = "APRIMORAR"
    INTEGRAR   = "INTEGRAR"
    REPARAR    = "REPARAR"
    ISOLAR     = "ISOLAR"
}

$ISOLATE_SUBTYPES = @{
    HISTORICO                  = "HISTORICO"
    DUPLICATA                  = "DUPLICATA"
    ORFAO                      = "ORFAO"
    BACKUP                     = "BACKUP"
    QUARENTENA                 = "QUARENTENA"
    ARTEFATO_DEV               = "ARTEFATO_DEV"
    MEMORIA                    = "MEMORIA"
    DIVERGENCIA_REAL_SOBERANIA = "DIVERGENCIA_REAL_SOBERANIA"
}

# ================================================================================================
# 1. SOURCE OF TRUTH — Manifesto Canônico
# ================================================================================================

function Get-CanonicalManifest {
    $manifestPath = Join-Path $Pasta "SOUSA_SOT_MANIFEST.json"

    if (Test-Path $manifestPath) {
        try {
            $raw = Get-Content -Path $manifestPath -Raw -Encoding UTF8
            return $raw | ConvertFrom-Json
        }
        catch {
            Write-Wolverine "Get-CanonicalManifest" $_
        }
    }

    # Manifesto placeholder de observação (não é Source of Truth real)
    return [PSCustomObject]@{
        version         = "0.0.0-observation"
        generatedAt     = (Get-Date).ToUniversalTime().ToString("o")
        authority       = "OBSERVATION_PLACEHOLDER"
        modules         = @()
        ignoredPatterns = @("*.bak", "*backup*", "*quarentena*", "*old*", "*tmp*", "*test*")
        notes           = "Manifesto placeholder. Substituir pelo manifesto gerado pelo pipeline (Git)."
    }
}

# ================================================================================================
# 2. INVENTÁRIO — Estado real da pasta
# ================================================================================================

function Get-RuntimeInventory {
    $inventory = [PSCustomObject]@{
        timestamp   = (Get-Date).ToUniversalTime().ToString("o")
        environment = "WINDOWS_LOCAL"
        root        = $Pasta
        files       = @()
        notes       = @()
    }

    try {
        $files = Get-ChildItem -Path $Pasta -File -Recurse -ErrorAction SilentlyContinue |
                 Where-Object { $_.Extension -match '\.(js|gs|json|ps1|md|txt)$' }

        foreach ($f in $files) {
            $rel = $f.FullName.Substring($Pasta.Length).TrimStart('\','/')
            $hash = $null
            try {
                $hash = (Get-FileHash -Path $f.FullName -Algorithm SHA256).Hash
            } catch {}

            $inventory.files += [PSCustomObject]@{
                path     = $rel
                fullPath = $f.FullName
                size     = $f.Length
                hash     = $hash
                lastWrite = $f.LastWriteTimeUtc.ToString("o")
            }
        }

        $inventory.notes += "Inventário concluído. Total de arquivos relevantes: $($inventory.files.Count)"
    }
    catch {
        Write-Wolverine "Get-RuntimeInventory" $_
        $inventory.notes += "Falha parcial no inventário: $($_.Exception.Message)"
    }

    return $inventory
}

# ================================================================================================
# 3. DIFF — Esperado × Encontrado
# ================================================================================================

function Compute-Diff {
    param($Manifest, $Inventory)

    $diff = [PSCustomObject]@{
        timestamp       = (Get-Date).ToUniversalTime().ToString("o")
        expectedCount   = @($Manifest.modules).Count
        foundCount      = @($Inventory.files).Count
        divergences     = @()
        summary         = [PSCustomObject]@{
            missingInRuntime     = @()
            unexpectedInRuntime  = @()
            hashMismatch         = @()
        }
    }

    $expectedMap = @{}
    foreach ($m in @($Manifest.modules)) {
        $key = if ($m.path) { $m.path } else { $m.id }
        $expectedMap[$key] = $m
    }

    foreach ($f in @($Inventory.files)) {
        $key = $f.path
        if (-not $expectedMap.ContainsKey($key)) {
            $diff.summary.unexpectedInRuntime += $f
            $diff.divergences += [PSCustomObject]@{
                type     = "UNEXPECTED"
                path     = $key
                found    = $f
                expected = $null
            }
        }
        else {
            $exp = $expectedMap[$key]
            if ($exp.hash -and $f.hash -and ($exp.hash -ne $f.hash)) {
                $diff.summary.hashMismatch += [PSCustomObject]@{
                    path     = $key
                    expected = $exp.hash
                    found    = $f.hash
                }
                $diff.divergences += [PSCustomObject]@{
                    type     = "HASH_MISMATCH"
                    path     = $key
                    found    = $f
                    expected = $exp
                }
            }
            $expectedMap.Remove($key)
        }
    }

    foreach ($key in $expectedMap.Keys) {
        $diff.summary.missingInRuntime += $expectedMap[$key]
        $diff.divergences += [PSCustomObject]@{
            type     = "MISSING"
            path     = $key
            found    = $null
            expected = $expectedMap[$key]
        }
    }

    return $diff
}

# ================================================================================================
# 4. CLASSIFICADOR
# ================================================================================================

function Classify-One {
    param($Divergence)

    if ($Divergence.type -eq "UNEXPECTED") {
        $path = ($Divergence.path).ToLower()

        if ($path -match "backup|\.bak") {
            return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.BACKUP; reason = "Padrão de backup detectado"; confidence = "HIGH" }
        }
        if ($path -match "quarentena|quarantine") {
            return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.QUARENTENA; reason = "Padrão de quarentena"; confidence = "HIGH" }
        }
        if ($path -match "old|historico|history") {
            return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.HISTORICO; reason = "Padrão histórico"; confidence = "MEDIUM" }
        }
        if ($path -match "test|dev|tmp|temp") {
            return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.ARTEFATO_DEV; reason = "Artefato de desenvolvimento"; confidence = "MEDIUM" }
        }
        if ($path -match "memoria|memory") {
            return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.MEMORIA; reason = "Arquivo de memória"; confidence = "MEDIUM" }
        }

        return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.ORFAO; reason = "Não mapeado no manifesto canônico"; confidence = "LOW" }
    }

    if ($Divergence.type -eq "MISSING") {
        return @{ category = $CATEGORIES.REPARAR; subtype = $null; reason = "Ausente no runtime em relação ao manifesto"; confidence = "MEDIUM" }
    }

    if ($Divergence.type -eq "HASH_MISMATCH") {
        return @{ category = $CATEGORIES.APRIMORAR; subtype = $null; reason = "Hash diverge do canônico"; confidence = "HIGH" }
    }

    return @{ category = $CATEGORIES.ISOLAR; subtype = $ISOLATE_SUBTYPES.DIVERGENCIA_REAL_SOBERANIA; reason = "Classificação não determinada"; confidence = "LOW" }
}

function Classify-Divergences {
    param($Diff)

    $classified = [PSCustomObject]@{
        timestamp         = (Get-Date).ToUniversalTime().ToString("o")
        byCategory        = @{
            REUTILIZAR = @()
            APRIMORAR  = @()
            INTEGRAR   = @()
            REPARAR    = @()
            ISOLAR     = @()
        }
        byIsolateSubtype  = @{}
        totals            = @{}
        rawCount          = @($Diff.divergences).Count
    }

    foreach ($sub in $ISOLATE_SUBTYPES.Values) {
        $classified.byIsolateSubtype[$sub] = @()
    }

    foreach ($d in @($Diff.divergences)) {
        $decision = Classify-One -Divergence $d

        $item = [PSCustomObject]@{
            divergence = $d
            reason     = $decision.reason
            subtype    = $decision.subtype
            confidence = $decision.confidence
        }

        $classified.byCategory[$decision.category] += $item

        if ($decision.category -eq $CATEGORIES.ISOLAR -and $decision.subtype) {
            $classified.byIsolateSubtype[$decision.subtype] += $d
        }
    }

    foreach ($cat in $classified.byCategory.Keys) {
        $classified.totals[$cat] = @($classified.byCategory[$cat]).Count
    }

    return $classified
}

# ================================================================================================
# 5. CONSOLIDAÇÃO (somente registro)
# ================================================================================================

function Consolidate-Observation {
    param($Manifest, $Inventory, $Diff, $Classified)

    $record = [PSCustomObject]@{
        version              = $Version
        mode                 = $Mode
        executedAt           = (Get-Date).ToUniversalTime().ToString("o")
        manifestAuthority    = $Manifest.authority
        manifestVersion      = $Manifest.version
        inventoryTimestamp   = $Inventory.timestamp
        root                 = $Inventory.root
        diffSummary          = [PSCustomObject]@{
            expected         = $Diff.expectedCount
            found            = $Diff.foundCount
            divergenceCount  = @($Diff.divergences).Count
        }
        classificationTotals = $Classified.totals
        isolateBreakdown     = @{}
        notes                = @(
            "Observação concluída. Nenhuma mutação realizada.",
            "Runtime não promoveu nenhum estado divergente a Source of Truth."
        )
    }

    foreach ($sub in $Classified.byIsolateSubtype.Keys) {
        $record.isolateBreakdown[$sub] = @($Classified.byIsolateSubtype[$sub]).Count
    }

    $historyDir = Join-Path $Pasta "_SOUSA_SYNC_HISTORY"
    if (-not (Test-Path $historyDir)) {
        New-Item -ItemType Directory -Path $historyDir -Force | Out-Null
    }

    $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $historyFile = Join-Path $historyDir "observation_$stamp.json"
    $lastFile    = Join-Path $historyDir "LAST_OBSERVATION.json"

    try {
        $record | ConvertTo-Json -Depth 10 | Set-Content -Path $historyFile -Encoding UTF8
        $record | ConvertTo-Json -Depth 10 | Set-Content -Path $lastFile -Encoding UTF8
    }
    catch {
        Write-Wolverine "Consolidate-Observation" $_
        $record.notes += "Falha ao persistir consolidação: $($_.Exception.Message)"
    }

    return $record
}

# ================================================================================================
# 6. RELATÓRIO SOBERANO AO FUNDADOR
# ================================================================================================

function Build-SovereignReport {
    param($Manifest, $Inventory, $Diff, $Classified, $Consolidation)

    $report = [PSCustomObject]@{
        title            = "SOUSA_SYNC_GUARD — Relatório de Observação"
        version          = $Version
        mode             = $Mode
        generatedAt      = (Get-Date).ToUniversalTime().ToString("o")
        authority        = $Manifest.authority
        root             = $Inventory.root
        executiveSummary = [PSCustomObject]@{
            totalDivergences          = $Classified.rawCount
            byCategory                = $Classified.totals
            isolateBreakdown          = $Consolidation.isolateBreakdown
            actionRequiredFromFounder = @()
        }
        details = [PSCustomObject]@{
            missingCritical           = @()
            hashMismatches            = @()
            itemsRequiringSovereignty = @()
        }
        notes = @(
            "Este relatório foi gerado em modo OBSERVAÇÃO.",
            "Nenhuma alteração foi feita no ambiente de produção.",
            "O runtime respeitou a regra: estado divergente NÃO foi promovido a Source of Truth."
        )
    }

    foreach ($item in @($Classified.byCategory.ISOLAR)) {
        if ($item.subtype -eq $ISOLATE_SUBTYPES.DIVERGENCIA_REAL_SOBERANIA -or $item.confidence -eq "LOW") {
            $report.details.itemsRequiringSovereignty += $item
            $report.executiveSummary.actionRequiredFromFounder += [PSCustomObject]@{
                path      = $item.divergence.path
                reason    = $item.reason
                suggested = "Avaliar e autorizar destino (isolar definitivamente / integrar / descartar)"
            }
        }
    }

    foreach ($item in @($Classified.byCategory.REPARAR)) {
        $report.details.missingCritical += $item
    }

    foreach ($item in @($Classified.byCategory.APRIMORAR)) {
        if ($item.divergence.type -eq "HASH_MISMATCH") {
            $report.details.hashMismatches += $item
        }
    }

    return $report
}

# ================================================================================================
# WOLVERINE
# ================================================================================================

function Write-Wolverine {
    param([string]$Context, $ErrorRecord)
    $entry = [PSCustomObject]@{
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        context   = $Context
        message   = $ErrorRecord.Exception.Message
    }
    Write-Host "[WOLVERINE][$Context] $($entry.message)" -ForegroundColor DarkYellow
}

# ================================================================================================
# PONTO DE ENTRADA — CAMINHO FELIZ DE OBSERVAÇÃO
# ================================================================================================

function Invoke-ObservationCycle {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host " SOUSA_SYNC_GUARD — Ciclo de Observação" -ForegroundColor Cyan
    Write-Host " Versão: $Version | Modo: $Mode" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "Pasta alvo: $Pasta" -ForegroundColor Gray
    Write-Host ""

    $result = [PSCustomObject]@{
        success       = $false
        version       = $Version
        mode          = $Mode
        report        = $null
        consolidation = $null
        error         = $null
    }

    try {
        # 1. Source of Truth
        Write-Host "[1/6] Lendo manifesto canônico..." -ForegroundColor Yellow
        $manifest = Get-CanonicalManifest

        # 2. Inventário
        Write-Host "[2/6] Inventariando estado real..." -ForegroundColor Yellow
        $inventory = Get-RuntimeInventory

        # 3. Diff
        Write-Host "[3/6] Calculando diff..." -ForegroundColor Yellow
        $diff = Compute-Diff -Manifest $manifest -Inventory $inventory

        # 4. Classificação
        Write-Host "[4/6] Classificando divergências..." -ForegroundColor Yellow
        $classified = Classify-Divergences -Diff $diff

        # 5. Consolidação
        Write-Host "[5/6] Consolidando (somente registro)..." -ForegroundColor Yellow
        $consolidation = Consolidate-Observation -Manifest $manifest -Inventory $inventory -Diff $diff -Classified $classified

        # 6. Relatório
        Write-Host "[6/6] Gerando relatório soberano..." -ForegroundColor Yellow
        $report = Build-SovereignReport -Manifest $manifest -Inventory $inventory -Diff $diff -Classified $classified -Consolidation $consolidation

        $result.success       = $true
        $result.report        = $report
        $result.consolidation = $consolidation

        # Exibir resumo
        Write-Host ""
        Write-Host "========== RESUMO EXECUTIVO ==========" -ForegroundColor Green
        Write-Host "Total de divergências : $($report.executiveSummary.totalDivergences)" -ForegroundColor White
        Write-Host "REUTILIZAR            : $($report.executiveSummary.byCategory.REUTILIZAR)" -ForegroundColor White
        Write-Host "APRIMORAR             : $($report.executiveSummary.byCategory.APRIMORAR)" -ForegroundColor White
        Write-Host "INTEGRAR              : $($report.executiveSummary.byCategory.INTEGRAR)" -ForegroundColor White
        Write-Host "REPARAR               : $($report.executiveSummary.byCategory.REPARAR)" -ForegroundColor White
        Write-Host "ISOLAR                : $($report.executiveSummary.byCategory.ISOLAR)" -ForegroundColor White
        Write-Host ""
        Write-Host "Itens que exigem soberania do Fundador: $($report.executiveSummary.actionRequiredFromFounder.Count)" -ForegroundColor Cyan
        Write-Host "Histórico gravado em: $Pasta\_SOUSA_SYNC_HISTORY" -ForegroundColor Gray
        Write-Host "======================================" -ForegroundColor Green
    }
    catch {
        Write-Wolverine "Invoke-ObservationCycle" $_
        $result.error = $_.Exception.Message
        Write-Host "ERRO no ciclo: $($_.Exception.Message)" -ForegroundColor Red
    }

    return $result
}

# ================================================================================================
# EXECUÇÃO
# ================================================================================================

$resultado = Invoke-ObservationCycle

# Salva o relatório completo também
$reportFile = Join-Path $Pasta "_SOUSA_SYNC_HISTORY\LAST_REPORT.json"
if ($resultado.report) {
    $resultado.report | ConvertTo-Json -Depth 10 | Set-Content -Path $reportFile -Encoding UTF8
    Write-Host ""
    Write-Host "Relatório completo salvo em:" -ForegroundColor Cyan
    Write-Host "  $reportFile" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
