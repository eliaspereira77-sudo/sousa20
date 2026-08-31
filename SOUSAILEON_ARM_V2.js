/**
 * ==========================================================
 * SOUSA 2.0
 * SOUSAILEON ARM V2
 * Executor Controlado
 *
 * Núcleo Orquestrador decide.
 * SOUSAILEON executa.
 * Log registra.
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");

const COMANDO = "COMANDO_SOUSAILEON.json";

const LOG_DIR = "07_LOG/SOUSAILEON";

const LOG_FILE = path.join(
    LOG_DIR,
    "SOUSAILEON_EXECUCAO.log"
);


function registrar(mensagem){

    if(!fs.existsSync(LOG_DIR)){
        fs.mkdirSync(LOG_DIR, {
            recursive:true
        });
    }

    const data = new Date()
        .toLocaleString("pt-BR");

    fs.appendFileSync(
        LOG_FILE,
        data + " | " + mensagem + "\n"
    );
}


function executarV2(){

    console.log("");
    console.log("🦾 SOUSAILEON ARM V2");
    console.log("==============================");


    if(!fs.existsSync(COMANDO)){

        console.log(
            "❌ Comando não encontrado."
        );

        registrar(
            "Falha: comando inexistente."
        );

        return;
    }


    const comando = JSON.parse(
        fs.readFileSync(
            COMANDO,
            "utf8"
        )
    );


    console.log(
        "Ação:",
        comando.acao
    );


    if(comando.autorizado !== true){

        console.log(
            "🔒 Ação bloqueada."
        );

        registrar(
            "Comando sem autorização."
        );

        return;
    }


    console.log(
        "✅ Autorização confirmada."
    );


    if(comando.acao === "DIAGNOSTICO"){

        console.log(
            "🔎 Diagnóstico assistido executado."
        );

        registrar(
            "Diagnóstico executado."
        );

    }
    else {

        console.log(
            "⚠️ Ação não reconhecida."
        );

        registrar(
            "Ação desconhecida."
        );

    }


    console.log("");
    console.log(
        "🦾 SOUSAILEON ARM V2 finalizado."
    );

}


executarV2();