@echo off
chcp 65001 >nul
title INSTALADOR SOUSA 2.0 — EDIÇÃO DAILEON
color 0B
cls
echo ╔════════════════════════════════════════════════════════╗
echo ║                 SOUSA 2.0 — INSTALADOR OFICIAL           ║
echo ║                   EDIÇÃO GIGANTE DAILEON                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 🛡️  Bem-vindo à instalação do SOUSA 2.0!
echo.
echo 1. Instalar no computador
echo 2. Gerar versão portátil
echo 3. Sair
echo.
set /p opcao="Escolha uma opção: "

if "%opcao%"=="1" (
    echo.
    echo 📂 Digite a pasta de destino (ex: C:\SOUSA_2.0):
    set /p destino=
    if "%destino%"=="" set destino=C:\SOUSA_2.0
    if not exist "%destino%" mkdir "%destino%" >nul 2>&1
    echo.
    echo 🚀 Copiando arquivos...
    xcopy . "%destino%" /E /I /Y /R >nul
    echo.
    echo 📌 Criando atalho na Área de Trabalho...
    set "atalho=%USERPROFILE%\Desktop\SOUSA 2.0 — Iniciar.lnk"
    powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%atalho%'); $s.TargetPath = '%destino%\INICIAR_SOUSA_INSTALLER.bat'; $s.WorkingDirectory = '%destino%'; $s.Save()" >nul
    echo.
    echo ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
    echo 🚀 Use o atalho na Área de Trabalho para começar.
    pause
) else if "%opcao%"=="2" (
    echo.
    echo ✅ Versão portátil já está pronta nesta pasta!
    echo 📦 Basta copiar esta pasta para qualquer dispositivo.
    pause
) else (
    echo.
    echo Encerrando...
)
exit /b