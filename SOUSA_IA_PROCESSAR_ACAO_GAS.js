/**
 * SOUSA 2.0 — SOUSA IA: PROCESSADOR CENTRAL DE AÇÕES
 * ==========================================================
 * LÓGICA "CAPITÃO PLANETA":
 *   "Pela união das vossas capacidades, eu sou a SOUSA IA."
 *
 * A SOUSA IA não é um provedor de IA específico. Ela é a
 * COMPOSIÇÃO das capacidades de todas as IAs/APIs registradas
 * nas Script Properties ou no Cofre (PropertiesService).
 * Cada IA é um "anel de poder"; a união forma a identidade
 * própria da SOUSA IA — o "DNA" dela é a soma dessas peças.
 *
 * PAPEL DESTE ARQUIVO:
 *   - Ponto único de entrada para QUALQUER solicitante
 *     (Add-on de Drive, Claude, GPT, LuzIA, Mira, Módulo ADS...)
 *   - Registra a origem de cada ação (sistema de contrapesos:
 *     nenhuma IA age direto no Drive/nucleo sem passar por aqui)
 *   - Não decide silenciosamente ações de risco alto — reusa o
 *     contrato de autorização já definido em SOUSA_CICLO_AUTONOMO
 *   - Não duplica lógica de capacidades — reusa SOUSA_CAPACIDADES.js
 *     (SOUSA_CAP_normalizarLista, SOUSA_CAP_indexarRecursos etc.)
 *
 * Este arquivo NUNCA escreve em disco/repositório sozinho.
 * Quem grava fisicamente é o Braço Robótico (SOUSAILEON), só
 * depois de autorização confirmada.
 */

'use strict';

var SOUSA_LOG_ACOES_CHAVE = 'SOUSA_LOG_ACOES_V1';
var SOUSA_LOG_ACOES_MAX = 200; // evita estourar o limite de PropertiesService

// ============================================================
// PONTO DE ENTRADA ÚNICO — chamado pelo Add-on e por qualquer
// membro do Conselho Multi-IA
// ============================================================
/**
 * @param {string} acao     Nome da ação solicitada (ex.: 'diagnostico_rapido')
 * @param {object} payload  Dados da ação
 * @param {string} origem   Quem está pedindo: 'CLAUDE' | 'GPT' | 'ADDON_DRIVE' |
 *                          'LUZIA' | 'MIRA' | 'MODULO_ADS' | 'DESCONHECIDA'
 * @return {object} { ok, mensagem, autorizacao_necessaria, ciclo }
 */
function SOUSA_IA_processarAcao(acao, payload, origem) {
  origem = origem || 'DESCONHECIDA';
  payload = payload || {};

  var ciclo = SOUSA_CICLO_criar(acao, {
    origem: origem,
    payload: payload
  });

  SOUSA_IA_registrarLogAcao_({
    acao: acao,
    origem: origem,
    timestamp: new Date().toISOString(),
    ciclo_id: ciclo.id
  });

  // Sinal de risco: por enquanto, conservador — qualquer ação que
  // não seja de leitura/diagnóstico é tratada como potencialmente
  // crítica até o Módulo ADS/SOUSAILEON classificar melhor.
  var sinalRisco = SOUSA_IA_classificarRisco_(acao, payload);
  var autorizacao = SOUSA_CICLO_precisaAutorizacao(ciclo, sinalRisco);

  if (autorizacao.necessaria) {
    SOUSA_CICLO_mudarEstado(ciclo, 'AGUARDANDO_AUTORIZACAO', autorizacao.motivo);
    return {
      ok: false,
      autorizacao_necessaria: true,
      motivo: autorizacao.motivo,
      mensagem: 'Ação "' + acao + '" (origem: ' + origem + ') aguarda autorização ' +
        'explícita de Elias antes de prosseguir.',
      ciclo: ciclo
    };
  }

  SOUSA_CICLO_mudarEstado(ciclo, 'EXECUTANDO');

  var resultado = SOUSA_IA_executarAcaoRotineira_(acao, payload, origem);

  SOUSA_CICLO_mudarEstado(ciclo, resultado.ok ? 'CONCLUIDA' : 'FALHA', resultado.mensagem);

  return {
    ok: resultado.ok,
    autorizacao_necessaria: false,
    mensagem: resultado.mensagem,
    dados: resultado.dados || null,
    ciclo: ciclo
  };
}

// ============================================================
// CLASSIFICAÇÃO DE RISCO (conservadora por padrão)
// ============================================================
function SOUSA_IA_classificarRisco_(acao, payload) {
  var acoesRotineiras = {
    'diagnostico_rapido': true,
    'analisar_item_drive': true,
    'listar_capacidades': true,
    'consultar_status': true
  };

  if (acoesRotineiras[acao]) {
    return { risco: 'BAIXO' };
  }

  // Qualquer ação fora da lista branca é tratada como alto risco
  // até ser explicitamente classificada — "seguro por padrão".
  return {
    risco: 'ALTO',
    altera_nucleo: true,
    motivo: 'Ação "' + acao + '" não está na lista de rotina conhecida.'
  };
}

// ============================================================
// EXECUÇÃO DE AÇÕES ROTINEIRAS (sem necessidade de autorização)
// ============================================================
function SOUSA_IA_executarAcaoRotineira_(acao, payload, origem) {
  switch (acao) {
    case 'diagnostico_rapido':
      return {
        ok: true,
        mensagem: 'Diagnóstico rápido executado (somente leitura).',
        dados: SOUSA_IA_montarDNA_()
      };

    case 'analisar_item_drive':
      return {
        ok: true,
        mensagem: 'Item recebido para análise: ' + (payload.titulo || payload.id || '(sem título)'),
        dados: payload
      };

    case 'listar_capacidades':
      return {
        ok: true,
        mensagem: 'Capacidades catalogadas listadas.',
        dados: (typeof SOUSA_CAPACIDADES_V1 !== 'undefined') ? SOUSA_CAPACIDADES_V1 : null
      };

    case 'consultar_status':
      return {
        ok: true,
        mensagem: 'Status consultado.',
        dados: { origem_solicitante: origem, dna: SOUSA_IA_montarDNA_() }
      };

    default:
      return {
        ok: false,
        mensagem: 'Ação rotineira desconhecida: ' + acao
      };
  }
}

// ============================================================
// "DNA" DA SOUSA IA — lógica Capitão Planeta
// ============================================================
/**
 * Não expõe valores de chave nenhuma — só CONFIRMA presença/ausência
 * de cada "anel de poder" (provedor) configurado nas Script Properties
 * ou no Cofre, para compor a identidade da SOUSA IA.
 */
function SOUSA_IA_montarDNA_() {
  var props = PropertiesService.getScriptProperties().getKeys();

  // Convenção assumida: chaves de API seguem o padrão SOUSA_API_<PROVEDOR>_KEY
  // Ajustar esta lista conforme os nomes reais usados no Cofre.
  var provedoresConhecidos = ['GEMINI', 'OMNIROUTE', 'GPT', 'LUZIA', 'MIRA', 'CLAUDE'];

  var aneis = provedoresConhecidos.map(function(provedor) {
    var chaveEsperada = 'SOUSA_API_' + provedor + '_KEY';
    return {
      provedor: provedor,
      presente: props.indexOf(chaveEsperada) !== -1
    };
  });

  var presentes = aneis.filter(function(a) { return a.presente; })
    .map(function(a) { return a.provedor; });

  return {
    lema: 'Pela união das vossas capacidades, eu sou a SOUSA IA.',
    aneis_de_poder: aneis,
    uniao_ativa: presentes,
    total_conectado: presentes.length,
    total_conhecido: provedoresConhecidos.length
  };
}

// ============================================================
// LOG DE AÇÕES (sistema de contrapesos — quem pediu o quê)
// ============================================================
function SOUSA_IA_registrarLogAcao_(entrada) {
  try {
    var props = PropertiesService.getScriptProperties();
    var bruto = props.getProperty(SOUSA_LOG_ACOES_CHAVE);
    var log = bruto ? JSON.parse(bruto) : [];

    log.push(entrada);

    if (log.length > SOUSA_LOG_ACOES_MAX) {
      log = log.slice(log.length - SOUSA_LOG_ACOES_MAX);
    }

    props.setProperty(SOUSA_LOG_ACOES_CHAVE, JSON.stringify(log));
  } catch (erro) {
    // Log é auxiliar — uma falha aqui nunca deve derrubar a ação principal.
    Logger.log('Falha ao registrar log de ação: ' + erro.message);
  }
}

function SOUSA_IA_lerLogAcoes() {
  var props = PropertiesService.getScriptProperties();
  var bruto = props.getProperty(SOUSA_LOG_ACOES_CHAVE);
  return bruto ? JSON.parse(bruto) : [];
}
