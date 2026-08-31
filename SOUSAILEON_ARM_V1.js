/**
 * ==========================================================
 * SOUSA 2.0
 * SOUSAILEON ARM V1
 * Braço Executor do Sistema
 *
 * Função:
 * Receber comandos autorizados do Núcleo Orquestrador
 * e executar ações controladas.
 *
 * Regra:
 * O braço executa.
 * O Núcleo decide.
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");

const SISTEMA = "SOUSA 2.0";
const MODULO = "SOUSAILEON ARM";

const PAINEL = "PAINEL_SOUSA.json";
const LOG_DIR = path.join("07_LOG", "SOUSAILEON");

const LOG_FILE = path.join(
    LOG_DIR,
    "SOUSAILEON_EXECUCAO.log"
);


// Criar pasta de log
function prepararAmbiente(){

    if(!fs.existsSync(LOG_DIR)){
        fs.mkdirSync(LOG_DIR, {
            recursive:true
        });
    }

}


// Registrar ações
function registrarLog(mensagem){

    const data = new Date()
        .toLocaleString("pt-BR");

    const linha =
`${data} | ${mensagem}\n`;

    fs.appendFileSync(
        LOG_FILE,
        linha
    );

}


// Ler painel do sistema
function lerSistema(){

    if(!fs.existsSync(PAINEL)){

        return {

            status:"ERRO",
            mensagem:"PAINEL_SOUSA.json não encontrado."

        };

    }


    return JSON.parse(
        fs.readFileSync(
            PAINEL,
            "utf8"
        )
    );

}


// Executar ações
function executarV1(){

    console.log("");
    console.log("🦾 SOUSAILEON ARM V1");
    console.log("==============================");


    prepararAmbiente();


    const sistema = lerSistema();


    console.log(
        "Sistema:",
        sistema.sistema
    );


    console.log(
        "Status:",
        sistema.status
    );


    registrarLog(
        "Braço iniciado."
    );


    if(
        sistema.status === "NORMAL"
    ){

        console.log("");
        console.log(
            "🟢 Sistema normal."
        );

        console.log(
            "🦾 Nenhuma ação necessária."
        );


        registrarLog(
            "Nenhuma intervenção necessária."
        );


    }

    else {


        console.log("");
        console.log(
            "🔴 ALERTA DETECTADO."
        );


        console.log(
            "Aguardando comando do Núcleo Orquestrador."
        );


        registrarLog(
            "Alerta detectado. Aguardando autorização."
        );

    }


    console.log("");
    console.log(
        "SOUSAILEON ARM finalizado."
    );


}


// Inicialização

try {

    executarV1();

}

catch(erro){

    console.log(
        "❌ Falha no SOUSAILEON ARM:"
    );

    console.log(
        erro.message
    );


    registrarLog(
        "ERRO: " + erro.message
    );

}