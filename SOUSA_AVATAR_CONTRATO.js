/**
 * SOUSA 2.0 — CONTRATO DE INTERFACE AVATAR SOUSA
 * ==========================================================
 * Avatar = presença/interface. SOUSA IA = inteligência.
 * O Avatar nunca decide política nem executa diretamente.
 */

var SOUSA_AVATAR_V1 = {
  nome: "AVATAR SOUSA",
  versao_contrato: "0.2",
  estado: "PREPARADO",
  entradas: ["TEXTO", "AUDIO", "EVENTO"],
  saidas: ["TEXTO", "TTS", "ANIMACAO", "ESTADO_VISUAL"],
  estados_visuais: ["NEUTRO","OUVINDO","PENSANDO","EXECUTANDO","AGUARDANDO_AUTORIZACAO","CONCLUIDO","ERRO"]
};

function SOUSA_AVATAR_receberEvento(evento) {
  return {
    ok: true,
    status: "EVENTO_NORMALIZADO",
    avatar: SOUSA_AVATAR_V1.nome,
    evento: evento || {}
  };
}

function SOUSA_AVATAR_estadoParaCiclo(estadoCiclo) {
  var mapa = {
    RECEBIDA:"OUVINDO", PLANEJANDO:"PENSANDO", EXECUTANDO:"EXECUTANDO",
    VERIFICANDO:"PENSANDO", RECUPERANDO:"PENSANDO", CONSOLIDANDO:"PENSANDO",
    REGISTRANDO:"PENSANDO", CONCLUIDA:"CONCLUIDO",
    AGUARDANDO_AUTORIZACAO:"AGUARDANDO_AUTORIZACAO", FALHA:"ERRO"
  };
  return mapa[estadoCiclo] || "NEUTRO";
}

function SOUSA_AVATAR_prepararSaida(resultado, preferencias) {
  preferencias = preferencias || {};
  return {
    ok: true,
    status: "SAIDA_AVATAR_PREPARADA",
    canal: preferencias.canal || "TEXTO",
    texto: resultado && (resultado.texto || resultado.mensagem) || "",
    estado_visual: preferencias.estado_visual || "NEUTRO",
    tts: {
      necessario: !!preferencias.tts,
      voz: preferencias.voz || null,
      idioma: preferencias.idioma || "pt-BR"
    },
    animacao: {
      necessario: !!preferencias.animacao,
      perfil: preferencias.animacao_perfil || null
    }
  };
}

function SOUSA_AVATAR_ttsContrato(texto, preferencias) {
  return {
    ok: false, status: "ENCAIXE_TTS",
    texto: String(texto || ""), preferencias: preferencias || {}
  };
}
