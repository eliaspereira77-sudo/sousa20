/*
==========================================================
🐕 SOUSA 2.0 - CÃO DE GUARDA
MONITOR INTELIGENTE DE ERROS DE SINTAXE V2
==========================================================
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PASTA = process.cwd();
const LOG_DIR = path.join(PASTA, "07_LOG", "MonitorSintaxe");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, "Relatorio_Correcao.txt");

let erros = [];

console.log("🐕 SOUSA 2.0 - CÃO DE GUARDA");
console.log("Analisando código...\n");


function analisarArquivo(arquivo) {

    try {

        const codigo = fs.readFileSync(arquivo, "utf8");

        new vm.Script(codigo);

    } catch (erro) {

        erros.push({
            arquivo: arquivo,
            erro: erro.message,
            diagnostico: diagnosticar(erro.message)
        });

    }

}


function diagnosticar(mensagem) {

    if (mensagem.includes("Unexpected token")) {

        return `
Possível problema de estrutura.

Verifique:
- Parênteses: ( )
- Chaves: { }
- Colchetes: [ ]
- Vírgulas ou caracteres extras.

Ação:
Abra o arquivo indicado e revise a linha apontada pelo erro.
`;

    }


    if (mensagem.includes("missing")) {

        return `
Possível fechamento ausente.

Verifique:
- Chaves abertas e não fechadas.
- Funções incompletas.
- Blocos if/for sem fechamento.
`;

    }


    return `
Erro encontrado.

Leia a mensagem original,
localize o arquivo indicado
e revise a região do código.
`;

}



function procurarArquivos(dir) {

    const arquivos = fs.readdirSync(dir);

    for (const item of arquivos) {

        const caminho = path.join(dir, item);

        if (fs.statSync(caminho).isDirectory()) {

            if (
                item !== "node_modules" &&
                item !== "07_LOG"
            ) {
                procurarArquivos(caminho);
            }

        } else {

            if (
                item.endsWith(".js") &&
                !item.includes("BACKUP")
            ) {

                analisarArquivo(caminho);

            }

        }

    }

}


procurarArquivos(PASTA);



let relatorio = "";

relatorio += "====================================\n";
relatorio += "SOUSA 2.0 - CÃO DE GUARDA\n";
relatorio += "DATA: " + new Date().toLocaleString() + "\n";
relatorio += "====================================\n\n";


if (erros.length === 0) {

    console.log("✅ SISTEMA NORMAL");
    console.log("Nenhum erro encontrado.");

    relatorio += "STATUS: SISTEMA NORMAL\n";

}
else {


    console.log("🚨 ALERTA SOUSA 2.0\n");


    relatorio += "STATUS: ERROS ENCONTRADOS\n\n";


    erros.forEach((item) => {


        console.log("==============================");
        console.log("Arquivo:");
        console.log(item.arquivo);

        console.log("\nErro:");
        console.log(item.erro);

        console.log("\nDiagnóstico:");
        console.log(item.diagnostico);


        relatorio += "Arquivo:\n";
        relatorio += item.arquivo + "\n\n";

        relatorio += "Erro:\n";
        relatorio += item.erro + "\n\n";

        relatorio += "Diagnóstico:\n";
        relatorio += item.diagnostico + "\n";

        relatorio += "==============================\n\n";


    });

}


fs.writeFileSync(
    LOG_FILE,
    relatorio,
    "utf8"
);


console.log("\n📘 Relatório criado:");
console.log("07_LOG\\MonitorSintaxe\\Relatorio_Correcao.txt");

// ==========================================================
// COMUNICACAO COM NUCLEO ORQUESTRADOR SOUSA 2.0
// ==========================================================

const alertaSousa = {
    sistema: "SOUSA 2.0",
    modulo: "MonitorSintaxe",
    data: new Date().toLocaleString(),
    status: erros.length === 0 ? "NORMAL" : "ALERTA",
    quantidadeErros: erros.length,
    relatorio: "07_LOG/MonitorSintaxe/Relatorio_Correcao.txt"
};

fs.writeFileSync(
    path.join(LOG_DIR, "ALERTA_SOUSA.json"),
    JSON.stringify(alertaSousa, null, 2),
    "utf8"
);

console.log("🔄 Alerta sincronizado com Núcleo Orquestrador.");