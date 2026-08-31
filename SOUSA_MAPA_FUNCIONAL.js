'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const ALVOS = [
    'SOUSA_AUTHORIZATION_GATE.js',
    'SOUSA_POLITICA.js',
    'CAMPAIGN_GUARDIAN.js',
    'CAMPAIGN_RUNTIME.js',

    'MonitorSintaxe.js',

    'SOUSA_AUTO_DIAGNOSTICO.js',
    'SOUSA_AUTO_REPAIR_COOR*.js',
    'SOUSA_AUTO_REPAIR_ENGINE.js',
    'SOUSA_AUTO_REPAIR_SANDBOX.js',
    'SOUSA_SELF_TEST_REPAIR.js',
    'SOUSA_MANUTENCAO_REFINO.js',
    'SOUSA_MAINTENANCE_ORCHESTRATOR.js',
    'SOUSA_MAINTENANCE_AGENT.js',

    'API_MANAGER/SOUSA_IA.js',
    'SOUSA_IA.js',
    'SOUSA_IA_COMANDO_DIAGNOSTICO.js',
    'SOUSA_IA_IDENTIDADE.js',
    'SOUSA_IA_COMPOSITOR.js',
    'SOUSA_IA_DNA_MEMORIA_VOZ.js'
];

function expandirPadrao(padrao) {
    if (!padrao.includes('*')) return [padrao];

    const dir = path.dirname(padrao);
    const base = path.basename(padrao).replace(/\*/g, '');

    const absoluto = path.join(RAIZ, dir);

    if (!fs.existsSync(absoluto)) return [];

    return fs.readdirSync(absoluto)
        .filter(nome => nome.startsWith(base))
        .map(nome => path.join(dir, nome));
}

function lerArquivo(relativo) {
    const absoluto = path.join(RAIZ, relativo);

    try {
        return fs.readFileSync(absoluto, 'utf8');
    } catch (_) {
        return null;
    }
}

function analisar(relativo) {

    const codigo = lerArquivo(relativo);

    if (codigo === null) {
        console.log(`[--] ${relativo} -> NAO ENCONTRADO`);
        return;
    }

    console.log('');
    console.log('----------------------------------------------');
    console.log(`>>> ${relativo}`);
    console.log('----------------------------------------------');

    const palavras = [
        'guard', 'guardian', 'security', 'authorization',
        'permission', 'block', 'deny', 'allow',
        'syntax', 'lint', 'validate',
        'repair', 'fix', 'restore', 'backup',
        'cleanup', 'clean', 'maintenance',
        'diagnostic', 'diagnostico',
        'orchestr', 'orquestr',
        'SOUSA_IA', 'intencao', 'intenção',
        'voice', 'voz', 'comando'
    ];

    const linhas = codigo.split(/\r?\n/);

    const encontrados = [];

    for (let i = 0; i < linhas.length; i++) {

        const linha = linhas[i];

        for (const palavra of palavras) {

            if (linha.toLowerCase().includes(palavra.toLowerCase())) {

                encontrados.push({
                    linha: i + 1,
                    texto: linha.trim()
                });

                break;
            }
        }
    }

    if (encontrados.length === 0) {
        console.log('[INFO] Nenhum indicador funcional encontrado');
    } else {

        console.log(`[OK] ${encontrados.length} indicador(es)`);

        encontrados.slice(0, 15).forEach(item => {
            console.log(
                `  L${item.linha}: ${item.texto.substring(0, 180)}`
            );
        });

        if (encontrados.length > 15) {
            console.log(
                `  ... +${encontrados.length - 15} ocorrencia(s)`
            );
        }
    }

    if (relativo.endsWith('.js')) {

        try {

            const absoluto = path.join(RAIZ, relativo);

            delete require.cache[require.resolve(absoluto)];

            const modulo = require(absoluto);

            if (modulo && typeof modulo === 'object') {

                const exports = Object.keys(modulo);

                if (exports.length > 0) {
                    console.log(
                        `[EXPORTS] ${exports.join(', ')}`
                    );
                } else {
                    console.log(
                        '[EXPORTS] nenhum'
                    );
                }

            } else {

                console.log(
                    `[EXPORT] ${typeof modulo}`
                );
            }

        } catch (erro) {

            console.log(
                `[LOAD] ${erro.message}`
            );
        }
    }
}

console.log('');
console.log('==============================================');
console.log(' SOUSA 2.0 - MAPA FUNCIONAL DO NUCLEO');
console.log('==============================================');
console.log('');
console.log('OBJETIVO:');
console.log('Identificar as pecas EXISTENTES.');
console.log('Nao criar duplicatas.');
console.log('Nao modificar nenhum modulo.');
console.log('');

const arquivos = [];

for (const alvo of ALVOS) {
    for (const arquivo of expandirPadrao(alvo)) {
        if (!arquivos.includes(arquivo)) {
            arquivos.push(arquivo);
        }
    }
}

for (const arquivo of arquivos) {
    analisar(arquivo);
}

console.log('');
console.log('==============================================');
console.log(' CLASSIFICACAO PROVISORIA');
console.log('==============================================');
console.log('');
console.log('[GUARDA]       seguranca/autorizacao/bloqueio');
console.log('[MONITOR]      sintaxe/validacao');
console.log('[MECANICO]     diagnostico/reparo/manutencao');
console.log('[SOUSA IA]     intencao/comando/voz/IA');
console.log('[MEMORIA]      continuidade/log');
console.log('');
console.log('==============================================');
console.log(' FIM DO MAPEAMENTO');
console.log('==============================================');
