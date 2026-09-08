'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const RAIZ = __dirname;

/**
 * ==========================================================
 * INTEGRAÇÃO REAL — CONTEXTO COMPARTILHADO DE EXECUÇÃO
 * ==========================================================
 * Cada require() do Node isola o módulo em seu próprio escopo de
 * função — por isso SOUSA_ORQUESTRADOR_porTexto() não enxergava
 * SOUSA_INTENCAO_receber e as demais dependências quando cada
 * arquivo era carregado isoladamente: os componentes existem, mas
 * cada um vivia em seu próprio escopo.
 *
 * Os módulos abaixo foram escritos em estilo GAS (funções e vars
 * de topo, sem module.exports obrigatório) — ou seja, foram feitos
 * para viver num único escopo global compartilhado. A ponte aqui
 * usa vm.createContext + vm.Script para recriar esse mesmo tipo de
 * escopo global compartilhado dentro do Node, SEM alterar nenhum
 * dos arquivos originais.
 * ==========================================================
 */

const ORDEM_INTEGRACAO = [
    'SOUSA_USB_REGISTRY.js',
    'SOUSA_REGISTRY.js',
    'SOUSA_POLITICA.js',
    'SOUSA_INTENCAO.js',
    'SOUSA_CICLO_AUTONOMO.js',
    'SOUSA_API_EXECUTOR_UNIVERSAL.js',
    'SOUSA_ORQUESTRADOR.js'
];

const FUNCOES_ESSENCIAIS = {
    'INTENÇÃO': ['SOUSA_INTENCAO_receber'],
    'POLÍTICA': ['SOUSA_POLITICA_inferirCapacidade', 'SOUSA_POLITICA_selecionar'],
    'REGISTRY/USB': ['SOUSA_USB_listar'],
    'CICLO': ['SOUSA_CICLO_criar', 'SOUSA_CICLO_mudarEstado', 'SOUSA_CICLO_registrarTentativa'],
    'EXECUTOR': ['SOUSA_API_EXECUTOR_UNIVERSAL'],
    'ORQUESTRADOR': ['SOUSA_ORQUESTRADOR_porTexto']
};

/**
 * Monta um contexto vm único, carrega os módulos originais nele
 * (sem tocar nos arquivos) e retorna o sandbox onde todas as
 * funções globais dos módulos passam a coexistir e se enxergar.
 */
function construirContextoCompartilhado() {
    const sandbox = { console };
    vm.createContext(sandbox);

    const carregados = [];
    const falhas = [];

    for (const arquivo of ORDEM_INTEGRACAO) {
        const absoluto = path.join(RAIZ, arquivo);

        if (!fs.existsSync(absoluto)) {
            falhas.push({ arquivo, motivo: 'ARQUIVO_NAO_ENCONTRADO' });
            continue;
        }

        try {
            const codigo = fs.readFileSync(absoluto, 'utf8');
            const script = new vm.Script(codigo, { filename: absoluto });
            script.runInContext(sandbox);
            carregados.push(arquivo);
        } catch (erro) {
            falhas.push({ arquivo, motivo: erro.message });
        }
    }

    return { sandbox, carregados, falhas };
}

/**
 * Teste controlado: monta o contexto compartilhado, confirma que
 * as funções essenciais estão simultaneamente disponíveis e chama
 * SOUSA_ORQUESTRADOR_porTexto com um texto de teste — SEM executar
 * nenhuma API externa real (nenhum adaptador/USB é semeado aqui,
 * então a Política não encontra recurso operacional e retorna
 * "SEM_RECURSO" em vez de chamar um provedor de verdade).
 */
function testarIntegracao() {
    console.log('');
    console.log('====================================================');
    console.log(' SOUSA 2.0 - FIO CONDUTOR REAL');
    console.log(' TESTE CONTROLADO DE INTEGRAÇÃO');
    console.log('====================================================');
    console.log('');

    const { sandbox, carregados, falhas } = construirContextoCompartilhado();

    console.log(`Módulos carregados no contexto compartilhado: ${carregados.length}/${ORDEM_INTEGRACAO.length}`);
    carregados.forEach(a => console.log(`  [CARREGADO] ${a}`));
    falhas.forEach(f => console.log(`  [FALHA]     ${f.arquivo} -> ${f.motivo}`));
    console.log('');

    const conectadas = [];
    const ausentes = [];
    let todosGruposOk = true;

    for (const [grupo, funcoes] of Object.entries(FUNCOES_ESSENCIAIS)) {
        const okGrupo = funcoes.every(nome => typeof sandbox[nome] === 'function');
        funcoes.forEach(nome => {
            if (typeof sandbox[nome] === 'function') conectadas.push(nome);
            else ausentes.push(nome);
        });
        if (!okGrupo) todosGruposOk = false;
        console.log(`[${okGrupo ? 'OK' : 'FALHA'}] ${grupo}`);
    }

    console.log('');
    console.log(`Funções conectadas simultaneamente: ${conectadas.length}/${
        Object.values(FUNCOES_ESSENCIAIS).reduce((n, arr) => n + arr.length, 0)
    }`);
    if (ausentes.length) {
        console.log(`Ausentes: ${ausentes.join(', ')}`);
    }

    let resultadoOrquestrador = null;
    let erroChamada = null;

    if (typeof sandbox.SOUSA_ORQUESTRADOR_porTexto === 'function') {
        try {
            resultadoOrquestrador = sandbox.SOUSA_ORQUESTRADOR_porTexto(
                'teste controlado de integração do fio condutor',
                { modo_teste: true }
            );
        } catch (erro) {
            erroChamada = erro.message;
        }
    }

    console.log('');
    if (erroChamada) {
        console.log(`[BLOQUEIO] Chamada ao Orquestrador falhou: ${erroChamada}`);
    } else if (resultadoOrquestrador) {
        console.log('[OK] SOUSA_ORQUESTRADOR_porTexto() executou sem "is not defined"');
        console.log(`     status retornado: ${resultadoOrquestrador.status} (nenhuma API externa foi chamada — nenhuma USB foi semeada neste teste)`);
    } else {
        console.log('[FALHA] SOUSA_ORQUESTRADOR_porTexto não está disponível no contexto.');
    }

    const integrado = todosGruposOk && !erroChamada && !!resultadoOrquestrador;

    console.log('');
    console.log('====================================================');
    if (integrado) {
        console.log('FIO CONDUTOR: INTEGRADO');
        console.log('CONTEXTO: COMPARTILHADO');
        console.log('MÓDULOS ORIGINAIS: PRESERVADOS');
    } else {
        console.log('FIO CONDUTOR: BLOQUEIO DETECTADO NA INTEGRAÇÃO');
    }
    console.log('====================================================');
    console.log('');

    return {
        carregados,
        falhas,
        conectadas,
        ausentes,
        resultadoOrquestrador,
        erroChamada,
        integrado
    };
}

const SISTEMA = {
    NUCLEO: {
        ORQUESTRADOR: 'SOUSA_ORQUESTRADOR.js',
        REGISTRY: 'SOUSA_REGISTRY.js',
        EXECUTOR: 'SOUSA_API_EXECUTOR_UNIVERSAL.js'
    },

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
    }
};

function existe(relativo) {
    return fs.existsSync(path.join(RAIZ, relativo));
}

function ler(relativo) {
    try {
        return fs.readFileSync(path.join(RAIZ, relativo), 'utf8');
    } catch {
        return null;
    }
}

function sintaxe(relativo) {
    const absoluto = path.join(RAIZ, relativo);

    if (!fs.existsSync(absoluto)) {
        return {
            status: 'NAO_ENCONTRADO'
        };
    }

    const resultado = spawnSync(
        process.execPath,
        ['--check', absoluto],
        {
            encoding: 'utf8',
            windowsHide: true
        }
    );

    if (resultado.status === 0) {
        return {
            status: 'OK'
        };
    }

    return {
        status: 'ERRO',
        erro: (resultado.stderr || resultado.stdout || 'Erro desconhecido')
            .trim()
    };
}

function interfaceDetectada(relativo) {
    const codigo = ler(relativo);

    if (codigo === null) {
        return {
            exports: [],
            funcoes: [],
            require: false
        };
    }

    const funcoes = [];

    const regexFuncoes =
        /(?:function\s+([A-Za-z0-9_$]+)|(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\()/g;

    let match;

    while ((match = regexFuncoes.exec(codigo)) !== null) {
        const nome = match[1] || match[2];

        if (nome && !funcoes.includes(nome)) {
            funcoes.push(nome);
        }
    }

    const exportsEncontrados = [];

    if (/module\.exports\s*=/.test(codigo)) {
        exportsEncontrados.push('module.exports');
    }

    if (/exports\.[A-Za-z0-9_$]+/.test(codigo)) {
        exportsEncontrados.push('exports.*');
    }

    return {
        exports: exportsEncontrados,
        funcoes: funcoes.slice(0, 40),
        require: /require\s*\(/.test(codigo)
    };
}

function analisarComponente(grupo, nome, arquivo) {
    const resultado = {
        grupo,
        nome,
        arquivo,
        existe: existe(arquivo)
    };

    if (!resultado.existe) {
        resultado.status = 'AUSENTE';
        return resultado;
    }

    resultado.sintaxe = sintaxe(arquivo);
    resultado.interface = interfaceDetectada(arquivo);

    if (resultado.sintaxe.status !== 'OK') {
        resultado.status = 'ERRO_SINTAXE';
    } else if (
        resultado.interface.exports.length === 0 &&
        resultado.interface.funcoes.length === 0
    ) {
        resultado.status = 'SEM_INTERFACE_DETECTAVEL';
    } else {
        resultado.status = 'PRONTO_PARA_ADAPTACAO';
    }

    return resultado;
}

function mapear() {
    const resultados = [];

    for (const [grupo, componentes] of Object.entries(SISTEMA)) {
        for (const [nome, arquivo] of Object.entries(componentes)) {
            resultados.push(
                analisarComponente(grupo, nome, arquivo)
            );
        }
    }

    return resultados;
}

function imprimir(resultados) {

    console.log('');
    console.log('====================================================');
    console.log(' SOUSA 2.0 - FIO CONDUTOR REAL');
    console.log(' ENGRANAGEM DO ECOSSISTEMA');
    console.log('====================================================');
    console.log('');

    const resumo = {
        OK: 0,
        PRONTO_PARA_ADAPTACAO: 0,
        SEM_INTERFACE_DETECTAVEL: 0,
        ERRO_SINTAXE: 0,
        AUSENTE: 0
    };

    for (const item of resultados) {

        resumo[item.status] =
            (resumo[item.status] || 0) + 1;

        let simbolo = '[OK]';

        if (item.status === 'PRONTO_PARA_ADAPTACAO') {
            simbolo = '[ADAPT]';
        }

        if (item.status === 'SEM_INTERFACE_DETECTAVEL') {
            simbolo = '[ATENCAO]';
        }

        if (item.status === 'ERRO_SINTAXE') {
            simbolo = '[ERRO]';
        }

        if (item.status === 'AUSENTE') {
            simbolo = '[--]';
        }

        console.log(
            `${simbolo} ${item.grupo.padEnd(10)} ${item.nome.padEnd(16)} -> ${item.arquivo}`
        );

        if (item.status === 'ERRO_SINTAXE') {
            console.log(`       ${item.sintaxe.erro}`);
        }

        if (
            item.status === 'PRONTO_PARA_ADAPTACAO' &&
            item.interface.funcoes.length
        ) {
            console.log(
                `       Funcoes: ${item.interface.funcoes.slice(0, 8).join(', ')}`
            );
        }

        if (item.status === 'SEM_INTERFACE_DETECTAVEL') {
            console.log(
                '       Existe, mas precisa de uma ponte/adaptador.'
            );
        }
    }

    console.log('');
    console.log('----------------------------------------------------');
    console.log(' RESUMO');
    console.log('----------------------------------------------------');

    console.log(`Existentes:             ${
        resultados.filter(x => x.existe).length
    }`);

    console.log(`Prontos para adaptacao: ${
        resumo.PRONTO_PARA_ADAPTACAO
    }`);

    console.log(`Sem interface:          ${
        resumo.SEM_INTERFACE_DETECTAVEL
    }`);

    console.log(`Erros de sintaxe:       ${
        resumo.ERRO_SINTAXE
    }`);

    console.log(`Ausentes:               ${
        resumo.AUSENTE
    }`);

    console.log('');
    console.log('====================================================');

    if (resumo.ERRO_SINTAXE > 0) {
        console.log('STATUS: BLOQUEADO POR ERRO DE SINTAXE');
    } else if (resumo.AUSENTE > 0) {
        console.log('STATUS: ESTRUTURA COM PECAS AUSENTES');
    } else if (resumo.SEM_INTERFACE_DETECTAVEL > 0) {
        console.log('STATUS: NUCLEO EXISTE - PONTES NECESSARIAS');
    } else {
        console.log('STATUS: COMPONENTES PRONTOS PARA ENGRANAGEM');
    }

    console.log('====================================================');
    console.log('');
}

function salvarRelatorio(resultados) {

    const pasta = path.join(
        RAIZ,
        '07_LOG',
        'FIO_CONDUTOR'
    );

    fs.mkdirSync(pasta, { recursive: true });

    const arquivo = path.join(
        pasta,
        'relatorio_engrenagem.json'
    );

    fs.writeFileSync(
        arquivo,
        JSON.stringify(
            {
                sistema: 'SOUSA 2.0',
                tipo: 'FIO_CONDUTOR_REAL',
                data: new Date().toISOString(),
                resultados
            },
            null,
            2
        ),
        'utf8'
    );

    console.log(`[RELATORIO] ${arquivo}`);
}

function executar() {

    console.log('');
    console.log('>>> INICIANDO ENGRANAGEM');
    console.log('>>> Nenhum modulo existente sera alterado.');
    console.log('');

    const resultados = mapear();

    imprimir(resultados);

    salvarRelatorio(resultados);

    return resultados;
}

module.exports = {
    executar,
    mapear,
    construirContextoCompartilhado,
    testarIntegracao
};

if (require.main === module) {
    if (process.argv.includes('--teste-integracao')) {
        testarIntegracao();
    } else {
        executar();
    }
}
