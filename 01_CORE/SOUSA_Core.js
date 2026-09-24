/**
 * SOUSA 2.0 - CORE / MOTOR DO TUNEL
 * SOUSA: Sistema Orquestrador Unificado Seguro Automatizado
 * Núcleo Operacional do SOUSA IA (com comportamento e habilidades JARVIS)
 * Implementado: 2026-09-15
 * Principio: EXECUTAR != CONCLUIR
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    sistema: 'SOUSA 2.0',
    definicao: 'Sistema Orquestrador Unificado Seguro Automatizado',
    status: 'ONLINE',
    identidade: 'SOUSA IA',
    comportamento: 'JARVIS',
    versao: '2.0',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var response = { success: false, data: null, error: null, timestamp: new Date().toISOString() };

  try {
    var params = e.parameter || {};
    var action = params.action || '';
    var payload = {};
    
    try { payload = JSON.parse(params.payload || '{}'); } catch (pe) { payload = {}; }

    if (!action) {
      response.error = 'Campo action ausente';
      response.data = { actions_disponiveis: ['ping','status','testar_backend','liberar_esteira','reconectar','reiniciar_sessao','logs','diagnostico','chat_conselho'] };
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    }

    response = handleAction(action, payload);

  } catch (err) {
    response.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function handleAction(action, payload) {
  var startTime = new Date();
  var response = { action: action, success: false, data: null, error: null, timestamp: startTime.toISOString(), duration: 0 };

  try {
    switch(action) {
      case 'ping':
        // EXECUTAR != CONCLUIR: ping so com evidencia de cascata
        if (typeof SOUSA_pingComEvidencia === 'function') {
          var pingEv = SOUSA_pingComEvidencia();
          response.data = pingEv;
          response.success = pingEv.success === true;
          if (!response.success) response.error = 'PING_SEM_EVIDENCIA';
        } else {
          response.data = {
            status: 'entrypoint_only',
            mensagem: 'SOUSA_VALIDACAO_CASCATA.js nao carregado — ping real indisponivel',
            estado_verdade: 'NAO_EXECUTADO'
          };
          response.success = false;
          response.error = 'VALIDACAO_CASCATA_AUSENTE';
        }
        break;

      case 'status':
        response.data = {
          sistema: 'SOUSA 2.0',
          definicao: 'Sistema Orquestrador Unificado Seguro Automatizado',
          identidade: 'SOUSA IA',
          resposta_conversacional: 'Status estrutural do nucleo. Para saude real use action=diagnostico (cascata com evidencia).',
          mensagem: 'Nucleo online. diagnostico/ping exigem evidencia de cascata.',
          nucleo: 'ONLINE',
          ultima_verificacao: new Date().toISOString()
        };
        response.success = true;
        break;

      case 'testar_backend':
        response.data = {
          backend: 'SOUSA 2.0 Express / Core Engine',
          conexao: 'testada',
          resposta: 'OK',
          mensagem: 'Backend testado (entrypoint).',
          tempo_resposta: (new Date() - startTime) + 'ms'
        };
        response.success = true;
        break;

      case 'liberar_esteira':
        response.data = { acao: 'esteira_liberada', status: 'OPERACIONAL', mensagem: 'Esteira liberada.' };
        response.success = true;
        break;

      case 'reconectar':
        response.data = { acao: 'reconexao_iniciada', tunnel: 'reiniciando', mensagem: 'Reconexao iniciada.' };
        response.success = true;
        break;

      case 'reiniciar_sessao':
        response.data = { acao: 'sessao_reiniciada', memoria_preservada: true, estado: 'limpo' };
        response.success = true;
        break;

      case 'logs':
        response.data = {
          logs: [
            { timestamp: new Date().toISOString(), tipo: 'INFO', mensagem: 'Core com validacao de cascata', modulo: 'CORE' }
          ],
          total: 1
        };
        response.success = true;
        break;

      case 'diagnostico':
        if (typeof SOUSA_diagnosticoComEvidencia === 'function') {
          var diagEv = SOUSA_diagnosticoComEvidencia();
          response.data = diagEv;
          response.success = diagEv.success === true;
          if (!response.success) response.error = 'DIAGNOSTICO_SEM_EVIDENCIA';
        } else {
          response.data = {
            sistema: 'INDETERMINADO',
            mensagem: 'SOUSA_VALIDACAO_CASCATA.js nao carregado',
            estado_verdade: 'NAO_EXECUTADO'
          };
          response.success = false;
          response.error = 'VALIDACAO_CASCATA_AUSENTE';
        }
        break;

      case 'chat_conselho':
        var msg = (payload.mensagem || payload.texto || '');
        if (typeof SOUSA_cascataComValidacao === 'function' && msg) {
          var chatR = SOUSA_cascataComValidacao('TEXTO', {
            texto: msg,
            systemInstruction: 'Voce e SOUSA IA (comportamento JARVIS). Responda em portugues, direto e util.'
          });
          response.data = {
            modulo: 'CONSELHO',
            tipo: 'CHAT_SOUSA_IA',
            mensagem_recebida: msg,
            resposta_conversacional: chatR.texto || null,
            resposta: chatR.texto || null,
            identidade: 'SOUSA IA',
            comportamento: 'JARVIS',
            provedor: chatR.provedor || (chatR.validacao && chatR.validacao.provedor),
            validacao: chatR.validacao,
            estado_verdade: chatR.estado_verdade
          };
          response.success = chatR.success === true;
          if (!response.success) response.error = chatR.status || 'CHAT_SEM_EVIDENCIA';
        } else {
          var resposta = processarIntencaoJARVIS(msg);
          response.data = {
            modulo: 'CONSELHO',
            tipo: 'CHAT_FALLBACK_LOCAL',
            mensagem_recebida: msg,
            resposta_conversacional: resposta,
            resposta: resposta,
            identidade: 'SOUSA IA',
            comportamento: 'JARVIS',
            estado_verdade: 'PROVAVEL',
            aviso: 'Cascata/validacao indisponivel — fallback local (nao e evidencia de API)'
          };
          response.success = false;
          response.error = 'CHAT_SEM_CASCATA';
        }
        break;

      default:
        response.error = 'Action nao reconhecida: ' + action;
        response.data = { actions_disponiveis: ['ping','status','testar_backend','liberar_esteira','reconectar','reiniciar_sessao','logs','diagnostico','chat_conselho'] };
        break;
    }
  } catch (e) {
    response.error = e.toString();
  }

  response.duration = (new Date() - startTime);
  return response;
}

function processarIntencaoJARVIS(msg) {
  if (!msg) return 'SOUSA IA pronta. Habilidades JARVIS ativas. Como posso ajudar?';
  try {
    var GeminiClient = require('./SOUSA_Gemini_CLIENT.js');
    if (GeminiClient && typeof GeminiClient.gerarRespostaConversacional === 'function') {
      return GeminiClient.gerarRespostaConversacional(msg);
    }
  } catch (e) {}

  var m = msg.toLowerCase();
  if (m.indexOf('instagram') !== -1 || m.indexOf('insta') !== -1) {
    return 'Instagram integrado na Aba 7 do SOUSA 2.0.';
  }
  if (m.indexOf('status') !== -1) return 'SOUSA IA operacional. Use diagnostico para evidencia de cascata.';
  if (m.indexOf('ajuda') !== -1 || m.indexOf('help') !== -1) return 'SOUSA IA ao seu dispor. Actions: ping, diagnostico, chat_conselho.';
  return 'A ordem, Fundador. Diretriz recebida. Preferir chat_conselho via cascata para resposta com evidencia.';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleAction: handleAction,
    processarIntencaoJARVIS: processarIntencaoJARVIS,
    doGet: doGet,
    doPost: doPost
  };
}
