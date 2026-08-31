/**
 * SOUSA 2.0 — DESCOBERTA DO ENDPOINT OPERACIONAL
 *
 * O painel não deve precisar conhecer manualmente a URL.
 *
 * PRINCÍPIO:
 * DESCOBRIR -> COMPARAR -> ALERTAR
 * PROMOVER -> somente com autorização do Fundador.
 */

const SOUSA_ENDPOINT_DISCOVERY = {
  sistema: "SOUSA 2.0",
  protocolo: "ENDPOINT_AUTO_DISCOVERY_V1",
  soberania: "FUNDADOR"
};

function SOUSA_DESCOBRIR_ENDPOINT() {

  const props = PropertiesService.getScriptProperties();

  const url = props.getProperty("SOUSA_URL_OFICIAL") || null;
  const deployment = props.getProperty("SOUSA_DEPLOYMENT_OFICIAL") || null;
  const versao = props.getProperty("SOUSA_VERSAO_OFICIAL") || null;
  const hash = props.getProperty("SOUSA_HASH_OFICIAL") || null;

  return {
    ok: !!url,
    sistema: SOUSA_ENDPOINT_DISCOVERY.sistema,

    endpoint: {
      url: url,
      deployment: deployment,
      versao: versao,
      hash: hash
    },

    estado: url
      ? "ENDPOINT_IDENTIFICADO"
      : "ENDPOINT_NAO_REGISTRADO",

    descoberta_automatica: true,
    deploy_automatico: false,
    promocao_automatica: false,

    soberania: SOUSA_ENDPOINT_DISCOVERY.soberania,

    timestamp: new Date().toISOString()
  };
}


/**
 * Ponto único para o painel.
 */
function SOUSA_ENDPOINT_OPERACIONAL() {
  return SOUSA_DESCOBRIR_ENDPOINT();
}
