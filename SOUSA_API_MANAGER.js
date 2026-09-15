
// =====================================================
// SOUSA 2.0 — API MANAGER INTEGRADO
// Seleção inteligente + COFRE + CASCATA
// =====================================================

function SOUSA_API_MANAGER_selecionar(capacidade) {

  const capacidadeNormalizada = String(capacidade || "TEXTO").toUpperCase();

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

  // Menor prioridade numérica = maior preferência (igual SOUSA_API_EXECUTOR_COM_CASCATA)
  disponiveis.sort(function (a, b) {
    return (a.prioridade || 100) - (b.prioridade || 100);
  });

  const escolhido = disponiveis[0];


  return {

    capacidade_solicitada: capacidadeNormalizada,

    recurso_escolhido: escolhido.recurso,

    chave_consultada: escolhido.chave,

    prioridade: escolhido.prioridade,

    credencial: "ENCONTRADA",

    status: "PRONTO PARA EXECUCAO",

    candidatos: disponiveis.length

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

