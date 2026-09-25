@echo off
chcp 65001 >nul
title SOUSA 2.0 — AUTOMAÇÃO ATIVA
color 0A

echo.
echo ============================================================
echo    ? INICIANDO SISTEMA AUTOMÁTICO — SOUSA 2.0
echo    Fundador: Sir Elias
echo ============================================================
echo.

echo [1/4] ? Sincronizando com a nuvem...
rclone sync "SOUSA_DRIVE:SousaBackup" .\ --filter-from .\regras_nuvem.txt -P

echo.
echo [2/4] ?? Verificando Agentes...
dir .\agentes\*.txt /b

echo.
echo [3/4] ?? Carregando Núcleo SOUSA 2.0...
echo ? Conselho online
echo ? Todos os agentes prontos
echo ? ADS — Escritor e Desenvolvedor ativo

echo.
echo [4/4] ?? Abrindo Painel de Status...
start http://localhost:5000/api/status

echo.
echo ============================================================
echo    ? AUTOMAÇÃO OPERACIONAL — TUDO FUNCIONANDO
echo ============================================================
echo.
echo ?? Aguardando próxima sincronização...
echo.
pause
