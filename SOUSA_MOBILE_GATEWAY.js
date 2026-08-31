/*
==========================================================
SOUSA 2.0
SOUSA MOBILE GATEWAY
Primeira ponte Smartphone
==========================================================
*/

const fs = require("fs");
const path = require("path");

console.log("?? SOUSA 2.0 - MOBILE GATEWAY");
console.log("Lendo status do sistema...\n");


const ARQUIVO_STATUS = path.join(
    "07_LOG",
    "MonitorSintaxe",
    "ALERTA_SOUSA.json"
);


if (!fs.existsSync(ARQUIVO_STATUS)) {

    console.log("?? Nenhum status encontrado.");
    process.exit();

}


const status = JSON.parse(
    fs.readFileSync(ARQUIVO_STATUS, "utf8")
);


const resposta = {

    sistema: status.sistema,
    modulo: status.modulo,
    status: status.status,
    erros: status.quantidadeErros,
    ultimaVerificacao: status.data

};


console.log("==============================");
console.log("?? STATUS MOBILE SOUSA 2.0");
console.log("==============================");

console.log(JSON.stringify(resposta, null, 2));


console.log("\n? Gateway funcionando.");
