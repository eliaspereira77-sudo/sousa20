/**
 * SOUSA 2.0 — COMPOSITOR DA SOUSA IA
 * ==========================================================
 * Planeja uma inteligência composta pela união de capacidades.
 * Não conhece fornecedores e não chama APIs diretamente.
 *
 * Refinamento: o plano agora é um GRAFO DE CAPACIDADES. Uma mesma
 * USB pode atender várias capacidades e uma capacidade pode ter
 * múltiplos candidatos. O executor continua sendo a camada de execução.
 */

var SOUSA_IA_VERSAO = "0.2-COMPOSICAO";

function SOUSA_IA_normalizarNecessidades(necessidades) {
  if (!Array.isArray(necessidades)) return [];
  return SOUSA_CAP_normalizarLista(necessidades);
}

function SOUSA_IA_listarRecursos() {
  if (typeof SOUSA_USB_listar !== "function") return [];
  return SOUSA_USB_listar({ apenas_operacional: true }).filter(function(usb) {
    return usb && usb.autorizado === true;
  });
}

function SOUSA_IA_scoreRecurso(recurso, capacidade, contexto) {
  var caps = SOUSA_CAP_normalizarLista(recurso.capacidades);
  if (caps.indexOf(capacidade) === -1) return -Infinity;
  var prioridade = Number(recurso.prioridade);
  if (!isFinite(prioridade)) prioridade = 100;
  var score = 1000 - prioridade;
  var preferidos = contexto && Array.isArray(contexto.recursos_preferidos)
    ? contexto.recursos_preferidos : [];
  if (preferidos.indexOf(recurso.id) !== -1) score += 500;
  if (contexto && contexto.recurso_excluido === recurso.id) score -= 100000;
  return score;
}

/**
 * Planeja sem executar. Pode combinar recursos diferentes.
 */
function SOUSA_IA_planejar(necessidades, contexto) {
  var req = SOUSA_IA_normalizarNecessidades(necessidades);
  if (!req.length) return {ok:false, status:"CAPACIDADES_AUSENTES", plano:[]};

  contexto = contexto || {};
  var recursos = SOUSA_IA_listarRecursos();
  var usados = {};
  var plano = [];
  var faltantes = [];
  var alternativas = {};

  req.forEach(function(cap) {
    var candidatos = recursos.filter(function(r) {
      return SOUSA_CAP_normalizarLista(r.capacidades).indexOf(cap) !== -1;
    }).sort(function(a,b) {
      return SOUSA_IA_scoreRecurso(b, cap, contexto) -
             SOUSA_IA_scoreRecurso(a, cap, contexto);
    });

    alternativas[cap] = candidatos.map(function(r){ return r.id; });

    var melhor = null;
    for (var i=0; i<candidatos.length; i++) {
      if (!usados[candidatos[i].id] || contexto.permitir_reuso === true) {
        melhor = candidatos[i]; break;
      }
    }

    if (!melhor) {
      faltantes.push(cap);
      return;
    }

    usados[melhor.id] = true;
    plano.push({
      etapa: plano.length + 1,
      capacidade: cap,
      recurso: melhor.id,
      modo: "RECURSO_ESPECIALIZADO",
      alternativas: alternativas[cap]
    });
  });

  return {
    ok: faltantes.length === 0,
    status: faltantes.length ? "PLANO_PARCIAL" : "PLANO_COMPOSTO",
    versao: SOUSA_IA_VERSAO,
    necessidades: req,
    plano: plano,
    faltantes: faltantes,
    alternativas: alternativas,
    contexto: contexto
  };
}

function SOUSA_IA_prepararConsolidacao(resultados, contexto) {
  return {
    ok: true,
    status: "CONSOLIDACAO_PREPARADA",
    resultados: Array.isArray(resultados) ? resultados : [],
    contexto: contexto || {},
    capacidade: "CONSOLIDACAO",
    proxima_etapa: "SINTETIZAR"
  };
}
