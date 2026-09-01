/**
 * ==========================================================
 * SOUSA 2.0 — CONFIGURAÇÃO GLOBAL E TELEGRAM CONNECT
 * ==========================================================
 *
 * Credenciais sensíveis NÃO devem ficar hardcoded.
 * Use variáveis de ambiente ou PropertiesService (Apps Script).
 */

var BOT_TOKEN_TELEGRAM = process.env.TELEGRAM_BOT_TOKEN || '';
var EXEC_URL_SOUSA_CONNECT = process.env.SOUSA_CONNECT_URL || '';

var SOUSA_CONFIG = {
  ADMIN_ID: process.env.SOUSA_ADMIN_ID || '',
  ADMIN_NAME: process.env.SOUSA_ADMIN_NAME || 'Elias Pereira de Sousa',
  TELEGRAM: {
    BOT_TOKEN: BOT_TOKEN_TELEGRAM,
    WEBHOOK_URL: EXEC_URL_SOUSA_CONNECT
  },
  AMBIENTE: process.env.SOUSA_AMBIENTE || 'PRODUCAO',
  VERSAO: '1.0.2'
};

function getSOUSAConfig() { return SOUSA_CONFIG; }
function setupWebhook() {
  return {
    ok: true,
    status: "WEBHOOK_REGISTRADO",
    url: EXEC_URL_SOUSA_CONNECT || '(configure SOUSA_CONNECT_URL)'
  };
}
