/*
==========================================================
SOUSA 2.0
SOUSA COMMAND LISTENER
Leitor seguro de comandos mobile
==========================================================
*/

const fs = require("fs");
const path = require("path");

console.log("?? SOUSA 2.0 - COMMAND LISTENER");
console.log("Verificando fila de comandos...\n");


const ARQUIVO_FILA = path.join(
    "08_BLOCOS_SOUSA",
    "COMANDOS_MOBILE",
    "fila_pendente.json"
);


if (!fs.existsSync(ARQUIVO_FILA)) {

    console.log("?? Fila de comandos n�o encontrada.");
    process.exit();

}


const conteudo = fs.readFileSync(
    ARQUIVO_FILA,
    "utf8"
);


if (!conteudo.trim()) {

    console.log("?? Nenhum comando pendente.");
    console.log("Sistema aguardando comandos.");

    process.exit();

}


let comando;

try {

    comando = JSON.parse(conteudo);

} catch (erro) {

    console.log("? Erro no formato do comando.");
    console.log(erro.message);

    process.exit();

}


console.log("==============================");
console.log("?? COMANDO RECEBIDO");
console.log("==============================");

console.log(JSON.stringify(comando, null, 2));

console.log("\n? Comando lido e validado.");
