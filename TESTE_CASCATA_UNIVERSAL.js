function TESTE_CASCATA_UNIVERSAL() {

  Logger.log("========================================");
  Logger.log("SOUSA 2.0 - TESTE UNIVERSAL DA CASCATA");
  Logger.log("========================================");

  SOUSA_APIS_CASCATA.forEach(api => {

    Logger.log("----------------------------------------");
    Logger.log(
      api.prioridade + "º - " +
      api.nome + " - " +
      api.modelo
    );

    const selecao = {
      recurso_escolhido: api.nome,
      chave_consultada: api.api_key || api.chave || "LOCAL",
      prioridade: api.prioridade
    };

    try {

      const resultado =
        SOUSA_API_EXECUTOR_UNIVERSAL(
          selecao,
          {
            texto: "Responda apenas: " + api.nome + " ONLINE"
          }
        );

      Logger.log(JSON.stringify(resultado, null, 2));

    } catch (erro) {

      Logger.log(JSON.stringify({
        ok: false,
        api: api.nome,
        erro: erro.message
      }, null, 2));

    }

  });

  Logger.log("========================================");
  Logger.log("FIM DO TESTE UNIVERSAL");
  Logger.log("========================================");
}
