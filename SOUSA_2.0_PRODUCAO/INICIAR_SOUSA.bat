@echo off
chcp 65001 >nul
title SOUSA 2.0 — Núcleo Ativo
color 0A

echo.
echo ============================================================
echo    SOUSA 2.0 — NÚCLEO
echo    Fundador: Sir Elias
echo ============================================================
echo.

echo [1/3] Sincronizando com a nuvem (pull)...
rclone sync "SOUSA_DRIVE:SOUSA_2.0_PRODUCAO" .\ --filter-from .\regras_nuvem.txt -P
if errorlevel 1 (
    echo Aviso: falha na sincronização. Continuando com arquivos locais...
)

echo.
echo [2/3] Verificando dependências...
python -c "import flask, dotenv" 2>nul
if errorlevel 1 (
    echo Instalando dependências...
    pip install -r requirements.txt
)

echo.
echo [3/3] Iniciando SOUSA 2.0...
echo.
echo   Endpoints:
echo   - http://localhost:5000/
echo   - http://localhost:5000/health
echo   - http://localhost:5000/chat/gemini
echo.

start "" python app.py
timeout /t 3 /nobreak >nul
start http://localhost:5000/status

echo.
echo ============================================================
echo    SISTEMA OPERACIONAL — SOUSA ONLINE
echo ============================================================
echo.
pause
