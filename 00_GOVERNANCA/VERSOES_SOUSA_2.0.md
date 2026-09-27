# AS 4 VERSÕES DO SOUSA 2.0
## Arquitetura Unificada com Fonte Única da Verdade

**Data de Criação:** 2026-09-27 16:29:18
**Status:** DOCUMENTO DE GOVERNANÇA OBRIGATÓRIO PARA O INSTALADOR

---

## 🎯 PRINCÍPIO SUPREMO

Todas as 4 versões compartilham a **MESMA Fonte Única da Verdade**:
- **00_GOVERNANCA/** → Regras, diretrizes, mapas de competência, protocolos
- **SOUSA_MEMORIA/** → Memória de Longo Prazo (LTM), lições, histórico
- **agentes/** → Definições e instruções de todos os agentes
- **CONFIG/** → Configurações globais do sistema

Nenhuma versão pode ter sua própria cópia divergente desses arquivos.
Se uma versão precisa de configuração específica, ela cria um arquivo de override local, mas a base é sempre a mesma.

---

## 🌐 VERSÃO 1: SOUSA 2.0 WEB (Navegável)

**Tipo:** Aplicação Web (Browser-based)
**Acesso:** Via navegador (Chrome, Firefox, Edge, Safari)
**Hospedagem:** SOUSA SERVER (nuvem ou desktop local)

### Componentes:
- **Backend:** app.py (Flask/FastAPI) + core/ + ruflo/
- **Frontend:** Interface web responsiva
- **API:** Endpoints REST para cada agente
- **Autenticação:** Token-based (SOUSA_TUNNEL_KEY)

### O que empacotar no instalador:
- app.py e dependências (requirements.txt)
- Pastas: core/, ruflo/, usb/, avatar/, voice/
- Pastas compartilhadas: 00_GOVERNANCA/, SOUSA_MEMORIA/, agentes/, CONFIG/
- Script de inicialização: start_web.sh / start_web.bat

### Como roda:
- No servidor: python app.py (ou uvicorn)
- No navegador: http://localhost:8000 ou https://dominio.com

---

## 📱 VERSÃO 2: SOUSA 2.0 APK ANDROID

**Tipo:** Aplicativo Nativo Android
**Acesso:** Instalado no celular/tablet Android
**Distribuição:** APK direto ou Play Store (futuro)

### Componentes:
- **App Android:** 00_GOVERNANCA/apk_projects/SousaMobileTest/
- **Comunicação:** API REST para o SOUSA SERVER (nuvem)
- **Offline:** Cache local de governança e memória

### O que empacotar no instalador:
- Projeto Android completo (app/src/, build.gradle, AndroidManifest.xml)
- Assets: ícones, splash screen, configurações padrão
- Script de build: build_apk.sh / build_apk.bat
- Pastas compartilhadas (embutidas no APK): 00_GOVERNANCA/, agentes/

### Como roda:
- Build: ./gradlew assembleRelease
- Instalação: APK no dispositivo Android
- Operação: Conecta ao SOUSA SERVER via API

### Regra de Soberania:
- O APK é um CLIENTE LEVE. O processamento pesado roda no SERVER.
- O APK pode funcionar offline para consultas à governança e memória local.

---

## 🖥️ VERSÃO 3: SOUSA 2.0 WINDOWS DESKTOP

**Tipo:** Aplicação Desktop Windows
**Acesso:** Instalado no PC Windows (10/11)
**Distribuição:** Instalador .exe ou .msi

### Componentes:
- **Interface:** GUI desktop (Electron, PyQt ou similar)
- **Backend Local:** Mesmo core da versão web
- **Integração:** Rclone, Piper TTS, FFmpeg locais
- **Pasta de trabalho:** 00_GOVERNANCA/ no diretório do usuário

### O que empacotar no instalador:
- Executável principal + dependências Python empacotadas
- Pastas: core/, ruflo/, usb/, avatar/, voice/, scripts/
- Pastas compartilhadas: 00_GOVERNANCA/, SOUSA_MEMORIA/, agentes/, CONFIG/
- Binários embarcados: rclone.exe, piper.exe, ffmpeg.exe
- Script de instalação: installer/setup.ps1
- Atalho na Área de Trabalho e Menu Iniciar

### Como roda:
- Instalação: setup.exe (wizard padrão Windows)
- Execução: Clique no atalho ou sousa.exe
- Operação: Roda localmente com opção de sincronizar com a nuvem

---

## 💾 VERSÃO 4: SOUSA 2.0 PORTÁTIL (Pendrive)

**Tipo:** Aplicação Portátil (Zero Instalação)
**Acesso:** Executado direto de um pendrive USB
**Distribuição:** Copiar pasta para pendrive

### Componentes:
- **Launcher:** run_sousa.bat (inicia tudo com 1 clique)
- **Backend Local:** Mesmo core da versão desktop
- **Python Embarcado:** Python portable (não precisa instalar no PC)
- **Dados:** Tudo dentro da pasta do pendrive

### O que empacotar no instalador:
- Pasta SOUSA_2.0_PORTATIL/ contendo:
  - run_sousa.bat (launcher)
  - python_portable/ (Python embarcado)
  - core/, ruflo/, usb/, avatar/, voice/
  - 00_GOVERNANCA/, SOUSA_MEMORIA/, agentes/, CONFIG/
  - tools/ (rclone, piper, ffmpeg portáteis)
  - .venv/ (ambiente virtual pré-configurado)

### Como roda:
- Conectar pendrive em qualquer PC Windows
- Clicar em run_sousa.bat
- O sistema inicia sem instalar nada no PC hospedeiro
- Ao desconectar, não deixa rastros

### Regra de Segurança:
- Ideal para uso em computadores de terceiros (escola, trabalho, lan house)
- Zero modificação no sistema hospedeiro
- Todos os dados ficam no pendrive

---

## 🔄 MATRIZ DE SINCRONIZAÇÃO

| Componente | WEB | APK | DESKTOP | PORTÁTIL |
|---|---|---|---|---|
| 00_GOVERNANCA/ | ✅ Servidor | ✅ Embarcado | ✅ Local | ✅ Pendrive |
| SOUSA_MEMORIA/ | ✅ Servidor | ⚡ Cache | ✅ Local | ✅ Pendrive |
| agentes/ | ✅ Servidor | ✅ Embarcado | ✅ Local | ✅ Pendrive |
| CONFIG/ | ✅ Servidor | ⚡ Parcial | ✅ Local | ✅ Pendrive |
| Core Python | ✅ Servidor | ❌ API | ✅ Local | ✅ Pendrive |
| Rclone | ✅ Servidor | ❌ API | ✅ Local | ✅ Pendrive |
| Piper TTS | ✅ Servidor | ❌ API | ✅ Local | ✅ Pendrive |
| FFmpeg | ✅ Servidor | ❌ API | ✅ Local | ✅ Pendrive |
| Interface | 🌐 Browser | 📱 App | 🖥️ GUI | 🖥️ CLI/GUI |

**Legenda:** ✅ Completo | ⚡ Parcial/Cache | ❌ Via API remota

---

## 📦 DIRETRIZES PARA O INSTALADOR OFICIAL

Quando o instalador for criado, ele DEVE:

1. **Consultar este documento** para saber o que empacotar em cada versão.
2. **Garantir que as 4 pastas compartilhadas** (00_GOVERNANCA, SOUSA_MEMORIA, agentes, CONFIG) sejam idênticas em todas as versões.
3. **Não criar duplicidades**: Se um arquivo existe na raiz, ele não deve ser copiado para dentro de uma subpasta de versão.
4. **Validar com o CÃO DE GUARDA**: Antes de empacotar, rodar o validador de integridade.
5. **Registrar na LTM**: Após cada build, registrar a versão, data e hash na memória.

---

**Este documento é a lei suprema para a criação do instalador oficial.**
**Qualquer versão que não siga esta arquitetura será considerada não-oficial e descartada.**


---

## 🚫 CLÁUSULA SUPREMA: NÃO É SAAS (USO EXCLUSIVO DO FUNDADOR)

O SOUSA 2.0 é, por definição arquitetônica e legal, uma **FERRAMENTA PRIVADA E PERSONALIZADA DE USO EXCLUSIVO DO FUNDADOR (Elias Pereira)**.

### PROIBIÇÕES ABSOLUTAS (O que o sistema NUNCA deve fazer):
1. **NENHUMA lógica de SaaS**: Não implementar multi-tenancy, cadastros de usuários, telas de "escolha de plano" ou qualquer funcionalidade voltada ao público geral.
2. **NENHUMA exposição pública**: As interfaces (Web, APK, Desktop) são estritamente privadas. O acesso deve ser protegido por autenticação local ou credenciais exclusivas do Fundador.
3. **NENHUMA dependência de terceiros para o núcleo**: O sistema deve operar com as credenciais, APIs e hardware do Fundador. Os dados pertencem exclusivamente a ele.

### O PROPÓSITO DAS 4 VERSÕES:
Elas não são "produtos para o mercado". São **pontos de acesso pessoais** para que o Fundador possa comandar seu ecossistema de qualquer lugar:
- **WEB**: Painel de controle privado no navegador (local ou na nuvem pessoal).
- **APK**: Aplicativo de bolso exclusivo para o smartphone do Fundador.
- **DESKTOP**: Potência total de processamento na máquina pessoal do Fundador.
- **PORTÁTIL**: Soberania total para operar de qualquer máquina sem deixar rastros.

**REGRA DE OURO PARA O INSTALADOR**: O empacotamento deve refletir uma ferramenta de uso pessoal (simples, direta, sem bloatware de "instalação corporativa"), focada em colocar o sistema nas mãos do Fundador em menos de 5 minutos.
