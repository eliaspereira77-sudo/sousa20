'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const ALVOS = [
    'SOUSA_USB_CONTRATO.js',
    'SOUSA_USB_ADAPTERS.js',
    'SOUSA_USB_TRANSPORTES.js',
    'SOUSA_USB_REGISTRY.js',
    'SOUSA_API_USB.js',
    'SOUSA_POLITICA.js',
    'SOUSA_API_EXECUTOR_UNIVERSAL.js'
];

const IGNORAR = new Set([
    'node_modules',
    '.git',
    'backup',
    'backups',
    '07_LOG'
]);

function percorrer(pasta, resultados = []) {

    let itens;

    try {
        itens = fs.readdirSync(pasta, {
            withFileTypes: true
        });
    } catch {
        return resultados;
    }

    for (const item of itens) {

        if (IGNORAR.has(item.name)) {
            continue;
        }

        const caminho = path.join(pasta, item.name);

        if (item.isDirectory()) {
            percorrer(caminho, resultados);
            continue;
        }

        if (!item.isFile()) {
            continue;
        }

        if (!/\.(js|mjs|cjs|gs|html|json|txt)$/i.test(item.name)) {
            continue;
        }

        let codigo;

        try {
            codigo = fs.readFileSync(caminho, 'utf8');
        } catch {
            continue;
        }

        for (const alvo of ALVOS) {

            const ocorrencias = codigo
                .split(/\r?\n/)
                .map((linha, indice) => ({
                    linha,
                    indice: indice + 1
                }))
                .filter(x => x.linha.includes(alvo));

            for (const ocorrencia of ocorrencias) {

                resultados.push({
                    alvo,
                    arquivo: path.relative(
                        RAIZ,
                        caminho
                    ),
                    linha: ocorrencia.indice,
                    conteudo: ocorrencia.linha.trim()
                });
            }
        }
    }

    return resultados;
}

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0 — MAPA DO CARREGAMENTO REAL');
console.log(' SOMENTE LEITURA');
console.log('====================================================');

const resultados = percorrer(RAIZ);

for (const alvo of ALVOS) {

    console.log('');
    console.log(`>>> ${alvo}`);

    const encontrados = resultados.filter(
        x => x.alvo === alvo
    );

    if (!encontrados.length) {
        console.log('[NENHUMA REFERÊNCIA EXTERNA ENCONTRADA]');
        continue;
    }

    for (const item of encontrados) {

        console.log(
            `  ${item.arquivo}:${item.linha}`
        );

        console.log(
            `      ${item.conteudo}`
        );
    }
}

console.log('');
console.log('====================================================');
console.log(' ANÁLISE DE MECANISMOS DE CARREGAMENTO');
console.log('====================================================');

const padroes = [
    'require(',
    'import ',
    'import(',
    'vm.Script',
    'eval(',
    'readFileSync(',
    'getScript',
    'include',
    'HtmlService'
];

const mecanismos = [];

function procurarMecanismos(pasta) {

    let itens;

    try {
        itens = fs.readdirSync(pasta, {
            withFileTypes: true
        });
    } catch {
        return;
    }

    for (const item of itens) {

        if (IGNORAR.has(item.name)) {
            continue;
        }

        const caminho = path.join(pasta, item.name);

        if (item.isDirectory()) {
            procurarMecanismos(caminho);
            continue;
        }

        if (!item.isFile()) {
            continue;
        }

        if (!/\.(js|mjs|cjs|gs|html)$/i.test(item.name)) {
            continue;
        }

        let codigo;

        try {
            codigo = fs.readFileSync(caminho, 'utf8');
        } catch {
            continue;
        }

        const linhas = codigo.split(/\r?\n/);

        linhas.forEach((linha, indice) => {

            for (const padrao of padroes) {

                if (linha.includes(padrao)) {

                    mecanismos.push({
                        arquivo: path.relative(
                            RAIZ,
                            caminho
                        ),
                        linha: indice + 1,
                        padrao,
                        conteudo: linha.trim()
                    });

                    break;
                }
            }
        });
    }
}

procurarMecanismos(RAIZ);

for (const item of mecanismos) {

    console.log(
        `  [${item.padrao}] ${item.arquivo}:${item.linha}`
    );

    console.log(
        `      ${item.conteudo}`
    );
}

console.log('');
console.log('====================================================');
console.log(' RESULTADO');
console.log('====================================================');

console.log(
    `Arquivos-alvo analisados: ${ALVOS.length}`
);

console.log(
    `Referências encontradas: ${resultados.length}`
);

console.log(
    `Mecanismos de carregamento encontrados: ${mecanismos.length}`
);

console.log('');
console.log('[REGRA] SOMENTE LEITURA');
console.log('[REGRA] NENHUM ARQUIVO ORIGINAL ALTERADO');
console.log('[REGRA] NENHUM REPARO EXECUTADO');
console.log('====================================================');
console.log('');
