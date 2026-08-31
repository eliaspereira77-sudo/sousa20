'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const IGNORAR = new Set([
    'node_modules',
    '.git',
    'backup',
    'backups',
    '07_LOG'
]);

const EXTENSOES = /\.(js|mjs|cjs|gs|html|json|txt)$/i;

const ALVOS_IA = [
    'SOUSA_IA',
    'SOUSA IA',
    'IA_DNA',
    'IA_MEMORIA',
    'SOUSA_CAPABILITY',
    'SOUSA_RUNTIME',
    'SOUSA_MAINTENANCE',
    'SOUSA_SELF_TEST',
    'SOUSA_AUTO_REPAIR',
    'SOUSA_API_EXECUTOR',
    'SOUSA_USB',
    'SOUSA_POLITICA',
    'SOUSA_TEAM',
    'RUFLO',
    'MANUS',
    'OPENCODE',
    'MINIMAX',
    'DEEPGRAM',
    'ARXIVISUAL'
];

const resultados = [];

function percorrer(pasta) {

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

        const absoluto = path.join(pasta, item.name);

        if (item.isDirectory()) {
            percorrer(absoluto);
            continue;
        }

        if (!item.isFile() || !EXTENSOES.test(item.name)) {
            continue;
        }

        let conteudo;

        try {
            conteudo = fs.readFileSync(
                absoluto,
                'utf8'
            );
        } catch {
            continue;
        }

        const linhas = conteudo.split(/\r?\n/);

        linhas.forEach((linha, indice) => {

            for (const alvo of ALVOS_IA) {

                if (
                    linha.toLowerCase()
                        .includes(alvo.toLowerCase())
                ) {

                    resultados.push({
                        alvo,
                        arquivo: path.relative(
                            RAIZ,
                            absoluto
                        ),
                        linha: indice + 1,
                        conteudo: linha.trim()
                    });

                    break;
                }
            }
        });
    }
}

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0 — MAPA DE CONSCIÊNCIA DA SOUSA IA');
console.log(' SOMENTE LEITURA');
console.log('====================================================');

percorrer(RAIZ);

const porAlvo = {};

for (const item of resultados) {

    if (!porAlvo[item.alvo]) {
        porAlvo[item.alvo] = [];
    }

    porAlvo[item.alvo].push(item);
}

for (const alvo of ALVOS_IA) {

    console.log('');
    console.log(`>>> ${alvo}`);

    const encontrados = porAlvo[alvo] || [];

    if (!encontrados.length) {
        console.log(
            '[NENHUMA REFERÊNCIA ENCONTRADA]'
        );
        continue;
    }

    const arquivos = new Set();

    for (const item of encontrados) {

        arquivos.add(item.arquivo);

        console.log(
            `  ${item.arquivo}:${item.linha}`
        );

        console.log(
            `      ${item.conteudo}`
        );
    }

    console.log(
        `  [ARQUIVOS ENVOLVIDOS] ${arquivos.size}`
    );
}

console.log('');
console.log('====================================================');
console.log(' RESUMO DA CONSCIÊNCIA');
console.log('====================================================');

console.log(
    `Referências SOUSA IA/ecossistema: ${resultados.length}`
);

const arquivosUnicos = new Set(
    resultados.map(x => x.arquivo)
);

console.log(
    `Arquivos envolvidos: ${arquivosUnicos.size}`
);

console.log('');
console.log('[REGRA] SOMENTE LEITURA');
console.log('[REGRA] NENHUM ARQUIVO ALTERADO');
console.log('[REGRA] NENHUM REPARO EXECUTADO');
console.log('[REGRA] NENHUMA CHAVE/API ACESSADA');
console.log('====================================================');
console.log('');
