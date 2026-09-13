/**
 * SOUSA 2.0 - CARDAN OPENMANUS
 * Junta de transmissao entre o SOUSA e o OpenManus.
 * O SOUSA nao contem o OpenManus; acopla-se a ele.
 */
const SOUSA_OPENMANUS_CARDAN = {
  protocolo: 'SOUSA-OPENMANUS-CARDAN',
  versao: '1.0.0',
  receberMissao: function(missao) {
    return { status: 'RECEBIDA_PELO_CARDAN', missao: missao };
  },
  normalizarContrato: function(missao) {
    return { status: 'CONTRATO_NORMALIZADO', payload: missao, destino: 'ADAPTADOR' };
  },
  devolverAoSOUSA: function(resultado) {
    return { status: 'RETORNO_PADRONIZADO', resultado: resultado, origem: 'OPENMANUS' };
  }
};
module.exports = SOUSA_OPENMANUS_CARDAN;
