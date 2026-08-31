// =============================================================================
// SOUSA 2.0 — Módulo de Recuperação Autônoma & Ciclo de Vida de Campanha
// Arquivo: SOUSA_Orquestrador_Recuperacao.js
// Finalidade: Elimina as 3 limitações operacionais identificadas no Teste (08/2026):
// 1. Recuperação Automática de Contexto (Teste 3)
// 2. Gerenciamento Persistente de Ciclo de Vida de Campanha (Teste 8)
// 3. Retomada Autônoma sem ID manual via Checkpoint Ativo (Teste 15)
// =============================================================================

/**
 * 1. RECUPERAÇÃO AUTOMÁTICA DE CONTEXTO (Teste 3)
 * Salva e recupera o estado contextual ativo da sessão de trabalho.
 */
function S20_salvarContextoAtivo(dados) {
  try {
    var props = PropertiesService.getScriptProperties();
    var contexto = {
      timestamp: new Date().toISOString(),
      ultimoEstado: dados.ultimoEstado || 'EM_ANDAMENTO',
      ultimaAcao: dados.ultimaAcao || 'NENHUMA',
      pendencias: dados.pendencias || [],
      proximoPasso: dados.proximoPasso || 'AGUARDANDO_COMANDO',
      trabalhoId: dados.trabalhoId || 'S20_SESSION_' + new Date().getTime(),
      arquivosRelacionados: dados.arquivosRelacionados || []
    };
    props.setProperty('SOUSA_CONTEXTO_ATIVO', JSON.stringify(contexto));
    return { ok: true, contexto: contexto };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function S20_obterContextoAtivo() {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('SOUSA_CONTEXTO_ATIVO');
    if (!raw) {
      return {
        ok: true,
        contexto: {
          timestamp: new Date().toISOString(),
          ultimoEstado: 'INICIALIZADO',
          ultimaAcao: 'BOOT',
          pendencias: [],
          proximoPasso: 'PRONTO_PARA_USO',
          trabalhoId: 'S20_MAIN',
          arquivosRelacionados: []
        }
      };
    }
    return { ok: true, contexto: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 2. GERENCIAMENTO COMPLETO DE CICLO DE VIDA DE CAMPANHA (Teste 8)
 * Executa as etapas: INICIAR -> REGISTRAR_PASSO -> PAUSAR -> RECUPERAR -> RETOMAR -> CONCLUIR
 */
function S20_gerenciarCampanha(action, campaignId, payload) {
  try {
    if (!campaignId) {
      return { ok: false, error: 'CAMPAIGN_GUARDIAN: campaignId é obrigatório' };
    }
    var props = PropertiesService.getScriptProperties();
    var key = 'S20_CAMPANHA_' + campaignId.toUpperCase();
    var raw = props.getProperty(key);
    var campanha = raw ? JSON.parse(raw) : null;
    var agora = new Date().toISOString();

    switch (action) {
      case 'iniciar':
        campanha = {
          campaignId: campaignId,
          status: 'EM_ANDAMENTO',
          criadoEm: agora,
          atualizadoEm: agora,
          passoAtual: 1,
          passosExecutados: [],
          payloadInicial: payload || {},
          proximoPasso: payload?.proximoPasso || 'EXECUTAR_PASSO_1'
        };
        break;

      case 'registrar_passo':
        if (!campanha) return { ok: false, error: 'Campanha não encontrada' };
        campanha.status = 'EM_ANDAMENTO';
        campanha.atualizadoEm = agora;
        campanha.passosExecutados.push({
          passo: campanha.passoAtual,
          timestamp: agora,
          detalhes: payload || {}
        });
        campanha.passoAtual += 1;
        if (payload?.proximoPasso) campanha.proximoPasso = payload.proximoPasso;
        break;

      case 'pausar':
        if (!campanha) return { ok: false, error: 'Campanha não encontrada' };
        campanha.status = 'PAUSADA';
        campanha.atualizadoEm = agora;
        campanha.motivoPausa = payload?.motivo || 'PAUSA_SOLICITADA';
        break;

      case 'recuperar':
        if (!campanha) return { ok: false, error: 'Campanha não encontrada' };
        return { ok: true, campanha: campanha };

      case 'retomar':
        if (!campanha) return { ok: false, error: 'Campanha não encontrada' };
        campanha.status = 'EM_ANDAMENTO';
        campanha.atualizadoEm = agora;
        break;

      case 'concluir':
        if (!campanha) return { ok: false, error: 'Campanha não encontrada' };
        campanha.status = 'CONCLUIDA';
        campanha.atualizadoEm = agora;
        campanha.proximoPasso = 'CAMPANHA_FINALIZADA';
        break;

      default:
        return { ok: false, error: 'Ação de campanha inválida: ' + action };
    }

    props.setProperty(key, JSON.stringify(campanha));
    S20_registrarCheckpoint('CHECKPOINT_CAMPANHA_' + campaignId, campanha.status, campanha.proximoPasso);

    return { ok: true, campanha: campanha };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * 3. RETOMADA AUTÔNOMA SEM ID MANUAL (Teste 15)
 * Registra o último checkpoint ativo e permite retomada direta.
 */
function S20_registrarCheckpoint(checkpointId, estado, proximoPasso) {
  try {
    var props = PropertiesService.getScriptProperties();
    var checkpoint = {
      checkpointId: checkpointId,
      estado: estado,
      proximoPasso: proximoPasso,
      timestamp: new Date().toISOString()
    };
    props.setProperty('SOUSA_CHECKPOINT_ATIVO', JSON.stringify(checkpoint));
    return { ok: true, checkpoint: checkpoint };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function S20_retomarUltimoCheckpoint() {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty('SOUSA_CHECKPOINT_ATIVO');
    if (!raw) {
      return { ok: false, msg: 'Nenhum checkpoint ativo encontrado.' };
    }
    var cp = JSON.parse(raw);
    return {
      ok: true,
      retomado: true,
      checkpointId: cp.checkpointId,
      estado: cp.estado,
      proximoPasso: cp.proximoPasso,
      timestamp: cp.timestamp
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}