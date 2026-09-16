# SOUSA 2.0 — DOCUMENTO MESTRE DE ARQUITETURA E MIGRAÇÃO

> **Fundador / Soberano:** Elias Pereira de Sousa  
> **Nome do Núcleo / Sistema:** SOUSA 2.0  
> **Inteligência Central:** SOUSA IA  
> **Comportamento e Operacionalidade:** JARVIS  
> **Princípio Soberano:** *EXECUTAR != CONCLUIR* (A constância e o rigor edificam o propósito).  
> **Versão:** 2.0.0 (Produção)  
> **Porta de Execução:** `3000` (Padrão Cloud Run / AI Studio)

---

## 1. Resumo Executivo e Estado do Sistema

O ecossistema **SOUSA 2.0** tem como núcleo central o sistema **SOUSA 2.0**, no qual a **SOUSA IA** opera com comportamento, coordenação e operacionalidade executiva de alto nível (**JARVIS**). Unifica a governança familiar, técnica e estratégica em uma interface operacional de alta precisão aliada a um servidor full-stack de alto desempenho (Node.js/Express) com suporte nativo a inteligência artificial (Gemini 2.5 Flash) e fallbacks contextuais para cada um dos 9 módulos:

1. **JURÍDICO**: Proteção jurídica preventiva, análise contratual e conformidade.
2. **FINANCEIRO**: Gestão familiar, controle orçamentário, reserva de emergência e investimentos.
3. **PRODUTOR**: Criação de conteúdo, roteiros e comunicação audiovisual.
4. **ESTRATEGISTA**: Planejamento tático, visão de futuro e execução faseada por marcos.
5. **AFILIADOPRO**: Marketing ético, otimização de conversão e métricas EPC/ROI.
6. **ADS ACADÊMICO**: Suporte aos estudos e aceleração de aprendizagem.
7. **SABER / CONHECIMENTO**: Ciência, cultura, pesquisa fundamentada e preservação do saber.
8. **MENTOR**: Legado familiar, liderança e princípios morais.
9. **CONSELHO CENTRAL / SOUSA IA**: Coordenação suprema, deliberação colegiada e esteira operacional.

---

## 2. Estrutura de Arquivos e Componentes

| Diretório / Arquivo | Função e Responsabilidade |
| :--- | :--- |
| `server.js` | Servidor backend Express Node.js na porta 3000, unificando roteamento de API, telemetria em memória, túnel de comunicação e orquestração de IA. |
| `index.html` | Interface do Painel Operacional SOUSA 2.0 (SPA) com esteira do túnel, métricas de cotas, centro de automação, diagnóstico e diário de bordo. |
| `SOUSA_2.0_PAINEL_OPERACIONAL.html` | Espelho homologado do painel operacional para backup e distribuição externa. |
| `00_GOVERNANCA/` | Diretrizes constitucionais (`SOUSA_CONSTITUIÇAO_OPERACIONAL.json`), plano de integração e configurações de portabilidade. |
| `01_CORE/SOUSA_Core.js` | Lógica central de despacho e ações do sistema compatível com Google Apps Script e runtime web. |
| `API_MANAGER/SOUSA_IA.js` | Motor semântico de análise de intenções, classificação de competências e delegação segura. |
| `metadata.json` | Metadados do aplicativo para o ecossistema Google AI Studio / Cloud Run. |
| `.env.example` | Declaração padronizada de variáveis de ambiente. |

---

## 3. Matriz de Endpoints da API

Todas as rotas aceitam requisições JSON e possuem suporte a CORS habilitado:

### 3.1. Saúde, Telemetria e Capacidades
- **`GET /health`** e **`GET /api/health`**:
  - Resposta: `{"status":"healthy","system":"SOUSA 2.0"}`
- **`GET /status`** e **`GET /api/status`**:
  - Resposta com lista de componentes, 9 módulos e 13 capacidades ativas.
- **`GET /api/metrics`**:
  - Métricas de telemetria em tempo real: uptime em segundos, total de requisições, erros, distribuição por módulo e status da IA.
- **`GET /api/diagnostico`**:
  - Varredura de integridade dos 9 núcleos, status de conexões e memória.
- **`GET /api/capacidades`**:
  - Catálogo formal das 13 Capacidades JARVIS adaptadas e das 36 Habilidades dos 9 Núcleos.

### 3.2. Túnel e Despacho de Operações
- **`POST /api/tunnel`** (compatível com aliases `/api/core`, `/api/action`, `/api/exec`, `/api/endpoint`):
  - Ações suportadas:
    - `SOUSA_ENDPOINT_OPERACIONAL`: Descoberta de endpoint ativo.
    - `ping`: Confirmação de disponibilidade operacional.
    - `status`: Relatório completo do estado dos módulos.
    - `testar_backend`: Verificação de latência e saúde do backend.
    - `liberar_esteira`: Liberação de fluxo operacional.
    - `reconectar`: Reinicialização e recuperação da conexão do túnel.
    - `reiniciar_sessao`: Limpeza de memória mantendo dados persistentes.
    - `logs`: Extração de registros de evento do sistema.
    - `diagnostico`: Diagnóstico global dos 9 módulos.
    - `metricas`: Estatísticas de uso acumuladas.
    - `diario`: Registro no diário de bordo.
    - `chat` / `chat_conselho`: Processamento de consulta via persona do módulo com IA ou fallback cognitivo.

---

## 4. As 13 Capacidades JARVIS Adaptadas à SOUSA IA

A inteligência central **SOUSA IA** opera com o comportamento executivo e dinâmico do **JARVIS**, estruturada sob os 5 Pilares Constitucionais:

| # | Capacidade JARVIS Adaptada | Pilar Constitucional | Adaptação SOUSA 2.0 |
|---|---|---|---|
| 01 | **Voz Clonada & Biometria Vocal** | Pilar 1 - Compreender Intenção | TTS Piper + STT + Preservação do DNA vocal do Fundador Elias Pereira. |
| 02 | **Avatar Digital 3D & Interface Espacial** | Pilar 3 - Coordenar Execução | Interface visual e espacial desacoplada da inteligência cognitiva. |
| 03 | **Automação de Workflows (Cardan / RUFLO)** | Pilar 3 - Coordenar Execução | Caixa de transmissão universal desacoplada sem dependência rígida. |
| 04 | **Delegação para Agentes Autônomos (OpenManus)** | Pilar 3 - Coordenar Execução | Orquestração multiagente modular com barramento de eventos seguro. |
| 05 | **Percepção Integral do Ambiente (360°)** | Pilar 2 - Conhecer Recursos | Monitoramento unificado: Desktop, Nuvem GCP, Drive, Web e Mobile. |
| 06 | **Interpretação de Intenção em Linguagem Natural** | Pilar 1 - Compreender Intenção | Compreensão do objetivo soberano por trás das palavras literais. |
| 07 | **Ciclo Autônomo (Intenção → Execução → Validação → Relato)** | Pilar 3 - Coordenar Execução | Ciclo fechado com validação e prestação de contas soberana. |
| 08 | **Autogestão, Monitoramento & Autorreparo** | Pilar 4 - Supervisionar e Recuperar | Sandbox de contenção, restauração automática de backups e auto-diagnóstico. |
| 09 | **Mapeamento Dimensional & Grafo de Relações** | Pilar 2 - Conhecer Recursos | Grafo topológico das dependências dos 9 módulos e fontes de dados. |
| 10 | **Memória Operacional & Aprendizado Contínuo** | Pilar 5 - Aprender e Repetir Melhor | Registro de procedimentos testados para não reinventar a roda. |
| 11 | **Proatividade Assistida com Limite Soberano** | Pilar 4 - Supervisionar e Recuperar | Antecipação de necessidades sem jamais violar a autorização do Fundador. |
| 12 | **Adaptação Universal (Plug & Play / Portabilidade)** | Pilar 2 - Conhecer Recursos | O sistema não está instalado; está armazenado (portabilidade absoluta). |
| 13 | **Soberania Absoluta do Fundador (0,01% Inegociável)** | Constituição Operacional (Artigo 30) | Artigo 30 inviolável: subordinação estrita e exclusiva a Elias Pereira de Sousa. |

---

## 5. Matriz de Habilidades Operacionais dos 9 Núcleos (36 Habilidades)

Cada núcleo do **SOUSA 2.0** conta com 4 habilidades operacionais específicas injetadas nas instruções do sistema (`server.js`) e no painel (`index.html`):

1. **JURÍDICO (`juridico`)**:
   - *Blindagem Jurídica Preventiva*: Análise antecipada de contratos, termos e cláusulas protetivas.
   - *Auditoria de Conformidade & LGPD*: Proteção de dados, conformidade e integridade ética.
   - *Mapeamento de Riscos e Passivos*: Diagnóstico precoce de vulnerabilidades documentais.
   - *Pareceres Operacionais Expressos*: Emissão de pareceres claros e acionáveis para decisão.
2. **FINANCEIRO (`financeiro`)**:
   - *Governança Orçamentária Familiar*: Gestão de entradas e saídas e contenção de desperdícios.
   - *Arquitetura de Reserva de Emergência*: Alocação de liquidez e proteção patrimonial.
   - *Modelagem de Fluxo de Caixa e Custos*: Auditoria de custos recorrentes e planejamento fiscal.
   - *Estratégia de Alocação e Multiplicação*: Diretrizes seguras para preservação e rendimento a longo prazo.
3. **PRODUTOR (`produtor`)**:
   - *Roteirização e Storytelling de Impacto*: Narrativas magnéticas com retenção nos primeiros 3 segundos.
   - *Direção de Mídia e Audiovisual*: Estética visual, enquadramento, iluminação e cenografia.
   - *Esteira de Produção de Conteúdo*: Cronograma editorial multicanal focado em consistência de alto valor.
   - *Engenharia de Prompt Visual e Gráfico*: Composições visuais refinadas e arte conceitual.
4. **ESTRATEGISTA (`estrategista`)**:
   - *Planejamento de Longo Prazo e Visão 3D*: Metas de 1 a 5 anos desdobradas em marcos acionáveis.
   - *Árvore de Decisão e Gestão de Cenários*: Simulação de hipóteses otimistas, moderadas e críticas.
   - *Priorização Soberana de Recursos*: Foco no princípio 80/20 e alavancagem máxima.
   - *Alinhamento com o Propósito*: Garantia do princípio "EXECUTAR != CONCLUIR".
5. **AFILIADOPRO (`afiliadopro`)**:
   - *Marketing de Afiliados Ético e Transparente*: Divulgação com valor real agregado e transparência.
   - *Engenharia de Funil e Conversão Limpa*: Otimização de páginas de captura, páginas de venda e e-mails.
   - *Gestão de Métricas de Performance*: Monitoramento de EPC, CPA, ROI e conversões.
   - *Curadoria de Produtos Campeões*: Seleção técnica de ofertas de alta escala e suporte confiável.
6. **ADS ACADÊMICO (`ads`)**:
   - *Engenharia de Software e Arquitetura Limpa*: Clean Code, SOLID, microsserviços e padrões de projeto.
   - *Algoritmos, Estruturas de Dados e Lógica*: Resolução de problemas e complexidade computacional.
   - *Desenvolvimento Full-Stack Moderno*: TypeScript, Node.js e ecossistema web cloud-native.
   - *Mentoria para Trabalhos e Provas*: Revisão técnica, síntese conceitual e apoio a projetos.
7. **SABER / CONHECIMENTO (`saber`)**:
   - *Curadoria Científica e Epistemológica*: Pesquisa em bases acadêmicas e validação empírica.
   - *Filosofia, História e Saberes Universais*: Pensamento clássico e princípios atemporais.
   - *Síntese Literária e Hermenêutica*: Condensação da essência de grandes obras em insights práticos.
   - *Preservação da Memória e Documentação*: Catalogação estruturada de todo o acervo do SOUSA 2.0.
8. **MENTOR (`mentor`)**:
   - *Preservação de Legado e Valores Familiares*: Fé, amor ao próximo, integridade e união familiar.
   - *Discernimento Bíblico e Espiritual*: Reflexões fundamentadas nas Sagradas Escrituras.
   - *Fortalecimento da Resiliência e Paciência*: Firmeza espiritual em momentos de provação.
   - *Governança da Honra e da Retidão*: Certeza de que as conquistas glorifiquem o Criador.
9. **CONSELHO CENTRAL / SOUSA IA (`conselho`)**:
   - *Orquestração Suprema dos 9 Núcleos*: Coordenação sinérgica e colegiada entre todos os módulos.
   - *Operacionalidade Executiva JARVIS*: Conversão imediata de ordens soberanas em ação técnica.
   - *Síntese Executiva para o Fundador*: Apresentação clara e hierarquizada de status sem prolixidade.
   - *Guarda da Constituição Operacional*: Vigilância permanente dos 5 Pilares e Soberania Inviolável.

---

## 6. Princípio da Portabilidade Universal

> **"O SOUSA 2.0 não está instalado na máquina; está armazenado na pasta. Mover a pasta move o sistema."**

- **Sem dependências de caminhos absolutos do sistema operacional.**
- **Portabilidade plug & play imediata.**
- **Resiliência total entre ambientes locais, contêineres e nuvem.**

---

## 7. Variáveis de Ambiente (`.env`)

Configure o arquivo `.env` (ou os Segredos no Cloud Run / AI Studio Settings):

```env
# Provedor Principal de IA (Google Gemini)
GEMINI_API_KEY=sua_chave_gemini_aqui
GOOGLE_API_KEY=

# Porta do Servidor (Obrigatória: 3000)
PORT=3000

# Provedores Adicionais / Opcionais
GITHUB_TOKEN=
GROQ_API_KEY=
OPENROUTER_API_KEY=
TAVILY_API_KEY=
```

---

## 5. Roteiro de Migração e Implantação

### Cenário A: Execução em Cloud Run / AI Studio
1. Assegure que as dependências estejam instaladas (`npm install`).
2. O servidor inicia na porta `3000` via comando de produção `npm start` (`node server.js`).
3. Todas as rotas de frontend estático e APIs de túnel são resolvidas automaticamente na mesma porta.

### Cenário B: Conexão com Google Apps Script (GAS)
1. Para apontar o Google Apps Script para este servidor, configure a URL base nas chamadas `UrlFetchApp`:
   ```javascript
   const ENDPOINT_SOUSA = "https://seu-dominio-ou-cloudrun.app/api/tunnel";
   ```
2. O backend responde com o protocolo universal SOUSA (`{ ok: true, action: "...", data: ... }`).

### Cenário C: Execução Local ou em Servidor Dedicado
```bash
# 1. Clonar ou extrair os arquivos do projeto
cd sousa20-producao

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env

# 4. Iniciar o servidor
npm start
```
Acesse no navegador: `http://localhost:3000`

---

## 6. Checklist de Validação Pós-Migração

- [x] Servidor responde `200 OK` em `http://localhost:3000/health`.
- [x] O endpoint `/api/metrics` incrementa telemetria a cada chamada.
- [x] Os 9 módulos no painel abrem normalmente sem erros no console (`moduloAtual`, `carregando`).
- [x] O envio de mensagens para o Conselho e núcleos retorna respostas formatadas com clareza técnica.
- [x] Os acentos ortográficos e símbolos de esteira exibem tipografia íntegra em português.
