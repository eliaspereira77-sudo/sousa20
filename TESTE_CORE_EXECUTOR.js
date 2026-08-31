function TESTE_CORE_EXECUTOR() {
  const payload = {
    module: "mentor",
    history: [
      {
        role: "user",
        content: "Responda apenas: CORE ONLINE"
      }
    ]
  };

  const resposta = doPost({
    postData: {
      contents: JSON.stringify(payload)
    }
  });

  Logger.log(resposta.getContent());
}
