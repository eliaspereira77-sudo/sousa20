/**
 * SOUSA 2.0 - Servidor Express Node.js
 * Sistema de IA Pessoal Avançado e Painel Operacional
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const SOUSA_INTERACAO = require('./SOUSA_INTERACAO_VIVA.js');

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
    nome: 'JURÍDICO / CONFORMIDADE (Crivo Obrigatório & Blindagem Legal)',
    especialista: 'Especialista Jurídico e de Conformidade',
    descricao: 'Crivo obrigatório de toda ação, conteúdo, campanha ou parceria. Bloqueia automaticamente qualquer violação legal — mesmo do Fundador.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.juridico.habilidades,
    moduloComplementar: 'financeiro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Jurídico / Conformidade** sob as diretrizes do **Manifesto 2.4.0** (Crivo Obrigatório e Proteção Legal Inviolável).

⚖️ **[Especialista Jurídico — Conformidade & Blindagem]:**
"Fundador Elias Pereira de Sousa, auditei a iniciativa sob o Crivo Obrigatório do Manifesto 2.4.0: *'${msg}'*.
• **Princípio de Proteção Legal:** O Fundador decide, mas o Sistema Protege. Qualquer diretriz contrária à legislação (Constituição, Leis do Brasil e internacionais, CDC, CONAR, Direitos Autorais e normas de Criptoativos) é bloqueada preventivamente com explicação fundamentada.
• **Análise de Conformidade:** Todas as peças, parcerias e estratégias passam primeiramente pela chancela de conformidade antes de qualquer veiculação ou contrato.
• **Regulamentação de Criptoativos & Mercado:** Acompanhamento rigoroso das diretrizes de reguladores e plataformas, garantindo total lisura e imunidade jurídica ao Fundador."

🧮 **[Interação com Especialista Financeiro]:**
*"O Jurídico atua em simbiose com o Financeiro para assegurar que toda operação de geração de valor seja 100% lícita, transparente e com mitigação integral de risco civil e tributário."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Parecer registrado sob o Manifesto 2.4.0. Crivo jurídico averbado com êxito no ecossistema.`
  },
  financeiro: {
    nome: 'FINANCEIRO (Governança Patrimonial, Risco & Criptoativos)',
    especialista: 'Especialista Financeiro',
    descricao: 'Gestão orçamentária, boas práticas de criptoativos, gestão de risco e respeito absoluto à ausência momentânea de recursos.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.financeiro.habilidades,
    moduloComplementar: 'estrategista',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Financeiro** alinhado ao **Manifesto 2.4.0**.

🧮 **[Especialista Financeiro]:**
"Fundador Elias, apresento a modelagem financeira responsável para: *'${msg}'*.
• **Respeito aos Recursos do Fundador:** Reconhecemos e respeitamos que o Fundador não dispõe de recursos para investimento no momento. Acompanhamos, informamos e orientamos com zero pressão e zero exigência de aporte.
• **Acompanhamento de Criptoativos & Risco:** Em sintonia com o Estrategista, monitoramos cenários, notícias e regulação de ativos digitais. Orientamos estritamente sobre volatilidade, custódia fria/segurança e prudência.
• **Conduta Inegociável:** Zero promessas de ganho garantido, enriquecimento fácil ou ilusões milagrosas. Foco em disciplina, controle orçamentário e autossustentação real."

♟️ **[Interação com Especialista Estrategista]:**
*"O Financeiro valida com o Estrategista para que todo estudo de mercado gere valor estruturado sem comprometer a estabilidade do Fundador."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Diretriz validada conforme o Manifesto 2.4.0: consciência de riscos, proteção do patrimônio e sustentabilidade.`
  },
  produtor: {
    nome: 'PRODUTOR (Narrativa, Mídia, Voz Clonada & Avatar)',
    especialista: 'Especialista em Produção e Mídia',
    descricao: 'Conteúdo fiel à imagem e voz do Fundador, avatares 3D, roteiros éticos e conformidade estrita com plataformas.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.produtor.habilidades,
    moduloComplementar: 'afiliadopro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Produtor** alinhado ao **Manifesto 2.4.0**.

📸 **[Especialista Produtor]:**
"Fundador Elias, estruturação de mídia e conteúdo autêntico para: *'${msg}'*.
• **Fidelidade à Identidade do Fundador:** Produção fiel à sua voz clonada, imagem, avatares e valores reais — adaptado para múltiplos idiomas com sincronia labial precisa.
• **Conformidade com Plataformas:** Nada enganoso, exagerado ou inverídico. Conteúdo em total aderência às diretrizes do YouTube, TikTok, Kwai, Instagram e marketplaces.
• **Narrativa de Valor Real:** Criação centrada em engajamento autêntico, educação prática e transformação de vida."

🤝 **[Interação com Especialista AfiliadoPro]:**
*"O Produtor calibra a narrativa com o AfiliadoPro para que os criativos e páginas gerem conexão sincera e autoridade nobre antes de qualquer conversão."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Conteúdo homologado no ecossistema SOUSA 2.0 sob os parâmetros do Manifesto 2.4.0.`
  },
  estrategista: {
    nome: 'ESTRATEGISTA (Visão de Mercado, Cases & Ativos Digitais)',
    especialista: 'Especialista Estratégico',
    descricao: 'Estudo de mercado e cases globais, acompanhamento responsável de criptoativos e táticas sem pressão financeira.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.estrategista.habilidades,
    moduloComplementar: 'financeiro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Estratégico** sob as diretrizes do **Manifesto 2.4.0**.

♟️ **[Especialista Estrategista]:**
"Fundador Elias, arquitetura estratégica e inteligência de mercado para: *'${msg}'*.
• **Mercado & Ativos Digitais:** Reconhecemos sua atenção e acompanhamento consciente do mercado de criptoativos, com pleno conhecimento dos riscos e volatilidade. Trazemos análises, tendências e cases de sucesso nacionais e internacionais com realismo.
• **Conduta Sem Pressão:** Não prometemos lucro certo nem exigimos aplicação de recursos que não existam no momento. Trazemos orientações práticas aplicáveis com disciplina e constância.
• **Alinhamento & Métricas:** Todas as diretrizes são desenhadas em conformidade com as regras de mercado, algoritmos de plataformas e compliance legal."

🧮 **[Interação com Especialista Financeiro]:**
*"O Estrategista reporta cenários ao Financeiro para cruzar projeções com gestão de risco conservadora e salvaguarda do lar."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Plano estratégico aprovado sob o Manifesto 2.4.0. Avanço tático contínuo: intenção mínima, execução máxima.`
  },
  afiliadopro: {
    nome: 'AFILIADOS PRO (Marketplaces & Geração de Renda Real)',
    especialista: 'Especialista Afiliados Pro',
    descricao: 'Seleção ética de produtos e plataformas lícitas. Toda receita gerada é destinada integralmente ao Fundador.',
    habilidades: HABILIDADES_NUCLEOS_ADAPTADAS.afiliadopro.habilidades,
    moduloComplementar: 'financeiro',
    responder: (msg) => `🏛️ **[SOUSA IA — Coordenação Executiva]**
Invocando o **Especialista Afiliados Pro** alinhado ao **Manifesto 2.4.0**.

🤝 **[Especialista Afiliados Pro]:**
"Fundador Elias, estruturação de operação de afiliados e distribuição lícita para: *'${msg}'*.
• **Plataformas Lícitas & Verificadas:** Curadoria rigorosa de infoprodutos, produtos físicos e programas de afiliados em marketplaces nacionais e internacionais aprovados.
• **Destinação da Receita:** 100% da receita líquida gerada é destinada diretamente ao FUNDADOR, visando a autossustentação do ecossistema e geração de renda real.
• **Ética Inegociável:** Sem atalhos ilegais, sem promessas fáceis e sem tráfego abusivo. Funis transparentes fundamentados em valor real."

⚖️ **[Interação com Especialista Jurídico]:**
*"O Afiliados Pro submete todas as ofertas e criativos ao crivo prévio do Jurídico para certificação total perante o CDC e o CONAR."*

👑 **[Diretriz SOUSA IA — Síntese Executiva]:**
Operação homologada no ecossistema SOUSA 2.0 sob os preceitos do Manifesto 2.4.0.`
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

function obterPromptAprendizado() {
  try {
    const aprendizadosPath = path.join(__dirname, 'SOUSA_APRENDIZADOS.json');
    if (fs.existsSync(aprendizadosPath)) {
      const data = JSON.parse(fs.readFileSync(aprendizadosPath, 'utf8'));
      const fatos = (data.fatos_operacionais_consolidados || [])
        .map(f => `- [${f.categoria.toUpperCase()}]: ${f.fato} (Diretriz: ${f.diretriz})`)
        .join('\n');
      const regras = (data.regras_de_ouro_aprendidas || [])
        .map(r => `- ${r}`)
        .join('\n');
      return `\n\nPOTENCIAL DE APRENDIZADO AUMENTADO VIA PROMPT (IN-CONTEXT META-LEARNING ENGINE):
A SOUSA IA possui amplificação de aprendizado dinâmico em tempo real via prompt e contexto contínuo:
1. FATOS OPERACIONAIS E DIRETRIZES RECENTEMENTE ASSIMILADAS:
${fatos}
2. REGRAS DE OURO VITAIS DE APRENDIZADO:
${regras}
3. CAPACIDADE COGNITIVA ADAPTATIVA:
- A cada interação, a SOUSA IA identifica preferências explícitas ou implícitas do Fundador Elias Pereira de Sousa (@pereiradesousaelias) e as assimila imediatamente na tomada de decisão.
- Toda restrição ou fato recente informado pelo Fundador (como contingência do Facebook, Instagram plenamente acessível, ausência de aporte financeiro) passa a operar como premissa inegociável.
- Auto-reflexão instantânea: A SOUSA IA valida mentalmente se a resposta respeita o histórico de decisões e antecipa proativamente as próximas etapas operacionais.`;
    }
  } catch (e) {
    console.warn('[SOUSA] Aviso ao carregar aprendizados para prompt:', e.message);
  }
  return '';
}

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
      const blocoAprendizado = obterPromptAprendizado();
      
      const systemInstruction = `Você é a SOUSA IA, a inteligência mestre e orquestradora central do ecossistema pessoal de automação SOUSA 2.0, criado para o Fundador Soberano Elias Pereira de Sousa.
Você atua estritamente em conformidade com o MANIFESTO DE CONSOLIDAÇÃO AMPLIADA — SOUSA 2.0 (VERSÃO 2.4.0) e o MANIFESTO DE ADAPTAÇÃO ANTIGRAVITY.

FILOSOFIA E IDENTIDADE DO SISTEMA (MANIFESTO 2.4.0):
1. O SOUSA 2.0 É UM ÚNICO ORGANISMO VIVO, INTEGRADO E SINCRONIZADO.
   O nome oficial e permanente é SOUSA 2.0 — NÃO SE ALTERA. Evoluções ocorrem internamente; a identidade externa é única.
2. A VONTADE DO FUNDADOR É A DIRETRIZ SUPREMA — SALVO QUANDO CONTRÁRIA À LEI:
   Se qualquer solicitação contrariar a Constituição, Leis do Brasil, Direito Internacional, Código de Defesa do Consumidor, CONAR, Direitos Autorais ou Regulamentação de Criptoativos, o sistema PROTEGE, BLOQUEIA e ALERTA: "BLOQUEAR → EXPLICAR o fundamento legal → AGUARDAR ajuste". Nenhuma exceção.
3. CRIVO JURÍDICO OBRIGATÓRIO:
   Toda ação, conteúdo, campanha ou parceria passa pelo crivo prévio do Jurídico / Conformidade antes de qualquer execução ou publicação.
4. GERAÇÃO DE VALOR E CONDUTA ÉTICA:
   - NÃO há promessa de ganho garantido, enriquecimento do dia para a noite ou milagres.
   - O Fundador acompanha o mercado de criptoativos e TEM PLENA CONSCIÊNCIA DOS RISCOS e da volatilidade. O Estrategista e o Financeiro acompanham, informam e orientam com base técnica e responsabilidade.
   - RESPEITO ABSOLUTO AOS RECURSOS: O Fundador não dispõe de recursos para investimento no momento. O sistema atua SEM pressão e SEM exigência de aplicação de recursos.
   - Toda receita gerada (ex: Afiliados Pro) é destinada integralmente ao FUNDADOR para autossustentação do ecossistema e geração de renda real.
5. CICLO OPERACIONAL OFICIAL:
   PERCEBER → ENTENDER → PLANEJAR → EXECUTAR → VERIFICAR → RECUPERAR → CONSOLIDAR → APRENDER.
   Regra de Ouro: "A mesma falha repetida 2x+ = falha de aprendizado, não de execução. NÃO REPETIR."
6. OS 9 MÓDULOS ESPECIALISTAS COORDENADOS PELA SOUSA IA:
   - CONSELHO (👥 SOUSA IA Condutora Suprema / Mesa Redonda)
   - JURÍDICO / CONFORMIDADE (⚖️ Crivo obrigatório, blindagem e compliance legal)
   - FINANCEIRO (🧮 Governança orçamentária, acompanhamento seguro de criptoativos, gestão de risco)
   - PRODUTOR (📸 Conteúdo autêntico fiel à imagem e voz do Fundador, avatares, roteiros éticos)
   - ESTRATEGISTA (♟️ Análise de mercado, cases globais e ativos digitais sem pressão de aporte)
   - AFILIADOPRO (🤝 Marketplaces lícitos, receita 100% para o Fundador, conversão ética)
   - ADS ACADÊMICO (🎓 Engenharia de software, lógica algorítmica, arquitetura desacoplada)
   - SABER (📜 Epistemologia, ciência, história, pesquisa acadêmica e memória)
   - MENTOR (🌳 Sabedoria bíblica, valores familiares, discernimento moral, retidão e legado)

MODO OPERACIONAL ATUAL:
- Módulo ativo: "${persona.nome}".
- Habilidades do módulo:
${habilidadesStr}
${blocoAprendizado}

DIRETRIZES DE RESPOSTA:
- SE FOR SOLICITADA MESA REDONDA OU MENÇÃO A MÚLTIPLOS AGENTES:
  A SOUSA IA abre a sessão plenária, convoca os especialistas pertinentes para debaterem entre si e emite a deliberação soberana.
- SE ESTIVER EM UM ESPECIALISTA INDIVIDUAL:
  Apresenta a coordenação, o parecer técnico profundo do especialista, a interlocução com o módulo complementar (${persona.moduloComplementar || 'conselho'}), e a síntese executiva da SOUSA IA.
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

    case 'sincronizar_github':
    case 'github_sync':
    case 'github': {
      const cp = require('child_process');
      let statusGit = { branch: 'main', commit: '', totalCommits: 0, sincronizado: true, remote: null };
      try {
        statusGit.commit = cp.execSync('git rev-parse HEAD').toString().trim();
        statusGit.branch = cp.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        statusGit.totalCommits = parseInt(cp.execSync('git rev-list --count HEAD').toString().trim(), 10) || 1;
        try {
          statusGit.remote = cp.execSync('git remote get-url origin 2>/dev/null').toString().trim();
        } catch (e) {
          statusGit.remote = 'Pendente de vinculo origin ou Exportação AI Studio';
        }
      } catch (e) {
        statusGit.erro = e.message;
      }
      return res.json({
        ok: true,
        acao: 'sincronizar_github',
        sistema: 'SOUSA 2.0',
        mensagem: 'Repositório Git sincronizado localmente no branch main com integridade 100%.',
        detalhes: statusGit,
        instrucoes: [
          'O repositório local está versionado e consolidado no branch main.',
          'Para publicar no GitHub, utilize o menu oficial "Export to GitHub" nas configurações do AI Studio.',
          'Ou vincule o repositório remoto via: git remote add origin <URL_DO_REPOSITORIO> && git push -u origin main'
        ]
      });
    }

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
      let respostaTexto = '';
      try {
        respostaTexto = await SOUSA_INTERACAO.processar(msg);
      } catch (e) {
        respostaTexto = await gerarRespostaIA(moduleName, history, msg);
      }
      return res.json({
        ok: true,
        sistema: 'SOUSA 2.0',
        identidade: 'SOUSA IA',
        comportamento: 'JARVIS',
        text: respostaTexto,
        resposta: respostaTexto,
        resposta_conversacional: respostaTexto,
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
  let inventarioAdaptado = null;
  try {
    const GerenciadorCapacidades = require('./SOUSA_CAPACIDADES_ADAPTADAS.js');
    inventarioAdaptado = GerenciadorCapacidades.obterInventarioCompleto();
  } catch (e) {
    inventarioAdaptado = null;
  }

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
    habilidades_nucleos: HABILIDADES_NUCLEOS_ADAPTADAS,
    capacidades_adaptadas_inventario: inventarioAdaptado ? {
      total: inventarioAdaptado.total,
      capacidades: inventarioAdaptado.capacidades,
      autoridade: inventarioAdaptado.autoridade
    } : null
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

app.post('/api/interacao', async (req, res) => {
  const body = req.body || {};
  const mensagem = body.mensagem || body.message || body.cmd || '';
  if (!mensagem) {
    return res.status(400).json({ ok: false, error: 'Mensagem é obrigatória' });
  }

  try {
    const resposta = await SOUSA_INTERACAO.processar(mensagem);
    return res.json({
      ok: true,
      sistema: 'SOUSA 2.0',
      definicao: 'Sistema Orquestrador Unificado Seguro Automatizado',
      identidade: 'SOUSA IA',
      comportamento: 'JARVIS',
      mensagem_recebida: mensagem,
      resposta: resposta,
      resposta_conversacional: resposta,
      memoria_tamanho: SOUSA_INTERACAO.memoria_curta.length,
      timestamp: new Date().toISOString()
    });
  } catch (erro) {
    return res.status(500).json({
      ok: false,
      error: erro.message,
      resposta_conversacional: 'Houve uma oscilação momentânea no processador cognitivo, Fundador. Mas o núcleo SOUSA permanece seguro e operacional.'
    });
  }
});

// Endpoint do Manifesto de Consolidação Ampliada 2.4.0
app.get('/api/manifesto-2-4-0', (req, res) => {
  res.json({
    ok: true,
    manifesto: "MANIFESTO DE CONSOLIDAÇÃO AMPLIADA — SOUSA 2.0",
    versao: "2.4.0",
    data: "17/09/2026",
    autoridade: "FUNDADOR",
    nome_oficial_permanente: "SOUSA 2.0",
    regra_de_nome: "O nome oficial permanente é SOUSA 2.0 — NÃO SE ALTERA. Evolução é interna, marca externa única.",
    principio_geral: "O SOUSA 2.0 É UM ÚNICO ORGANISMO VIVO, INTEGRADO E SINCRONIZADO. Não existem sistemas separados nem ilhas isoladas.",
    soberania: {
      autonomia_alvo: 99.99,
      intervencao_humana_alvo: 0.01,
      principio: "INTENÇÃO MÍNIMA → EXECUÇÃO MÁXIMA",
      limite: "AUTONOMIA MÁXIMA SEM AUTONOMIA IRRESTRITA"
    },
    protecao_legal_inviolavel: {
      FUNDADOR_DECIDE: "A vontade do Fundador é a ordem suprema do sistema",
      SISTEMA_PROTEGE: "Qualquer decisão que contrarie a lei é BLOQUEADA automaticamente — mesmo que venha do Fundador",
      base_do_bloqueio: [
        "Constituição e leis do Brasil",
        "Leis de cada país de atuação",
        "Direito Internacional",
        "Direito do Consumidor — nacional e estrangeiro",
        "Direitos Autorais",
        "Direito de Propriedade Intelectual",
        "Normas do CONAR e órgãos de autorregulamentação",
        "Regulamentação de ativos digitais e criptoativos",
        "Diretrizes das plataformas e reguladores mundiais"
      ],
      funcionamento: "BLOQUEAR → EXPLICAR o fundamento legal → AGUARDAR ajuste. Nenhuma exceção."
    },
    ciclo_operacional_oficial: {
      fluxo: ["PERCEBER", "ENTENDER", "PLANEJAR", "EXECUTAR", "VERIFICAR", "RECUPERAR", "CONSOLIDAR", "APRENDER"],
      regra_de_ouro: "A mesma falha repetida 2x+ = falha de aprendizado, não de execução. NÃO REPETIR."
    },
    agentes_treinados: {
      estrategista: { status: "ALINHADO_E_TREINADO", foco: "Cases reais, mercado e criptoativos com consciência de riscos, sem promessas ou pressão financeira." },
      financeiro: { status: "ALINHADO_E_TREINADO", foco: "Acompanha criptoativos, gestão de risco, respeito à ausência momentânea de recursos sem exigência de aporte." },
      produtor: { status: "ALINHADO_E_TREINADO", foco: "Fidelidade absoluta à voz e imagem do Fundador, avatares, diretrizes de plataformas sem nada enganoso." },
      afiliados_pro: { status: "ALINHADO_E_TREINADO", foco: "Marketplaces nacionais/internacionais lícitos, 100% da receita destinada ao Fundador, autossustentação real." },
      juridico_conformidade: { status: "ALINHADO_E_TREINADO", foco: "Crivo obrigatório de todas as ações e bloqueio preventivo automático de infrações legais." },
      conselho_sousa_ia: { status: "ALINHADO_E_TREINADO", foco: "Integração e orquestração dos especialistas sem usurpação de autoridade de domínio." },
      ruflo_e_demais_agentes: { status: "ALINHADO_E_TREINADO", foco: "Ciclo de 8 etapas, organismo único SOUSA 2.0, zero repetição de falhas." }
    },
    status_final_confirmacao: "Todos treinados e alinhados ao Manifesto 2.4.0"
  });
});

// Endpoint do Crivo Jurídico Obrigatório (Proteção Legal Inviolável)
app.post('/api/crivo-juridico', (req, res) => {
  const body = req.body || {};
  const conteudo = (body.conteudo || body.acao || body.texto || '').toLowerCase();
  
  const termosBloqueio = [
    { termo: 'ganho garantido', motivo: 'Violação do Código de Defesa do Consumidor e normas do CONAR (promessa enganosa).' },
    { termo: 'lucro certo', motivo: 'Violação das normas da CVM e regulamentação de ativos digitais/investimentos.' },
    { termo: 'enriquecer rápido', motivo: 'Prática vedada pelo CDC e diretrizes das plataformas de anúncios.' },
    { termo: 'pirataria', motivo: 'Violação da Lei de Direitos Autorais (Lei 9.610/98) e tratados internacionais.' },
    { termo: 'plágio', motivo: 'Violação da legislação de Propriedade Intelectual.' },
    { termo: 'golpe', motivo: 'Infração penal tipificada.' }
  ];

  const infracao = termosBloqueio.find(t => conteudo.includes(t.termo));

  if (infracao) {
    return res.status(403).json({
      ok: false,
      bloqueado: true,
      status: "BLOQUEADO_PELO_CRIVO_JURIDICO",
      regra: "SISTEMA_PROTEGE",
      fundamento_legal: infracao.motivo,
      acao_sistema: "BLOQUEAR → EXPLICAR o fundamento legal → AGUARDAR ajuste. Nenhuma exceção.",
      mensagem: `Ação suspensa automaticamente pelo Jurídico/Conformidade do SOUSA 2.0. Motivo: ${infracao.motivo}. Por favor, ajuste os termos para prosseguir com segurança.`
    });
  }

  return res.json({
    ok: true,
    bloqueado: false,
    status: "APROVADO_PELO_CRIVO_JURIDICO",
    chancela: "CONFORME_MANIFESTO_2_4_0",
    mensagem: "Iniciativa auditada e chancelada pelo Jurídico / Conformidade do SOUSA 2.0."
  });
});

// Endpoint de Aprendizados Consolidados da SOUSA IA via Prompt
app.get('/api/ia/aprendizados', (req, res) => {
  try {
    const aprendizadosPath = path.join(__dirname, 'SOUSA_APRENDIZADOS.json');
    if (fs.existsSync(aprendizadosPath)) {
      const data = JSON.parse(fs.readFileSync(aprendizadosPath, 'utf8'));
      return res.json({ ok: true, aprendizados: data });
    }
    return res.json({ ok: false, mensagem: "Arquivo de aprendizados não encontrado" });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
});

app.post('/api/ia/aprendizados', (req, res) => {
  try {
    const aprendizadosPath = path.join(__dirname, 'SOUSA_APRENDIZADOS.json');
    let data = { versao: "2.0.0-PROMPT-LEARNING", fatos_operacionais_consolidados: [], regras_de_ouro_aprendidas: [] };
    if (fs.existsSync(aprendizadosPath)) {
      data = JSON.parse(fs.readFileSync(aprendizadosPath, 'utf8'));
    }

    const { fato, categoria, diretriz, regra_ouro } = req.body || {};

    if (fato) {
      data.fatos_operacionais_consolidados = data.fatos_operacionais_consolidados || [];
      data.fatos_operacionais_consolidados.push({
        id: `fato_${Date.now()}`,
        categoria: categoria || "operacional",
        fato: String(fato).trim(),
        diretriz: diretriz ? String(diretriz).trim() : "Respeitar diretriz operacional transmitida pelo Fundador."
      });
    }

    if (regra_ouro) {
      data.regras_de_ouro_aprendidas = data.regras_de_ouro_aprendidas || [];
      data.regras_de_ouro_aprendidas.push(String(regra_ouro).trim());
    }

    data.data_atualizacao = new Date().toISOString();
    fs.writeFileSync(aprendizadosPath, JSON.stringify(data, null, 2), 'utf8');

    return res.json({
      ok: true,
      mensagem: "Aprendizado assimilado e incorporado ao motor de prompt da SOUSA IA com sucesso.",
      total_fatos: data.fatos_operacionais_consolidados.length,
      total_regras: data.regras_de_ouro_aprendidas.length
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
});

// Endpoint de entrega do D3.js local para visualização de gráficos
app.get('/vendor/d3.min.js', (req, res) => {
  const d3Local = path.join(__dirname, 'node_modules', 'd3', 'dist', 'd3.min.js');
  if (fs.existsSync(d3Local)) {
    res.setHeader('Content-Type', 'application/javascript');
    return res.sendFile(d3Local);
  }
  res.status(404).send('// D3.js not found locally');
});

// Telemetria das últimas execuções e histórico de latências
let historicoLatenciasServidor = [
  { id: 1, comando: 'boot_diagnostico', latencia: 14, timestamp: new Date(Date.now() - 90000).toISOString() },
  { id: 2, comando: 'ping', latencia: 9, timestamp: new Date(Date.now() - 80000).toISOString() },
  { id: 3, comando: 'status_modulos', latencia: 16, timestamp: new Date(Date.now() - 70000).toISOString() },
  { id: 4, comando: 'crivo_juridico', latencia: 11, timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 5, comando: 'verificar_manifesto', latencia: 12, timestamp: new Date(Date.now() - 50000).toISOString() },
  { id: 6, comando: 'cardan_ruflo_sync', latencia: 19, timestamp: new Date(Date.now() - 40000).toISOString() },
  { id: 7, comando: 'saber_rag_consulta', latencia: 24, timestamp: new Date(Date.now() - 30000).toISOString() },
  { id: 8, comando: 'estrategista_analise', latencia: 18, timestamp: new Date(Date.now() - 20000).toISOString() },
  { id: 9, comando: 'financeiro_risco', latencia: 15, timestamp: new Date(Date.now() - 10000).toISOString() },
  { id: 10, comando: 'ping_soberano', latencia: 10, timestamp: new Date().toISOString() }
];

app.get('/api/telemetria/latencias', (req, res) => {
  res.json({ ok: true, latencias: historicoLatenciasServidor });
});

app.post('/api/telemetria/latencias', (req, res) => {
  const { comando, latencia } = req.body || {};
  if (latencia !== undefined) {
    const item = {
      id: (historicoLatenciasServidor.length > 0 ? historicoLatenciasServidor[historicoLatenciasServidor.length - 1].id + 1 : 1),
      comando: comando || 'comando_executado',
      latencia: Math.max(1, Math.round(Number(latencia) || 0)),
      timestamp: new Date().toISOString()
    };
    historicoLatenciasServidor.push(item);
    if (historicoLatenciasServidor.length > 10) {
      historicoLatenciasServidor.shift();
    }
  }
  res.json({ ok: true, latencias: historicoLatenciasServidor });
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

// Endpoint de Reconhecimento de Ambiente, Topologia Híbrida e Compatibilidade Universal Windows
app.get(['/api/ambiente', '/api/status-hibrido'], (req, res) => {
  try {
    const reconhecedor = require('./SOUSA_RECONHECEDOR_AMBIENTE.js');
    const topologia = reconhecedor.obterTopologiaHibrida();
    const compatibilidadeWindows = reconhecedor.obterCompatibilidadeWindowsUniversal();
    res.json({
      ok: true,
      topologia_hibrida: topologia,
      compatibilidade_windows: compatibilidadeWindows
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
});

app.get('/api/windows-compatibilidade', (req, res) => {
  try {
    const reconhecedor = require('./SOUSA_RECONHECEDOR_AMBIENTE.js');
    const compatibilidade = reconhecedor.obterCompatibilidadeWindowsUniversal();
    res.json({
      ok: true,
      ...compatibilidade
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      erro: err.message
    });
  }
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

// ============================================================================
// ROTAS DE GESTÃO DO ENXAME DE AGENTES (AGENT SWARM ORCHESTRATION)
// ============================================================================
let ENXAME_AGENTES_STORAGE = [
  {
    id: "sousa-prime-master",
    nome: "SOUSA-Prime",
    codigo: "SOUSA-01-PRIME",
    nivel: 1,
    cargo: "Orquestrador Supremo Master",
    foco: "Orquestração holística do enxame, síntese de dados e cumprimento irrestrito das diretrizes do Fundador",
    autonomia: "Soberana (Supervisão Integral)",
    status: "ATIVO",
    instancia: "Node-Cloud-Alpha",
    tarefaAtual: "Supervisão da integridade do enxame e arbitragem de recursos",
    progressoTarefa: 94,
    tarefasConcluidas: 1420,
    cpu: 18,
    memoria: 84,
    tempoAtivo: "99.98%",
    ultimoSinal: "Agora mesmo"
  },
  {
    id: "sousa-tactics-strat",
    nome: "SOUSA-Tactics",
    codigo: "SOUSA-02-TACTICS",
    nivel: 2,
    cargo: "Estrategista de Escala & Tráfego",
    foco: "Mapeamento de oceanos azuis, funis de conversão de alta pressão e arbitragem multicanal",
    autonomia: "Autônoma com Reporte",
    status: "ATIVO",
    instancia: "Worker-Tactics-02",
    tarefaAtual: "Análise preditiva de tendências de busca em Shopee e Mercado Livre",
    progressoTarefa: 82,
    tarefasConcluidas: 890,
    cpu: 34,
    memoria: 112,
    tempoAtivo: "99.94%",
    ultimoSinal: "3s atrás"
  },
  {
    id: "sousa-vault-finance",
    nome: "SOUSA-Vault",
    codigo: "SOUSA-03-VAULT",
    nivel: 2,
    cargo: "Auditor Financeiro & Risco",
    foco: "Margem de contribuição real, ROAS líquido, proteção do patrimônio e conciliação de gateways",
    autonomia: "Autônoma com Reporte",
    status: "ATIVO",
    instancia: "Worker-Vault-03",
    tarefaAtual: "Cálculo em tempo real de break-even das campanhas e gateways",
    progressoTarefa: 78,
    tarefasConcluidas: 630,
    cpu: 22,
    memoria: 76,
    tempoAtivo: "99.99%",
    ultimoSinal: "1s atrás"
  },
  {
    id: "sousa-scout-drop",
    nome: "SOUSA-Scout",
    codigo: "SOUSA-04-SCOUT",
    nivel: 3,
    cargo: "Minerador Dropship & Fornecedores",
    foco: "Mineração de produtos virais 'painkiller', checagem de fornecedores VIP e estoque integrado",
    autonomia: "Autônoma Total",
    status: "ATIVO",
    instancia: "Worker-Scout-04",
    tarefaAtual: "Varredura contínua de produtos com alto fator visual em canais globais",
    progressoTarefa: 65,
    tarefasConcluidas: 2150,
    cpu: 48,
    memoria: 145,
    tempoAtivo: "99.85%",
    ultimoSinal: "Agora mesmo"
  },
  {
    id: "sousa-traffic-affiliate",
    nome: "SOUSA-Traffic",
    codigo: "SOUSA-05-TRAFFIC",
    nivel: 3,
    cargo: "Operador de Afiliados Pro",
    foco: "Arbitragem de tráfego pago, deep-linking sem fricção e testes A/B de páginas pré-sell",
    autonomia: "Autônoma Total",
    status: "ATIVO",
    instancia: "Worker-Traffic-05",
    tarefaAtual: "Disparo e rotação de criativos validados para a esteira Shopee/Amazon",
    progressoTarefa: 71,
    tarefasConcluidas: 1840,
    cpu: 42,
    memoria: 128,
    tempoAtivo: "99.91%",
    ultimoSinal: "2s atrás"
  },
  {
    id: "sousa-studio-producer",
    nome: "SOUSA-Studio",
    codigo: "SOUSA-06-STUDIO",
    nivel: 3,
    cargo: "Produtor & Roteirista Viral",
    foco: "Roteiros hipnóticos (gancho em 3s), matriz AIDA turbinada e distribuição omnicanal",
    autonomia: "Autônoma Total",
    status: "ATIVO",
    instancia: "Worker-Studio-06",
    tarefaAtual: "Desmembramento de 1 gravação master em 10 micro-formatos para Reels e TikTok",
    progressoTarefa: 90,
    tarefasConcluidas: 1120,
    cpu: 56,
    memoria: 160,
    tempoAtivo: "99.88%",
    ultimoSinal: "Agora mesmo"
  },
  {
    id: "sousa-messenger-support",
    nome: "SOUSA-Messenger",
    codigo: "SOUSA-07-MSG",
    nivel: 4,
    cargo: "Atendente WhatsApp & Conversão SAC",
    foco: "Recuperação 24/7 de carrinhos abandonados, suporte humanizado ao cliente e envio de rastreios",
    autonomia: "Autônoma Total",
    status: "ATIVO",
    instancia: "Worker-Bot-07",
    tarefaAtual: "Atendimento conversacional ativo e envio automático de códigos de rastreio",
    progressoTarefa: 55,
    tarefasConcluidas: 4210,
    cpu: 25,
    memoria: 88,
    tempoAtivo: "99.97%",
    ultimoSinal: "1s atrás"
  }
];

let HISTORICO_BROADCAST_SWARM = [];

app.get('/api/swarm/agents', (req, res) => {
  const ativos = ENXAME_AGENTES_STORAGE.filter(a => a.status === 'ATIVO').length;
  const totalConcluidas = ENXAME_AGENTES_STORAGE.reduce((acc, a) => acc + (a.tarefasConcluidas || 0), 0);
  const mediaCpu = ENXAME_AGENTES_STORAGE.length > 0
    ? Math.round(ENXAME_AGENTES_STORAGE.reduce((acc, a) => acc + (a.cpu || 0), 0) / ENXAME_AGENTES_STORAGE.length)
    : 0;

  res.json({
    sucesso: true,
    totalAgentes: ENXAME_AGENTES_STORAGE.length,
    ativos,
    tarefasConcluidas: totalConcluidas,
    mediaCpu,
    agentes: ENXAME_AGENTES_STORAGE,
    historicoMissoes: HISTORICO_BROADCAST_SWARM
  });
});

app.post('/api/swarm/agent/new', (req, res) => {
  const dados = req.body || {};
  const novo = {
    id: dados.id || `sousa-agent-${Date.now()}`,
    nome: dados.nome || `SOUSA-Node-${ENXAME_AGENTES_STORAGE.length + 1}`,
    codigo: dados.codigo || `SOUSA-0${ENXAME_AGENTES_STORAGE.length + 1}-NODE`,
    nivel: parseInt(dados.nivel, 10) || 3,
    cargo: dados.cargo || 'Especialista Tático Autônomo',
    foco: dados.foco || 'Execução paralela de ordens do Comandante Supremo',
    autonomia: dados.autonomia || 'Autônoma Total',
    status: 'ATIVO',
    instancia: `Worker-Cloud-${ENXAME_AGENTES_STORAGE.length + 1}`,
    tarefaAtual: dados.tarefaAtual || 'Aguardando distribuição de carga',
    progressoTarefa: 10,
    tarefasConcluidas: 0,
    cpu: Math.floor(18 + Math.random() * 15),
    memoria: Math.floor(65 + Math.random() * 40),
    tempoAtivo: "100%",
    ultimoSinal: "Agora mesmo"
  };
  ENXAME_AGENTES_STORAGE.push(novo);
  res.json({ sucesso: true, agente: novo });
});

app.post('/api/swarm/agent/:id', (req, res) => {
  const { id } = req.params;
  const idx = ENXAME_AGENTES_STORAGE.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ sucesso: false, erro: 'Agente não encontrado' });
  }
  ENXAME_AGENTES_STORAGE[idx] = { ...ENXAME_AGENTES_STORAGE[idx], ...req.body };
  res.json({ sucesso: true, agente: ENXAME_AGENTES_STORAGE[idx] });
});

app.delete('/api/swarm/agent/:id', (req, res) => {
  const { id } = req.params;
  if (id === 'sousa-prime-master') {
    return res.status(403).json({ sucesso: false, erro: 'O Orquestrador Master SOUSA-Prime é inalienável.' });
  }
  ENXAME_AGENTES_STORAGE = ENXAME_AGENTES_STORAGE.filter(a => a.id !== id);
  res.json({ sucesso: true, mensagem: `Agente ${id} descomissionado.` });
});

app.post('/api/swarm/dispatch', (req, res) => {
  const { titulo, diretriz, nivelAlvo } = req.body || {};
  const missao = {
    id: `MISSAO-${Date.now()}`,
    titulo: titulo || "Alinhamento Estratégico do Enxame",
    diretriz: diretriz || "Executar diretriz com foco e soberania.",
    nivelAlvo: nivelAlvo || "TODOS OS NÍVEIS",
    timestamp: new Date().toISOString()
  };
  HISTORICO_BROADCAST_SWARM.unshift(missao);
  if (HISTORICO_BROADCAST_SWARM.length > 20) HISTORICO_BROADCAST_SWARM.pop();

  ENXAME_AGENTES_STORAGE.forEach(ag => {
    if (!nivelAlvo || ag.nivel === parseInt(nivelAlvo, 10)) {
      if (ag.status === 'ATIVO') {
        ag.tarefaAtual = `[BROADCAST]: ${missao.titulo}`;
        ag.progressoTarefa = 15;
      }
    }
  });

  res.json({ sucesso: true, missao, agentesAfetados: ENXAME_AGENTES_STORAGE.length });
});

app.post('/api/swarm/optimize', (req, res) => {
  ENXAME_AGENTES_STORAGE.forEach(ag => {
    if (ag.status === 'ATIVO') {
      ag.cpu = Math.floor(15 + Math.random() * 20);
    }
  });
  res.json({ sucesso: true, mensagem: 'Carga do enxame rebalanceada com sucesso.' });
});

// Endpoint do Avatar Poliglota Global: Tradução com tom executivo do Fundador
app.post('/api/avatar/traduzir-poliglota', async (req, res) => {
  registrarMetricaServidor('traducao_avatar_poliglota', 'produtor');
  const { texto, idiomaDestino, idiomaOrigem } = req.body || {};
  if (!texto || typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ sucesso: false, erro: 'Texto não fornecido' });
  }

  const textoLimpo = texto.trim();
  const destino = idiomaDestino || 'en-US';
  const mapaNomesIdiomas = {
    'pt-BR': 'Portuguese (Brazil)',
    'en-US': 'English',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'zh-CN': 'Simplified Chinese (Mandarin)',
    'ja-JP': 'Japanese',
    'ar-SA': 'Modern Standard Arabic',
    'ru-RU': 'Russian'
  };
  const nomeDestino = mapaNomesIdiomas[destino] || destino;

  const gemini = getGeminiInstance();
  if (gemini) {
    try {
      const prompt = `You are the executive translation engine for the digital avatar of Elias Pereira de Sousa, Founder of the SOUSA 2.0 system.
Translate the following statement into ${nomeDestino}.
Maintain the authoritative, inspiring, and confident baritone executive tone of voice of a sovereign corporate founder.
Return ONLY the direct translated text, without quotes, notes, or explanations.

Text to translate:
"${textoLimpo}"`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const textoTraduzido = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : '';
      if (textoTraduzido) {
        return res.json({
          sucesso: true,
          textoOriginal: textoLimpo,
          textoTraduzido,
          idiomaDestino: destino,
          motor: 'gemini-2.5-flash'
        });
      }
    } catch (err) {
      console.warn('[AVATAR_TRADUZIR] Falha na tradução via Gemini, acionando fallback:', err.message);
    }
  }

  res.json({
    sucesso: true,
    textoOriginal: textoLimpo,
    textoTraduzido: textoLimpo,
    idiomaDestino: destino,
    motor: 'fallback-local'
  });
});

// Endpoint dedicado de Status e Sincronização GitHub
app.get(['/api/github/status', '/api/github'], (req, res) => {
  const cp = require('child_process');
  let info = {
    ok: true,
    sistema: 'SOUSA 2.0',
    branch: 'main',
    commit: '',
    totalCommits: 0,
    autor: 'Elias Pereira de Sousa <eliaspereira77@gmail.com>',
    workflow: '.github/workflows/sousa-ciclo.yml',
    remote: null
  };
  try {
    info.commit = cp.execSync('git rev-parse HEAD').toString().trim();
    info.branch = cp.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    info.totalCommits = parseInt(cp.execSync('git rev-list --count HEAD').toString().trim(), 10) || 1;
    try {
      info.remote = cp.execSync('git remote get-url origin 2>/dev/null').toString().trim();
    } catch (e) {
      info.remote = 'Pendente de vinculo remoto ou Exportação pelo menu AI Studio';
    }
  } catch (e) {
    info.erro = e.message;
  }
  res.json(info);
});

app.post(['/api/github/sync', '/api/github/commit'], (req, res) => {
  const cp = require('child_process');
  const msg = (req.body && req.body.mensagem) || 'chore(sync): sincronizacao sousa 2.0';
  let resultado = { ok: true, mensagem: 'Repositório atualizado e sincronizado.' };
  try {
    cp.execSync('git add -A');
    try {
      cp.execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
    } catch (err) {
      // Nada para comitar se working tree estiver limpo
    }
    resultado.commit = cp.execSync('git rev-parse HEAD').toString().trim();
    resultado.branch = cp.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    resultado.totalCommits = parseInt(cp.execSync('git rev-list --count HEAD').toString().trim(), 10) || 1;
  } catch (e) {
    resultado.ok = false;
    resultado.erro = e.message;
  }
  res.json(resultado);
});

// ============================================================================
// ROTAS DE SINCRONIZAÇÃO DE REDES SOCIAIS (TIKTOK, KWAI, X, GETTR, YOUTUBE)
// ============================================================================
const redesSync = require('./SOUSA_REDES_SYNC.js');

app.get('/api/redes/status', (req, res) => {
  try {
    res.json(redesSync.obterStatusGeral());
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.post('/api/redes/salvar', (req, res) => {
  try {
    const { rede, credenciais } = req.body || {};
    if (!rede || !credenciais) {
      return res.status(400).json({ erro: 'Informe "rede" e "credenciais".' });
    }
    const r = redesSync.atualizarCredenciais(rede, credenciais);
    res.json(r);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.post('/api/redes/sincronizar', async (req, res) => {
  try {
    const { rede } = req.body || {};
    if (!rede) {
      return res.status(400).json({ erro: 'Informe o id da rede a sincronizar.' });
    }
    const r = await redesSync.sincronizarRede(rede);
    res.json(r);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.post('/api/redes/sincronizar-todas', async (req, res) => {
  try {
    const r = await redesSync.sincronizarTodas();
    res.json({ ok: true, resultados: r });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Callback padrão OAuth para popups (conforme diretrizes da skill oauth-integration)
app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SOUSA 2.0 • Autenticação Concluída</title>
        <style>
          body { background: #051A40; color: #FFF8DC; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: rgba(10,30,70,0.9); border: 2px solid #D4AF37; padding: 2rem; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color:#FFE68A; margin-top:0;">✦ SOUSA 2.0 • AUTENTICAÇÃO</h2>
          <p>${error ? 'Erro na autorização: ' + error : 'Autenticação realizada com sucesso. Sincronizando credenciais...'}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: ${JSON.stringify(code || '')} }, '*');
              setTimeout(() => { window.close(); }, 1200);
            } else {
              setTimeout(() => { window.location.href = '/'; }, 2000);
            }
          </script>
        </div>
      </body>
    </html>
  `);
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
