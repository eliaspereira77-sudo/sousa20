/**
 * ==========================================================
 * SOUSA 2.0 — MOTOR DE POLÍTICA (operacional + atuações)
 * ==========================================================
 * Responsabilidades:
 *   - Inferir capacidade a partir da intenção
 *   - Escolher USB/provedor com critérios reais
 *     (custo, latência, prioridade, saúde, cooldown)
 *   - Decidir fallback e gerenciar saúde dos conectores
 * ==========================================================
 */

var SOUSA_POLITICA_COOLDOWN_STORE = {};
var SOUSA_POLITICA_SAUDE_STORE = {};

/**
 * Inferência de capacidade a partir do texto.
 */
function SOUSA_POLITICA_inferirCapacidade(texto) {
  var t = String(texto || "").toLowerCase();

  if (/código|code|função|bug|script|js|python/.test(t)) return "CODIGO";
  if (/capítulo|livro|romance|escreva|continue a história/.test(t)) return "PRODUCAO_LIVRO";
  if (/imagem|ilustr|capa|desenho/.test(t)) return "IMAGEM";
  if (/vídeo|video|roteiro|cena/.test(t)) return "VIDEO";
  if (/áudio|audio|voz|narração/.test(t)) return "AUDIO";
  if (/pdf|relatório|documento oficial/.test(t)) return "DOCUMENTO_PDF";
  if (/analis|compar|decid|estratég/.test(t)) return "ANALISE";
  if (/memória|buscar|lembrar|embedding/.test(t)) return "BUSCA_MEMORIA";

  return "TEXTO";
}

/**
 * Estimativa de custo por USB/capacidade.
 */
function SOUSA_POLITICA_custo(usb) {
  if (!usb) return 0;
  var tipo = (usb.metadados && usb.metadados.natureza) || usb.tipo || "API_CLOUD";
  if (tipo === "IA_LOCAL" || tipo === "LOCAL") return 0;
  if (usb.id === "GEMINI" || usb.id === "GROQ" || usb.id === "CEREBRAS") return 0.0001;
  return 0.0005;
}

/**
 * Registro e consulta de saúde de uma USB.
 */
function SOUSA_POLITICA_saude(usbId, registro) {
  if (!usbId) return { ok: true, status: "SAUDE_DESCONHECIDA" };
  var id = String(usbId).toUpperCase();
  if (registro && typeof registro === "object") {
    SOUSA_POLITICA_SAUDE_STORE[id] = {
      ok: registro.ok !== false,
      ultima_checagem: new Date().toISOString(),
      falhas_consecutivas: registro.falha ? ((SOUSA_POLITICA_SAUDE_STORE[id] && SOUSA_POLITICA_SAUDE_STORE[id].falhas_consecutivas || 0) + 1) : 0,
      detalhe: registro.detalhe || "Saúde atualizada"
    };
  }
  return SOUSA_POLITICA_SAUDE_STORE[id] || { ok: true, falhas_consecutivas: 0, status: "SAUDAVEL" };
}

/**
 * Registra ou verifica cooldown de uma USB/provedor.
 */
function SOUSA_POLITICA_cooldown(provedorOuUsbId, motivo, duracaoSegundos) {
  if (!provedorOuUsbId) return false;
  var key = String(provedorOuUsbId).toUpperCase();
  var agora = new Date().getTime();

  if (motivo) {
    var dur = (duracaoSegundos || 60) * 1000;
    SOUSA_POLITICA_COOLDOWN_STORE[key] = {
      ate: agora + dur,
      motivo: motivo,
      inicio: new Date().toISOString()
    };
    return true;
  }

  var cd = SOUSA_POLITICA_COOLDOWN_STORE[key];
  if (cd && cd.ate > agora) {
    return true; // Em cooldown
  }
  if (cd && cd.ate <= agora) {
    delete SOUSA_POLITICA_COOLDOWN_STORE[key];
  }
  return false; // Fora de cooldown
}

/**
 * Seleção por política inteligente.
 */
function SOUSA_POLITICA_selecionar(capacidade, contexto) {
  var cap = String(capacidade || "TEXTO").toUpperCase();

  // Registry dinâmico: seleciona diretamente o melhor
  // recurso operacional fora de cooldown.
  if (typeof SOUSA_USB_listar === "function") {
    var candidatos = SOUSA_USB_listar({
      capacidade: cap,
      apenas_operacional: true
    }) || [];

    candidatos = candidatos.filter(function(u) {
      return !SOUSA_POLITICA_cooldown(u.id);
    });

    candidatos.sort(function(a, b) {
      return ((a.prioridade === undefined || a.prioridade === null) ? 100 : a.prioridade) - ((b.prioridade === undefined || b.prioridade === null) ? 100 : b.prioridade);
    });

    if (candidatos.length > 0) {
      var escolhido = candidatos[0];

      return {
        ok: true,
        origem: "REGISTRY",
        capacidade: cap,
        recurso_escolhido: escolhido.id,
        usb: escolhido,
        politica: "REGISTRY_PRIORIDADE"
      };
    }
  }

  // Fallback legado.
  if (typeof SOUSA_API_MANAGER_selecionar === "function") {
    var sel = SOUSA_API_MANAGER_selecionar(cap);

    if (
      sel &&
      sel.recurso_escolhido &&
      !SOUSA_POLITICA_cooldown(sel.recurso_escolhido)
    ) {
      return {
        ok: true,
        origem: "CASCATA",
        capacidade: cap,
        recurso_escolhido: sel.recurso_escolhido,
        politica: "CASCATA_PRIORIDADE",
        detalhe: sel
      };
    }
  }

  return {
    ok: false,
    status: "SEM_RECURSO",
    capacidade: cap,
    mensagem:
      "Nenhum recurso disponível (ou todos em cooldown) para a capacidade solicitada."
  };
}
/**
 * Política de fallback inteligente.
 */
function SOUSA_POLITICA_proximoFallback(capacidade, excluirIds, contexto) {
  var cap = String(capacidade || "TEXTO").toUpperCase();
  var excluidos = excluirIds || [];

  if (typeof SOUSA_USB_listar === "function") {
    var operacionais = SOUSA_USB_listar({ apenas_operacional: true }) || [];
    var candidatos = operacionais.filter(function(u) {
      if (excluidos.indexOf(u.id) !== -1) return false;
      if (SOUSA_POLITICA_cooldown(u.id)) return false;
      return (u.capacidades || []).some(function(c) { return String(c).toUpperCase() === cap; });
    });

    candidatos.sort(function(a, b) {
      return ((a.prioridade === undefined || a.prioridade === null) ? 100 : a.prioridade) - ((b.prioridade === undefined || b.prioridade === null) ? 100 : b.prioridade);
    });

    if (candidatos.length > 0) {
      var proximo = candidatos[0];
      return {
        ok: true,
        status: "FALLBACK_DISPONIVEL",
        capacidade: cap,
        recurso_escolhido: proximo.id,
        usb: proximo,
        politica: "FALLBACK_PRIORIDADE"
      };
    }
  }

  return {
    ok: false,
    status: "FALLBACK_ESGOTADO",
    capacidade: cap,
    excluidos: excluidos,
    mensagem: "Todos os candidatos de fallback falharam ou estão indisponíveis."
  };
}


