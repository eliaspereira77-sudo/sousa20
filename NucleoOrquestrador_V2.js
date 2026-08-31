/*
==========================================================
âš™ï¸ SOUSA 2.0 - NÃšCLEO ORQUESTRADOR
Leitor de Alertas do CÃ£o de Guarda
==========================================================
*/

const fs = require("fs");
const path = require("path");
// ðŸ¦¾ SOUSAILEON
// Acionamento assistido
// NÃ£o altera arquivos automaticamente
// Apenas executa diagnÃ³stico

const { execSync } = require("child_process");

function acionarSOUSAILEON(){

    console.log("");
    console.log("ðŸ¦¾ Acionando SOUSAILEON...");

    try {

        execSync(
            "node SOUSAILEON_COMMAND.js",
            {stdio:"inherit"}
        );

    }
    catch(error){

        console.log(
            "âš ï¸ SOUSAILEON indisponÃ­vel."
        );

    }
}
console.log("âš™ï¸ SOUSA 2.0 - NÃšCLEO ORQUESTRADOR");
console.log("Lendo alertas do sistema...\n");


const ARQUIVO_ALERTA = path.join(
    "07_LOG",
    "MonitorSintaxe",
    "ALERTA_SOUSA.json"
);


if (!fs.existsSync(ARQUIVO_ALERTA)) {

    console.log("âš ï¸ Nenhum alerta encontrado.");
    console.log("Execute primeiro o MonitorSintaxe.");

    process.exit();

}


const alerta = JSON.parse(
    fs.readFileSync(ARQUIVO_ALERTA, "utf8")
);


console.log("==============================");
console.log("SISTEMA:", alerta.sistema);
console.log("MÃ“DULO:", alerta.modulo);
console.log("DATA:", alerta.data);
console.log("STATUS:", alerta.status);
console.log("ERROS:", alerta.quantidadeErros);
console.log("==============================\n");


if (alerta.status === "NORMAL") {

    console.log("âœ… SOUSA 2.0 OPERANDO NORMALMENTE");
    acionarSOUSAILEON();

}
else {

    console.log("ðŸš¨ ATENÃ‡ÃƒO - ALERTA RECEBIDO");

    console.log(
        "Consultar relatÃ³rio:",
        alerta.relatorio
    );

}

