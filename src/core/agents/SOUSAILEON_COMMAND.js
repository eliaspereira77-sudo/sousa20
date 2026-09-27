/**
 * 🦾 SOUSAILEON COMMAND V1
 * Extensão operacional SOUSA 2.0
 * Filosofia:
 * Diagnosticar antes de agir.
 * Registrar antes de alterar.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const LOG_PATH = path.join(
    "07_LOG",
    "SOUSAILEON",
    "SOUSAILEON_COMMAND.log"
);

function log(mensagem) {

    const pasta = path.dirname(LOG_PATH);

    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
    }

    fs.appendFileSync(
        LOG_PATH,
        `[${new Date().toLocaleString()}] ${mensagem}\n`
    );
}

console.log("🦾 SOUSAILEON COMMAND V1");
console.log("==============================");

console.log("Sistema: SOUSA 2.0");
console.log("Ação: ACIONAR BRAÇO");

log("SOUSAILEON COMMAND iniciado.");

try {

    execSync("node SOUSAILEON_ARM_V2.js", {
        stdio: "inherit"
    });

    log("SOUSAILEON ARM V2 executado com sucesso.");

}
catch(error) {

    console.log("❌ Falha na execução do braço.");

    log(
        "ERRO: " + error.message
    );
}

console.log("");
console.log("🦾 SOUSAILEON COMMAND finalizado.");