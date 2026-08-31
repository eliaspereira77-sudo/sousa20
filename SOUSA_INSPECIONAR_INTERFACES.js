const fs = require('fs');
const path = require('path');

const arquivos = [
    'SOUSA_ORQUESTRADOR.js',
    'SOUSA_REGISTRY.js',
    'SOUSA_API_EXECUTOR_UNIVERSAL.js',
    'SOUSA_AUTO_DIAGNOSTICO.js',
    'MEMORIA/core/capabilities/SOUSA_AUTO_REPAIR_ENGINE.js',
    'SOUSA_VALIDATOR.js',
    'SOUSA_CONTINUITY_ENGINE.js'
];

console.log('');
console.log('==============================================');
console.log(' SOUSA 2.0 - INTERFACES DO FIO CONDUTOR');
console.log('==============================================');

for (const arquivo of arquivos) {
    const absoluto = path.join(__dirname, arquivo);

    console.log('');
    console.log(`>>> ${arquivo}`);

    try {
        if (!fs.existsSync(absoluto)) {
            console.log('  [ERRO] Arquivo não encontrado');
            continue;
        }

        const modulo = require(absoluto);

        console.log('  [OK] carregamento');

        if (modulo && typeof modulo === 'object') {
            const chaves = Object.keys(modulo);

            if (chaves.length === 0) {
                console.log('  [AVISO] Nenhum export encontrado');
            } else {
                console.log('  [EXPORTS]');
                chaves.forEach(chave => {
                    console.log(
                        `    - ${chave}: ${typeof modulo[chave]}`
                    );
                });
            }
        } else {
            console.log(`  [EXPORT] ${typeof modulo}`);
        }

    } catch (erro) {
        console.log('  [ERRO AO CARREGAR]');
        console.log(`  ${erro.message}`);
    }
}

console.log('');
console.log('==============================================');
console.log(' FIM DA INSPEÇÃO');
console.log('==============================================');
