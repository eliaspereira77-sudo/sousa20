function TESTE_EXECUTOR_CEREBRAS() {

  const selecao = {
    recurso_escolhido: "CEREBRAS",
    chave_consultada: "CEREBRAS_API_KEY",
    prioridade: 2
  };

  Logger.log("===== SELEÇÃO CEREBRAS =====");
  Logger.log(JSON.stringify(selecao, null, 2));

  const resultado =
    SOUSA_API_EXECUTOR_UNIVERSAL(
      selecao,
      {
        texto: "Responda apenas: CEREBRAS ONLINE"
      }
    );

  Logger.log("===== RESULTADO =====");
  Logger.log(JSON.stringify(resultado, null, 2));
}
