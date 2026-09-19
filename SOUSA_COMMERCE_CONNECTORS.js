/**
 * SOUSA 2.0 — CONECTORES DE COMÉRCIO, MARKETPLACE & AFILIADOS
 */
(function(root) {
  'use strict';
  root.SousaCommerce = {
    marketplaces: [
      { nome: "Mercado Livre", chave: "MERCADO_LIVRE_API_KEY", tipo: "API", status: "ATIVO" },
      { nome: "Shopee", chave: "SHOPEE_API_KEY", tipo: "API", status: "ATIVO" },
      { nome: "Temu", chave: "TEMU_API_KEY", tipo: "API", status: "ATIVO" },
      { nome: "Magalu", tipo: "LINK_AFILIADO", status: "ATIVO" },
      { nome: "Amazon", tipo: "LINK_AFILIADO", status: "ATIVO" }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
