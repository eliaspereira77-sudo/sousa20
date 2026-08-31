/**
 * SOUSA 2.0 — DESCOBERTA DE CAPACIDADES
 * ----------------------------------------------------------
 * Função:
 *   Identificar capacidades ausentes/parciais e estruturar
 *   oportunidades de expansão do SOUSA 2.0.
 *
 * Regra:
 *   DESCUBRIR → ANALISAR → PROPOR
 *   Nunca instalar/alterar produção automaticamente.
 */

var SOUSA_CAPACIDADES_CORE = {
  versao: "1.0.0",

  analisar: function(capacidade, contexto) {
    var cap = String(capacidade || "").trim().toUpperCase();

    if (!cap) {
      return {
        ok: false,
        status: "CAPACIDADE_AUSENTE"
      };
    }

    var existentes = [];

    if (typeof SOUSA_USB_listar === "function") {
      existentes = SOUSA_USB_listar({
        apenas_operacional: true
      });
    }

    var encontrada = existentes.filter(function(u) {
      return (u.capacidades || []).some(function(c) {
        return String(c).toUpperCase() === cap;
      });
    });

    return {
      ok: true,
      status: encontrada.length
        ? "CAPACIDADE_DISPONIVEL"
        : "CAPACIDADE_NAO_LOCALIZADA",

      capacidade: cap,

      recursos_existentes: encontrada.map(function(u) {
        return {
          id: u.id,
          provedor: u.provedor,
          protocolo: u.protocolo,
          modelo: u.modelo || null
        };
      }),

      lacuna: encontrada.length === 0,

      contexto: contexto || {},

      proxima_acao: encontrada.length
        ? "REUTILIZAR_RECURSO_EXISTENTE"
        : "PESQUISAR_FERRAMENTAS_COMPATIVEIS"
    };
  },

  comparar: function(capacidade, candidatos) {
    var cap = String(capacidade || "").trim().toUpperCase();
    var lista = Array.isArray(candidatos) ? candidatos : [];

    return {
      ok: true,
      capacidade: cap,
      candidatos: lista.map(function(c) {
        return {
          nome: c.nome || c.id || "DESCONHECIDO",
          tipo: c.tipo || "FERRAMENTA",
          capacidades: c.capacidades || [],
          compatibilidade: c.compatibilidade || null,
          protocolo: c.protocolo || null,
          observacao: c.observacao || ""
        };
      })
    };
  },

  propor: function(capacidade, candidato) {
    return {
      ok: true,
      status: "PROPOSTA_GERADA",
      capacidade: String(capacidade || "").toUpperCase(),
      candidato: candidato || null,
      estrategia: "ADAPTAR_NO_SOUSA_LAB",
      producao: false,
      autorizacao_humana: true
    };
  }
};

function SOUSA_CAPABILITY_DISCOVERY_analisar(capacidade, contexto) {
  return SOUSA_CAPACIDADES_CORE.analisar(capacidade, contexto);
}

function SOUSA_CAPABILITY_DISCOVERY_comparar(capacidade, candidatos) {
  return SOUSA_CAPACIDADES_CORE.comparar(capacidade, candidatos);
}

function SOUSA_CAPABILITY_DISCOVERY_propor(capacidade, candidato) {
  return SOUSA_CAPACIDADES_CORE.propor(capacidade, candidato);
}
