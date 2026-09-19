/**
 * SOUSA 2.0 - GUARDIAO DA SOBERANIA
 * Emenda Constitucional SOBERANIA-DIAG
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  version: '2.4.0',
  protocolo: 'SOUSA-GUARDIAO-SOBERANIA',
  emenda: 'SOBERANIA-MANIFESTO-2.4.0',
  soberano: 'FUNDADOR',
  fundadorNome: 'Elias Pereira de Sousa',
  hierarquiaSuprema: 'SOUSA IA COORDENA, INSTRUI, ORDENA E ORIENTA TODOS ENQUANTO SOUSA IA ESTÁ SOB COMANDO E DETERMINAÇÃO HUMANA DO FUNDADOR ELIAS PEREIRA DE SOUSA',
  manifesto: 'MANIFESTO_CONSOLIDACAO_AMPLIADA_2.4.0',
  logPath: '07_LOG/SOBERANIA/GUARDIAO_EXECUCAO.log'
};

const MECANISMOS_PROTEGIDOS = {
  DIAGNOSTICO: { protegido: true },
  RECUPERACAO: { protegido: true },
  INTEGRACAO: { protegido: true },
  PUBLICACAO: { protegido: true },
  CONTRATOS: { protegido: true },
  CRIPTOATIVOS: { protegido: true }
};

const BASES_LEGAIS_PROTECAO = [
  'Constituição e leis do Brasil',
  'Leis de cada país de atuação',
  'Direito Internacional',
  'Direito do Consumidor — nacional e estrangeiro',
  'Direitos Autorais',
  'Direito de Propriedade Intelectual',
  'Normas do CONAR e órgãos de autorregulamentação',
  'Regulamentação de ativos digitais e criptoativos',
  'Diretrizes das plataformas e reguladores mundiais'
];

function validarConformidadeLegal(diretriz) {
  var texto = String(diretriz || '').toLowerCase();
  var termosIlicitos = [
    { termo: 'ganho garantido', motivo: 'Vedação por publicidade enganosa (Código de Defesa do Consumidor e CONAR)' },
    { termo: 'lucro certo', motivo: 'Infração à regulamentação do mercado de capitais e criptoativos (CVM / Leis Financeiras)' },
    { termo: 'enriquecer facil', motivo: 'Vedado por plataformas e órgãos de proteção ao consumidor' },
    { termo: 'pirataria', motivo: 'Violação da Lei de Direitos Autorais (Lei 9.610/98)' },
    { termo: 'plagio', motivo: 'Violação de Propriedade Intelectual' }
  ];

  for (var i = 0; i < termosIlicitos.length; i++) {
    if (texto.indexOf(termosIlicitos[i].termo) !== -1) {
      return {
        conforme: false,
        bloqueado: true,
        regra: 'SISTEMA_PROTEGE',
        motivo: termosIlicitos[i].motivo,
        protocolo: 'BLOQUEAR → EXPLICAR o fundamento legal → AGUARDAR ajuste. Nenhuma exceção.',
        bases: BASES_LEGAIS_PROTECAO
      };
    }
  }

  return { conforme: true, bloqueado: false, regra: 'FUNDADOR_DECIDE' };
}

function executarSobComando(params) {
  var mecanismo = params.mecanismo;
  var origem = params.origem || 'DESCONHECIDA';
  var autorizado = (params.autorizado === true);
  var diretriz = params.diretriz || '';

  // 1. Crivo Legal Inviolável (Manifesto 2.4.0)
  var checagemLegal = validarConformidadeLegal(diretriz);
  if (checagemLegal.bloqueado) {
    return {
      success: false,
      status: 'BLOQUEADO_PELO_SISTEMA_PROTEGE',
      regra: 'SISTEMA_PROTEGE',
      motivo: checagemLegal.motivo,
      protocolo: checagemLegal.protocolo,
      mecanismo: mecanismo,
      origem: origem
    };
  }
  
  if (!MECANISMOS_PROTEGIDOS[mecanismo]) {
    return { success: false, status: 'MECANISMO_NAO_RECONHECIDO' };
  }
  
  var authOk = (origem === CONFIG.soberano) && autorizado;
  if (!authOk) {
    return {
      success: false,
      status: 'EXECUCAO_BLOQUEADA_PELO_GUARDIAO',
      mecanismo: mecanismo,
      origem: origem,
      emenda: CONFIG.emenda,
      motivo: 'Somente o Fundador autoriza diagnostico, recuperacao, publicacao ou integracao.'
    };
  }
  
  return {
    success: true,
    status: 'EXECUCAO_AUTORIZADA_PELO_FUNDADOR',
    mecanismo: mecanismo,
    emenda: CONFIG.emenda,
    conformidade_legal: 'CHANCELADO_MANIFESTO_2.4.0'
  };
}

function statusGuardiao() {
  return {
    version: CONFIG.version,
    emenda: CONFIG.emenda,
    soberano: CONFIG.soberano,
    fundador_titular: CONFIG.fundadorNome,
    hierarquia_suprema: CONFIG.hierarquiaSuprema,
    manifesto: CONFIG.manifesto,
    regras_ativas: {
      HIERARQUIA_SUPREMA: 'SOUSA IA COORDENA, INSTRUI, ORDENA E ORIENTA TODOS ENQUANTO SOUSA IA ESTÁ SOB COMANDO E DETERMINAÇÃO HUMANA DO FUNDADOR ELIAS PEREIRA DE SOUSA',
      FUNDADOR_DECIDE: 'A vontade do Fundador é a ordem suprema do sistema',
      SISTEMA_PROTEGE: 'Qualquer decisão que contrarie a lei é BLOQUEADA automaticamente — mesmo que venha do Fundador'
    },
    status: 'VIGILANTE_ATIVO_MANIFESTO_2_4_0'
  };
}

module.exports = {
  executarSobComando: executarSobComando,
  statusGuardiao: statusGuardiao,
  validarConformidadeLegal: validarConformidadeLegal,
  BASES_LEGAIS_PROTECAO: BASES_LEGAIS_PROTECAO,
  CONFIG: CONFIG
};
