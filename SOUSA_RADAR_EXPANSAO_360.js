var SOUSA_RADAR_EXPANSAO_360 = {
  versao: "1.0.0",
  estado: "OPERACIONAL",

  analisar: function(capacidade, contexto) {
    var alvo = String(capacidade || "").trim().toUpperCase();

    if (!alvo) {
      return {
        ok: false,
        status: "CAPACIDADE_AUSENTE"
      };
    }

    var recursosInternos = [];

    if (typeof SOUSA_USB_listar === "function") {
      recursosInternos = SOUSA_USB_listar({
        apenas_operacional: true
      }) || [];
    }

    var internos = recursosInternos.filter(function(recurso) {
      return (recurso.capacidades || []).some(function(c) {
        return String(c).toUpperCase() === alvo;
      });
    });

    return {
      ok: true,
      status: internos.length
        ? "CAPACIDADE_INTERNA_LOCALIZADA"
        : "LACUNA_INTERNA_IDENTIFICADA",

      capacidade: alvo,

      olho_interno: {
        localizada: internos.length > 0,
        recursos: internos.map(function(r) {
          return {
            id: r.id || null,
            provedor: r.provedor || null,
            protocolo: r.protocolo || null,
            modelo: r.modelo || null,
            capacidades: r.capacidades || []
          };
        })
      },

      olho_externo: {
        pesquisa_necessaria: internos.length === 0,
        criterio: "BUSCAR_FERRAMENTAS_COMPATIVEIS_POR_CAPACIDADE",
        contexto: contexto || {}
      },

      politica: {
        instalar_automaticamente: false,
        alterar_producao: false,
        exigir_validacao: true,
        exigir_autorizacao_humana: true
      },

      proxima_acao: internos.length
        ? "AVALIAR_MELHORIA_DO_RECURSO_EXISTENTE"
        : "PESQUISAR_E_COMPARAR_FERRAMENTAS_EXTERNAS"
    };
  },

  registrarCandidato: function(candidato) {
    var c = candidato || {};

    return {
      ok: true,
      status: "CANDIDATO_REGISTRADO",
      candidato: {
        nome: c.nome || c.id || "DESCONHECIDO",
        origem: c.origem || "EXTERNA",
        capacidades: c.capacidades || [],
        protocolo: c.protocolo || null,
        compatibilidade: c.compatibilidade || "NAO_AVALIADA",
        observacao: c.observacao || ""
      }
    };
  },

  comparar: function(capacidade, candidatos) {
    var lista = Array.isArray(candidatos) ? candidatos : [];

    return {
      ok: true,
      status: "COMPARACAO_GERADA",

      capacidade: String(capacidade || "")
        .trim()
        .toUpperCase(),

      candidatos: lista.map(function(c) {
        return {
          nome: c.nome || c.id || "DESCONHECIDO",
          capacidades: c.capacidades || [],
          compatibilidade: c.compatibilidade || "NAO_AVALIADA",
          protocolo: c.protocolo || null,

          prioridade:
            typeof c.prioridade === "number"
              ? c.prioridade
              : 100,

          estrategia: "ADAPTAR_NO_SOUSA_LAB"
        };
      })
    };
  },

  gerarMissao: function(capacidade, candidato) {
    return {
      ok: true,
      status: "MISSAO_EXPANSAO_GERADA",

      missao: {
        id: "EXPANSAO_" + Date.now(),
        origem: "SOUSA_2.0_RADAR_360",
        tipo: "EXPANSAO_DE_CAPACIDADE",

        capacidade: String(capacidade || "")
          .trim()
          .toUpperCase(),

        candidato: candidato || null,

        destino: "SOUSA_LAB",
        estrategia: "ADAPTAR_E_VALIDAR",

        restricoes: {
          instalar_automaticamente: false,
          alterar_producao: false,
          exigir_autorizacao_humana: true
        },

        fluxo: [
          "DESCOBRIR",
          "ANALISAR",
          "COMPARAR",
          "ADAPTAR",
          "TESTAR_NO_LAB",
          "VALIDAR",
          "PROPOR_PRODUCAO"
        ]
      }
    };
  },

  status: function() {
    return {
      ok: true,
      radar: "SOUSA_RADAR_EXPANSAO_360",
      versao: this.versao,
      estado: this.estado,

      olhos: {
        interno: true,
        externo: true
      },

      protecoes: {
        producao_automatica: false,
        autorizacao_humana: true
      }
    };
  }
};

function SOUSA_RADAR_360_analisar(capacidade, contexto) {
  return SOUSA_RADAR_EXPANSAO_360.analisar(capacidade, contexto);
}

function SOUSA_RADAR_360_comparar(capacidade, candidatos) {
  return SOUSA_RADAR_EXPANSAO_360.comparar(capacidade, candidatos);
}

function SOUSA_RADAR_360_missao(capacidade, candidato) {
  return SOUSA_RADAR_EXPANSAO_360.gerarMissao(capacidade, candidato);
}

function SOUSA_RADAR_360_status() {
  return SOUSA_RADAR_EXPANSAO_360.status();
}

if (typeof module !== "undefined") {
  module.exports = {
    SOUSA_RADAR_EXPANSAO_360: SOUSA_RADAR_EXPANSAO_360,
    SOUSA_RADAR_360_analisar: SOUSA_RADAR_360_analisar,
    SOUSA_RADAR_360_comparar: SOUSA_RADAR_360_comparar,
    SOUSA_RADAR_360_missao: SOUSA_RADAR_360_missao,
    SOUSA_RADAR_360_status: SOUSA_RADAR_360_status
  };
}
