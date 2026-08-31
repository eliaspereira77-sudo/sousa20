@echo off
setlocal
title SOUSA 2.0 - CENTRAL OPERACIONAL
cd /d "%~dp0"

echo.
echo ============================================================
echo        SOUSA 2.0 - CENTRAL OPERACIONAL
echo ============================================================
echo.

if not exist "SOUSA_MANUTENCAO_OPERACIONAL.js" (
    echo [ERRO] Motor de manutencao nao encontrado.
    echo.
    echo A equipe precisa instalar/restaurar:
    echo SOUSA_MANUTENCAO_OPERACIONAL.js
    echo.
    pause
    exit /b 1
)

echo [OK] Motor de manutencao localizado.

if exist "SOUSA_CAPABILITY_REGISTRY.js" (
    echo [OK] Capability Registry localizado.
) else (
    echo [WARN] Capability Registry nao localizado.
)

if exist "SOUSA_CAPABILITY_ADAPTER.js" (
    echo [OK] Capability Adapter localizado.
) else (
    echo [WARN] Capability Adapter nao localizado.
)

if exist "SOUSA_MAINTENANCE_ORCHESTRATOR.js" (
    echo [OK] Maintenance Orchestrator localizado.
) else (
    echo [INFO] Maintenance Orchestrator ainda nao esta presente.
)

if exist "node_modules" (
    echo [OK] Dependencias locais encontradas.
) else (
    echo [INFO] node_modules nao encontrado.
)

echo.
echo ============================================================
echo        EXECUTANDO MANUTENCAO ASSISTIDA
echo ============================================================
echo.

node ".\SOUSA_MANUTENCAO_OPERACIONAL.js"

set RESULT=%ERRORLEVEL%

echo.
echo ============================================================
echo        CENTRAL OPERACIONAL - RESULTADO
echo ============================================================
echo.

if exist "SOUSA_MANUTENCAO_RELATORIO.md" (
    echo [OK] Relatorio de manutencao gerado.
)

if exist "SOUSA_MANUTENCAO_RELATORIO.json" (
    echo [OK] Relatorio estruturado gerado.
)

if exist "SOUSA_MANUTENCAO_EVIDENCIAS.log" (
    echo [OK] Evidencias registradas.
)

echo.

if "%RESULT%"=="0" (
    echo STATUS: OPERACIONAL
) else (
    echo STATUS: ATENCAO - EXISTEM TAREFAS PARA A EQUIPE
)

echo.
echo O fundador nao precisa executar diagnosticos adicionais.
echo A fila deve ser tratada pela equipe de manutencao.
echo.

pause
exit /b %RESULT%
