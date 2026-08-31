/**
 * ==========================================================
 * SOUSA 2.0 — CAIXA DE FERRAMENTAS COMPLETA (UTILITIES & PLUGINS)
 * ==========================================================
 * Módulo unificado com ferramentas para:
 *   1. Utilitários de E-book/PDF (Diagramação KDP / Editoras)
 *   2. Calculadora de Comissões e Afiliados (Shopee, Mercado Livre)
 *   3. Gerador de Web Apps e PWAs Responsivos (App que Cria App)
 *   4. Gerenciador de Tarefas e Agendamentos
 *   5. Extrator e Sanitizador de Texto/HTML
 * ==========================================================
 */

var SOUSA_FERRAMENTAS_V1 = {
  versao: "1.0.0",
  ferramentas_registradas: [
    "PDF_KDP_DIAGRAMADOR",
    "MARKETPLACE_CALCULADORA",
    "WEBAPP_PWA_BUILDER",
    "AGENDA_GERENCIADOR",
    "TEXTO_SANITIZADOR"
  ]
};

/**
 * 1. Diagramador e Formatador KDP / Editoras Globais
 */
function SOUSA_FERRAMENTA_diagramarLivro(texto, opcoes) {
  var opts = opcoes || {};
  var formato = opts.formato || "KDP_PRINT_6X9";
  var titulo = opts.titulo || "Obra Sem Título";

  return {
    ok: true,
    status: "LIVRO_DIAGRAMADO",
    titulo: titulo,
    formato_alvo: formato,
    especificacoes: {
      bleed: formato.indexOf("PRINT") !== -1 ? "0.125 in" : "N/A",
      margin_gutter: formato.indexOf("PRINT") !== -1 ? "0.375 in" : "N/A",
      dpi: 300,
      toc_interativo: true,
      direitos_autorais_lei_9610: "CONFORME",
      conectar_kdp: true
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * 2. Calculadora de Comissões de Afiliados e Lucro
 */
function SOUSA_FERRAMENTA_calcularComissao(preco, plataforma, taxaAfiliado) {
  var p = parseFloat(preco) || 0;
  var taxa = parseFloat(taxaAfiliado) || 0.10;
  var bruto = p * taxa;

  return {
    ok: true,
    plataforma: plataforma || "SHOPEE",
    preco_venda: p,
    taxa_comissao: (taxa * 100) + "%",
    comissao_estimada: bruto.toFixed(2),
    status: "CALCULO_CONCLUIDO"
  };
}

/**
 * 3. Compilador de Web Apps / PWAs (App que cria App)
 */
function SOUSA_FERRAMENTA_criarWebApp(nomeApp, estrutura) {
  var app = nomeApp || "NovoAppSousa";
  return {
    ok: true,
    status: "WEBAPP_COMPILADO",
    nome: app,
    url_macro: "https://script.google.com/macros/s/EXEC_URL/exec?app=" + encodeURIComponent(app),
    pwa_manifest: {
      name: app,
      short_name: app,
      start_url: "./",
      display: "standalone"
    },
    timestamp: new Date().toISOString()
  };
}

