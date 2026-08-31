function corrigirWebhookAgora() {
  var token = SOUSA_CONFIG.TELEGRAM.BOT_TOKEN;
  var url = ScriptApp.getService().getUrl();
  // O SEGREDO: O Telegram só funciona com /exec. O Google às vezes gera /dev.
  // Essa linha força a troca de /dev para /exec.
  url = url.replace('/dev', '/exec');
  
  var telegramUrl = 'https://api.telegram.org/bot' + token + '/setWebhook?url=' + url;
  UrlFetchApp.fetch(telegramUrl);
  Logger.log('Webhook corrigido para: ' + url);
}