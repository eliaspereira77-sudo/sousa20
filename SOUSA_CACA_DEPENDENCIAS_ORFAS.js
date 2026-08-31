'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const ALVOS = [
    'SOUSA_USB_normalizarContexto',
    'SOUSA_API_USB_preparar',
    'SOUSA_POLITICA_cooldown'
];

const IGNORAR = new Set([
    'node_modules',
    '.git',
    '07_LOG',
    'backup',
    'backups'
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

        const caminho = path.join(
            pasta,
            item.name
        );

        if (item.isDirectory()) {

            percorrer(
                caminho,
                resultados
            );

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
            codigo = fs.readFileSync(
                caminho,
                'utf8'
            );
        } catch {
            continue;
        }

        for (const alvo of ALVOS) {

            if (!codigo.includes(alvo)) {
                continue;
            }

            const linhas =
                codigo.split(/\r?\n/);

            linhas.forEach(
                (linha, indice) => {

                    if (linha.includes(alvo)) {

                        resultados.push({
                            alvo,
                            arquivo: path.relative(
                                RAIZ,
                                caminho
                            ),
                            linha: indice + 1,
                            conteudo:
                                linha.trim()
                        });
                    }
                }
            );
        }
    }

    return resultados;
}

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0 — CAÇA ÀS DEPENDÊNCIAS ÓRFÃS');
console.log('====================================================');

const resultados =
    percorrer(RAIZ);

for (const alvo of ALVOS) {

    console.log('');
    console.log(`>>> ${alvo}`);

    const encontrados =
        resultados.filter(
            x => x.alvo === alvo
        );

    if (!encontrados.length) {

        console.log(
            '[NÃO ENCONTRADO NO PROJETO]'
        );

        continue;
    }

    for (const item of encontrados) {

        console.log(
            `  [REFERÊNCIA] ${item.arquivo}:${item.linha}`
        );

        console.log(
            `      ${item.conteudo}`
        );
    }
}

console.log('');
console.log('====================================================');
console.log(' RESULTADO');
console.log('====================================================');

for (const alvo of ALVOS) {

    const quantidade =
        resultados.filter(
            x => x.alvo === alvo
        ).length;

    console.log(
        `${alvo}: ${quantidade} ocorrência(s)`
    );
}

console.log('');
console.log('[REGRA] SOMENTE LEITURA');
console.log('[REGRA] NENHUM ARQUIVO ALTERADO');
console.log('[REGRA] NENHUM REPARO EXECUTADO');
console.log('====================================================');
console.log('');
