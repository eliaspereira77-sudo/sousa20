'use strict';

const fs = require('fs');
const path = require('path');

const arquivos = [
    'SOUSA_USB_CONTRATO.js',
    'SOUSA_USB_ADAPTERS.js',
    'SOUSA_USB_REGISTRY.js',
    'SOUSA_API_EXECUTOR_UNIVERSAL.js'
];

const simbolos = new Set();

function ler(arquivo) {
    const caminho = path.join(__dirname, arquivo);

    if (!fs.existsSync(caminho)) {
        return null;
    }

    return fs.readFileSync(caminho, 'utf8');
}

function extrairSimbolos(codigo) {

    if (!codigo) return [];

    const encontrados = [];

    const padroes = [
        /\bfunction\s+(SOUSA_[A-Za-z0-9_$]+)\s*\(/g,
        /\b(?:const|let|var)\s+(SOUSA_[A-Za-z0-9_$]+)\s*=/g,
        /\b(?:const|let|var)\s+(SOUSA_[A-Za-z0-9_$]+)\s*=/g
    ];

    for (const regex of padroes) {

        let match;

        while ((match = regex.exec(codigo)) !== null) {

            if (match[1]) {
                encontrados.push(match[1]);
            }
        }
    }

    return [...new Set(encontrados)];
}

function extrairReferencias(codigo) {

    if (!codigo) return [];

    const regex =
        /\bSOUSA_[A-Za-z0-9_$]+\b/g;

    return [
        ...new Set(
            [...codigo.matchAll(regex)]
                .map(x => x[0])
        )
    ];
}

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0 — MAPA DE DEFINIÇÕES USB');
console.log('====================================================');

const definicoes = new Map();

for (const arquivo of arquivos) {

    const codigo = ler(arquivo);

    if (codigo === null) {

        console.log('');
        console.log(`[AUSENTE] ${arquivo}`);

        continue;
    }

    const encontrados =
        extrairSimbolos(codigo);

    for (const simbolo of encontrados) {

        if (!definicoes.has(simbolo)) {
            definicoes.set(
                simbolo,
                []
            );
        }

        definicoes
            .get(simbolo)
            .push(arquivo);
    }
}

console.log('');
console.log('>>> DEFINIÇÕES ENCONTRADAS');

for (const [simbolo, arquivosDef] of definicoes) {

    console.log(
        `  [DEF] ${simbolo} -> ${arquivosDef.join(', ')}`
    );
}

console.log('');
console.log('>>> REFERÊNCIAS DO EXECUTOR');

const executor =
    ler('SOUSA_API_EXECUTOR_UNIVERSAL.js');

const referencias =
    extrairReferencias(executor);

for (const simbolo of referencias) {

    const origem =
        definicoes.get(simbolo);

    if (origem) {

        console.log(
            `  [RESOLVIDA] ${simbolo} -> ${origem.join(', ')}`
        );

    } else {

        console.log(
            `  [SEM DEFINIÇÃO LOCAL] ${simbolo}`
        );
    }
}

console.log('');
console.log('====================================================');
console.log(' REGRA: SOMENTE LEITURA');
console.log(' REGRA: NENHUM ARQUIVO ALTERADO');
console.log(' REGRA: NENHUM REPARO EXECUTADO');
console.log('====================================================');
console.log('');
