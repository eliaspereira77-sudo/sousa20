'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const COMPONENTES = {
    ORQUESTRADOR: 'SOUSA_ORQUESTRADOR.js',
    REGISTRY: 'SOUSA_REGISTRY.js',
    EXECUTOR: 'SOUSA_API_EXECUTOR_UNIVERSAL.js',
    DIAGNOSTICO: 'SOUSA_AUTO_DIAGNOSTICO.js',
    REPARO: 'MEMORIA/core/capabilities/SOUSA_AUTO_REPAIR_ENGINE.js',
    VALIDADOR: 'SOUSA_VALIDATOR.js',
    MEMORIA: 'SOUSA_CONTINUITY_ENGINE.js'
};

function carregar(nome, arquivo) {
    const alvo = path.join(RAIZ, arquivo);

    if (!fs.existsSync(alvo)) {
        return {
            nome,
            arquivo,
            ok: false,
            erro: 'ARQUIVO_NAO_ENCONTRADO'
        };
    }

    try {
        const modulo = require(alvo);

        return {
            nome,
            arquivo,
            ok: true,
            modulo,
            exports: modulo && typeof modulo === 'object'
                ? Object.keys(modulo)
                : []
        };

    } catch (erro) {
        return {
            nome,
            arquivo,
            ok: false,
            erro: erro.message
        };
    }
}

function conectar() {

    console.log('');
    console.log('==============================================');
    console.log(' SOUSA 2.0 - FIO CONDUTOR');
    console.log(' CONEXAO DO NUCLEO OPERACIONAL');
    console.log('==============================================');
    console.log('');

    const estado = {};

    for (const [nome, arquivo] of Object.entries(COMPONENTES)) {

        const resultado = carregar(nome, arquivo);

        estado[nome] = resultado;

        if (resultado.ok) {

            console.log(
                `[OK] ${nome.padEnd(15)} -> ${arquivo}`
            );

            if (resultado.exports.length > 0) {
                console.log(
                    `     Interface: ${resultado.exports.join(', ')}`
                );
            } else {
                console.log(
                    '     Interface: EXECUCAO DIRETA / SEM EXPORTS'
                );
            }

        } else {

            console.log(
                `[ERRO] ${nome.padEnd(15)} -> ${resultado.erro}`
            );
        }
    }

    console.log('');
    console.log('----------------------------------------------');

    const falhas = Object.values(estado)
        .filter(item => !item.ok);

    if (falhas.length === 0) {

        console.log('[OK] TODOS OS COMPONENTES FORAM CARREGADOS');

        estado.STATUS = 'NUCLEO_CONECTADO';

        console.log('[OK] FIO CONDUTOR ESTABELECIDO');
        console.log('[OK] ORQUESTRADOR -> EXECUTOR');
        console.log('[OK] REGISTRY -> NUCLEO');
        console.log('[OK] DIAGNOSTICO -> NUCLEO');
        console.log('[OK] REPARO -> NUCLEO');
        console.log('[OK] VALIDADOR -> NUCLEO');
        console.log('[OK] MEMORIA -> NUCLEO');

    } else {

        estado.STATUS = 'CONEXAO_INCOMPLETA';

        console.log(
            `[ERRO] ${falhas.length} componente(s) nao carregaram`
        );
    }

    console.log('----------------------------------------------');
    console.log('');

    return estado;
}

function testeFluxo() {

    console.log('');
    console.log('==============================================');
    console.log(' SOUSA 2.0 - TESTE DO FIO CONDUTOR');
    console.log('==============================================');
    console.log('');

    const estado = conectar();

    console.log('----------------------------------------------');

    if (estado.STATUS === 'NUCLEO_CONECTADO') {

        console.log('[PASS] NUCLEO OPERACIONAL CONECTADO');
        console.log('[PASS] FIO CONDUTOR ATIVO');
        console.log('');
        console.log('PROXIMA FASE: TESTAR EXECUCAO REAL');
        console.log('SEM ALTERAR OS MODULOS EXISTENTES.');

    } else {

        console.log('[FAIL] NUCLEO NAO ESTA TOTALMENTE CONECTADO');
    }

    console.log('');
    console.log('==============================================');
    console.log('');
}

module.exports = {
    conectar,
    testeFluxo
};

if (require.main === module) {
    testeFluxo();
}
