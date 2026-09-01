/**
 * ==========================================================
 * SOUSA 2.0
 * SOUSAILEON ARM V2
 * Executor Controlado
 *
 * Núcleo Orquestrador decide.
 * SOUSAILEON executa.
 * Log registra.
 *
 * V2.1 - adiciona a ação APLICAR_CORRECAO:
 *   - so aplica se autorizado === true E aprovada === true
 *     (duas travas independentes: autorizado vem do fluxo normal
 *     de comando; aprovada confirma que essa correcao especifica
 *     foi revisada, nao so autorizada em geral)
 *   - sempre faz backup do arquivo original antes de sobrescrever
 *   - recusa se o arquivo alvo nao existir (nao "corrige" o que
 *     nao existe - isso seria criar, nao corrigir)
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

const BACKUP_DIR = path.join(
    LOG_DIR,
    "backups"
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


function timestampArquivo(){
    return new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
}


function fazerBackup(caminhoArquivo){

    if(!fs.existsSync(BACKUP_DIR)){
        fs.mkdirSync(BACKUP_DIR, {
            recursive:true
        });
    }

    const nomeBase = path.basename(caminhoArquivo);
    const nomeBackup = nomeBase + "." + timestampArquivo() + ".bak";
    const caminhoBackup = path.join(BACKUP_DIR, nomeBackup);

    fs.copyFileSync(caminhoArquivo, caminhoBackup);

    return caminhoBackup;
}


function executarDiagnostico(){

    console.log(
        "🔎 Diagnóstico assistido executado."
    );

    registrar(
        "Diagnóstico executado."
    );
}


function executarAplicarCorrecao(comando){

    if(comando.aprovada !== true){

        console.log(
            "🔒 Correção não aprovada explicitamente. Recusado."
        );

        registrar(
            "APLICAR_CORRECAO recusado: campo 'aprovada' ausente ou false."
        );

        return;
    }

    if(!comando.arquivo || !comando.conteudo_novo){

        console.log(
            "❌ Comando incompleto: faltam 'arquivo' ou 'conteudo_novo'."
        );

        registrar(
            "APLICAR_CORRECAO recusado: comando incompleto."
        );

        return;
    }

    if(!fs.existsSync(comando.arquivo)){

        console.log(
            "❌ Arquivo alvo não existe: " + comando.arquivo
        );

        registrar(
            "APLICAR_CORRECAO recusado: arquivo inexistente (" + comando.arquivo + ")."
        );

        return;
    }

    const caminhoBackup = fazerBackup(comando.arquivo);

    const tamanhoAntes = fs.statSync(comando.arquivo).size;

    fs.writeFileSync(comando.arquivo, comando.conteudo_novo, "utf8");

    const tamanhoDepois = fs.statSync(comando.arquivo).size;

    console.log(
        "✅ Correção aplicada em: " + comando.arquivo
    );
    console.log(
        "   Backup salvo em: " + caminhoBackup
    );
    console.log(
        "   Tamanho antes: " + tamanhoAntes + " bytes | depois: " + tamanhoDepois + " bytes"
    );

    registrar(
        "APLICAR_CORRECAO aplicado em " + comando.arquivo +
        " | backup: " + caminhoBackup +
        " | antes: " + tamanhoAntes + "b, depois: " + tamanhoDepois + "b" +
        (comando.problema ? " | problema: " + comando.problema : "")
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

        executarDiagnostico();

    }
    else if(comando.acao === "APLICAR_CORRECAO"){

        executarAplicarCorrecao(comando);

    }
    else {

        console.log(
            "⚠️ Ação não reconhecida."
        );

        registrar(
            "Ação desconhecida: " + comando.acao
        );

    }


    console.log("");
    console.log(
        "🦾 SOUSAILEON ARM V2 finalizado."
    );

}


executarV2();
