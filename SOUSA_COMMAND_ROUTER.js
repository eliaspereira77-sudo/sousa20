/*
==========================================================
SOUSA 2.0
SOUSA COMMAND ROUTER
Roteador seguro de comandos
==========================================================
*/

const fs = require("fs");
const path = require("path");


console.log("?? SOUSA 2.0 - COMMAND ROUTER");
console.log("Encaminhando comando para valida��o...\n");


const ARQUIVO_FILA = path.join(
    "08_BLOCOS_SOUSA",
    "COMANDOS_MOBILE",
    "fila_pendente.json"
);


const ARQUIVO_RESPOSTA = path.join(
    "08_BLOCOS_SOUSA",
    "COMANDOS_MOBILE",
    "resposta_comando.json"
);


if (!fs.existsSync(ARQUIVO_FILA)) {

    console.log("?? Fila n�o encontrada.");
    process.exit();

}


const comando = JSON.parse(
    fs.readFileSync(ARQUIVO_FILA, "utf8")
);


function validarComandoRouter(comando) {

    if (comando.sistema !== "SOUSA 2.0") {

        return {
            status: "BLOQUEADO",
            motivo: "Destino inv�lido."
        };

    }


    if (comando.autorizacao !== "Fundador") {

        return {
            status: "BLOQUEADO",
            motivo: "Autoriza��o inv�lida."
        };

    }


    return {

        status: "APROVADO",
        motivo: "Comando autorizado pelo SOUSA 2.0."

    };

}


const resultado = validarComandoRouter(comando);


const resposta = {

    sistema: "SOUSA 2.0",
    comando: comando,
    resultado: resultado,
    data: new Date().toLocaleString("pt-BR")

};


fs.writeFileSync(
    ARQUIVO_RESPOSTA,
    JSON.stringify(resposta, null, 2)
);


console.log("==============================");
console.log("RESULTADO");
console.log("==============================");

console.log(JSON.stringify(resultado, null, 2));

console.log("\n?? Resposta criada:");
console.log(ARQUIVO_RESPOSTA);
