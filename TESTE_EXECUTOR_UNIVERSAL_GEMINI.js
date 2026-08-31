function TESTE_EXECUTOR_UNIVERSAL_GEMINI() {

  const selecao =
    SOUSA_API_MANAGER_selecionar("CODIGO");

  Logger.log("===== SELEÇÃO =====");
  Logger.log(JSON.stringify(selecao, null, 2));

  const resultado =
    SOUSA_API_EXECUTOR_UNIVERSAL(
      selecao,
      {
        texto: "Responda apenas: EXECUTOR UNIVERSAL ONLINE"
      }
    );

  Logger.log("===== EXECUTOR UNIVERSAL =====");
  Logger.log(JSON.stringify(resultado, null, 2));
}
