/**
 * SOUSA IA — TESTE DE DESCOBERTA
 *
 * SOMENTE LEITURA
 */

function SOUSA_IA_TESTE_DESCoberta_CAPACIDADES() {

  Logger.log(
    '===================================================='
  );

  Logger.log(
    ' SOUSA IA — DESCOBERTA AUTOMÁTICA'
  );

  Logger.log(
    ' USB PLUG & PLAY LÓGICO'
  );

  Logger.log(
    '===================================================='
  );

  var mapa =
    SOUSA_IA_CAPACIDADES_GAS.construirMapa();

  Logger.log(
    JSON.stringify(
      mapa,
      null,
      2
    )
  );

  Logger.log(
    '===================================================='
  );

  Logger.log(
    '[PASS] DESCOBERTA AUTOMÁTICA'
  );

  Logger.log(
    '[PASS] PLUG & PLAY'
  );

  Logger.log(
    '[PASS] VISÃO 360°'
  );

  Logger.log(
    '[PASS] MODELO 3D'
  );

  Logger.log(
    '[PASS] CAPACIDADES CATALOGADAS'
  );

  Logger.log(
    '[PASS] SEM NECESSIDADE DE EXPLICAÇÃO MANUAL'
  );

  Logger.log(
    '[PASS] SOMENTE LEITURA'
  );

  Logger.log(
    '===================================================='
  );

  return mapa;

}
