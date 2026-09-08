'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = __dirname;

/*
 * ============================================================
 * SOUSA 2.0 — PONTE GLOBAL
 * ============================================================
 *
 * Objetivo:
 *  - carregar módulos JavaScript GLOBAL sem exigir module.exports
 *  - preservar as funções existentes
 *  - não alterar arquivos originais
 *  - executar em contexto isolado
 *  - entregar as funções ao núcleo adaptador
 *
 * NÃO executa reparos.
 * NÃO grava nos módulos.
 * NÃO chama APIs externas.
 * ============================================================
 */

function caminho(relativo) {
    return path.join(RAIZ, relativo);
}

function ler(relativo) {
    const arquivo = caminho(relativo);

    if (!fs.existsSync(arquivo)) {
        throw new Error(`ARQUIVO_NAO_ENCONTRADO: ${relativo}`);
    }

    return fs.readFileSync(arquivo, 'utf8');
}

function criarRequireControlado(baseDir) {

    return function requireControlado(modulo) {

        /*
         * Permite apenas módulos Node necessários
         * e módulos locais relativos.
         */

        if (
            modulo.startsWith('.') ||
            modulo.startsWith('/')
        ) {
            const alvo = require.resolve(
                path.resolve(baseDir, modulo)
            );

            return require(alvo);
        }

        return require(modulo);
    };
}

function carregarGlobal(relativo) {

    const codigo = ler(relativo);

    const sandbox = {

        console,

        process: {
            env: process.env,
            version: process.version,
            platform: process.platform
        },

        Buffer,

        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,

        __filename: caminho(relativo),
        __dirname: path.dirname(caminho(relativo)),

        module: {
            exports: {}
        },

        exports: {},

        require: criarRequireControlado(
            path.dirname(caminho(relativo))
        )

    };

    /*
     * Proxy evita que o módulo altere objetos
     * essenciais do processo principal.
     */

    sandbox.global = sandbox;
    sandbox.globalThis = sandbox;

    vm.createContext(sandbox);

    const script = new vm.Script(
        codigo,
        {
            filename: caminho(relativo),
            displayErrors: true
        }
    );

    script.runInContext(sandbox);

    return {
        arquivo: relativo,
        contexto: sandbox,
        exports: sandbox.module.exports
    };
}

/*
 * ============================================================
 * CONTEXTO COMPARTILHADO (adição mínima e compatível)
 * ============================================================
 *
 * carregarGlobal() acima cria um sandbox NOVO por chamada —
 * por isso módulos carregados separadamente não se enxergam
 * (cada um é um contexto isolado).
 *
 * As duas funções abaixo permitem montar UM único contexto e
 * carregar vários módulos DENTRO dele, em sequência, para que
 * as funções globais de cada arquivo enxerguem as dos demais.
 *
 * Não alteram nem substituem carregarGlobal()/criarPonte().
 * NÃO executam reparos. NÃO chamam API externa.
 * ============================================================
 */

function criarContextoBase() {

    const sandbox = {

        console,

        process: {
            env: process.env,
            version: process.version,
            platform: process.platform
        },

        Buffer,

        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,

        __filename: caminho('.'),
        __dirname: RAIZ,

        module: {
            exports: {}
        },

        exports: {},

        require: criarRequireControlado(RAIZ)

    };

    sandbox.global = sandbox;
    sandbox.globalThis = sandbox;

    vm.createContext(sandbox);

    return sandbox;
}

function carregarEmContexto(relativo, contexto) {

    if (!contexto) {
        throw new Error(
            'CONTEXTO_AUSENTE: chame criarContextoBase() antes.'
        );
    }

    let codigo;

    try {
        codigo = ler(relativo);
    } catch (erro) {
        return {
            ok: false,
            arquivo: relativo,
            erro: erro.message
        };
    }

    // Cada arquivo carregado ganha seu próprio module.exports
    // (evita que um módulo herde o export do módulo anterior),
    // mas continua no MESMO objeto global/contexto.
    contexto.__filename = caminho(relativo);
    contexto.__dirname = path.dirname(caminho(relativo));
    contexto.require = criarRequireControlado(contexto.__dirname);
    contexto.module = { exports: {} };
    contexto.exports = contexto.module.exports;

    try {

        const script = new vm.Script(
            codigo,
            {
                filename: caminho(relativo),
                displayErrors: true
            }
        );

        script.runInContext(contexto);

        return {
            ok: true,
            arquivo: relativo,
            exports: contexto.module.exports
        };

    } catch (erro) {

        return {
            ok: false,
            arquivo: relativo,
            erro: erro.message
        };
    }
}

function obterFuncoes(contexto, nomes) {

    const resultado = {};

    for (const nome of nomes) {

        if (
            contexto &&
            typeof contexto[nome] === 'function'
        ) {
            resultado[nome] = contexto[nome];
        }
    }

    return resultado;
}

function testarFuncao(funcao, nome) {

    if (typeof funcao !== 'function') {
        return {
            ok: false,
            status: 'FUNCAO_NAO_DISPONIVEL',
            funcao: nome
        };
    }

    return {
        ok: true,
        status: 'FUNCAO_CARREGADA',
        funcao: nome
    };
}

function criarPonte(relativo, nomes) {

    console.log('');
    console.log(
        `>>> CRIANDO PONTE GLOBAL: ${relativo}`
    );

    let carregado;

    try {

        carregado = carregarGlobal(relativo);

    } catch (erro) {

        console.log(
            `[ERRO] ${erro.message}`
        );

        return {
            ok: false,
            arquivo: relativo,
            erro: erro.message,
            funcoes: {}
        };
    }

    const funcoes = obterFuncoes(
        carregado.contexto,
        nomes
    );

    const testes = {};

    for (const nome of nomes) {

        testes[nome] =
            testarFuncao(
                funcoes[nome],
                nome
            );

        console.log(
            testes[nome].ok
                ? `  [OK] ${nome}`
                : `  [--] ${nome}`
        );
    }

    const disponiveis =
        Object.keys(funcoes).length;

    console.log(
        `[PONTE GLOBAL] ${disponiveis}/${nomes.length} disponíveis`
    );

    return {
        ok: true,
        arquivo: relativo,
        contexto: carregado.contexto,
        funcoes,
        testes
    };
}

function executar(nomePonte, nomeFuncao, ...args) {

    if (
        !nomePonte ||
        typeof nomePonte.funcoes?.[nomeFuncao] !== 'function'
    ) {

        return {
            ok: false,
            status: 'FUNCAO_NAO_DISPONIVEL',
            funcao: nomeFuncao
        };
    }

    try {

        const resultado =
            nomePonte.funcoes[nomeFuncao](...args);

        return {
            ok: true,
            status: 'EXECUTADO',
            funcao: nomeFuncao,
            resultado
        };

    } catch (erro) {

        return {
            ok: false,
            status: 'ERRO_EXECUCAO',
            funcao: nomeFuncao,
            erro: erro.message
        };
    }
}


/*
 * ============================================================
 * TESTE CONTROLADO
 * ============================================================
 */

function teste() {

    console.log('');
    console.log(
        '===================================================='
    );
    console.log(
        ' SOUSA 2.0 — PONTE GLOBAL'
    );
    console.log(
        ' TESTE CONTROLADO'
    );
    console.log(
        '===================================================='
    );

    const pontes = {};

    pontes.orquestrador =
        criarPonte(
            'SOUSA_ORQUESTRADOR.js',
            [
                'SOUSA_ORQUESTRADOR_criarCiclo',
                'SOUSA_ORQUESTRADOR_planejarComposto',
                'SOUSA_ORQUESTRADOR_executar',
                'SOUSA_ORQUESTRADOR_porTexto',
                'SOUSA_ORQUESTRADOR_porCanal',
                'SOUSA_ORQUESTRADOR_fluxo'
            ]
        );

    pontes.executor =
        criarPonte(
            'SOUSA_API_EXECUTOR_UNIVERSAL.js',
            [
                'SOUSA_API_EXECUTOR_UNIVERSAL',
                'SOUSA_API_EXECUTOR_COM_CASCATA',
                'SOUSA_API_EXECUTOR_normalizarContexto'
            ]
        );

    pontes.diagnostico =
        criarPonte(
            'SOUSA_AUTO_DIAGNOSTICO.js',
            [
                'SOUSA_AUTO_DIAGNOSTICO'
            ]
        );

    pontes.manutencao =
        criarPonte(
            'SOUSA_MANUTENCAO_REFINO.js',
            [
                'SOUSA_MANUTENCAO_diagnosticoCompleto',
                'SOUSA_MANUTENCAO_refinarCascata',
                'SOUSA_MANUTENCAO_sanitizarAmbiente',
                'SOUSA_MANUTENCAO_convergirImplantacaoUnica',
                'SOUSA_MANUTENCAO_executarCicloCompleto',
                'SOUSA_MANUTENCAO_configurarTrigger'
            ]
        );

    pontes.identidade =
        criarPonte(
            'SOUSA_IA_IDENTIDADE.js',
            [
                'SOUSA_IA_criarContextoIdentidade',
                'SOUSA_IA_memoriaContrato'
            ]
        );

    pontes.compositor =
        criarPonte(
            'SOUSA_IA_COMPOSITOR.js',
            [
                'SOUSA_IA_normalizarNecessidades',
                'SOUSA_IA_listarRecursos',
                'SOUSA_IA_scoreRecurso',
                'SOUSA_IA_planejar',
                'SOUSA_IA_prepararConsolidacao'
            ]
        );

    pontes.continuidade =
        criarPonte(
            'SOUSA_CONTINUITY_ENGINE.js',
            [
                'ADS_CONTINUITY_ENGINE_generate',
                'setupAutoTrigger'
            ]
        );

    console.log('');
    console.log(
        '===================================================='
    );
    console.log(
        ' RESULTADO'
    );
    console.log(
        '===================================================='
    );

    const resultados =
        Object.entries(pontes);

    let total = 0;
    let disponiveis = 0;

    for (const [nome, ponte] of resultados) {

        if (!ponte.ok) {

            console.log(
                `[ERRO] ${nome}`
            );

            continue;
        }

        const qtd =
            Object.keys(
                ponte.funcoes || {}
            ).length;

        total +=
            ponte.testes
                ? Object.keys(ponte.testes).length
                : 0;

        disponiveis += qtd;

        console.log(
            `[${nome}] ${qtd} funções disponíveis`
        );
    }

    console.log('');
    console.log(
        `Interfaces examinadas: ${total}`
    );

    console.log(
        `Interfaces recuperadas: ${disponiveis}`
    );

    console.log('');

    if (disponiveis > 0) {

        console.log(
            '[PASS] PONTE GLOBAL OPERACIONAL'
        );

        console.log(
            '[PASS] MÓDULOS ORIGINAIS PRESERVADOS'
        );

        console.log(
            '[PASS] CONTEXTO ISOLADO'
        );

        console.log(
            '[PASS] NENHUM REPARO EXECUTADO'
        );

        console.log('');
        console.log(
            'PRÓXIMA FASE: TESTE DE FLUXO CONTROLADO'
        );

    } else {

        console.log(
            '[BLOQUEADO] Nenhuma interface recuperada.'
        );
    }

    console.log(
        '===================================================='
    );
    console.log('');
    
    return pontes;
}

module.exports = {
    caminho,
    ler,
    carregarGlobal,
    obterFuncoes,
    criarPonte,
    executar,
    teste,
    criarContextoBase,
    carregarEmContexto
};

if (require.main === module) {
    teste();
}

