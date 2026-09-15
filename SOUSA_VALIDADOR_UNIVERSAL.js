/**
 * ==========================================================
 * SOUSA 2.0 - VALIDADOR UNIVERSAL
 * Materializa o principio EXECUTAR != CONCLUIR
 * (Contrato Executavel: Secoes 10, 11 e 26)
 * ==========================================================
 * Nenhuma operacao e declarada COMPLETED sem verificacao real.
 * Nenhuma aprovacao declarativa e aceita. So evidencia.
 *
 * Estados de Verdade (Secao 26):
 * CONFIRMADO, PROVAVEL, NAO_VERIFICADO, BLOQUEADO,
 * FALHOU, NAO_EXECUTADO, ESTADO_DESCONHECIDO
 * ==========================================================
 */

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const CONFIG = {
  version: '1.0.0',
  protocolo: 'SOUSA-VALIDADOR-UNIVERSAL',
  principio: 'EXECUTAR_DIFERENTE_CONCLUIR',
  logPath: '07_LOG/VALIDACAO/VALIDADOR_EXECUCAO.log'
};

// Estados de Verdade (Contrato Secao 26)
const ESTADOS_DE_VERDADE = {
  CONFIRMADO: 'CONFIRMADO',
  PROVAVEL: 'PROVAVEL',
  NAO_VERIFICADO: 'NAO_VERIFICADO',
  BLOQUEADO: 'BLOQUEADO',
  FALHOU: 'FALHOU',
  NAO_EXECUTADO: 'NAO_EXECUTADO',
  ESTADO_DESCONHECIDO: 'ESTADO_DESCONHECIDO'
};

function registrarEvidencia(evento, detalhes) {
  var timestamp = new Date().toISOString();
  var linha = '[' + timestamp + '] ' + evento + ': ' + JSON.stringify(detalhes) + '\n';
  try {
    var logDir = path.dirname(CONFIG.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(CONFIG.logPath, linha, 'utf8');
  } catch (e) {
    console.error('[VALIDADOR] Erro ao registrar:', e.message);
  }
}

// Validacao REAL de existencia de arquivo
function validarArquivoExiste(alvo) {
  var existe = fs.existsSync(alvo);
  registrarEvidencia('VALIDAR_ARQUIVO', { alvo: alvo, existe: existe });
  return {
    estado: existe ? ESTADOS_DE_VERDADE.CONFIRMADO : ESTADOS_DE_VERDADE.FALHOU,
    evidencia: 'fs.existsSync = ' + existe,
    alvo: alvo
  };
}

// Validacao REAL de sintaxe JS (node --check)
function validarSintaxeJS(alvo) {
  if (!fs.existsSync(alvo)) {
    return { estado: ESTADOS_DE_VERDADE.NAO_EXECUTADO, evidencia: 'Arquivo ausente', alvo: alvo };
  }
  try {
    execSync('node --check ' + JSON.stringify(alvo), { stdio: 'pipe' });
    registrarEvidencia('VALIDAR_SINTAXE', { alvo: alvo, valida: true });
    return { estado: ESTADOS_DE_VERDADE.CONFIRMADO, evidencia: 'node --check passou', alvo: alvo };
  } catch (e) {
    registrarEvidencia('VALIDAR_SINTAXE', { alvo: alvo, valida: false });
    return { estado: ESTADOS_DE_VERDADE.FALHOU, evidencia: 'node --check falhou', alvo: alvo };
  }
}

// Validacao REAL de JSON (parse real)
function validarJSON(alvo) {
  if (!fs.existsSync(alvo)) {
    return { estado: ESTADOS_DE_VERDADE.NAO_EXECUTADO, evidencia: 'Arquivo ausente', alvo: alvo };
  }
  try {
    var conteudo = fs.readFileSync(alvo, 'utf8');
    JSON.parse(conteudo);
    registrarEvidencia('VALIDAR_JSON', { alvo: alvo, valido: true });
    return { estado: ESTADOS_DE_VERDADE.CONFIRMADO, evidencia: 'JSON.parse passou', alvo: alvo };
  } catch (e) {
    registrarEvidencia('VALIDAR_JSON', { alvo: alvo, valido: false });
    return { estado: ESTADOS_DE_VERDADE.FALHOU, evidencia: 'JSON.parse falhou', alvo: alvo };
  }
}

// Validacao REAL de conteudo esperado
function validarConteudo(alvo, esperado) {
  if (!fs.existsSync(alvo)) {
    return { estado: ESTADOS_DE_VERDADE.NAO_EXECUTADO, evidencia: 'Arquivo ausente', alvo: alvo };
  }
  try {
    var conteudo = fs.readFileSync(alvo, 'utf8');
    var contem = conteudo.indexOf(esperado) !== -1;
    registrarEvidencia('VALIDAR_CONTEUDO', { alvo: alvo, contem: contem });
    return {
      estado: contem ? ESTADOS_DE_VERDADE.CONFIRMADO : ESTADOS_DE_VERDADE.FALHOU,
      evidencia: 'Contem padrao: ' + contem,
      alvo: alvo
    };
  } catch (e) {
    return { estado: ESTADOS_DE_VERDADE.FALHOU, evidencia: 'Erro de leitura', alvo: alvo };
  }
}

// Comparacao EXPECTED vs ACTUAL (Contrato Secao 10)
function compararEstados(esperado, real) {
  var coincide = JSON.stringify(esperado) === JSON.stringify(real);
  registrarEvidencia('COMPARAR_ESTADOS', { coincide: coincide });
  return {
    estado: coincide ? ESTADOS_DE_VERDADE.CONFIRMADO : ESTADOS_DE_VERDADE.FALHOU,
    esperado: esperado,
    real: real,
    evidencia: 'EXPECTED == ACTUAL: ' + coincide
  };
}

// Verificacao principal (Contrato Secao 10: VERIFY(task))
function verificar(task) {
  var alvo = task.alvo;
  var tipo = task.tipo || 'ARQUIVO';
  var resultado;

  if (tipo === 'ARQUIVO') {
    resultado = validarArquivoExiste(alvo);
  } else if (tipo === 'SINTAXE_JS') {
    resultado = validarSintaxeJS(alvo);
  } else if (tipo === 'JSON') {
    resultado = validarJSON(alvo);
  } else if (tipo === 'CONTEUDO') {
    resultado = validarConteudo(alvo, task.esperado);
  } else {
    resultado = { estado: ESTADOS_DE_VERDADE.ESTADO_DESCONHECIDO, evidencia: 'Tipo nao reconhecido' };
  }

  // Secao 11: EXECUTAR != CONCLUIR. So CONFIRMADO com evidencia real.
  var concluido = (resultado.estado === ESTADOS_DE_VERDADE.CONFIRMADO);

  return {
    task_id: task.id || 'SEM_ID',
    estado_verdade: resultado.estado,
    concluido: concluido,
    evidencia: resultado.evidencia,
    principio: CONFIG.principio,
    timestamp: new Date().toISOString()
  };
}

function statusValidador() {
  return {
    version: CONFIG.version,
    protocolo: CONFIG.protocolo,
    principio: CONFIG.principio,
    estadosDeVerdade: Object.keys(ESTADOS_DE_VERDADE),
    status: 'OPERACIONAL'
  };
}

module.exports = {
  CONFIG: CONFIG,
  ESTADOS_DE_VERDADE: ESTADOS_DE_VERDADE,
  validarArquivoExiste: validarArquivoExiste,
  validarSintaxeJS: validarSintaxeJS,
  validarJSON: validarJSON,
  validarConteudo: validarConteudo,
  compararEstados: compararEstados,
  verificar: verificar,
  registrarEvidencia: registrarEvidencia,
  statusValidador: statusValidador
};
