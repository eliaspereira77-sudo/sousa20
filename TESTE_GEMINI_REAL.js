function testarGeminiReal() {

  const payload = {
    module: "mentor",
    history: [
      {
        role: "user",
        content: "Responda apenas: SISTEMA ONLINE"
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