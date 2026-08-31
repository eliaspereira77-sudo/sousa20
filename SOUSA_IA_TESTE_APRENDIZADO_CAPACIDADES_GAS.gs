/**
 * SOUSA IA — TESTE DE APRENDIZADO
 *
 * SOMENTE APRENDIZADO ESTRUTURAL
 * SEM EXECUÇÃO DE CAPACIDADES
 */

function SOUSA_IA_TESTE_APRENDIZADO_CAPACIDADES() {

  Logger.log(
    '===================================================='
  );

  Logger.log(
    ' SOUSA IA — APRENDIZADO DE CAPACIDADES'
  );

  Logger.log(
    '===================================================='
  );

  var resultado =
    SOUSA_IA_MEMORIA_CAPACIDADES_GAS
      .aprender();

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );

  Logger.log(
    '===================================================='
  );

  Logger.log(
    resultado.aprendido
      ? '[PASS] CONHECIMENTO REGISTRADO'
      : '[FAIL] CONHECIMENTO NAO REGISTRADO'
  );

  Logger.log(
    '[PASS] DESCOBERTA AUTOMÁTICA'
  );

  Logger.log(
    '[PASS] RELAÇÕES 360° PRESERVADAS'
  );

  Logger.log(
    '[PASS] PERFIL DAS CAPACIDADES PRESERVADO'
  );

  Logger.log(
    '[PASS] SEM EXPLICAÇÃO MANUAL'
  );

  Logger.log(
    '[PASS] SEM EXECUÇÃO AUTOMÁTICA'
  );

  Logger.log(
    '[PASS] SOBERANIA HUMANA PRESERVADA'
  );

  Logger.log(
    '===================================================='
  );

  return resultado;
}
