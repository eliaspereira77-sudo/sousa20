
// =====================================================
// SOUSA 2.0 â€” API MANAGER INTEGRADO
// SeleÃ§Ã£o inteligente + COFRE + CASCATA
// =====================================================

function SOUSA_API_MANAGER_selecionar(capacidade) {

  const capacidadeNormalizada = capacidade.toUpperCase();

  const disponiveis = [];

  SOUSA_APIS_CASCATA.forEach(api => {

    let chaveDisponivel = true;

    if (api.api_key || api.chave) {
      chaveDisponivel = !!obterChaveAPI(api.api_key || api.chave);
    }

    if (chaveDisponivel && api.status === "ATIVO") {

      disponiveis.push({
        prioridade: api.prioridade,
        recurso: api.nome,
        chave: api.api_key || api.chave || "LOCAL"
      });

    }

  });


  if (disponiveis.length === 0) {

    return {
      capacidade_solicitada: capacidadeNormalizada,
      recurso_escolhido: null,
      status: "SEM_RECURSO_DISPONIVEL"
    };

  }


  const escolhido = disponiveis[0];


  return {

    capacidade_solicitada: capacidadeNormalizada,

    recurso_escolhido: escolhido.recurso,

    chave_consultada: escolhido.chave,

    prioridade: escolhido.prioridade,

    credencial: "ENCONTRADA",

    status: "PRONTO PARA EXECUÃ‡ÃƒO"

  };

}


// =====================================================
// TESTE
// =====================================================

function testarSOUSA_API_MANAGER() {

  const resultado =
    SOUSA_API_MANAGER_selecionar("CODIGO");


  Logger.log(
    JSON.stringify(resultado, null, 2)
  );

}

