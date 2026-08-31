// =======================================================
// TESTE ISOLADO — SOUSA DEVICE AUTH
// Não integra com produção
// =======================================================

function S20_testeCompletoDeviceAuth() {

  var deviceId = "ANDROID-001";

  Logger.log("=== TESTE DEVICE AUTH ===");

  // 1 - Validar dispositivo
  var validacao = S20_validarDevice(deviceId);

  Logger.log(
    "VALIDAÇÃO: " +
    JSON.stringify(validacao)
  );


  if (!validacao.autorizado) {
    Logger.log("TESTE ENCERRADO - DEVICE NEGADO");
    return;
  }


  // 2 - Criar sessão
  var sessao =
    S20_criarSessao(deviceId);

  Logger.log(
    "SESSÃO CRIADA: " +
    JSON.stringify(sessao)
  );


  // 3 - Validar sessão
  var conferencia =
    S20_validarSessao(
      sessao.session_id
    );

  Logger.log(
    "SESSÃO VALIDADA: " +
    JSON.stringify(conferencia)
  );


  // 4 - Renovar sessão
  var renovacao =
    S20_renovarSessao(
      sessao.session_id
    );

  Logger.log(
    "RENOVAÇÃO: " +
    JSON.stringify(renovacao)
  );


  Logger.log(
    "=== TESTE FINALIZADO ==="
  );

}