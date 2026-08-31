/*
==========================================================
SOUSA 2.0
SOUSA AUTHORIZATION GATE
Portal de Autoriza��o do Fundador
==========================================================
*/

const fs = require("fs");
const path = require("path");


console.log("??? SOUSA 2.0 - AUTHORIZATION GATE");
console.log("Criando solicita��o de autoriza��o...\n");


const PASTA_AUTORIZACAO = path.join(
    "08_BLOCOS_SOUSA",
    "COMANDOS_MOBILE"
);


const ARQUIVO_AUTORIZACAO = path.join(
    PASTA_AUTORIZACAO,
    "autorizacoes_pendentes.json"
);


if (!fs.existsSync(PASTA_AUTORIZACAO)) {

    fs.mkdirSync(PASTA_AUTORIZACAO, {
        recursive: true
    });

}


const solicitacao = {

    id: Date.now(),

    sistema: "SOUSA 2.0",

    solicitante: "Nucleo Orquestrador",

    autorizador: "Fundador",

    acao: "integracao_modulo",

    descricao:
    "Solicita��o de integra��o aguardando aprova��o.",

    status: "PENDENTE",

    data:
    new Date().toLocaleString("pt-BR")

};


fs.writeFileSync(
    ARQUIVO_AUTORIZACAO,
    JSON.stringify(solicitacao, null, 2)
);


console.log("==============================");
console.log("AUTORIZA��O GERADA");
console.log("==============================");

console.log(
    JSON.stringify(solicitacao, null, 2)
);


console.log("\n?? Arquivo criado:");
console.log(ARQUIVO_AUTORIZACAO);
