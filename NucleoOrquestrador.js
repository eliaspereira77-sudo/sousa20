/*
==========================================================
⚙️ SOUSA 2.0 - NÚCLEO ORQUESTRADOR
Leitor de Alertas do Cão de Guarda
==========================================================
*/

const fs = require("fs");
const path = require("path");

console.log("⚙️ SOUSA 2.0 - NÚCLEO ORQUESTRADOR");
console.log("Lendo alertas do sistema...\n");


const ARQUIVO_ALERTA = path.join(
    "07_LOG",
    "MonitorSintaxe",
    "ALERTA_SOUSA.json"
);


if (!fs.existsSync(ARQUIVO_ALERTA)) {

    console.log("⚠️ Nenhum alerta encontrado.");
    console.log("Execute primeiro o MonitorSintaxe.");

    process.exit();

}


const alerta = JSON.parse(
    fs.readFileSync(ARQUIVO_ALERTA, "utf8")
);


console.log("==============================");
console.log("SISTEMA:", alerta.sistema);
console.log("MÓDULO:", alerta.modulo);
console.log("DATA:", alerta.data);
console.log("STATUS:", alerta.status);
console.log("ERROS:", alerta.quantidadeErros);
console.log("==============================\n");


if (alerta.status === "NORMAL") {

    console.log("✅ SOUSA 2.0 OPERANDO NORMALMENTE");

}
else {

    console.log("🚨 ATENÇÃO - ALERTA RECEBIDO");

    console.log(
        "Consultar relatório:",
        alerta.relatorio
    );

}

