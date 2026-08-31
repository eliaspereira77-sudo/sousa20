/**
 * Testes dos novos encaixes SOUSA IA / Avatar.
 * Não requer chamadas externas.
 */
function testarEncaixesSOUSAIAAvatar() {
  var out = [];
  function t(nome, ok, detalhe) {
    out.push({nome:nome, ok:!!ok, detalhe:detalhe||""});
  }

  t("identidade_SOUSA_IA",
    !!SOUSA_IA_IDENTIDADE_V1 &&
    SOUSA_IA_IDENTIDADE_V1.papel === "INTELIGENCIA_COMPOSTA");

  t("catalogo_capacidades", !!SOUSA_CAPACIDADES_V1 &&
    SOUSA_CAPACIDADES_V1.TEXTO === "TEXTO");

  var inter = SOUSA_CAP_intersecao(["TEXTO","VISAO"], ["TEXTO","CODIGO"]);
  t("intersecao_capacidades", inter.length === 1 && inter[0] === "TEXTO");

  var av = SOUSA_AVATAR_prepararSaida({ok:true,texto:"teste"}, {canal:"TEXTO"});
  t("avatar_saida", av.ok === true && av.texto === "teste");

  var mem = SOUSA_IA_memoriaContrato("CONSULTAR", {chave:"teste"});
  t("contrato_memoria", mem.status === "ENCAIXE_MEMORIA");

  return {
    ok: out.every(function(x){return x.ok;}),
    total: out.length,
    falhas: out.filter(function(x){return !x.ok;}),
    testes: out
  };
}
