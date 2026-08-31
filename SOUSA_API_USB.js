/**
 * ==========================================================
 * SOUSA 2.0 — USB DE APIs
 * Contrato único de conexão com recursos de IA
 * ==========================================================
 *
 * FLUXO:
 * CAPACIDADE → API MANAGER → USB DE APIs → PROVEDOR
 *
 * A USB:
 * - recebe o recurso selecionado;
 * - localiza seu contrato na cascata;
 * - consulta o Cofre;
 * - identifica o protocolo;
 * - executa ou informa a condição de execução.
 *
 * As credenciais NÃO ficam neste arquivo.
 */

function SOUSA_API_USB_obterContrato(nomeProvedor) {

  const api = SOUSA_APIS_CASCATA.find(
    item => item.nome === nomeProvedor
  );

  if (!api) {
    throw new Error(
      "USB_APIS: provedor não cadastrado: " + nomeProvedor
    );
  }

  return api;
}


function SOUSA_API_USB_obterCredencial(api) {

  const nomeChave = api.api_key || api.chave || null;

  if (!nomeChave) {
    return {
      necessaria: false,
      disponivel: true,
      nome: null,
      valor: null
    };
  }

  const valor = obterChaveAPI(nomeChave);

  return {
    necessaria: true,
    disponivel: !!valor,
    nome: nomeChave,
    valor: valor || null
  };
}


function SOUSA_API_USB_preparar(selecao) {

  if (!selecao || !selecao.recurso_escolhido) {
    throw new Error(
      "USB_APIS: seleção de recurso inválida."
    );
  }

  const provedor = selecao.recurso_escolhido;

  const api =
    SOUSA_API_USB_obterContrato(provedor);

  const credencial =
    SOUSA_API_USB_obterCredencial(api);

  if (!credencial.disponivel) {

    return {
      ok: false,
      status: "CREDENCIAL_AUSENTE",
      provedor: provedor,
      credencial: credencial.nome
    };

  }

  return {

    ok: true,

    status: "RECURSO_PRONTO",

    provedor: api.nome,

    modelo: api.modelo || null,

    tipo: api.tipo || null,

    endpoint: api.endereco || null,

    protocolo: api.protocolo || null,

    credencial:
      credencial.necessaria
        ? "DISPONIVEL"
        : "NAO_NECESSARIA"

  };

}


/**
 * Executor público da USB.
 *
 * A execução física de cada protocolo será concentrada
 * nesta camada, nunca no SOUSA_Core.js.
 */
function SOUSA_API_USB_executar(selecao, contexto) {

  const preparado =
    SOUSA_API_USB_preparar(selecao);

  if (!preparado.ok) {
    return preparado;
  }

  if (!contexto || !contexto.prompt) {
    return {
      ok: false,
      status: "CONTEXTO_AUSENTE",
      provedor: preparado.provedor
    };
  }

  if (preparado.protocolo === "GEMINI_GENERATE_CONTENT") {

    const chave =
      obterChaveAPI(
        SOUSA_API_USB_obterContrato(
          preparado.provedor
        ).api_key
      );

    if (!chave) {
      return {
        ok: false,
        status: "CREDENCIAL_AUSENTE",
        provedor: preparado.provedor
      };
    }

    const endpoint =
      preparado.endpoint +
      preparado.modelo +
      ":generateContent?key=" +
      encodeURIComponent(chave);

    const payload = {
      contents: [
        {
          parts: [
            {
              text: contexto.prompt
            }
          ]
        }
      ]
    };

    const resposta = UrlFetchApp.fetch(
      endpoint,
      {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }
    );

    const codigo = resposta.getResponseCode();
    const corpo = resposta.getContentText();

    return {
      ok: codigo >= 200 && codigo < 300,
      status: codigo >= 200 && codigo < 300
        ? "EXECUCAO_CONCLUIDA"
        : "ERRO_PROVEDOR",
      provedor: preparado.provedor,
      modelo: preparado.modelo,
      protocolo: preparado.protocolo,
      codigo_http: codigo,
      resposta: corpo
    };
  }

  return {
    ok: false,
    status: "PROTOCOLO_NAO_IMPLEMENTADO",
    provedor: preparado.provedor,
    modelo: preparado.modelo,
    protocolo: preparado.protocolo
  };
}
