cls;Write-Host "`n  SOUSA 2.0 x QWEN 3.8`n" -Fore Cyan
$ok=0;$fail=0
foreach($f in @("SOUSA_QWEN_ADAPTER.json","SOUSA_QWEN_BRIDGE.py","test_sousa_qwen_bridge.py")){
 if(Test-Path $f){Write-Host "  [OK] $f" -Fore Green;$ok++}else{Write-Host "  [FALTA] $f" -Fore Red;$fail++}}
Write-Host ""
if($fail -gt 0){Write-Host "  ARQUIVOS FALTANDO" -Fore Red;return}
python --version 2>$null
if(-not $?){Write-Host "  PYTHON NAO ENCONTRADO" -Fore Red;return}
Write-Host "  [OK] Python" -Fore Green
python -m pip install pytest pytest-cov -q 2>$null
Write-Host "  [OK] pytest" -Fore Green
python -m pytest test_sousa_qwen_bridge.py -v --tb=short
if($?){Write-Host "`n  TUDO OK" -Fore Green}else{Write-Host "`n  FALHOU" -Fore Red}
