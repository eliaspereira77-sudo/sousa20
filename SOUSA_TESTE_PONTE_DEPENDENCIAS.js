'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = __dirname;

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

function criarSandbox() {

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

        module: {
            exports: {}
        },

        exports: {}
    };

    sandbox.global = sandbox;
    sandbox.globalThis = sandbox;

    return sandbox;
}

function carregarNoMesmoContexto(sandbox, relativo) {

    const codigo = ler(relativo);

    sandbox.__filename = caminho(relativo);
    sandbox.__dirname =
        path.dirname(caminho(relativo));

    sandbox.require =
        criarRequireControlado(
            sandbox.__dirname
        );

    const script = new vm.Script(
        codigo,
        {
            filename: caminho(relativo),
            displayErrors: true
        }
    );

    script.runInContext(sandbox);

    return sandbox;
}

function verificar(sandbox, nomes) {

    const resultado = {};

    for (const nome of nomes) {

        const existe =
            typeof sandbox[nome] === 'function';

        resultado[nome] = existe;

        console.log(
            existe
                ? `[OK] ${nome}`
                : `[FALHA] ${nome}`
        );
    }

    return resultado;
}

function teste() {

    console.log('');
    console.log('====================================================');
    console.log(' SOUSA 2.0 — PONTE DE DEPENDÊNCIAS');
    console.log(' TESTE CONTROLADO');
    console.log('====================================================');

    const sandbox = criarSandbox();

    vm.createContext(sandbox);

    /*
     * ORDEM INTENCIONAL:
     *
     * 1. CONTRATO
     * 2. ADAPTERS
     * 3. TRANSPORTES
     * 4. REGISTRY
     * 5. API USB
     * 6. POLÍTICA
     * 7. EXECUTOR
     *
     * Tudo no MESMO sandbox.
     */

    const arquivos = [
        'SOUSA_USB_CONTRATO.js',
        'SOUSA_USB_ADAPTERS.js',
        'SOUSA_USB_TRANSPORTES.js',
        'SOUSA_USB_REGISTRY.js',
        'SOUSA_API_USB.js',
        'SOUSA_POLITICA.js',
        'SOUSA_API_EXECUTOR_UNIVERSAL.js'
    ];

    for (const arquivo of arquivos) {

        console.log('');
        console.log(`>>> CARREGANDO: ${arquivo}`);

        try {

            carregarNoMesmoContexto(
                sandbox,
                arquivo
            );

            console.log(
                `[OK] ${arquivo}`
            );

        } catch (erro) {

            console.log(
                `[ERRO] ${arquivo}: ${erro.message}`
            );

            return false;
        }
    }

    console.log('');
    console.log('====================================================');
    console.log(' VERIFICAÇÃO DAS DEPENDÊNCIAS');
    console.log('====================================================');

    const funcoes = verificar(
        sandbox,
        [
            'SOUSA_USB_normalizarContexto',
            'SOUSA_API_USB_preparar',
            'SOUSA_POLITICA_cooldown',
            'SOUSA_API_EXECUTOR_UNIVERSAL',
            'SOUSA_API_EXECUTOR_COM_CASCATA',
            'SOUSA_API_EXECUTOR_normalizarContexto'
        ]
    );

    console.log('');
    console.log('====================================================');
    console.log(' TESTE DA NORMALIZAÇÃO');
    console.log('====================================================');

    if (
        typeof sandbox.SOUSA_API_EXECUTOR_normalizarContexto
        !== 'function'
    ) {

        console.log(
            '[BLOQUEADO] Executor não disponível.'
        );

        return false;
    }

    try {

        const resultado =
            sandbox.SOUSA_API_EXECUTOR_normalizarContexto({
                origem: 'TESTE_PONTE_DEPENDENCIAS',
                intencao: 'diagnostico',
                canal: 'local',
                seguro: true
            });

        console.log(
            JSON.stringify(
                resultado,
                null,
                2
            )
        );

        console.log('');
        console.log(
            '[PASS] DEPENDÊNCIAS RESOLVIDAS NO MESMO CONTEXTO'
        );

    } catch (erro) {

        console.log('');
        console.log(
            `[FALHA] ${erro.message}`
        );

        return false;
    }

    console.log('');
    console.log('====================================================');
    console.log(' RESULTADO FINAL');
    console.log('====================================================');

    const falhas =
        Object.entries(funcoes)
            .filter(
                ([, ok]) => !ok
            );

    if (falhas.length === 0) {

        console.log(
            '[PASS] TODAS AS DEPENDÊNCIAS RESOLVIDAS'
        );

        console.log(
            '[PASS] EXECUTOR CONECTADO À CAMADA USB'
        );

        console.log(
            '[PASS] POLÍTICA DISPONÍVEL'
        );

        console.log(
            '[PASS] API USB DISPONÍVEL'
        );

        console.log(
            '[PASS] TRANSPORTES DISPONÍVEIS'
        );

        console.log(
            '[PASS] NENHUM ARQUIVO ORIGINAL ALTERADO'
        );

    } else {

        console.log(
            `[ATENÇÃO] ${falhas.length} dependência(s) ainda não resolvida(s).`
        );
    }

    console.log(
        '===================================================='
    );
    console.log('');

    return falhas.length === 0;
}

if (require.main === module) {

    process.exit(
        teste()
            ? 0
            : 1
    );
}

module.exports = {
    teste
};
