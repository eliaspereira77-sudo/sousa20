'use strict';

const fs = require('fs');
const path = require('path');

const arquivos = [
    'SOUSA_API_EXECUTOR_UNIVERSAL.js',
    'SOUSA_USB_CONTRATO.js',
    'SOUSA_USB_ADAPTERS.js',
    'SOUSA_USB_REGISTRY.js'
];

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0 — DIAGNÓSTICO DE DEPENDÊNCIAS USB');
console.log('====================================================');

for (const arquivo of arquivos) {

    const caminho = path.join(__dirname, arquivo);

    console.log('');
    console.log(`>>> ${arquivo}`);

    if (!fs.existsSync(caminho)) {
        console.log('[AUSENTE]');
        continue;
    }

    const codigo = fs.readFileSync(caminho, 'utf8');

    const referencias = [
        ...codigo.matchAll(/\bSOUSA_USB_[A-Za-z0-9_$]+\b/g)
    ].map(x => x[0]);

    const unicas = [...new Set(referencias)];

    if (!unicas.length) {
        console.log('[OK] Nenhuma referência SOUSA_USB encontrada');
        continue;
    }

    for (const nome of unicas) {
        console.log(`  [DEPENDÊNCIA] ${nome}`);
    }
}

console.log('');
console.log('====================================================');
console.log(' REGRA: NENHUM ARQUIVO FOI ALTERADO');
console.log(' REGRA: NENHUM REPARO FOI EXECUTADO');
console.log('====================================================');
console.log('');
