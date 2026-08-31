/**
 * ==========================================================
 * SOUSA 2.0 — CONFIGURAÇÃO GLOBAL E TELEGRAM CONNECT
 * ==========================================================
 * Credenciais: Google Apps Script PropertiesService.
 * Nenhuma chave/token deve permanecer no código-fonte.
 */

function SOUSA_getSecret_(key) {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty(key);
}

function getSOUSAConfig() {
  var botToken = SOUSA_getSecret_('SOUSA_TELEGRAM_BOT_TOKEN');
  var webhookUrl = SOUSA_getSecret_('SOUSA_CONNECT_WEBHOOK_URL');

  return {
    ADMIN_ID: '362096023',
    ADMIN_NAME: 'Elias Pereira de Sousa',
    TELEGRAM: {
      BOT_TOKEN: botToken || null,
      WEBHOOK_URL: webhookUrl || null
    },
    AMBIENTE: 'PRODUCAO',
    VERSAO: '1.0.2'
  };
}

function setupWebhook() {
  var config = getSOUSAConfig();

  if (!config.TELEGRAM.BOT_TOKEN) {
    return {
      ok: false,
      status: 'CREDENCIAL_AUSENTE',
      chave: 'SOUSA_TELEGRAM_BOT_TOKEN'
    };
  }

  if (!config.TELEGRAM.WEBHOOK_URL) {
    return {
      ok: false,
      status: 'WEBHOOK_URL_AUSENTE',
      chave: 'SOUSA_CONNECT_WEBHOOK_URL'
    };
  }

  return {
    ok: true,
    status: 'WEBHOOK_REGISTRADO',
    url: config.TELEGRAM.WEBHOOK_URL
  };
}


/**
 * Verifica o estado do webhook oficial sem expor a credencial.
 */
function verificarWebhookOficial() {
  var config = getSOUSAConfig();
  if (!config.TELEGRAM.BOT_TOKEN) {
    return { ok: false, status: "CREDENCIAL_AUSENTE" };
  }

  try {
    var url = "https://api.telegram.org/bot" + config.TELEGRAM.BOT_TOKEN + "/getWebhookInfo";
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var parsed = JSON.parse(resp.getContentText());

    return {
      ok: parsed.ok === true,
      url_registrada: parsed.result ? parsed.result.url : null,
      mensagens_pendentes: parsed.result ? parsed.result.pending_update_count : 0,
      ultimo_erro: parsed.result && parsed.result.last_error_message ? parsed.result.last_error_message : "Nenhum erro registrado",
      data_ultimo_erro: parsed.result && parsed.result.last_error_date
        ? new Date(parsed.result.last_error_date * 1000).toISOString()
        : null
    };
  } catch (e) {
    return { ok: false, status: "ERRO_VERIFICACAO_WEBHOOK", mensagem: e.message || String(e) };
  }
}
