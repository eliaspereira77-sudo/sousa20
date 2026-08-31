'use strict';

const ponte = require('./SOUSA_PONTE_GLOBAL.js');

console.log('');
console.log('====================================================');
console.log(' SOUSA 2.0 — TESTE DE FLUXO CONTROLADO');
console.log('====================================================');

const pontes = ponte.teste();

function executar(nome, funcao, ...args) {

    console.log('');
    console.log(`>>> EXECUTANDO: ${nome}.${funcao}`);

    const resultado = ponte.executar(
        pontes[nome],
        funcao,
        ...args
    );

    console.log(
        JSON.stringify(
            resultado,
            null,
            2
        )
    );

    return resultado;
}

console.log('');
console.log('>>> FASE 1 — NORMALIZAÇÃO');

const contexto = executar(
    'executor',
    'SOUSA_API_EXECUTOR_normalizarContexto',
    {
        origem: 'TESTE_FLUXO_CONTROLADO',
        intencao: 'diagnostico',
        canal: 'local',
        seguro: true
    }
);

console.log('');
console.log('>>> FASE 2 — DIAGNÓSTICO');

const diagnostico = executar(
    'diagnostico',
    'SOUSA_AUTO_DIAGNOSTICO'
);

console.log('');
console.log('>>> FASE 3 — ORQUESTRADOR');

const ciclo = executar(
    'orquestrador',
    'SOUSA_ORQUESTRADOR_criarCiclo',
    {
        tipo: 'TESTE_CONTROLADO',
        origem: 'SOUSA_PONTE_GLOBAL'
    }
);

console.log('');
console.log('====================================================');
console.log(' RESULTADO DO FLUXO');
console.log('====================================================');

const resultados = {
    contexto,
    diagnostico,
    ciclo
};

const falhas = Object.values(resultados)
    .filter(x => !x || x.ok === false);

if (falhas.length === 0) {

    console.log('[PASS] NORMALIZAÇÃO');
    console.log('[PASS] DIAGNÓSTICO');
    console.log('[PASS] ORQUESTRADOR');
    console.log('');
    console.log('[PASS] FLUXO CONTROLADO EXECUTADO');
    console.log('[PASS] NENHUM REPARO AUTOMÁTICO EXECUTADO');

} else {

    console.log(
        `[ATENÇÃO] ${falhas.length} etapa(s) apresentaram falha.`
    );

}

console.log('====================================================');
console.log('');

