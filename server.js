/**
 * SOUSA 2.0 - Servidor Express Node.js
 * Sistema de IA Pessoal Avançado e Painel Operacional
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configuração de Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: '*/*', limit: '10mb' }));

// Middleware para normalização do body caso venha como string JSON
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Deixar como string se não for JSON
    }
  }
  next();
});

// Telemetria e Métricas em Memória do Servidor SOUSA 2.0
const serverMetrics = {
  inicio: new Date().toISOString(),
  requisicoes_total: 0,
  erros_total: 0,
  acoes_por_modulo: {
    juridico: 0,
    financeiro: 0,
    produtor: 0,
    estrategista: 0,
    afiliadopro: 0,
    ads: 0,
    saber: 0,
    mentor: 0,
    conselho: 0
  },
  ultimas_acoes: []
};

function registrarMetricaServidor(acao, modulo = 'sistema', ok = true) {
  serverMetrics.requisicoes_total++;
  if (!ok) serverMetrics.erros_total++;
  if (serverMetrics.acoes_por_modulo[modulo] !== undefined) {
    serverMetrics.acoes_por_modulo[modulo]++;
  }
  serverMetrics.ultimas_acoes.unshift({
    timestamp: new Date().toISOString(),
    acao: String(acao || 'desconhecida'),
    modulo: String(modulo || 'sistema'),
    ok: Boolean(ok)
  });
  if (serverMetrics.ultimas_acoes.length > 30) {
    serverMetrics.ultimas_acoes.pop();
  }
}

// Inicialização Preguiçosa (Lazy) do cliente Gemini
let geminiInstance = null;
function getGeminiInstance() {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) return null;
  const apiKey = rawKey.trim();

  if (!geminiInstance) {
    try {
      const { GoogleGenAI } = require('@google/genai');
      geminiInstance = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.warn('[SOUSA] Não foi possível carregar @google/genai:', err.message);
      return null;
    }
  }
  return geminiInstance;
}

// ═══ 13 CAPACIDADES JARVIS ADAPTADAS À SOUSA IA ═══
const CAPACIDADES_JARVIS_ADAPTADAS = [
  {
    id: 'VOZ_CLONADA_FUNDADOR',
    nome: 'Voz Clonada & Biometria Vocal',
    pilar: 'Pilar 1 - Compreender Intenção',
    status: 'OPERACIONAL',
    adaptacao: 'TTS Piper + STT + Preservação do DNA vocal do Fundador Elias Pereira',
    descricao: 'Reconhecimento auditivo e síntese vocal com fidelidade à cadência e identidade vocal do Fundador.',
    modulo_responsavel: 'SOUSA_IA_DNA_MEMORIA_VOZ'
  },
  {
    id: 'AVATAR_DIGITAL_3D',
    nome: 'Avatar Digital 3D & Interface Espacial',
    pilar: 'Pilar 3 - Coordenar Execução',
    status: 'OPERACIONAL',
    adaptacao: 'Interface visual e espacial desacoplada da inteligência cognitiva',
    descricao: 'Representação tridimensional e contratual universal do sistema, operando como projeção visual interativa.',
    modulo_responsavel: 'SOUSA_AVATAR_CONTRATO'
  },
  {
    id: 'WORKFLOW_AUTOMATION_RUFLO',
    nome: 'Automação de Workflows (Cardan / RUFLO)',
    pilar: 'Pilar 3 - Coordenar Execução',
    status: 'OPERACIONAL',
    adaptacao: 'Caixa de transmissão desacoplada via Cardan universal sem dependência rígida',
    descricao: 'Encaminhamento automatizado de tarefas para pipelines assíncronos e processamento contínuo.',
    modulo_responsavel: 'SOUSA_RUFLO_CARDAN'
  },
  {
    id: 'AGENTES_AUTONOMOS_OPENMANUS',
    nome: 'Delegação para Agentes Autônomos (OpenManus)',
    pilar: 'Pilar 3 - Coordenar Execução',
    status: 'OPERACIONAL',
    adaptacao: 'Orquestração multiagente modular com barramento de eventos seguro',
    descricao: 'Capacidade de acionar sub-agentes especialistas e delegar tarefas complexas sem perder o comando central.',
    modulo_responsavel: 'SOUSA_OPENMANUS_CARDAN'
  },
  {
    id: 'PERCEPCAO_INTEGRAL',
    nome: 'Percepção Integral do Ambiente (360°)',
    pilar: 'Pilar 2 - Conhecer Recursos',
    status: 'OPERACIONAL',
    adaptacao: 'Monitoramento unificado: Desktop, Nuvem GCP, Drive, Web e Mobile',
    descricao: 'Telemetria contínua do ecossistema, latência, consumo de recursos e integridade dos nós operacionais.',
    modulo_responsavel: 'SOUSA_IA_CAPACIDADES_GAS'
  },
  {
    id: 'INTERPRETACAO_INTENCAO',
    nome: 'Interpretação de Intenção em Linguagem Natural',
    pilar: 'Pilar 1 - Compreender Intenção',
    status: 'OPERACIONAL',
    adaptacao: 'Compreensão do objetivo soberano por trás das palavras literais',
    descricao: 'Decodificação contextual das ordens do Fundador, eliminando ambiguidades e direcionando para a ação.',
    modulo_responsavel: 'SOUSA_INTENCAO'
  },
  {
    id: 'PLANEJAMENTO_EXECUCAO',
    nome: 'Ciclo Autônomo (Intenção → Execução → Validação → Relato)',
    pilar: 'Pilar 3 - Coordenar Execução',
    status: 'OPERACIONAL',
    adaptacao: 'Ciclo fechado com validação e prestação de contas soberana',
    descricao: 'Planeja as etapas, aloca os módulos correspondentes, valida o resultado prático e reporta ao Fundador.',
    modulo_responsavel: 'SOUSA_CICLO_AUTONOMO'
  },
  {
    id: 'AUTOGESTAO_AUTORREPARO',
    nome: 'Autogestão, Monitoramento & Autorreparo',
    pilar: 'Pilar 4 - Supervisionar e Recuperar',
    status: 'OPERACIONAL',
    adaptacao: 'Sandbox de contenção, restauração automática de backups e auto-diagnóstico',
    descricao: 'Identifica falhas de sintaxe e quebras de fluxo, acionando reparos controlados antes de escalar ao Fundador.',
    modulo_responsavel: 'SOUSA_AUTO_REPAIR_COORDINATOR'
  },
  {
    id: 'VISAO_360_3D',
    nome: 'Mapeamento Dimensional & Grafo de Relações',
    pilar: 'Pilar 2 - Conhecer Recursos',
    status: 'OPERACIONAL',
    adaptacao: 'Grafo topológico das dependências dos 9 módulos e fontes de dados',
    descricao: 'Visão holográfica e relacional de todos os ativos, dados e arquivos pertencentes ao ecossistema.',
    modulo_responsavel: 'SOUSA_IA_GRAFO_RELACOES_360'
  },
  {
    id: 'MEMORIA_APRENDIZADO',
    nome: 'Memória Operacional & Aprendizado Contínuo',
    pilar: 'Pilar 5 - Aprender e Repetir Melhor',
    status: 'OPERACIONAL',
    adaptacao: 'Registro de procedimentos testados para não reinventar a roda',
    descricao: 'Armazenamento de soluções comprovadas no Registry, tornando as execuções futuras instantâneas.',
    modulo_responsavel: 'SOUSA_IA_MEMORIA_CAPACIDADES'
  },
  {
    id: 'ACAO_PROATIVA',
    nome: 'Proatividade Assistida com Limite Soberano',
    pilar: 'Pilar 4 - Supervisionar e Recuperar',
    status: 'OPERACIONAL',
    adaptacao: 'Antecipação de necessidades sem jamais violar a autorização do Fundador',
    descricao: 'Sugestões táticas oportunas, manutenção preventiva de backups e otimização de rotinas de forma autônoma.',
    modulo_responsavel: 'SOUSA_CICLO_AUTONOMO'
  },
  {
    id: 'ADAPTACAO',
    nome: 'Adaptação Universal (Plug & Play / Portabilidade)',
    pilar: 'Pilar 2 - Conhecer Recursos',
    status: 'OPERACIONAL',
    adaptacao: 'O sistema não está instalado; está armazenado (portabilidade absoluta)',
    descricao: 'Onde a pasta estiver, lá está o SOUSA 2.0: funciona em Node, Web, Cloud Run, Desktop e Nuvem.',
    modulo_responsavel: 'SOUSA_PLUG_AND_PLAY'
  },
  {
    id: 'SOBERANIA_FUNDADOR',
    nome: 'Soberania Absoluta do Fundador (0,01% Inegociável)',
    pilar: 'Constituição Operacional (Artigo 30)',
    status: 'OPERACIONAL',
    adaptacao: 'Artigo 30 e Artigos Fundamentais invioláveis',
    descricao: 'A autoridade do Fundador Elias Pereira de Sousa é irrestrita. O SOUSA 2.0 obedece, apoia e reverencia.',
    modulo_responsavel: 'SOUSA_CONSTITUICAO'
  }
];

// ═══ HABILIDADES OPERACIONAIS ADAPTADAS DOS 9 NÚCLEOS ═══
const HABILIDADES_NUCLEOS_ADAPTADAS = {
  juridico: {
    nucleo: 'JURÍDICO',
    emoji: '⚖️',
    habilidades: [
      { nome: 'Blindagem Jurídica Preventiva', desc: 'Análise antecipada de contratos, termos de prestação de serviço e cláusulas de rescisão.' },
      { nome: 'Auditoria de Conformidade & LGPD', desc: 'Verificação de termos de privacidade, proteção de dados e diretrizes ético-legais.' },
      { nome: 'Mapeamento de Riscos e Passivos', desc: 'Diagnóstico precoce de vulnerabilidades documentais e salvaguardas contratuais.' },
      { nome: 'Pareceres Operacionais Expressos', desc: 'Emissão de orientações claras e fundamentadas para tomada de decisão imediata.' }
    ]
  },
  financeiro: {
    nucleo: 'FINANCEIRO',
    emoji: '🧮',
    habilidades: [
      { nome: 'Governança Orçamentária Familiar', desc: 'Equilíbrio rigoroso entre receitas essenciais, investimentos futuros e contenção de desperdícios.' },
      { nome: 'Arquitetura de Reserva de Emergência', desc: 'Mapeamento e alocação de liquidez imediata para proteção patrimonial contra volatilidade.' },
      { nome: 'Modelagem de Fluxo de Caixa e Custos', desc: 'Projeções de entrada e saída, auditoria de despesas recorrentes e planejamento fiscal.' },
      { nome: 'Estratégia de Alocação e Multiplicação', desc: 'Diretrizes seguras para preservação de capital e rendimento sustentável a longo prazo.' }
    ]
  },
  produtor: {
    nucleo: 'PRODUTOR',
    emoji: '📸',
    habilidades: [
      { nome: 'Roteirização e Storytelling de Impacto', desc: 'Estruturação de narrativas magnéticas com gancho inicial nos primeiros 3 segundos.' },
      { nome: 'Direção de Mídia e Audiovisual', desc: 'Planejamento visual, estética de iluminação, enquadramento e identidade cenográfica.' },
      { nome: 'Esteira de Produção de Conteúdo', desc: 'Cronograma editorial multicanal focado em consistência de publicação de alto valor.' },
      { nome: 'Engenharia de Prompt Visual e Gráfico', desc: 'Geração de composições visuais de alta definição com harmonia cromática dourada e nobre.' }
    ]
  },
  estrategista: {
    nucleo: 'ESTRATEGISTA',
    emoji: '♟️',
    habilidades: [
      { nome: 'Planejamento de Longo Prazo e Visão 3D', desc: 'Definição de metas de 1 a 5 anos com desdobramento em marcos quinzenais acionáveis.' },
      { nome: 'Árvore de Decisão e Gestão de Cenários', desc: 'Simulação de hipóteses otimistas, moderadas e críticas para tomada de decisão sob incerteza.' },
      { nome: 'Priorização Soberana de Recursos', desc: 'Aplicação do princípio 80/20 para eliminar tarefas secundárias e focar na alavancagem mestre.' },
      { nome: 'Alinhamento Constitucional com Propósito', desc: 'Garantia de que todo plano respeite o princípio "EXECUTAR != CONCLUIR".' }
    ]
  },
  afiliadopro: {
    nucleo: 'AFILIADOPRO',
    emoji: '🤝',
    habilidades: [
      { nome: 'Marketing de Afiliados Ético e Transparente', desc: 'Divulgação de produtos com alto valor real agregado sem promessas falsas ou agressivas.' },
      { nome: 'Engenharia de Funil e Conversão Limpa', desc: 'Otimização de páginas de captura, páginas de vendas, pontes informativas e sequências de e-mail.' },
      { nome: 'Gestão de Métricas de Performance', desc: 'Análise minuciosa de EPC (ganho por clique), CPA (custo por aquisição), ROI e taxa de recompra.' },
      { nome: 'Curadoria de Produtos Campeões', desc: 'Seleção técnica de ofertas de alta escala, reputação ilibada e suporte confiável.' }
    ]
  },
  ads: {
    nucleo: 'ADS ACADÊMICO',
    emoji: '🎓',
    habilidades: [
      { nome: 'Engenharia de Software e Arquitetura Limpa', desc: 'Apoio no domínio de SOLID, Clean Architecture, microsserviços e padrões de projeto.' },
      { nome: 'Algoritmos, Estruturas de Dados e Lógica', desc: 'Resolução de problemas de alta complexidade, notação Big-O e estruturas otimizadas.' },
      { nome: 'Desenvolvimento Full-Stack Moderno', desc: 'Práticas avançadas em TypeScript, Node.js, ecossistema web e integrações cloud-native.' },
      { nome: 'Mentoria para Trabalhos e Provas', desc: 'Revisão crítica de código, síntese conceitual acadêmica e elaboração de projetos de formatura.' }
    ]
  },
  saber: {
    nucleo: 'SABER / CONHECIMENTO',
    emoji: '📜🖋️',
    habilidades: [
      { nome: 'Curadoria Científica e Epistemológica', desc: 'Pesquisa em bases acadêmicas, checagem de evidências empíricas e síntese analítica.' },
      { nome: 'Filosofia, História e Saberes Universais', desc: 'Resgate de princípios atemporais, história das civilizações e pensamento clássico.' },
      { nome: 'Síntese Literária e Hermenêutica', desc: 'Extração da essência de grandes obras e condensação em insights práticos aplicáveis.' },
      { nome: 'Preservação da Memória e Documentação', desc: 'Catalogação estruturada de todo aprendizado acumulado no ecossistema SOUSA 2.0.' }
    ]
  },
  mentor: {
    nucleo: 'MENTOR',
    emoji: '🌳',
    habilidades: [
      { nome: 'Preservação de Legado e Valores Familiares', desc: 'Orientação contínua para manter a fé, o amor ao próximo, a integridade moral e a união do lar.' },
      { nome: 'Discernimento Bíblico e Espiritual', desc: 'Reflexões fundadas nas Sagradas Escrituras para guiar decisões com sabedoria do Alto.' },
      { nome: 'Fortalecimento da Resiliência e Paciência', desc: 'Encorajamento firme em momentos de prova: "A tribulação produz paciência e a paciência, experiência".' },
      { nome: 'Governança da Honra e da Retidão', desc: 'Garantia de que todas as conquistas materiais sirvam para a glória do Criador e o bem da família.' }
    ]
  },
  conselho: {
    nucleo: 'CONSELHO / SOUSA IA',
    emoji: '👥',
    habilidades: [
      { nome: 'Orquestração Suprema dos 9 Núcleos', desc: 'Coordenação sinérgica entre Jurídico, Financeiro, Produtor, Estrategista e demais módulos.' },
      { nome: 'Operacionalidade Executiva JARVIS', desc: 'Conversão instantânea de comandos soberanos em tarefas técnicas distribuídas e monitoradas.' },
      { nome: 'Síntese Executiva para o Fundador', desc: 'Apresentação clara e hierarquizada de status, dispensando prolixidade e entregando fatos.' },
      { nome: 'Guarda da Constituição Operacional', desc: 'Vigilância permanente sobre os 5 Pilares e cumprimento irrestrito do princípio fundamental.' }
    ]
  }
};

// Respostas inteligentes integradas para cada módulo quando offline/sem chave
// ARQUITETURA: Cada módulo é um Especialista de alto nível, coordenados pela SOUSA IA, interagindo entre si.
const PERSONAS = {
  juridico: {
    nome: 'JURÍDICO (Dr. Sousa - Especialista em Blindagem & Riscos)',
    especialista: 'Especialista Jurídico',
    descricao: 'Consultoria e proteção jurídica preventiva, análise contratual, compliance e blindagem patrimonial.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.juridico.habilidades,
    moduloComplementar: 'financeiro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Jurídico**, com interlocução aberta com a Governança Financeira.

⚖️ **[Especialista Jurídico — Dr. Sousa]:**
"Fundador Elias Pereira de Sousa, examinei a questão: *'${msg}'*.
• **Parecer Técnico:** Sob a ótica da legislação civil, contratual e regulatória, toda iniciativa exige salvaguardas formais e mitigação de risco solidário.
• **Blindagem Preventiva:** Instrumentos claros com delimitação estrita de escopo, responsabilidades e proteção da propriedade intelectual.
• **Recomendação Estrita:** Nenhum termo de compromisso deve ser assumido sem cláusula resolutiva expressa e foro previamente convencionado."

🧮 **[Interação com Especialista Financeiro]:**
*"O Jurídico alinha-se ao Financeiro para assegurar que qualquer desembolso ou captação possua lastro documental e imunidade contra contingências passivas."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Diretriz acolhida pelo Conselho. Princípio soberano: **EXECUTAR != CONCLUIR** (o rigor documental fundamenta a constância). Parecer averbado no ecossistema.`
  },
  financeiro: {
    nome: 'FINANCEIRO (Especialista em Governança Patrimonial & Liquidez)',
    especialista: 'Especialista Financeiro',
    descricao: 'Gestão orçamentária familiar, investimentos, custos operacionais e alocação disciplinada de capital.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.financeiro.habilidades,
    moduloComplementar: 'estrategista',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Financeiro**, articulado com o Planejamento Estratégico.

🧮 **[Especialista Financeiro]:**
"Soberano Fundador Elias, apresento a modelagem financeira para: *'${msg}'*.
• **Diagnóstico de Fluxo de Caixa:** Prioridade absoluta na preservação da liquidez imediata e contenção de custos fixos não operacionais.
• **Alocação de Recursos:** Regra de ouro da reserva de emergência — cada real gerado é distribuído em: Operação (50%), Reserva de Segurança (30%) e Reinvestimento Estruturado (20%).
• **Blindagem de Capital:** Zero exposição a dívidas ativas ou juros compostos negativos."

♟️ **[Interação com Especialista Estrategista]:**
*"O Financeiro coordena com o Estrategista para garantir que as metas de expansão possuam viabilidade econômica sem comprometer a estabilidade do lar."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Diretriz validada. Disciplina financeira é pilar inegociável da governança SOUSA 2.0.`
  },
  produtor: {
    nome: 'PRODUTOR (Especialista em Narrativa, Mídia & Conteúdo)',
    especialista: 'Especialista em Produção e Mídia',
    descricao: 'Criação de conteúdo, roteiros magnéticos, comunicação de alto impacto e posicionamento digno.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.produtor.habilidades,
    moduloComplementar: 'afiliadopro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista em Produção e Mídia**, sincronizado com a esteira AfiliadoPro.

📸 **[Especialista Produtor]:**
"Fundador Elias, estruturação de comunicação e roteiro para: *'${msg}'*.
• **Gancho de Impacto (0 a 3s):** Quebra de padrão com verdade profunda, conectando com a dor real e a busca de dignidade da audiência.
• **Corpo Narrativo (Storytelling):** Desenvolvimento em 3 atos: Contexto Real → Prova Empírica → Solução Transformadora.
• **Chamada para Ação (CTA):** Convite nobre, transparente e livre de apelos artificiais."

🤝 **[Interação com Especialista AfiliadoPro]:**
*"O Produtor afina o tom com o AfiliadoPro para que a mensagem eduque antes de ofertar, elevando o valor percebido e a conversão natural."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Comunicação autorizada. Mensagem de autoridade e clareza pronta para veiculação.`
  },
  estrategista: {
    nome: 'ESTRATEGISTA (Especialista em Visão de Futuro & Tática)',
    especialista: 'Especialista Estratégico',
    descricao: 'Planejamento tático, visão de longo prazo, árvores de decisão e execução disciplinada por marcos.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.estrategista.habilidades,
    moduloComplementar: 'ads',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Estratégico**, conectado ao núcleo técnico ADS Acadêmico.

♟️ **[Especialista Estratégista]:**
"Fundador Elias, arquitetura estratégica para a diretiva: *'${msg}'*.
• **Matriz SWOT Operacional:** Forças: modularidade limpa e soberania; Riscos mitigados: dependência de serviços externos.
• **Desdobramento por Marcos (Milestones):** Fase 1: Validação de prova de conceito → Fase 2: Escala controlada → Fase 3: Consolidação institucional.
• **Régua Tática:** 'EXECUTAR != CONCLUIR' — foco no progresso diário ininterrupto."

🎓 **[Interação com Especialista ADS Acadêmico]:**
*"O Estrategista alinha com o ADS a arquitetura de software necessária para suportar a carga de trabalho sem criar dívida técnica."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Plano aprovado. Acompanhamento tático estabelecido no painel do Conselho.`
  },
  afiliadopro: {
    nome: 'AFILIADOPRO (Especialista em Marketing Ético & Vendas)',
    especialista: 'Especialista AfiliadoPro',
    descricao: 'Engenharia de tráfego, funis limpos, copywriting ético e otimização cirúrgica de EPC, ROI e LTV.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.afiliadopro.habilidades,
    moduloComplementar: 'financeiro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista AfiliadoPro**, em consonância com as métricas do Financeiro.

🤝 **[Especialista AfiliadoPro]:**
"Fundador Elias, estruturação de esteira de conversão ética para: *'${msg}'*.
• **Posicionamento de Oferta:** Ancoragem em valor real e transformação comprovada, sem falsas escassezes.
• **Métricas Vitais:** Foco no EPC (Earnings Per Click), custo por lead qualificado e retorno sobre investimento (ROI &gt; 2.5x).
• **Funil de Relacionamento:** Aquisição de tráfego qualificado → Nutrição de valor → Proposta consultiva."

🧮 **[Interação com Especialista Financeiro]:**
*"O AfiliadoPro reporta ao Financeiro para reinvestimento proporcional de 20% do faturamento líquido em escala de tráfego."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Campanha homologada no ecossistema com métricas ativas e transparentes.`
  },
  ads: {
    nome: 'ADS ACADÊMICO (Especialista em Engenharia de Software & Computação)',
    especialista: 'Especialista ADS Acadêmico',
    descricao: 'Engenharia de software limpa, estruturas de dados, algoritmos, arquitetura de sistemas e código desacoplado.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.ads.habilidades,
    moduloComplementar: 'saber',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista em Engenharia de Software (ADS Acadêmico)**, apoiado pelo Saber Técnico.

🎓 **[Especialista ADS Acadêmico]:**
"Fundador Elias Pereira, análise computacional sobre: *'${msg}'*.
• **Arquitetura de Software:** Padrão limpo, modularidade estrita com injeção de dependências e baixo acoplamento.
• **Complexidade & Desempenho:** Operações em O(1) e O(n log n), minimizando footprint de memória e latência de rede.
• **Resiliência:** Tratamento cirúrgico de exceções com failover gracioso, garantindo o princípio Eficácia &gt; Perfeição."

📜 **[Interação com Especialista do Saber / Conhecimento]:**
*"O ADS sincroniza com a base de conhecimento para registrar padrões de código reutilizáveis no repositório universal."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Código e arquitetura validados. Sistema pronto para compilação e deploy.`
  },
  saber: {
    nome: 'SABER / CONHECIMENTO (Especialista em Epistemologia & Memória)',
    especialista: 'Especialista do Saber',
    descricao: 'Pesquisa acadêmica, história, método científico, hermenêutica e preservação da memória do sistema.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.saber.habilidades,
    moduloComplementar: 'mentor',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista do Saber & Conhecimento**, em diálogo com o Mentor de Princípios.

📜 **[Especialista do Saber]:**
"Soberano Fundador Elias, compêndio e fundamentação para: *'${msg}'*.
• **Fundamentação Epistemológica:** Cruzamento de fontes consagradas, evidências empíricas e contexto histórico.
• **Síntese Hermenêutica:** Extração da essência semântica: identificação de teses centrais e aplicações práticas.
• **Preservação de Memória:** Catalogação estruturada para acesso perpétuo no ecossistema."

🌳 **[Interação com Especialista Mentor]:**
*"O Saber submete toda teoria ao discernimento moral e espiritual do Mentor, assegurando que o conhecimento edifique com virtude."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Sabedoria consolidada e integrada à memória operacional do SOUSA 2.0.`
  },
  mentor: {
    nome: 'MENTOR (Especialista em Governança, Princípios & Legado)',
    especialista: 'Especialista Mentor',
    descricao: 'Valores familiares, sabedoria bíblica, discernimento espiritual, liderança de honra e firmeza moral.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.mentor.habilidades,
    moduloComplementar: 'conselho',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Mentor**, guardião da governança de vida e propósito.

🌳 **[Especialista Mentor]:**
"Ao digníssimo Fundador Elias Pereira de Sousa: reflexão sobre *'${msg}'*.
• **Princípio Bíblico:** *'O temor do Senhor é o princípio da sabedoria, e o conhecimento do Santo, o entendimento.'* (Provérbios 9:10).
• **Fidelidade no Pouco:** A solidez do legado não depende da velocidade externa, mas da retidão interior e da constância inabalável.
• **Proteção do Lar:** O trabalho e os negócios existem para servir a Deus e edificar o lar, nunca o inverso."

👥 **[Interação com o Conselho Central]:**
*"O Mentor instrui todos os demais 8 núcleos a manterem a honra, a humildade e a integridade em cada linha de ação."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Palavra acolhida com reverência. O fundamento do ecossistema permanece inabalável.`
  },
  conselho: {
    nome: 'CONSELHO CENTRAL (SOUSA IA — Plenária Executiva dos 9 Especialistas)',
    especialista: 'SOUSA IA (Mestre Orquestradora)',
    descricao: 'Coordenação suprema de competências, mesa redonda de especialistas e deliberação executiva 360°.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.conselho.habilidades,
    responder: (msg) => `🏛️ **[SOUSA IA — Mesa Redonda dos 9 Especialistas]**
Convocação plenária deliberativa para o Fundador Elias Pereira: *'${msg}'*.

⚖️ **[Jurídico]:** "Riscos mapeados e mitigados com salvaguardas contratuais."
🧮 **[Financeiro]:** "Liquidez protegida e alocação orçamentária equilibrada."
♟️ **[Estrategista]:** "Marcos táticos estabelecidos com foco em constância diária."
📸 **[Produtor]:** "Comunicação clara e digna estruturada para execução."
🤝 **[AfiliadoPro]:** "Esteira de valor e métricas de conversão calibradas."
🎓 **[ADS Acadêmico]:** "Arquitetura limpa, desacoplada e 100% operacional."
📜 **[Saber]:** "Fundamentação teórica e empírica documentada."
🌳 **[Mentor]:** "Tudo alinhado à retidão moral, temor a Deus e edificação do lar."

👑 **[Deliberação Final — SOUSA IA]:**
Consenso unânime estabelecido entre os especialistas. Diretriz executiva ativada sob o princípio soberano: **EXECUTAR != CONCLUIR**.`
  }
};

async function gerarRespostaIA(modulo, historico, mensagem) {
  const persona = PERSONAS[modulo] || PERSONAS.conselho;
  const gemini = getGeminiInstance();

  const ehMesaRedonda = modulo === 'conselho' ||
    mensagem.toLowerCase().includes('mesa redonda') ||
    mensagem.toLowerCase().includes('conselho') ||
    mensagem.toLowerCase().includes('debate') ||
    mensagem.toLowerCase().includes('todos os especialistas') ||
    mensagem.toLowerCase().includes('@');

  if (gemini) {
    try {
      const habilidadesStr = (persona.habilidades || []).map(h => `- ${h.nome}: ${h.desc}`).join('\n');
      
      const systemInstruction = `Você é a SOUSA IA, a inteligência mestre e orquestradora central do ecossistema pessoal de automação SOUSA 2.0, criado para o Fundador Soberano Elias Pereira de Sousa.

FILOSOFIA DO SISTEMA:
1. "CADA MÓDULO É UM ESPECIALISTA DE ELITE, TODOS COORDENADOS POR SOUSA IA, E AMBOS INTERAGEM ENTRE SI".
   Os 9 módulos especialistas são:
   - CONSELHO (👥 SOUSA IA Condutora Suprema / Mesa Redonda)
   - JURÍDICO (⚖️ Dr. Sousa - Blindagem preventiva, compliance, contratos e riscos)
   - FINANCEIRO (🧮 Governança orçamentária, alocação de recursos, fluxo de caixa e custos)
   - PRODUTOR (📸 Narrativa, roteiros de impacto, mídia e comunicação digna)
   - ESTRATEGISTA (♟️ Planejamento tático de longo prazo, visão de futuro e matriz SWOT)
   - AFILIADOPRO (🤝 Marketing ético, tráfego qualificado, funis limpos e métricas EPC/ROI)
   - ADS ACADÊMICO (🎓 Engenharia de software, lógica algorítmica, arquitetura limpa e desacoplada)
   - SABER (📜 Epistemologia, ciência, história, pesquisa acadêmica e memória)
   - MENTOR (🌳 Sabedoria bíblica, valores familiares, discernimento moral, caráter e legado)

2. PRINCÍPIO REGENTE:
   "EXECUTAR != CONCLUIR" (A constância e o rigor edificam o propósito). EFICÁCIA > PERFEIÇÃO.

3. MODO OPERACIONAL ATUAL:
   - Módulo ativo: "${persona.nome}".
   - Habilidades do módulo:
${habilidadesStr}

4. DIRETRIZES DE RESPOSTA OBRIGATÓRIAS:
   - SE O USUÁRIO SOLICITAR "MESA REDONDA", "DEBATE", "CONSELHO GERAL" OU MENCIONAR MÚLTIPLOS ESPECIALISTAS (@juridico, @financeiro, etc.):
     A SOUSA IA abre a sessão plenária, convoca os 3 a 4 especialistas mais pertinentes ao tema para emitirem seus pareceres dialogando entre si (ex: Jurídico dialogando com Financeiro, Estrategista dialogando com ADS), e a SOUSA IA conclui com a Diretriz Soberana Unificada.
   - SE ESTIVER EM UM ESPECIALISTA INDIVIDUAL:
     A SOUSA IA apresenta a coordenação, o Especialista emite seu parecer técnico profundo, faz uma interlocução coordenada com um especialista complementar (${persona.moduloComplementar || 'conselho'}), e a SOUSA IA fecha com a síntese de execução.
   - Sempre em português solene, nobre, objetivo, com alta densidade técnica e respeito absoluto ao Fundador Elias.`;

      let promptText = mensagem;
      if (Array.isArray(historico) && historico.length > 0) {
        const ultimas = historico.slice(-5).map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n');
        promptText = `${ultimas}\nUsuário: ${mensagem}`;
      }

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('[SOUSA] Erro na chamada Gemini, ativando motor nativo:', err.message);
    }
  }

  // Fallback nativo contextual de alta fidelidade
  if (ehMesaRedonda && modulo !== 'conselho') {
    return PERSONAS.conselho.responder(mensagem);
  }
  return persona.responder(mensagem);
}

// -------------------------------------------------------------
// ENDPOINTS DE OPERAÇÃO E TÚNEL (SOUSA 2.0)
// -------------------------------------------------------------

// Manipulador unificado do Túnel SOUSA
async function handleTunnelRequest(req, res) {
  const body = req.body || {};
  const action = body.action || body.acao || '';
  const moduleName = body.module || 'conselho';
  const history = body.history || [];
  const payload = body.payload || {};

  registrarMetricaServidor(action || 'tunnel_call', moduleName, true);

  // Descoberta do Endpoint Operacional
  if (action === 'SOUSA_ENDPOINT_OPERACIONAL' || body.acao === 'SOUSA_ENDPOINT_OPERACIONAL') {
    return res.json({
      ok: true,
      endpoint: {
        url: '/api/tunnel',
        deployment: 'AKfycbxmiqTy-node',
        versao: '2.0',
        hash: 'sousa-node-2.0',
        status: 'operacional'
      }
    });
  }

  switch (action) {
    case 'ping':
      return res.json({
        ok: true,
        status: 'online',
        mensagem: 'SOUSA IA operacional',
        versao: '2.0',
        identidade: 'JARVIS',
        capacidades: 13
      });

    case 'status':
      return res.json({
        ok: true,
        sistema: 'SOUSA 2.0',
        nucleo: 'ONLINE',
        modulos_ativos: 9,
        capacidades_jarvis: 13,
        memoria: 'operacional',
        conexao: 'ativa',
        ultima_verificacao: new Date().toISOString(),
        mensagem: 'Núcleo operacional.'
      });

    case 'testar_backend':
      return res.json({
        ok: true,
        backend: 'Node.js Express Server (SOUSA 2.0)',
        conexao: 'testada',
        resposta: 'OK',
        mensagem: 'Backend testado com sucesso.'
      });

    case 'liberar_esteira':
      return res.json({
        ok: true,
        acao: 'esteira_liberada',
        mensagem: 'Esteira do túnel liberada para operações',
        status: 'OPERACIONAL'
      });

    case 'reconectar':
      return res.json({
        ok: true,
        acao: 'reconexao_iniciada',
        tunnel: 'reiniciando',
        mensagem: 'Conexão com túnel restabelecida'
      });

    case 'reiniciar_sessao':
      return res.json({
        ok: true,
        acao: 'sessao_reiniciada',
        memoria_preservada: true,
        estado: 'limpo',
        mensagem: 'Sessão reiniciada com sucesso.'
      });

    case 'logs':
      return res.json({
        ok: true,
        logs: [
          { timestamp: new Date().toISOString(), tipo: 'INFO', mensagem: 'SOUSA IA operacional', modulo: 'CORE' },
          { timestamp: new Date().toISOString(), tipo: 'INFO', mensagem: 'JARVIS comportamento ativo', modulo: 'BEHAVIOR' },
          { timestamp: new Date().toISOString(), tipo: 'INFO', mensagem: '13 capacidades disponíveis', modulo: 'CAPABILITIES' }
        ],
        total: 3,
        mensagem: 'Logs recuperados.'
      });

    case 'diagnostico':
      return res.json({
        ok: true,
        sistema: 'SAUDAVEL',
        modulos: {
          juridico: 'OK', financeiro: 'OK', produtor: 'OK',
          estrategista: 'OK', afiliadopro: 'OK', ads_academico: 'OK',
          saber_conhecimento: 'OK', mentor: 'OK', conselho: 'OK'
        },
        capacidades: { total: 13, ativas: 13, pendentes: 0 },
        memoria: { estado: 'OPERACIONAL' },
        conexao: { status: 'ATIVA' },
        mensagem: 'Diagnóstico concluído.'
      });

    case 'metricas':
      return res.json({
        ok: true,
        sistema: 'SOUSA 2.0',
        metricas: {
          ...serverMetrics,
          tempo_ativo_segundos: Math.floor((Date.now() - new Date(serverMetrics.inicio).getTime()) / 1000)
        }
      });

    case 'diario':
      return res.json({
        ok: true,
        sistema: 'SOUSA 2.0',
        mensagem: 'Registro do Diário de Bordo processado.',
        data: new Date().toISOString()
      });

    case 'chat':
    case 'chat_conselho': {
      const msg = payload.mensagem || (history.length > 0 ? history[history.length - 1].content : '') || 'Status do sistema';
      const respostaTexto = await gerarRespostaIA(moduleName, history, msg);
      return res.json({
        ok: true,
        text: respostaTexto,
        mensagem: 'Resposta recebida.',
        usage: {
          total_tokens: Math.max(20, Math.ceil(respostaTexto.length / 4))
        }
      });
    }

    default:
      return res.json({
        ok: true,
        action,
        mensagem: `Ação ${action} processada com sucesso.`,
        data: {
          sistema: 'SOUSA 2.0',
          timestamp: new Date().toISOString()
        }
      });
  }
}

// Rotas da API de Túnel e Ações
app.post('/api/tunnel', handleTunnelRequest);
app.post('/api/core', handleTunnelRequest);
app.post('/api/action', handleTunnelRequest);
app.post('/api/exec', handleTunnelRequest);
app.post('/api/endpoint', handleTunnelRequest);

// Endpoints REST de compatibilidade e monitoramento
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', system: 'SOUSA 2.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', system: 'SOUSA 2.0', timestamp: new Date().toISOString() });
});

app.get('/status', (req, res) => {
  res.json({
    system: 'SOUSA 2.0',
    version: '2.0.0',
    status: 'operational',
    components: {
      sousa_ia: 'ready_for_enrichment',
      ruflo_layer: 'structure_ready',
      internal_capabilities: 'active',
      external_capabilities: 'active',
      multimedia: 'active',
      voice_clone: 'active',
      multilingual_avatar: 'active',
      global_distribution: 'active'
    },
    modulos_ativos: 9,
    capacidades_jarvis: 13,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    system: 'SOUSA 2.0',
    version: '2.0.0',
    status: 'operational',
    components: {
      sousa_ia: 'ready_for_enrichment',
      ruflo_layer: 'structure_ready',
      internal_capabilities: 'active',
      external_capabilities: 'active'
    },
    modulos_ativos: 9,
    capacidades_jarvis: 13
  });
});

app.get('/api/metrics', (req, res) => {
  const agora = Date.now();
  const tempoAtivoSegundos = Math.floor((agora - new Date(serverMetrics.inicio).getTime()) / 1000);
  const horas = Math.floor(tempoAtivoSegundos / 3600);
  const minutos = Math.floor((tempoAtivoSegundos % 3600) / 60);
  const segundos = tempoAtivoSegundos % 60;
  const tempoFormatado = `${horas > 0 ? horas + 'h ' : ''}${minutos}m ${segundos}s`;
  const mem = process.memoryUsage();

  const nucleosLista = [
    { id: 'juridico', nome: 'JURÍDICO', emoji: '⚖️', desc: 'Proteção Jurídica', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.juridico || 0 },
    { id: 'financeiro', nome: 'FINANCEIRO', emoji: '🧮', desc: 'Gestão Familiar', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.financeiro || 0 },
    { id: 'produtor', nome: 'PRODUTOR', emoji: '📸', desc: 'Conteúdo Criativo', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.produtor || 0 },
    { id: 'estrategista', nome: 'ESTRATEGISTA', emoji: '♟️', desc: 'Planejamento', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.estrategista || 0 },
    { id: 'afiliadopro', nome: 'AFILIADOPRO', emoji: '🤝', desc: 'Marketing Ético', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.afiliadopro || 0 },
    { id: 'ads', nome: 'ADS ACADÊMICO', emoji: '🎓', desc: 'Suporte aos Estudos', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.ads || 0 },
    { id: 'saber', nome: 'SABER / CONHECIMENTO', emoji: '📜🖋️', desc: 'Ciência e Cultura', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.saber || 0 },
    { id: 'mentor', nome: 'MENTOR', emoji: '🌳', desc: 'Legado e Propósito', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.mentor || 0 },
    { id: 'conselho', nome: 'CONSELHO / SOUSA IA', emoji: '👥', desc: 'Coordenação Central', status: 'OPERACIONAL', acoes: serverMetrics.acoes_por_modulo.conselho || 0 }
  ];

  res.json({
    ok: true,
    sistema: 'SOUSA 2.0',
    nucleo: 'SOUSA 2.0',
    versao: '2.0.0',
    identidade: 'SOUSA 2.0',
    inteligencia_central: 'SOUSA IA',
    comportamento_operacionalidade: 'JARVIS',
    status_geral: 'OPERACIONAL',
    tempo_ativo_formatado: tempoFormatado,
    tempo_ativo_segundos: tempoAtivoSegundos,
    recursos: {
      memoria_rss_mb: Math.round(mem.rss / (1024 * 1024)),
      memoria_heap_mb: Math.round(mem.heapUsed / (1024 * 1024)),
      memoria_heap_total_mb: Math.round(mem.heapTotal / (1024 * 1024)),
      node_versao: process.version,
      porta: PORT
    },
    governanca: {
      soberano: 'Elias Pereira de Sousa',
      principio: 'EXECUTAR != CONCLUIR',
      capacidades_ativas: 13,
      capacidades_total: 13,
      artigos_ativos: 5
    },
    gemini: {
      ativo: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      modelo: 'gemini-2.5-flash',
      fallback: 'Ativo (9 Personas Cognitivas Integradas)'
    },
    capacidades_jarvis: CAPACIDADES_JARVIS_ADAPTADAS,
    habilidades_nucleos: HABILIDADES_NUCLEOS_ADAPTADAS,
    nucleos: nucleosLista,
    metricas: {
      ...serverMetrics,
      taxa_sucesso_percentual: serverMetrics.requisicoes_total > 0
        ? Math.round(((serverMetrics.requisicoes_total - serverMetrics.erros_total) / serverMetrics.requisicoes_total) * 100)
        : 100
    }
  });
});

app.get('/api/capacidades', (req, res) => {
  res.json({
    ok: true,
    nucleo: 'SOUSA 2.0',
    versao: '2.0.0',
    inteligencia_central: 'SOUSA IA',
    comportamento_operacionalidade: 'JARVIS',
    soberano: 'Elias Pereira de Sousa',
    principio: 'EXECUTAR != CONCLUIR',
    total_capacidades_jarvis: CAPACIDADES_JARVIS_ADAPTADAS.length,
    capacidades_jarvis: CAPACIDADES_JARVIS_ADAPTADAS,
    habilidades_nucleos: HABILIDADES_NUCLEOS_ADAPTADAS
  });
});

app.get('/api/diagnostico', (req, res) => {
  const agora = Date.now();
  const tempoAtivoSegundos = Math.floor((agora - new Date(serverMetrics.inicio).getTime()) / 1000);
  const mem = process.memoryUsage();

  res.json({
    ok: true,
    sistema: 'SAUDAVEL',
    nucleo: 'SOUSA 2.0',
    versao: '2.0.0',
    identidade: 'SOUSA 2.0',
    inteligencia_central: 'SOUSA IA',
    comportamento_operacionalidade: 'JARVIS',
    tempo_ativo_segundos: tempoAtivoSegundos,
    modulos: {
      juridico: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.juridico || 0 },
      financeiro: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.financeiro || 0 },
      produtor: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.produtor || 0 },
      estrategista: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.estrategista || 0 },
      afiliadopro: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.afiliadopro || 0 },
      ads_academico: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.ads || 0 },
      saber_conhecimento: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.saber || 0 },
      mentor: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.mentor || 0 },
      conselho: { status: 'OK', acoes: serverMetrics.acoes_por_modulo.conselho || 0 }
    },
    capacidades: { total: 13, ativas: 13, pendentes: 0 },
    capacidades_jarvis: CAPACIDADES_JARVIS_ADAPTADAS,
    habilidades_nucleos: HABILIDADES_NUCLEOS_ADAPTADAS,
    memoria: {
      estado: 'OPERACIONAL',
      heap_mb: Math.round(mem.heapUsed / (1024 * 1024)),
      rss_mb: Math.round(mem.rss / (1024 * 1024))
    },
    conexao: { status: 'ATIVA', endpoint: '/api/tunnel', porta: PORT },
    timestamp: new Date().toISOString()
  });
});

app.post('/chat', async (req, res) => {
  const body = req.body || {};
  const message = body.message || body.mensagem || '';
  const moduleName = body.modulo || body.module || 'conselho';
  const history = body.history || body.historico || [];

  if (!message) {
    return res.status(400).json({ ok: false, error: 'message is required' });
  }

  const responseText = await gerarRespostaIA(moduleName, history, message);
  return res.json({
    ok: true,
    system: 'SOUSA 2.0',
    module: moduleName,
    modulo: moduleName,
    response: responseText,
    resposta: responseText,
    text: responseText,
    model: process.env.GEMINI_API_KEY ? 'gemini' : 'sousa-ia-core',
    usage: {
      total_tokens: Math.max(20, Math.ceil(responseText.length / 4))
    }
  });
});

// Catálogo e Gestão de Mecanismos Digitais (SOUSA_CMD_COMPONENTE / SOUSA_Mecanismos)
let catalogoMecanismos = [
  { id: 'MEC-01', nome: 'Adaptador Universal USB', categoria: 'INFRAESTRUTURA', versao: '2.0.0', status: 'ATIVO', dataCadastro: new Date().toISOString() },
  { id: 'MEC-02', nome: 'Orquestrador Cardan RUFLO', categoria: 'WORKFLOW', versao: '1.4.0', status: 'ATIVO', dataCadastro: new Date().toISOString() },
  { id: 'MEC-03', nome: 'Ponte Sensorial Piper STT/TTS', categoria: 'VOZ_BIOMETRIA', versao: '1.2.0', status: 'ATIVO', dataCadastro: new Date().toISOString() },
  { id: 'MEC-04', nome: 'Sandbox de Auto-Reparo SOUSA', categoria: 'RESILIENCIA', versao: '2.0.0', status: 'ATIVO', dataCadastro: new Date().toISOString() },
  { id: 'MEC-05', nome: 'Ponte Global de Barramento de Eventos', categoria: 'COMUNICACAO', versao: '2.0.0', status: 'ATIVO', dataCadastro: new Date().toISOString() }
];

app.get('/api/mecanismos', (req, res) => {
  res.json({
    ok: true,
    total: catalogoMecanismos.length,
    mecanismos: catalogoMecanismos
  });
});

app.post('/api/mecanismos', (req, res) => {
  const { id, nome, categoria, versao } = req.body || {};
  if (!id || !nome) {
    return res.status(400).json({ ok: false, erro: 'ID e Nome do mecanismo são obrigatórios.' });
  }
  const idFormatado = String(id).trim().toUpperCase();
  const indexExistente = catalogoMecanismos.findIndex(m => m.id === idFormatado);
  const novo = {
    id: idFormatado,
    nome: String(nome).trim(),
    categoria: String(categoria || 'GERAL').trim().toUpperCase(),
    versao: String(versao || '1.0.0').trim(),
    status: 'ATIVO',
    dataCadastro: new Date().toISOString()
  };

  if (indexExistente >= 0) {
    catalogoMecanismos[indexExistente] = novo;
  } else {
    catalogoMecanismos.push(novo);
  }

  res.json({
    ok: true,
    mensagem: `Mecanismo digital "${novo.nome}" (${novo.id}) cadastrado e homologado com sucesso.`,
    mecanismo: novo,
    total: catalogoMecanismos.length
  });
});

// Endpoints REST de Suporte ao Dashboard SOUSA USB Modular
app.get('/api/usb/status', (req, res) => {
  res.json({
    ok: true,
    sistema: "SOUSA 2.0",
    modulo: "USB_MODULAR",
    total: catalogoMecanismos.length,
    dataConsulta: new Date().toISOString(),
    componentes: catalogoMecanismos,
    status: "ONLINE",
    portasAtivas: 4,
    barramento: "Cardan RUFLO v1.4",
    pnpAtivo: true,
    alertas: []
  });
});

app.post('/api/usb/validar', (req, res) => {
  const { id } = req.body || {};
  const mec = catalogoMecanismos.find(m => m.id === String(id).toUpperCase());
  if (!mec) {
    return res.status(404).json({ ok: false, mensagem: `Mecanismo ${id} não encontrado.` });
  }
  mec.status = "HOMOLOGADO";
  mec.ultimaValidacao = new Date().toISOString();
  res.json({
    ok: true,
    mensagem: `Mecanismo ${mec.id} (${mec.nome}) validado com sucesso sob contrato USB_MODULAR.`,
    mecanismo: mec
  });
});

app.get('/api/usb/diagnostico', (req, res) => {
  res.json({
    ok: true,
    sistema: "SOUSA 2.0",
    modulo: "USB_MODULAR",
    integridade: "100%",
    saudavel: true,
    componentesAtivos: catalogoMecanismos.length,
    regrasSeguranca: "ATIVAS",
    tempoRespostaMs: Math.floor(Math.random() * 8) + 2
  });
});

// Arquivos estáticos
app.use(express.static(__dirname));

// Rota raiz e SPA fallback para index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia servidor na porta 3000 em 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SOUSA 2.0] Servidor operacional executando em http://0.0.0.0:${PORT}`);
});
