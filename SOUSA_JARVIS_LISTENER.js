/**
 * ==========================================================
 * SOUSA 2.0 - LISTENER JARVIS (MINIMO)
 * ==========================================================
 * Objetivo: provar o loop "comando -> acao real no desktop"
 * sem precisar abrir chat e digitar toda vez.
 *
 * Como funciona:
 *   1) Fica rodando em segundo plano (roda continuamente).
 *   2) A cada poucos segundos, olha se o arquivo
 *      COMANDO_JARVIS.json mudou.
 *   3) Se mudou e tem "autorizado": true, executa a acao -
 *      mas SO se a acao estiver na lista branca abaixo.
 *   4) Loga tudo em 07_LOG/JARVIS/JARVIS_EXECUCAO.log.
 *   5) Marca o comando como processado (processado: true)
 *      pra nao executar a mesma coisa de novo.
 *
 * Principio de seguranca: lista branca pequena de proposito.
 * Nao executa comando arbitrario. Cada acao nova precisa ser
 * adicionada aqui explicitamente - "seguro por padrao", igual
 * o resto do SOUSA 2.0 ja segue.
 *
 * Como usar:
 *   node SOUSA_JARVIS_LISTENER.js
 *   (deixa essa janela aberta rodando; ou usa pm2/nssm depois
 *   pra virar servico de verdade)
 *
 * Como mandar um comando (de qualquer lugar - voce mesmo
 * editando o arquivo, ou futuramente via Drive/Add-on):
 *   escreva em COMANDO_JARVIS.json algo como:
 *   {
 *     "acao": "ABRIR_PASTA",
 *     "alvo": "C:\\Users\\Dionisio Lima\\Documents",
 *     "autorizado": true
 *   }
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ARQUIVO_COMANDO = "COMANDO_JARVIS.json";
const INTERVALO_MS = 3000;

const LOG_DIR = path.join("07_LOG", "JARVIS");
const LOG_FILE = path.join(LOG_DIR, "JARVIS_EXECUCAO.log");

// Lista branca de acoes permitidas. So isso executa - nada fora daqui.
const ACOES_PERMITIDAS = {

    ABRIR_PASTA: function(comando){
        if(!comando.alvo){
            throw new Error("Falta o campo 'alvo' (caminho da pasta).");
        }
        if(!fs.existsSync(comando.alvo)){
            throw new Error("Pasta nao existe: " + comando.alvo);
        }
        exec('explorer "' + comando.alvo + '"');
        return "Pasta aberta: " + comando.alvo;
    },

    RODAR_CAO_DE_GUARDA: function(){
        if(!fs.existsSync("MonitorSintaxe.js")){
            throw new Error("MonitorSintaxe.js nao encontrado na pasta atual.");
        }
        exec('node MonitorSintaxe.js', function(erro, stdout, stderr){
            const resultado = erro ? ("ERRO: " + erro.message) : stdout.trim();
            registrar("Cao de Guarda finalizou: " + resultado);
        });
        return "Cao de Guarda disparado (resultado sai no log em alguns segundos).";
    },

    ESVAZIAR_LIXEIRA: function(){
        exec('powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
        return "Comando de esvaziar lixeira enviado.";
    }

};


function registrar(mensagem){
    if(!fs.existsSync(LOG_DIR)){
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    const data = new Date().toLocaleString("pt-BR");
    fs.appendFileSync(LOG_FILE, data + " | " + mensagem + "\n");
}


function lerComando(){
    if(!fs.existsSync(ARQUIVO_COMANDO)){
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(ARQUIVO_COMANDO, "utf8"));
    } catch(e){
        registrar("Comando ilegivel (JSON invalido): " + e.message);
        return null;
    }
}


function marcarProcessado(comando){
    comando.processado = true;
    fs.writeFileSync(ARQUIVO_COMANDO, JSON.stringify(comando, null, 4), "utf8");
}


function processarComando(comando){

    if(comando.processado === true){
        return; // ja tratado, nao repete
    }

    console.log("Novo comando: " + comando.acao);

    if(comando.autorizado !== true){
        console.log("Bloqueado: sem autorizacao.");
        registrar("Comando '" + comando.acao + "' bloqueado: sem autorizacao.");
        marcarProcessado(comando);
        return;
    }

    const funcaoAcao = ACOES_PERMITIDAS[comando.acao];

    if(!funcaoAcao){
        console.log("Acao fora da lista branca: " + comando.acao);
        registrar("Comando '" + comando.acao + "' recusado: fora da lista branca.");
        marcarProcessado(comando);
        return;
    }

    try {
        const resultado = funcaoAcao(comando);
        console.log("OK: " + resultado);
        registrar("Comando '" + comando.acao + "' executado: " + resultado);
    } catch(erro){
        console.log("Falha: " + erro.message);
        registrar("Comando '" + comando.acao + "' falhou: " + erro.message);
    }

    marcarProcessado(comando);
}


function ciclo(){
    const comando = lerComando();
    if(comando){
        processarComando(comando);
    }
}


console.log("");
console.log("SOUSA JARVIS LISTENER - rodando");
console.log("Acoes permitidas: " + Object.keys(ACOES_PERMITIDAS).join(", "));
console.log("Observando " + ARQUIVO_COMANDO + " a cada " + (INTERVALO_MS/1000) + "s");
console.log("Ctrl+C para parar.");
console.log("");

registrar("Listener iniciado.");

setInterval(ciclo, INTERVALO_MS);
