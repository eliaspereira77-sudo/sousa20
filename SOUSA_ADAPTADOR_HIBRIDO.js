'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const COMPONENTES = {
    ORQUESTRADOR: 'SOUSA_ORQUESTRADOR.js',

    GUARDA: {
        AUTHORIZATION: 'SOUSA_AUTHORIZATION_GATE.js',
        GUARDIAN: 'CAMPAIGN_GUARDIAN.js',
        RUNTIME: 'CAMPAIGN_RUNTIME.js',
        MONITOR: 'MonitorSintaxe.js'
    },

    MECANICO: {
        DIAGNOSTICO: 'SOUSA_AUTO_DIAGNOSTICO.js',
        MANUTENCAO: 'SOUSA_MANUTENCAO_REFINO.js',
        REPARO: 'MEMORIA/core/capabilities/SOUSA_AUTO_REPAIR_ENGINE.js',
        SELF_TEST: 'MEMORIA/core/capabilities/SOUSA_SELF_TEST_REPAIR.js'
    },

    SOUSA_IA: {
        IA: 'API_MANAGER/SOUSA_IA.js',
        COMANDO: 'SOUSA_IA_COMANDO_DIAGNOSTICO.js',
        IDENTIDADE: 'SOUSA_IA_IDENTIDADE.js',
        COMPOSITOR: 'SOUSA_IA_COMPOSITOR.js',
        DNA: 'SOUSA_IA_DNA_MEMORIA_VOZ.js'
    },

    MEMORIA: {
        CONTINUIDADE: 'SOUSA_CONTINUITY_ENGINE.js',
        LOG: 'SOUSA_LOG_ENGINE.js'
    },

    EXECUTOR: 'SOUSA_API_EXECUTOR_UNIVERSAL.js'
};

function absoluto(arquivo) {
    return path.join(RAIZ, arquivo);
}

function ler(arquivo) {
    try {
        return fs.readFileSync(absoluto(arquivo), 'utf8');
    } catch {
        return null;
    }
}

function arquivoExiste(arquivo) {
    return fs.existsSync(absoluto(arquivo));
}

/*
 * Detecta funções declaradas no código,
 * independentemente de module.exports.
 */
function detectarFuncoes(codigo) {

    if (!codigo) return [];

    const encontrados = [];

    const padroes = [
        /function\s+([A-Za-z0-9_$]+)\s*\(/g,
        /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:function\s*)?\(/g
    ];

    for (const regex of padroes) {

        let match;

        while ((match = regex.exec(codigo)) !== null) {

            const nome = match[1];

            if (
                nome &&
                !encontrados.includes(nome)
            ) {
                encontrados.push(nome);
            }
        }
    }

    return encontrados;
}

function detectarExports(codigo) {

    if (!codigo) return [];

    const resultado = [];

    if (/module\.exports\s*=/.test(codigo)) {
        resultado.push('module.exports');
    }

    const regex = /exports\.([A-Za-z0-9_$]+)/g;

    let match;

    while ((match = regex.exec(codigo)) !== null) {

        if (!resultado.includes(match[1])) {
            resultado.push(match[1]);
        }
    }

    return resultado;
}

function detectarFormato(codigo) {

    if (!codigo) return 'AUSENTE';

    const commonjs =
        /module\.exports|exports\./.test(codigo);

    const gas =
        /PropertiesService|SpreadsheetApp|ScriptProperties|Session\.|Utilities\./
            .test(codigo);

    if (commonjs && gas) {
        return 'HIBRIDO';
    }

    if (commonjs) {
        return 'COMMONJS';
    }

    if (gas) {
        return 'GOOGLE_APPS_SCRIPT';

    }

    return 'JAVASCRIPT_GLOBAL';
}

function analisar(arquivo) {

    const codigo = ler(arquivo);

    if (codigo === null) {

        return {
            arquivo,
            existe: false,
            formato: 'AUSENTE',
            funcoes: [],
            exports: []
        };
    }

    return {
        arquivo,
        existe: true,
        formato: detectarFormato(codigo),
        funcoes: detectarFuncoes(codigo),
        exports: detectarExports(codigo)
    };
}

function imprimir(grupo, nome, resultado) {

    console.log('');
    console.log(
        `>>> ${grupo} / ${nome}`
    );

    console.log(
        `    Arquivo: ${resultado.arquivo}`
    );

    console.log(
        `    Formato: ${resultado.formato}`
    );

    console.log(
        `    Funções: ${resultado.funcoes.length}`
    );

    if (resultado.funcoes.length) {

        console.log(
            `    ${resultado.funcoes.slice(0, 12).join(', ')}`
        );

        if (resultado.funcoes.length > 12) {
            console.log(
                `    ... +${resultado.funcoes.length - 12}`
            );
        }
    }

    console.log(
        `    Exports: ${
            resultado.exports.length
                ? resultado.exports.join(', ')
                : 'nenhum'
        }`
    );

    if (
        resultado.existe &&
        resultado.funcoes.length &&
        resultado.exports.length === 0
    ) {

        console.log(
            '    [PONTE] FUNÇÕES EXISTEM, MAS NÃO ESTÃO EXPORTADAS'
        );
    }

    if (
        resultado.formato === 'GOOGLE_APPS_SCRIPT'
    ) {

        console.log(
            '    [GAS] NECESSITA ADAPTADOR DE AMBIENTE'
        );
    }
}

function executar() {

    console.log('');
    console.log('====================================================');
    console.log(' SOUSA 2.0 - ADAPTADOR HÍBRIDO');
    console.log(' DIAGNÓSTICO DE INTERFACES');
    console.log('====================================================');

    const relatorio = [];

    for (
        const [grupo, componentes]
        of Object.entries(COMPONENTES)
    ) {

        if (
            typeof componentes === 'string'
        ) {

            const resultado =
                analisar(componentes);

            imprimir(
                grupo,
                grupo,
                resultado
            );

            relatorio.push({
                grupo,
                nome: grupo,
                ...resultado
            });

            continue;
        }

        for (
            const [nome, arquivo]
            of Object.entries(componentes)
        ) {

            const resultado =
                analisar(arquivo);

            imprimir(
                grupo,
                nome,
                resultado
            );

            relatorio.push({
                grupo,
                nome,
                ...resultado
            });
        }
    }

    const existentes =
        relatorio.filter(x => x.existe);

    const semExportacao =
        existentes.filter(
            x =>
                x.funcoes.length > 0 &&
                x.exports.length === 0
        );

    const commonjs =
        existentes.filter(
            x => x.formato === 'COMMONJS'
        );

    const gas =
        existentes.filter(
            x => x.formato === 'GOOGLE_APPS_SCRIPT'
        );

    const globais =
        existentes.filter(
            x => x.formato === 'JAVASCRIPT_GLOBAL'
        );

    console.log('');
    console.log('====================================================');
    console.log(' DIAGNÓSTICO DAS PONTES');
    console.log('====================================================');

    console.log(
        `Arquivos existentes:          ${existentes.length}`
    );

    console.log(
        `CommonJS:                     ${commonjs.length}`
    );

    console.log(
        `Google Apps Script:           ${gas.length}`
    );

    console.log(
        `JavaScript global:            ${globais.length}`
    );

    console.log(
        `Com funções sem exportação:   ${semExportacao.length}`
    );

    console.log('');

    if (semExportacao.length) {

        console.log(
            '[PONTE] EXISTEM FUNÇÕES NÃO EXPORTADAS'
        );

        console.log(
            '[PONTE] ISSO NÃO É FALHA DE SINTAXE'
        );

        console.log(
            '[PONTE] É DIFERENÇA DE MODELO DE EXECUÇÃO'
        );
    }

    console.log('');
    console.log(
        '[REGRA] NENHUM MÓDULO EXISTENTE FOI ALTERADO'
    );

    console.log(
        '[REGRA] NENHUM REPARO AUTOMÁTICO FOI EXECUTADO'
    );

    console.log('');
    console.log('====================================================');

    const pasta =
        path.join(
            RAIZ,
            '07_LOG',
            'FIO_CONDUTOR'
        );

    fs.mkdirSync(
        pasta,
        { recursive: true }
    );

    const destino =
        path.join(
            pasta,
            'diagnostico_interfaces_hibridas.json'
        );

    fs.writeFileSync(
        destino,
        JSON.stringify(
            {
                sistema: 'SOUSA 2.0',
                tipo: 'DIAGNOSTICO_INTERFACES_HIBRIDAS',
                data: new Date().toISOString(),
                resumo: {
                    existentes: existentes.length,
                    commonjs: commonjs.length,
                    googleAppsScript: gas.length,
                    javascriptGlobal: globais.length,
                    semExportacao: semExportacao.length
                },
                componentes: relatorio
            },
            null,
            2
        ),
        'utf8'
    );

    console.log(
        `[RELATÓRIO] ${destino}`
    );

    console.log('');
}

if (require.main === module) {
    executar();
}

module.exports = {
    executar,
    analisar,
    detectarFuncoes,
    detectarExports,
    detectarFormato
};
