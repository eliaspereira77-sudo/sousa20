/**
 * SOUSA 2.0 — GERENCIADOR OFICIAL DE ATUALIZAÇÕES
 * Detecta: versão, deployment, URL operacional e divergência.
 * NÃO faz deploy automaticamente.
 */

const SOUSA_UPDATE_CONFIG = {
  sistema: "SOUSA 2.0",
  interface: "CONSELHO / SOUSA IA",
  controle: "FUNDADOR"
};

/**
 * Estado oficial conhecido pelo sistema.
 */
function SOUSA_OBTER_ESTADO_OFICIAL() {
  const p = PropertiesService.getScriptProperties();

  return {
    versao: p.getProperty("SOUSA_VERSAO_OFICIAL") || null,
    deployment: p.getProperty("SOUSA_DEPLOYMENT_OFICIAL") || null,
    url: p.getProperty("SOUSA_URL_OFICIAL") || null,
    hash: p.getProperty("SOUSA_HASH_OFICIAL") || null
  };
}

/**
 * Identidade desta execução.
 */
function SOUSA_OBTER_IDENTIDADE_PRODUCAO() {
  let deployments = [];

  try {
    if (typeof ScriptApp.getDeploymentInfo === "function") {
      deployments = ScriptApp.getDeploymentInfo().map(function(d) {
        return {
          id: d.getDeploymentId(),
          versao: d.getVersionNumber(),
          descricao: d.getDescription()
        };
      });
    }
  } catch (e) {
    deployments = [{
      erro: String(e)
    }];
  }

  return {
    sistema: SOUSA_UPDATE_CONFIG.sistema,
    interface: SOUSA_UPDATE_CONFIG.interface,
    deployments: deployments,
    timestamp: new Date().toISOString()
  };
}

/**
 * Endpoint para o painel consultar o estado.
 */
function SOUSA_VERIFICAR_ATUALIZACAO() {
  const oficial = SOUSA_OBTER_ESTADO_OFICIAL();
  const producao = SOUSA_OBTER_IDENTIDADE_PRODUCAO();

  const versoesProducao = producao.deployments
    .map(function(d) {
      return d.versao;
    })
    .filter(Boolean);

  const versaoOficial = oficial.versao
    ? String(oficial.versao)
    : null;

  const producaoPossuiVersao =
    versoesProducao.indexOf(versaoOficial) !== -1;

  return {
    ok: true,

    sistema: SOUSA_UPDATE_CONFIG.sistema,

    estado: versaoOficial && producaoPossuiVersao
      ? "ATUALIZADO"
      : "VERIFICAR_ATUALIZACAO",

    atualizacao_detectada:
      !!versaoOficial && !producaoPossuiVersao,

    fonte_da_verdade: oficial,

    producao: producao,

    acao_automatica: false,

    deploy_automatico: false,

    soberania: "FUNDADOR",

    timestamp: new Date().toISOString()
  };
}

/**
 * Registra explicitamente a versão aprovada pelo Fundador.
 * Não executa deploy.
 */
function SOUSA_REGISTRAR_VERSAO_OFICIAL(dados) {

  if (!dados || !dados.versao) {
    throw new Error("Versão obrigatória.");
  }

  const p = PropertiesService.getScriptProperties();

  p.setProperty(
    "SOUSA_VERSAO_OFICIAL",
    String(dados.versao)
  );

  if (dados.deployment) {
    p.setProperty(
      "SOUSA_DEPLOYMENT_OFICIAL",
      String(dados.deployment)
    );
  }

  if (dados.url) {
    p.setProperty(
      "SOUSA_URL_OFICIAL",
      String(dados.url)
    );
  }

  if (dados.hash) {
    p.setProperty(
      "SOUSA_HASH_OFICIAL",
      String(dados.hash)
    );
  }

  return {
    ok: true,
    mensagem: "Versão oficial registrada.",
    deploy_executado: false,
    soberania: "FUNDADOR"
  };
}

/**
 * Ponto único de consulta do painel.
 */
function SOUSA_STATUS_ATUALIZACAO() {
  return SOUSA_VERIFICAR_ATUALIZACAO();
}
