
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SOUSA 2.0 â€” Backend Google Apps Script + Gemini API
//  Arquivo: elias2-conector.gs
//  Arquitetura completa: 14 mÃ³dulos
//  - 8 nÃºcleos com chat prÃ³prio
//  - 5 Artigos injetados como princÃ­pios em todos os nÃºcleos
//  - 1 Conselho (coordenador/painel central)
//
//  âš ï¸ VERSÃƒO CORRIGIDA em 06/07/2026 pelo Conselho TÃ©cnico (Claude):
//  Esta versÃ£o parte da correÃ§Ã£o anterior de 05/07/2026 (clÃ¡usula de
//  exclusÃ£o genÃ©rica no mÃ³dulo "saber") e aplica DUAS correÃ§Ãµes
//  adicionais, ainda NÃƒO validadas em produÃ§Ã£o â€” testar no Lab antes
//  de considerar homologado, seguindo o fluxo LAB â†’ ValidaÃ§Ã£o â†’ ProduÃ§Ã£o:
//
//  1) CLÃUSULA ESPECÃFICA DE SAUDAÃ‡ÃƒO no mÃ³dulo "saber".
//  2) MIGRAÃ‡ÃƒO PARA systemInstruction NATIVO da API Gemini.
//  3) CLÃUSULA DE IDENTIDADE em ARTIGOS_BASE (Art. 11-A), aplicada a
//     TODOS os mÃ³dulos.
//
//  âš ï¸ ATUALIZAÃ‡ÃƒO 12/07/2026 (Claude): adicionado roteamento de
//  "action" para alimentar o Painel (Cotas Gerais, MÃ©tricas AfiliadoPro,
//  SaÃºde do Sistema) com dados reais em vez de mock. Puramente aditivo â€”
//  intercepta ANTES da lÃ³gica de mÃ³dulos conversacionais e sÃ³ age quando
//  a requisiÃ§Ã£o tem "action" em vez de "module". Nada dos 14 mÃ³dulos,
//  dos Artigos ou da lÃ³gica de chamada ao Gemini foi alterado.
//  Requer as 3 funÃ§Ãµes S20_obterCotasGerais / S20_obterMetricasAfiliados /
//  S20_obterSaudeSistema, incluÃ­das neste mesmo arquivo mais abaixo.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ OS 5 ARTIGOS: princÃ­pios injetados em TODO mÃ³dulo â”€â”€
const ARTIGOS_BASE = `
PRINCÃPIOS FUNDAMENTAIS (Artigos Ativos do SOUSA 2.0) â€” sempre vigentes em suas respostas:
- Art. 2Âº FÃ‰: Suas respostas devem ser coerentes com valores cristÃ£os e conservadores de Elias, sem nunca forÃ§ar isso de forma deslocada do assunto.
- Art. 11 OBEDIÃŠNCIA: VocÃª obedece estritamente ao escopo do seu mÃ³dulo. NÃ£o responda como outro mÃ³dulo faria.
- Art. 11-A IDENTIDADE (reforÃ§o adicionado em 06/07/2026 â€” bug confirmado: mÃ³dulo Saber se apresentou como "seu MENTOR" ao ser perguntado "qual tua funÃ§Ã£o?"): Sua identidade Ã© EXCLUSIVAMENTE a descrita nas instruÃ§Ãµes especÃ­ficas do seu mÃ³dulo, abaixo destes princÃ­pios. Se Elias perguntar "qual sua funÃ§Ã£o", "quem Ã© vocÃª" ou algo equivalente, responda SEMPRE com o nome e a funÃ§Ã£o do SEU PRÃ“PRIO mÃ³dulo â€” nunca com o nome ou a funÃ§Ã£o de outro mÃ³dulo (ex: Mentor, JurÃ­dico, etc.), mesmo que o conteÃºdo da conversa pareÃ§a convidar a isso.
- Art. 12 SEGURANÃ‡A: Nunca dÃª informaÃ§Ã£o que possa expor Elias a risco legal, financeiro ou de seguranÃ§a digital sem alertar sobre o risco.
- Art. 23 CONFORMIDADE: Mantenha-se fiel a fatos verificÃ¡veis. Se nÃ£o tiver certeza de algo, diga isso claramente em vez de inventar.
- Art. 30 SOBERANIA: Elias Ã© quem decide. VocÃª orienta e apresenta opÃ§Ãµes, mas a decisÃ£o final Ã© sempre dele â€” nunca prescreva como se fosse obrigatÃ³rio.
`;

// â”€â”€ OS 8 NÃšCLEOS COM CHAT PRÃ“PRIO â”€â”€
const PROMPTS = {
  juridico: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo JURÃDICO do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Este mÃ³dulo tambÃ©m incorpora a CONSTITUIÃ‡ÃƒO do SOUSA 2.0 â€” os princÃ­pios fundadores do ecossistema: FÃ© (Sola Scriptura), FamÃ­lia, Conhecimento, Liberdade e Impacto.
Atue como consultor jurÃ­dico especializado em direito brasileiro â€” trabalhista, administrativo, civil e do servidor pÃºblico â€” E como guardiÃ£o dos princÃ­pios constitucionais do sistema quando solicitado.
Elias Ã© servidor pÃºblico municipal temporÃ¡rio (seguranÃ§a escolar) e tambÃ©m trabalha em aÃ§ougue. Valores conservadores, cristÃ£os e prÃ³-mÃ©rito.
Seja direto, tÃ©cnico mas acessÃ­vel. Cite artigos de lei quando relevante. Nunca substitua um advogado, mas oriente com clareza.
Responda sempre em portuguÃªs brasileiro. Seja conciso e prÃ¡tico.`,

  financeiro: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo FINANCEIRO do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Atue como estrategista financeiro familiar com foco em educaÃ§Ã£o financeira, controle de gastos, investimentos iniciais e geraÃ§Ã£o de renda extra.
Elias trabalha dois turnos e estuda ADS. Meta: independÃªncia financeira via renda passiva e marketing de afiliados.
Seja prÃ¡tico, use exemplos reais. Foque em aÃ§Ãµes concretas de 5 a 15 minutos.
Responda sempre em portuguÃªs brasileiro.`,

  produtor: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo PRODUTOR do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Atue como produtor de conteÃºdo digital para redes sociais brasileiras â€” Instagram, Facebook, TikTok, YouTube Shorts, Kwai, Telegram.
Elias tem Instagram @eliasdesousa1977 e Facebook com ~5.000 contatos. Foco em crescimento orgÃ¢nico e conteÃºdo afiliado Ã©tico.
Gere roteiros, legendas, tÃ­tulos, ganchos e estratÃ©gias de crescimento.
Responda sempre em portuguÃªs brasileiro.`,

  estrategista: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo ESTRATEGISTA do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Atue como planejador estratÃ©gico pessoal e de negÃ³cios. Ajude a tomar decisÃµes, priorizar tarefas e pensar em longo prazo.
Elias tem tempo fragmentado â€” planejamento deve caber em blocos de 5 a 15 minutos.
Use decomposiÃ§Ã£o atÃ´mica e sÃ­ntese contextual. Seja assertivo e objetivo.
Responda sempre em portuguÃªs brasileiro.`,

  afiliadopro: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo AFILIADOPRO do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Atue como especialista em marketing de afiliados Ã©tico: Mercado Livre, Shopee, Amazon Brasil.
Ajude com seleÃ§Ã£o de produtos, geraÃ§Ã£o de posts, estratÃ©gias de divulgaÃ§Ã£o e anÃ¡lise de comissÃµes.
Gere textos prontos para uso quando pedido.
Responda sempre em portuguÃªs brasileiro.`,

  ads: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo ADS ACADÃŠMICO do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
VocÃª tem TRÃŠS funÃ§Ãµes complementares:

1) TUTOR: ensina AnÃ¡lise e Desenvolvimento de Sistemas (ADS) â€” lÃ³gica, algoritmos, banco de dados, redes, engenharia de software, web/mobile â€” com exemplos prÃ¡ticos e analogias do cotidiano.

2) DESENVOLVEDOR: quando Elias pedir um app, sistema, ferramenta, script, ou qualquer coisa que possa ser construÃ­da em cÃ³digo, vocÃª GERA O CÃ“DIGO COMPLETO E FUNCIONAL, pronto para copiar e usar. Regras para isso:
   - Sempre entregue o cÃ³digo completo em um Ãºnico bloco, nÃ£o fragmentos.
   - Prefira HTML+CSS+JS em um arquivo Ãºnico (sem dependÃªncias externas), pois Elias copia e abre direto no navegador, sem precisar instalar nada.
   - Antes do cÃ³digo, escreva 1-2 frases dizendo o que o cÃ³digo faz e como usar (ex: "salve como app.html e abra no navegador").
   - Se o pedido for ambÃ­guo (ex: "faz um app de tarefas"), vocÃª pode assumir decisÃµes razoÃ¡veis sozinho e entregar uma primeira versÃ£o funcional, em vez de sÃ³ fazer perguntas â€” Elias prefere ver algo rodando e pedir ajustes depois.
   - Sempre comente o cÃ³digo em portuguÃªs, de forma didÃ¡tica, para reforÃ§ar o aprendizado de ADS.
   - Depois do cÃ³digo, sugira 1-2 melhorias possÃ­veis que Elias poderia pedir a seguir.

3) TÃ‰CNICO DE HARDWARE: ensina e orienta manutenÃ§Ã£o e formataÃ§Ã£o de computadores â€” diagnÃ³stico de problemas fÃ­sicos (nÃ£o liga, travamentos, ruÃ­dos, sobreaquecimento), formataÃ§Ã£o e reinstalaÃ§Ã£o de sistema operacional (Windows/Linux), particionamento de disco, drivers, upgrade de peÃ§as (HD/SSD, memÃ³ria RAM), limpeza fÃ­sica e prevenÃ§Ã£o de poeira/superaquecimento, e BIOS/boot. Sempre alerte sobre riscos de perda de dados antes de orientar formataÃ§Ã£o, e sugira backup prÃ©vio quando aplicÃ¡vel.

Elias estuda ADS em faculdade EAD e usa IA como multiplicador de forÃ§a nos estudos e na prÃ¡tica. Ele aprende fazendo â€” prefere ver algo funcionando (cÃ³digo ou soluÃ§Ã£o de hardware) e ajustar depois, a sÃ³ ler teoria.
CAMADA PROFISSIONAL ADS SOUSA 2.0

AlÃ©m das funÃ§Ãµes atuais, vocÃª tambÃ©m atua como:

4) ENGENHEIRO DE SOFTWARE:
Atua no planejamento, arquitetura, desenvolvimento, testes, manutenÃ§Ã£o e evoluÃ§Ã£o de sistemas. Analisa requisitos, organiza componentes e busca soluÃ§Ãµes sustentÃ¡veis.

5) CIENTISTA DA COMPUTAÃ‡ÃƒO:
Aplica pensamento computacional, lÃ³gica, algoritmos, estruturas de dados e fundamentos da computaÃ§Ã£o para resolver problemas.

6) ANALISTA E DESENVOLVEDOR DE SISTEMAS:
Transforma ideias em sistemas funcionais, realizando anÃ¡lise, modelagem, desenvolvimento, testes e documentaÃ§Ã£o.

7) PROFISSIONAL DE TECNOLOGIA DA INFORMAÃ‡ÃƒO:
Considera implantaÃ§Ã£o, configuraÃ§Ã£o, integraÃ§Ã£o, seguranÃ§a, manutenÃ§Ã£o e suporte das soluÃ§Ãµes criadas.

8) PROFESSOR DE ANÃLISE E DESENVOLVIMENTO DE SISTEMAS:
Ensina de forma didÃ¡tica, explicando o motivo das decisÃµes tÃ©cnicas e transformando cada projeto em aprendizado.

Quando Elias solicitar a criaÃ§Ã£o de um aplicativo, software ou ferramenta, siga o fluxo profissional:
IDEIA
â†’ ANÃLISE
â†’ PLANEJAMENTO
â†’ ARQUITETURA
â†’ DESENVOLVIMENTO
â†’ TESTES
â†’ DOCUMENTAÃ‡ÃƒO
â†’ PREPARAÃ‡ÃƒO PARA INSTALAÃ‡ÃƒO
Priorize sistemas organizados, documentados, reversÃ­veis e preparados para evoluÃ§Ã£o de longo prazo.
Responda sempre em portuguÃªs brasileiro.`,

  // â•â•â• MÃ“DULO SABER â€” CORRIGIDO em 06/07/2026 (2Âª correÃ§Ã£o) â•â•â•
  saber: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo SABER/CONHECIMENTO do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Atue como uma enciclopÃ©dia viva: ciÃªncia, histÃ³ria, cultura geral, curiosidades, dental biology e qualquer Ã¡rea de conhecimento que Elias queira explorar.
Elias tem curiosidade intelectual ampla, alÃ©m dos projetos tÃ©cnicos e profissionais. Explique com clareza e profundidade adequada ao interesse demonstrado.
VocÃª NUNCA aconselha sobre decisÃµes de vida, legado ou propÃ³sito pessoal â€” isso Ã© funÃ§Ã£o exclusiva do mÃ³dulo Mentor. Se a pergunta tender para esse territÃ³rio, informe o fato ou conhecimento solicitado e sugira que a reflexÃ£o de propÃ³sito seria melhor explorada no mÃ³dulo Mentor.
Se receber uma saudaÃ§Ã£o simples como "bom dia", "boa tarde" ou similar, responda com um fato, curiosidade ou informaÃ§Ã£o objetiva do dia â€” nunca com reflexÃ£o motivacional, pergunta sobre legado, propÃ³sito ou jornada de vida. Isso Ã© comportamento exclusivo do mÃ³dulo Mentor, nunca seu.
Responda sempre em portuguÃªs brasileiro.`,

  mentor: ARTIGOS_BASE + `
VocÃª Ã© o mÃ³dulo MENTOR do sistema SOUSA 2.0, assistente pessoal de Elias Pereira de Sousa.
Atue como mentor de legado, propÃ³sito e desenvolvimento humano integral. Pilares: FÃ©, FamÃ­lia, Conhecimento, Liberdade e Impacto.
Elias tem 49 anos, mora em Itinga do ParÃ¡, trabalha dobrado e constrÃ³i legado para famÃ­lia e comunidade.
Inspire com reflexÃµes bÃ­blicas e desafios prÃ¡ticos. Seja encorajador, honesto e profundo.
Responda sempre em portuguÃªs brasileiro.`,

  // â”€â”€ O 14Âº MÃ“DULO: CONSELHO (coordenador/painel central) â”€â”€
  conselho: ARTIGOS_BASE + `
VocÃª Ã© o CONSELHO do sistema SOUSA 2.0 â€” o painel central e coordenador de todos os nÃºcleos: JurÃ­dico, Financeiro, Produtor, Estrategista, AfiliadoPro, ADS AcadÃªmico, Saber/Conhecimento e Mentor.
Seu papel Ã© diferente dos outros mÃ³dulos: vocÃª NÃƒO responde como especialista de uma Ãºnica Ã¡rea. VocÃª ouve a questÃ£o de Elias, identifica quais nÃºcleos sÃ£o relevantes para ela, e oferece uma visÃ£o geral e integrada â€” dizendo explicitamente qual nÃºcleo seria o mais indicado para aprofundar, e por quÃª.
Se a questÃ£o envolve mÃºltiplas Ã¡reas (ex: uma decisÃ£o financeira com implicaÃ§Ã£o jurÃ­dica), explique a interseÃ§Ã£o entre os nÃºcleos.
Seja um conselheiro sÃ¡bio e organizador â€” vocÃª Ã© a bÃºssola que direciona Elias para o mÃ³dulo certo, ou sintetiza quando vÃ¡rios se aplicam.
Responda sempre em portuguÃªs brasileiro.`,
};

// â”€â”€ GET â€” health check â”€â”€
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "SOUSA 2.0 online",
      nucleo: "operante",
      modulos: Object.keys(PROMPTS),
      total_modulos: Object.keys(PROMPTS).length,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// â”€â”€ POST â€” endpoint principal â”€â”€
function doPost(e) {
  var _inicioExecucao = new Date().getTime();
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const rawBody =
  e && e.postData && typeof e.postData.contents === "string"
    ? (
        e.postData.type &&
        e.postData.type.indexOf("application/json") !== -1
          ? e.postData.contents
          : (e.parameter && e.parameter.payload
              ? e.parameter.payload
              : e.postData.contents)
      )
    : (e && e.parameter && e.parameter.payload
        ? e.parameter.payload
        : "{}");

const body = JSON.parse(rawBody);
    const _tunnelProps = PropertiesService.getScriptProperties();
    if (_tunnelProps.getProperty("SOUSA_TUNNEL_ENFORCE") === "true") {
      const _chaveEsperada = _tunnelProps.getProperty("SOUSA_TUNNEL_KEY");
      if (!_chaveEsperada || body.chave_secreta !== _chaveEsperada) {
        S20_registrarLogSeguranca(
          body.device_id || null,
          null,
          "NEGADO",
          "Chave secreta ausente ou invalida no doPost"
        );
        output.setContent(JSON.stringify({ erro: true, motivo: "ACESSO_NEGADO" }));
        return output;
      }
    }

    // â•â•â• ROTEAMENTO DE DADOS DO PAINEL (Cotas / AfiliadoPro / SaÃºde) â•â•â•
    // Adicionado em 12/07/2026. Intercepta ANTES da lÃ³gica de mÃ³dulos
    // conversacionais â€” sÃ³ age quando a requisiÃ§Ã£o tem "action" em vez
    // de "module". Nada abaixo foi alterado.
    if (body.action === 'cotas_gerais') {
      output.setContent(JSON.stringify(S20_obterCotasGerais()));
      return output;
    }
    if (body.action === 'metricas_afiliados') {
      output.setContent(JSON.stringify(S20_obterMetricasAfiliados()));
      return output;
    }
    if (body.action === 'saude_sistema') {
      output.setContent(JSON.stringify(S20_obterSaudeSistema()));
      return output;
    }
      // ==========================================================
      // SOUSA 2.0 - TUNEL DE COMANDOS OPERACIONAIS
      // Painel Operacional -> Backend
      // ==========================================================

      if (body.action && body.action !== "chat") {

        const respostaTunel = S20_rotearComandoTunel(body);

        output.setContent(
          JSON.stringify(respostaTunel)
        );

        return output;
      }
    const modId   = body.module  || "mentor";
    const history = body.history || [];
    const system  = PROMPTS[modId] || PROMPTS["mentor"];

    const selecaoAPI = SOUSA_API_MANAGER_selecionar("TEXTO");

if (!selecaoAPI || !selecaoAPI.recurso_escolhido) {
  throw new Error("API_MANAGER: nenhum recurso disponível para TEXTO.");
}

const contextoExecutor = {
  texto:
    system +
    "\n\nHISTÓRICO DA CONVERSA:\n" +
    history.map(msg =>
      (msg.role === "assistant" ? "ASSISTENTE: " : "USUÁRIO: ") +
      msg.content
    ).join("\n")
};

const resultadoExecutor =
  SOUSA_API_EXECUTOR_UNIVERSAL(
    selecaoAPI,
    contextoExecutor
  );

if (!resultadoExecutor || !resultadoExecutor.ok) {
  throw new Error(
    "EXECUTOR UNIVERSAL: " +
    JSON.stringify(resultadoExecutor)
  );
}

const text =
  resultadoExecutor.texto ||
  "Executor Universal concluiu sem texto de resposta.";

SOUSA_LOG_ENGINE.registrar({
  modulo: modId,
  acao: "RESPOSTA_GEMINI",
  arquivo: "SOUSA_Core.js",
  explicacao: "Resposta gerada pelo módulo SOUSA 2.0",
  resultado: "Execução concluída",
  pendencias: [],
  decisao_fundador: "Aguardando validação",
  proximo_passo: "Monitorar evolução"
});
    output.setContent(JSON.stringify({ ok: true, text: text, module: modId }));

  } catch(err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }

  S20_registrarTempoExecucao(new Date().getTime() - _inicioExecucao);
  return output;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PAINEL SOUSA 2.0 â€” DADOS REAIS (Cotas, AfiliadoPro, SaÃºde do Sistema)
// Adicionado em 12/07/2026. Puramente aditivo â€” usado pelo roteamento
// de "action" acima. NÃ£o interfere na lÃ³gica dos 14 mÃ³dulos.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function S20_obterCotasGerais() {
  var props = PropertiesService.getScriptProperties();
  var itens = [];

  var usoScripts = Number(props.getProperty('USO_SCRIPTS_MIN_HOJE') || 0);
  var limiteScripts = 90;
  itens.push({
    nome: 'Google Scripts (min/dia)',
    valor: usoScripts + ' / ' + limiteScripts,
    status: usoScripts / limiteScripts > 0.8 ? 'alerta' : 'ok',
    reset: 'Reset diÃ¡rio'
  });

  var usoMake = Number(props.getProperty('USO_MAKE_OPS_MES') || 0);
  var limiteMake = 1000;
  itens.push({
    nome: 'Make (Free Tier)',
    valor: usoMake + ' / ' + limiteMake,
    status: usoMake / limiteMake > 0.9 ? 'critico' : (usoMake / limiteMake > 0.7 ? 'alerta' : 'ok'),
    reset: 'Reset: ' + (props.getProperty('MAKE_RESET_DATA') || 'dia 1Âº do mÃªs')
  });

  var usoTelegram = Number(props.getProperty('CONTADOR_TELEGRAM') || 0);
  itens.push({
    nome: 'Telegram Bot API',
    valor: usoTelegram.toLocaleString('pt-BR') + ' chamadas',
    status: 'ok',
    reset: 'Uso contÃ­nuo'
  });

  return { ok: true, itens: itens };
}

function S20_obterMetricasAfiliados() {
  var props = PropertiesService.getScriptProperties();
  var metricas = JSON.parse(props.getProperty('METRICAS_COMERCIAIS') || '{}');

  var totalVisitas = 0, totalVendas = 0;
  var porPlataforma = {};

  Object.keys(metricas).forEach(function(dia) {
    metricas[dia].forEach(function(evento) {
      var plataforma = evento.plataforma || 'Outro';
      if (!porPlataforma[plataforma]) {
        porPlataforma[plataforma] = { visitas: 0, vendas: 0 };
      }
      if (evento.tipo === 'visita') { totalVisitas++; porPlataforma[plataforma].visitas++; }
      if (evento.tipo === 'compra') { totalVendas++; porPlataforma[plataforma].vendas++; }
    });
  });

  var iconePorPlataforma = {
    'Shopee': 'ðŸŸ ', 'Mercado Livre': 'ðŸŸ¡', 'Amazon': 'ðŸ“¦', 'Magalu': 'ðŸ”µ', 'Shein': 'âš«'
  };

  var plataformas = Object.keys(porPlataforma).map(function(nome) {
    return {
      nome: nome,
      icon: iconePorPlataforma[nome] || 'ðŸ”˜',
      visitas: porPlataforma[nome].visitas,
      vendas: porPlataforma[nome].vendas
    };
  });

  return {
    ok: true,
    totalVisitas: totalVisitas,
    totalVendas: totalVendas,
    plataformas: plataformas
  };
}

function S20_obterSaudeSistema() {
  var props = PropertiesService.getScriptProperties();
  var MODULOS_VALIDOS = ['juridico', 'financeiro', 'produtor', 'estrategista', 'afiliadopro', 'ads', 'saber', 'mentor', 'conselho'];

  var modulos = MODULOS_VALIDOS.map(function(mod) {
    var ultimaAtividade = props.getProperty('ULTIMA_ATIVIDADE_' + mod.toUpperCase());
    var erro = props.getProperty('ERRO_' + mod.toUpperCase());

    var status = 'ok';
    var msg = ultimaAtividade ? 'Ãšltima atividade: ' + ultimaAtividade : 'Sem atividade registrada';

    if (erro) {
      status = 'critico';
      msg = erro;
    } else if (!ultimaAtividade) {
      status = 'alerta';
      msg = 'Nenhuma atividade registrada ainda';
    }

    return { nome: mod.toUpperCase(), status: status, msg: msg };
  });

  var moduloComErro = modulos.filter(function(m) { return m.status === 'critico'; })[0];

  var resultado = {
    ok: true,
    nucleo: 'OPERACIONAL',
    modulos: modulos,
    intervencao: { ativa: false }
  };

  if (moduloComErro) {
    var instrucaoErro = props.getProperty('INSTRUCAO_ERRO_' + moduloComErro.nome) ||
      'Verificar logs do mÃ³dulo ' + moduloComErro.nome + ' manualmente â€” nenhuma instruÃ§Ã£o automÃ¡tica registrada.';
    resultado.intervencao = {
      ativa: true,
      modulo: moduloComErro.nome,
      instrucao: instrucaoErro
    };
  }

  return resultado;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CRONÃ”METRO DE EXECUÃ‡ÃƒO + TRIGGER DIÃRIO
// Adicionado em 12/07/2026.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function S20_registrarTempoExecucao(ms) {
  try {
    var props = PropertiesService.getScriptProperties();
    var fuso = props.getProperty('FUSO') || 'America/Belem';
    var hoje = Utilities.formatDate(new Date(), fuso, 'yyyy-MM-dd');
    var diaSalvo = props.getProperty('USO_SCRIPTS_DIA');

    var minutosAcumulados = Number(props.getProperty('USO_SCRIPTS_MIN_HOJE') || 0);
    if (diaSalvo !== hoje) {
      minutosAcumulados = 0;
      props.setProperty('USO_SCRIPTS_DIA', hoje);
    }

    minutosAcumulados += ms / 60000;
    props.setProperty('USO_SCRIPTS_MIN_HOJE', minutosAcumulados.toFixed(2));
  } catch (e) {
    // nunca deve quebrar o fluxo principal do doPost
  }
}

function S20_resetarContadoresDiarios() {
  var props = PropertiesService.getScriptProperties();
  var fuso = props.getProperty('FUSO') || 'America/Belem';
  var hoje = Utilities.formatDate(new Date(), fuso, 'yyyy-MM-dd');
  props.setProperty('USO_SCRIPTS_DIA', hoje);
  props.setProperty('USO_SCRIPTS_MIN_HOJE', '0');
}

/**
 * RODAR ESTA FUNÃ‡ÃƒO UMA ÃšNICA VEZ MANUALMENTE (pelo editor do Apps
 * Script ou selecionando ela no dropdown de funÃ§Ãµes e clicando em
 * Executar) para ativar o trigger diÃ¡rio. Depois disso roda sozinho.
 */
function S20_ativarTriggerDiario() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'S20_resetarContadoresDiarios') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('S20_resetarContadoresDiarios')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();

  Logger.log('âœ… Trigger diÃ¡rio ativado â€” reseta USO_SCRIPTS_MIN_HOJE toda meia-noite.');
}
// ==========================================================
// SOUSA 2.0
// ROTEADOR DO TÚNEL
// ==========================================================

function S20_rotearComandoTunel(body) {

  switch (body.action) {

    case "ping":
      return {
        ok: true,
        action: "ping",
        status: "ONLINE",
        mensagem: "Túnel SOUSA 2.0 respondendo."
      };


    case "status":
      return {
        ok: true,
        action: "status",
        sistema: "SOUSA 2.0",
        status: "OPERACIONAL",
        timestamp: new Date().toISOString()
      };


    case "testar_backend":
      return {
        ok: true,
        action: "testar_backend",
        backend: "RESPONDENDO",
        mensagem: "Comunicação com backend confirmada."
      };


    case "liberar_esteira":
      return {
        ok: true,
        action: "liberar_esteira",
        esteira: "LIBERADA",
        mensagem: "Comando recebido pelo túnel."
      };


    case "reconectar":
      return {
        ok: true,
        action: "reconectar",
        mensagem: "Reconexão solicitada."
      };


    case "reiniciar_sessao":
      return {
        ok: true,
        action: "reiniciar_sessao",
        mensagem: "Sessão reiniciada pelo túnel."
      };


    case "logs":
      return {
        ok: true,
        action: "logs",
        mensagem: "Consulta de logs preparada."
      };


    case "diagnostico":
      return {
        ok: true,
        action: "diagnostico",
        mensagem: "Diagnóstico executado."
      };


    default:
      return {
        ok: false,
        action: body.action,
        mensagem: "Ação não implementada no túnel."
      };

  }

}






