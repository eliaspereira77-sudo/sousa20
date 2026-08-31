/**
 * ==========================================================
 * SOUSA 2.0 — CAMADA DE PERSISTÊNCIA GOOGLE DRIVE (GAS)
 * ==========================================================
 * Módulo oficial para gravação, organização, versionamento e
 * recuperação de estado operacional e artefatos no Google Drive.
 *
 * Princípio: "A IA pode perder o contexto da conversa. 
 *            O SOUSA não pode perder o estado oficial do projeto."
 * ==========================================================
 */

var SOUSA_DRIVE_CONFIG = {
  PASTA_RAIZ_NOME: "SOUSA_2.0_PRODUCAO",
  PASTA_ESTADOS_NOME: "ESTADOS_PERSISTENTES",
  PASTA_ARTEFATOS_NOME: "ARTEFATOS_CAMPAINHAS",
  PASTA_HISTORICO_NOME: "HISTORICO_VERSOES"
};

/**
 * Obtém ou cria uma pasta no Google Drive pelo nome.
 */
function SOUSA_DRIVE_obterOuCriarPasta(nomePasta, parentId) {
  var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
  var pastas = parent.getFoldersByName(nomePasta);
  if (pastas.hasNext()) {
    return pastas.next();
  }
  return parent.createFolder(nomePasta);
}

/**
 * Salva um estado persistente (JSON) no Google Drive com controle de duplicatas e versão.
 */
function SOUSA_DRIVE_salvarEstado(chave, payload, opcoes) {
  var opts = opcoes || {};
  try {
    var pastaRaiz = SOUSA_DRIVE_obterOuCriarPasta(SOUSA_DRIVE_CONFIG.PASTA_RAIZ_NOME);
    var pastaEstados = SOUSA_DRIVE_obterOuCriarPasta(SOUSA_DRIVE_CONFIG.PASTA_ESTADOS_NOME, pastaRaiz.getId());
    
    var nomeArquivo = "STATE_" + String(chave).toUpperCase() + ".json";
    var conteudoStr = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    
    // Verificar se já existe versão oficial
    var arquivos = pastaEstados.getFilesByName(nomeArquivo);
    var arquivoExistente = arquivos.hasNext() ? arquivos.next() : null;
    
    if (arquivoExistente) {
      // Backup da versão anterior na pasta HISTORICO antes de atualizar
      if (opts.manterHistorico !== false) {
        var pastaHist = SOUSA_DRIVE_obterOuCriarPasta(SOUSA_DRIVE_CONFIG.PASTA_HISTORICO_NOME, pastaRaiz.getId());
        var timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        var nomeBackup = "BACKUP_" + timestamp + "_" + nomeArquivo;
        pastaHist.createFile(nomeBackup, arquivoExistente.getBlob().getDataAsString(), "application/json");
      }
      arquivoExistente.setContent(conteudoStr);
      return {
        ok: true,
        status: "ATUALIZADO",
        id: arquivoExistente.getId(),
        nome: nomeArquivo,
        url: arquivoExistente.getUrl(),
        timestamp: new Date().toISOString()
      };
    } else {
      var novoArquivo = pastaEstados.createFile(nomeArquivo, conteudoStr, "application/json");
      
      // Registrar ID no ScriptProperties para busca instantânea por O(1)
      try {
        PropertiesService.getScriptProperties().setProperty("SOUSA_DRIVE_ID_" + chave, novoArquivo.getId());
      } catch (e) {}

      return {
        ok: true,
        status: "CRIADO",
        id: novoArquivo.getId(),
        nome: nomeArquivo,
        url: novoArquivo.getUrl(),
        timestamp: new Date().toISOString()
      };
    }
  } catch (erro) {
    return {
      ok: false,
      status: "ERRO_GRAVACAO",
      mensagem: erro.message || String(erro)
    };
  }
}

/**
 * Carrega um estado persistente (JSON) do Google Drive.
 */
function SOUSA_DRIVE_carregarEstado(chave, opcoes) {
  try {
    // 1. Tentar busca rápida por ID em ScriptProperties
    var fileId = null;
    try {
      fileId = PropertiesService.getScriptProperties().getProperty("SOUSA_DRIVE_ID_" + chave);
    } catch (e) {}

    if (fileId) {
      try {
        var arq = DriveApp.getFileById(fileId);
        var content = arq.getBlob().getDataAsString();
        return {
          ok: true,
          status: "CARREGADO_POR_ID",
          id: fileId,
          dados: JSON.parse(content),
          timestamp: arq.getLastUpdated().toISOString()
        };
      } catch (e) {
        // ID desatualizado ou inacessível, cai para busca por nome
      }
    }

    // 2. Busca por nome na pasta de estados
    var pastaRaiz = SOUSA_DRIVE_obterOuCriarPasta(SOUSA_DRIVE_CONFIG.PASTA_RAIZ_NOME);
    var pastaEstados = SOUSA_DRIVE_obterOuCriarPasta(SOUSA_DRIVE_CONFIG.PASTA_ESTADOS_NOME, pastaRaiz.getId());
    var nomeArquivo = "STATE_" + String(chave).toUpperCase() + ".json";
    var arquivos = pastaEstados.getFilesByName(nomeArquivo);

    if (!arquivos.hasNext()) {
      return {
        ok: false,
        status: "NAO_ENCONTRADO",
        chave: chave
      };
    }

    var arquivo = arquivos.next();
    var conteudo = arquivo.getBlob().getDataAsString();
    
    // Atualiza ID cache
    try {
      PropertiesService.getScriptProperties().setProperty("SOUSA_DRIVE_ID_" + chave, arquivo.getId());
    } catch (e) {}

    return {
      ok: true,
      status: "CARREGADO_POR_NOME",
      id: arquivo.getId(),
      dados: JSON.parse(conteudo),
      timestamp: arquivo.getLastUpdated().toISOString()
    };
  } catch (erro) {
    return {
      ok: false,
      status: "ERRO_LEITURA",
      mensagem: erro.message || String(erro)
    };
  }
}

/**
 * Registra checkpoint operacional de campanha no Google Drive.
 */
function SOUSA_DRIVE_registrarCheckpoint(campaignId, state) {
  if (!campaignId) return { ok: false, status: "CAMPAIGN_ID_REQUIRED" };
  var payload = {
    campaignId: campaignId,
    state: state,
    checkpointTime: new Date().toISOString()
  };
  return SOUSA_DRIVE_salvarEstado("CAMPAIGN_" + campaignId, payload);
}

/**
 * Recupera o último checkpoint de campanha para retomada automática.
 */
function SOUSA_DRIVE_recuperarUltimoCheckpoint(campaignId) {
  if (!campaignId) return { ok: false, status: "CAMPAIGN_ID_REQUIRED" };
  return SOUSA_DRIVE_carregarEstado("CAMPAIGN_" + campaignId);
}

/**
 * Teste funcional da camada de persistência em Drive.
 */
function testarSousaDrivePersistencia() {
  var chaveTeste = "TESTE_CONTINUIDADE";
  var payloadTeste = {
    versao: "2.0.0",
    modulos: ["GUARDIAN", "PERSISTENCIA", "DRIVE_API"],
    status: "OPERACIONAL_99_99",
    timestamp: new Date().toISOString()
  };

  var esc = SOUSA_DRIVE_salvarEstado(chaveTeste, payloadTeste);
  Logger.log("Salvar: " + JSON.stringify(esc));

  var rec = SOUSA_DRIVE_carregarEstado(chaveTeste);
  Logger.log("Carregar: " + JSON.stringify(rec));

  var ok = esc.ok && rec.ok && rec.dados.versao === "2.0.0";
  return {
    ok: ok,
    status: ok ? "PASS" : "FAIL",
    salvamento: esc,
    recuperacao: rec
  };
}
