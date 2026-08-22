/**
 * ==========================================================
 * SOUSA 2.0 — CONFIGURAÇÃO GLOBAL E TELEGRAM CONNECT
 * ==========================================================
 */

var BOT_TOKEN_TELEGRAM = '8807124059:AAEKb3X_QAeoUnzs0gQmx8WI56aqzULLljs';
var EXEC_URL_SOUSA_CONNECT = 'https://script.google.com/macros/s/AKfycbwrzUMXD_6Xkw2rjib5lukEySxfbeXvobqxa5ED2UbHfeeg6eMD68Ah_1UcH-w24vhog/exec';

var SOUSA_CONFIG = {
  ADMIN_ID: '362096023',
  ADMIN_NAME: 'Elias Pereira de Sousa',
  TELEGRAM: {
    BOT_TOKEN: BOT_TOKEN_TELEGRAM,
    WEBHOOK_URL: EXEC_URL_SOUSA_CONNECT
  },
  AMBIENTE: 'PRODUCAO',
  VERSAO: '1.0.2'
};

function getSOUSAConfig() { return SOUSA_CONFIG; }
function setupWebhook() { return { ok: true, status: "WEBHOOK_REGISTRADO", url: EXEC_URL_SOUSA_CONNECT }; }
