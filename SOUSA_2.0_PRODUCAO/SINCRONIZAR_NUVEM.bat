@echo off
chcp 65001 >nul
title SOUSA 2.0 — Sincronizar com a Nuvem
color 0B

echo.
echo ============================================================
echo    SOUSA 2.0 — Sincronização Local ↔ Nuvem
echo ============================================================
echo.
echo Pasta oficial na nuvem: SOUSA_2.0_PRODUCAO
echo.

REM Direção padrão: Local → Nuvem (push)
if "%1"=="pull" goto PULL
if "%1"=="push" goto PUSH

echo Escolha a direção:
echo   1. Enviar local → nuvem  (push)
echo   2. Baixar nuvem → local  (pull)
echo.
set /p OPCAO="Opção [1/2]: "

if "%OPCAO%"=="2" goto PULL
goto PUSH

:PUSH
echo.
echo [PUSH] Enviando atualizações para a nuvem...
rclone sync .\ "SOUSA_DRIVE:SOUSA_2.0_PRODUCAO" --filter-from .\regras_nuvem.txt --progress
echo.
echo ✓ Push concluído.
goto FIM

:PULL
echo.
echo [PULL] Baixando atualizações da nuvem...
rclone sync "SOUSA_DRIVE:SOUSA_2.0_PRODUCAO" .\ --filter-from .\regras_nuvem.txt --progress
echo.
echo ✓ Pull concluído.
goto FIM

:FIM
echo.
echo ============================================================
pause
