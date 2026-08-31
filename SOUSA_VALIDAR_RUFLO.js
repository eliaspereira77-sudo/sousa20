const https = require("https");

const url = "https://raw.githubusercontent.com/ruvnet/ruflo/main/package.json";

https.get(url, function(res) {
let data = "";

res.on("data", function(chunk) {
data += chunk;
});

res.on("end", function() {
console.log("=== SOUSA 2.0 — VALIDAÇÃO EXTERNA RUFLO ===");
console.log("HTTP:", res.statusCode);

```
if (res.statusCode !== 200) {
  console.log("STATUS: NAO_VALIDADO");
  console.log("MOTIVO: package.json nao localizado no caminho testado.");
  return;
}

try {
  const pkg = JSON.parse(data);

  console.log("STATUS: REPOSITORIO_ACESSIVEL");
  console.log("NOME:", pkg.name || "NAO_INFORMADO");
  console.log("VERSAO:", pkg.version || "NAO_INFORMADA");
  console.log("DESCRICAO:", pkg.description || "NAO_INFORMADA");
  console.log("BIN:", JSON.stringify(pkg.bin || null, null, 2));
  console.log("DEPENDENCIAS:", Object.keys(pkg.dependencies || {}).length);
  console.log("DEV_DEPENDENCIAS:", Object.keys(pkg.devDependencies || {}).length);

  console.log("=== DECISAO ===");
  console.log("INSTALAR_AUTOMATICAMENTE: NAO");
  console.log("ALTERAR_PRODUCAO: NAO");
  console.log("PROXIMO_PASSO: ANALISAR_ARQUITETURA_RUFLO");

} catch (erro) {
  console.log("STATUS: FALHA_DE_LEITURA");
  console.log("ERRO:", erro.message);
}
```

});

}).on("error", function(erro) {
console.log("STATUS: FALHA_DE_CONEXAO");
console.log("ERRO:", erro.message);
});
