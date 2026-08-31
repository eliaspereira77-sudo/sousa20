/**
 * ==========================================================
 * SOUSA 2.0 — MARKETPLACE CASCATA & AFILIADOS
 * ==========================================================
 */

var SOUSA_MARKETPLACE_CASCATA = [
  { prioridade: 1, nome: "MERCADO_LIVRE", chave: "MERCADO_LIVRE_API_KEY", tipo: "MARKETPLACE_API", status: "ATIVO" },
  { prioridade: 2, nome: "SHOPEE", chave: "SHOPEE_API_KEY", tipo: "MARKETPLACE_API", status: "ATIVO" },
  { prioridade: 3, nome: "TEMU", chave: "TEMU_API_KEY", tipo: "MARKETPLACE_API", status: "ATIVO" },
  { prioridade: 4, nome: "MAGALU", tipo: "LINK_AFILIADO", status: "ATIVO" },
  { prioridade: 5, nome: "AMAZON", tipo: "LINK_AFILIADO", status: "ATIVO" }
];

function obterChaveMarketplace(nomeChave) {
  if (!nomeChave) return null;
  try {
    return PropertiesService.getScriptProperties().getProperty(String(nomeChave));
  } catch (e) {
    return null;
  }
}

function verificarMarketplacesConfigurados() {
  var configurados = [];
  SOUSA_MARKETPLACE_CASCATA.forEach(function(m) {
    var temChave = m.chave ? !!obterChaveMarketplace(m.chave) : true;
    configurados.push({
      nome: m.nome,
      prioridade: m.prioridade,
      tipo: m.tipo,
      operacional: temChave
    });
  });
  return { ok: true, marketplaces: configurados };
}
