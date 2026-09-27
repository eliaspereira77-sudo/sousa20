[CmdletBinding()]
param(
    [string]$RepositoryRoot,
    [ValidateSet("backend-local", "painel-operacional", "operacao-local-combinada")]
    [string]$Profile = "backend-local",
    [switch]$StrictContracts
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-SafePath {
    param(
        [string]$Root,
        [string]$RelativePath
    )

    if ([string]::IsNullOrWhiteSpace($RelativePath) -or
        [IO.Path]::IsPathRooted($RelativePath) -or
        $RelativePath -match "(^|[\\/])\.\.([\\/]|$)") {
        throw "Invalid manifest path: $RelativePath"
    }

    $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)
    $candidate = [IO.Path]::GetFullPath((Join-Path $rootFull $RelativePath))
    $rootPrefix = $rootFull + [IO.Path]::DirectorySeparatorChar

    if (-not $candidate.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path outside repository: $RelativePath"
    }

    return $candidate
}

function Get-ObjectById {
    param(
        [hashtable]$Index,
        [string]$Id,
        [string]$Type
    )

    if (-not $Index.ContainsKey($Id)) {
        throw "$Type not found in manifest: $Id"
    }

    return $Index[$Id]
}

function Get-ListProperty {
    param(
        [object]$Object,
        [string]$Name
    )

    $property = $Object.PSObject.Properties[$Name]
    if ($null -eq $property -or $null -eq $property.Value) {
        return @()
    }

    return @($property.Value)
}

try {
    if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
        $RepositoryRoot = Split-Path -Parent $PSScriptRoot
    }

    $root = [IO.Path]::GetFullPath($RepositoryRoot)
    $manifestPath = Join-Path $root "SOUSA_SOT_MANIFEST.json"

    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
        throw "Manifest not found: $manifestPath"
    }

    $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $filesById = @{}
    $paths = @{}

    foreach ($file in @($manifest.files)) {
        if ([string]::IsNullOrWhiteSpace($file.id) -or [string]::IsNullOrWhiteSpace($file.path) -or [string]::IsNullOrWhiteSpace($file.sha256)) {
            throw "Incomplete file registration in manifest."
        }

        if ($filesById.ContainsKey($file.id)) {
            throw "Duplicate file ID: $($file.id)"
        }

        $normalizedPath = $file.path.Replace("\\", "/").ToLowerInvariant()
        if ($paths.ContainsKey($normalizedPath)) {
            throw "File registered more than once: $($file.path)"
        }

        $filesById[$file.id] = $file
        $paths[$normalizedPath] = $file.id
    }

    $null = Get-ObjectById -Index $filesById -Id $manifest.sourceOfTruth.fileId -Type "Source of truth"

    foreach ($file in @($manifest.files)) {
        $sourcePath = Resolve-SafePath -Root $root -RelativePath $file.path
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
            throw "Missing file: $($file.path)"
        }

        $actualHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualHash -ne $file.sha256.ToLowerInvariant()) {
            throw "Hash mismatch: $($file.path)"
        }
    }

    $profilesById = @{}
    foreach ($candidateProfile in @($manifest.profiles)) {
        if ([string]::IsNullOrWhiteSpace($candidateProfile.id)) {
            throw "Profile without ID in manifest."
        }
        if ($profilesById.ContainsKey($candidateProfile.id)) {
            throw "Duplicate profile ID: $($candidateProfile.id)"
        }
        $profilesById[$candidateProfile.id] = $candidateProfile
    }

    $selectedProfile = Get-ObjectById -Index $profilesById -Id $Profile -Type "Profile"
    $profileFileIds = @(Get-ListProperty -Object $selectedProfile -Name "fileIds")
    if ($profileFileIds.Count -ne (@($profileFileIds | Select-Object -Unique).Count)) {
        throw "Profile $Profile repeats files."
    }

    foreach ($fileId in $profileFileIds) {
        $null = Get-ObjectById -Index $filesById -Id $fileId -Type "File"
    }

    foreach ($includedProfileId in @(Get-ListProperty -Object $selectedProfile -Name "includesProfiles")) {
        $includedProfile = Get-ObjectById -Index $profilesById -Id $includedProfileId -Type "Profile"
        foreach ($fileId in @(Get-ListProperty -Object $includedProfile -Name "fileIds")) {
            $null = Get-ObjectById -Index $filesById -Id $fileId -Type "File"
        }
    }

    $contractsById = @{}
    foreach ($contract in @($manifest.contracts)) {
        if ([string]::IsNullOrWhiteSpace($contract.id) -or $contractsById.ContainsKey($contract.id)) {
            throw "Contract without ID or duplicate ID in manifest."
        }
        $contractsById[$contract.id] = $contract

        $frontend = Get-ObjectById -Index $filesById -Id $contract.frontendFileId -Type "Frontend file"
        $backend = Get-ObjectById -Index $filesById -Id $contract.backendFileId -Type "Backend file"
        $frontendContent = Get-Content -LiteralPath (Resolve-SafePath -Root $root -RelativePath $frontend.path) -Raw
        $backendContent = Get-Content -LiteralPath (Resolve-SafePath -Root $root -RelativePath $backend.path) -Raw

        foreach ($call in @($contract.frontendCalls)) {
            if (-not $frontendContent.Contains($call)) {
                throw "Contract $($contract.id) does not contain frontend call: $call"
            }
        }

        foreach ($route in @($contract.backendRoutes)) {
            $routeMarker = '@app.route("' + $route + '")'
            if (-not $backendContent.Contains($routeMarker)) {
                throw "Contract $($contract.id) does not contain backend route: $route"
            }
        }
    }

    foreach ($contractId in @(Get-ListProperty -Object $selectedProfile -Name "contractIds")) {
        $contract = Get-ObjectById -Index $contractsById -Id $contractId -Type "Contract"
        if ($contract.status -ne "compatible") {
            $message = "Contract $($contract.id) blocked: $($contract.reason)"
            if ($StrictContracts) {
                throw $message
            }
            Write-Warning $message
        }
    }

    foreach ($runtimeDirectory in @(Get-ListProperty -Object $selectedProfile -Name "runtimeDirectories")) {
        $directoryPath = Resolve-SafePath -Root $root -RelativePath $runtimeDirectory.path
        $parentPath = Split-Path -Parent $directoryPath
        if (-not (Test-Path -LiteralPath $parentPath -PathType Container)) {
            throw "Runtime directory parent missing: $($runtimeDirectory.path)"
        }
    }

    Write-Host "Manifest verified: $($manifest.package.name) $($manifest.package.version)"
    Write-Host "Profile verified: $Profile"
    Write-Host "Canonical files: $($filesById.Count)"
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
