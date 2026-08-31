'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = __dirname;

const IGNORAR = new Set([
    'node_modules',
    '.git',
    'backup',
    'backups',
    '07_LOG'
]);

const EXTENSOES = /\.(js|mjs|cjs|gs|html|json)$/i;

const CATEGORIAS = {
    IA: [
        'SOUSA_IA',
        'SOUSA IA',
        'IA_DNA',
        'IA_MEMORIA'
    ],

    EXECUCAO: [
        'EXECUTOR',
        'EXECUTOR_UNIVERSAL',
        'API_USB',
        'USB_CONTRATO',
        'USB_ADAPTERS',
        'USB_TRANSPORTES',
        'USB_REGISTRY'
    ],

    SEGURANCA: [
        'POLITICA',
        'AUTHORIZATION',
        'PERMISSION',
        'CONTRATO'
    ],

    MEMORIA: [
        'MEMORIA',
        'DNA',
        'PERSISTENCIA',
        'DRIVE'
    ],

    MANUTENCAO: [
        'AUTO_REPAIR',
        'SELF_TEST',
        'MAINTENANCE',
        'DIAGNOSTICO',
        'MONITOR'
    ],

    CAPACIDADES: [
        'CAPABILITY',
        'RUFLO',
        'MANUS',
        'OPENCODE',
        'MINIMAX',
        'DEEPGRAM',
        'ARXIVISUAL'
    ],

    INTERFACE: [
        'PAINEL',
        'MOBILE',
        'COMMAND',
        'INTERFACE'
    ]
};

const indice = {
    sistema: 'SOUSA 2.0',
    componente: 'SOUSA IA',
    tipo: 'INDICE_CENTRAL_CONSCIENCIA',
    modo: 'SOMENTE_LEITURA',

    timestamp: new Date().toISOString(),

    raiz: RAIZ,

    categorias: {},

    arquivos: [],

    estatisticas: {
        arquivosAnalisados: 0,
        arquivosRelacionados: 0,
        referenciasEncontradas: 0
    }
};

function deveIgnorar(nome) {
    return IGNORAR.has(nome);
}

function classificar(nome, conteudo) {

    const texto =
        `${nome}\n${conteudo}`.toLowerCase();

    const categorias = [];

    for (const [categoria, termos] of Object.entries(CATEGORIAS)) {

        for (const termo of termos) {

            if (texto.includes(termo.toLowerCase())) {
                categorias.push(categoria);
                break;
            }
        }
    }

    return categorias;
}

function analisarArquivo(absoluto) {

    let conteudo;

    try {
        conteudo =
            fs.readFileSync(
                absoluto,
                'utf8'
            );
    } catch {
        return;
    }

    indice.estatisticas.arquivosAnalisados++;

    const relativo =
        path.relative(
            RAIZ,
            absoluto
        );

    const categorias =
        classificar(
            relativo,
            conteudo
        );

    if (!categorias.length) {
        return;
    }

    indice.estatisticas.arquivosRelacionados++;

    const hash =
        crypto
            .createHash('sha256')
            .update(conteudo)
            .digest('hex');

    const registro = {
        arquivo: relativo,
        tamanho: Buffer.byteLength(
            conteudo,
            'utf8'
        ),
        sha256: hash,
        categorias
    };

    indice.arquivos.push(registro);

    for (const categoria of categorias) {

        if (!indice.categorias[categoria]) {
            indice.categorias[categoria] = [];
        }

        indice.categorias[categoria]
            .push(relativo);
    }

    indice.estatisticas.referenciasEncontradas +=
        categorias.length;
}

function percorrer(pasta) {

    let itens;

    try {
        itens =
            fs.readdirSync(
                pasta,
                { withFileTypes: true }
            );
    } catch {
        return;
    }

    for (const item of itens) {

        if (deveIgnorar(item.name)) {
            continue;
        }

        const absoluto =
            path.join(
                pasta,
                item.name
            );

        if (item.isDirectory()) {
            percorrer(absoluto);
            continue;
        }

        if (
            item.isFile() &&
            EXTENSOES.test(item.name)
        ) {
            analisarArquivo(absoluto);
        }
    }
}

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0');
console.log(' ÍNDICE CENTRAL DE CONSCIÊNCIA');
console.log(' SOUSA IA');
console.log(' SOMENTE LEITURA');
console.log('====================================================');

percorrer(RAIZ);

const saida =
    path.join(
        RAIZ,
        'SOUSA_IA_INDICE_CONSCIENCIA.json'
    );

fs.writeFileSync(
    saida,
    JSON.stringify(
        indice,
        null,
        2
    ),
    'utf8'
);

console.log('');
console.log('RESULTADO');
console.log('----------------------------------------------------');

console.log(
    `Arquivos analisados: ${indice.estatisticas.arquivosAnalisados}`
);

console.log(
    `Arquivos relacionados: ${indice.estatisticas.arquivosRelacionados}`
);

console.log(
    `Referências/categorizações: ${indice.estatisticas.referenciasEncontradas}`
);

console.log('');

for (
    const [categoria, arquivos]
    of Object.entries(indice.categorias)
) {

    console.log(
        `[${categoria}] ${arquivos.length} arquivo(s)`
    );
}

console.log('');
console.log(
    `[OK] ÍNDICE GERADO: ${path.basename(saida)}`
);

console.log('[OK] SOMENTE LEITURA');
console.log('[OK] NENHUM ARQUIVO ORIGINAL ALTERADO');
console.log('[OK] NENHUMA API EXECUTADA');
console.log('[OK] NENHUMA CHAVE ACESSADA');

console.log('====================================================');
console.log('');
