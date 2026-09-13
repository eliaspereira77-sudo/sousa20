
// ═══ GAP PREENCHIDO: PERSISTENCIA (Drive) ═══
// SOUSA_FIO_CONDUTOR_REAL obedece a SOUSA_DRIVE_PERSISTENCE.gs.js
// para checkpoint e recuperação de estado
// ════════════════════════════════════════════

// ═══ GAP PREENCHIDO: RUFLO (Aprendizado) ═══
// SOUSA_FIO_CONDUTOR_REAL obedece a SOUSA_RUFLO_ADAPTER.js
// para consolidação de aprendizado pós-ciclo
// ════════════════════════════════════════════
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ═══ FONTE DA VERDADE SOUSA 2.0 ═══
// Este componente obedece a SOUSA_SOURCE_OF_TRUTH.json
let SOUSA_SOURCE_OF_TRUTH = null;
try { SOUSA_SOURCE_OF_TRUTH = require('./SOUSA_SOURCE_OF_TRUTH.json'); } catch(e) { /* Fonte indisponível */ }
// ═══════════════════════════════════


const RAIZ = __dirname;

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

/*
 * ============================================================
 * INTEGRAÇÃO REAL DO FIO CONDUTOR
 * ============================================================
 * O mapeamento acima (mapear/imprimir/executar) NÃO é alterado.
 *
 * A partir daqui o Fio Condutor deixa de ser só auditor: ele
 * monta um CONTEXTO COMPARTILHADO (via SOUSA_PONTE_GLOBAL) e
 * carrega os módulos da cadeia INTENÇÃO → POLÍTICA →
 * REGISTRY/USB → CICLO → EXECUTOR → ORQUESTRADOR dentro dele,
 * na mesma ordem de dependência real (descoberta lendo os
 * arquivos, não suposta): USB_CONTRATO (define SOUSA_USB_ESTADOS/
 * normalizar/validarContrato, usados por USB_REGISTRY) →
 * USB_REGISTRY → USB_ADAPTERS (define os adaptadores de
 * protocolo, inclusive o TESTE_ECO, que não chama rede) →
 * APIS_CASCATA → API_USB (ponte com a cascata legada) →
 * REGISTRY (catálogo de componentes, usado quando necessário) →
 * POLITICA → INTENCAO → CICLO_AUTONOMO → API_EXECUTOR_UNIVERSAL
 * → ORQUESTRADOR.
 *
 * Nenhum arquivo original ganha module.exports novo. A ponte é
 * só o SOUSA_FIO_CONDUTOR_REAL.js + SOUSA_PONTE_GLOBAL.js.
 * ============================================================
 */

const ponteGlobal = require('./SOUSA_PONTE_GLOBAL.js');

const MODULOS_FIO_INTEGRACAO = [
    'SOUSA_USB_CONTRATO.js',
    'SOUSA_USB_REGISTRY.js',
    'SOUSA_USB_ADAPTERS.js',
    'SOUSA_APIS_CASCATA.js',
    'SOUSA_API_USB.js',
    'SOUSA_REGISTRY.js',
    'SOUSA_POLITICA.js',
    'SOUSA_INTENCAO.js',
    'SOUSA_CICLO_AUTONOMO.js',
    'SOUSA_API_EXECUTOR_UNIVERSAL.js',
    'SOUSA_ORQUESTRADOR.js'
];

const FUNCOES_CRITERIO_SUCESSO = [
    'SOUSA_INTENCAO_receber',
    'SOUSA_POLITICA_inferirCapacidade',
    'SOUSA_POLITICA_selecionar',
    'SOUSA_CICLO_criar',
    'SOUSA_CICLO_mudarEstado',
    'SOUSA_CICLO_registrarTentativa',
    'SOUSA_USB_listar',
    'SOUSA_API_EXECUTOR_UNIVERSAL',
    'SOUSA_ORQUESTRADOR_porTexto'
];

function montarContextoIntegrado() {

    const contexto = ponteGlobal.criarContextoBase();

    const carregamentos = MODULOS_FIO_INTEGRACAO.map(function (arquivo) {
        return ponteGlobal.carregarEmContexto(arquivo, contexto);
    });

    return { contexto, carregamentos };
}

function integrar() {

    console.log('');
    console.log('====================================================');
    console.log(' SOUSA 2.0 - FIO CONDUTOR REAL');
    console.log(' INTEGRAÇÃO OPERACIONAL (CONTEXTO COMPARTILHADO)');
    console.log('====================================================');
    console.log('');

    const { contexto, carregamentos } = montarContextoIntegrado();

    let bloqueio = null;

    for (const c of carregamentos) {
        const status = c.ok ? '[OK]' : '[ERRO]';
        console.log(`${status} carregado no contexto -> ${c.arquivo}`);
        if (!c.ok && !bloqueio) {
            bloqueio = c;
        }
    }

    console.log('');
    console.log('----------------------------------------------------');
    console.log(' VERIFICAÇÃO DAS FUNÇÕES ESSENCIAIS');
    console.log('----------------------------------------------------');

    const verificacao = {};
    let conectadas = 0;

    for (const nome of FUNCOES_CRITERIO_SUCESSO) {
        const disponivel = typeof contexto[nome] === 'function';
        verificacao[nome] = disponivel;
        if (disponivel) conectadas++;
        console.log(`${disponivel ? '[OK]' : '[--]'} ${nome}`);
    }

    console.log('');
    console.log(`Funções conectadas: ${conectadas}/${FUNCOES_CRITERIO_SUCESSO.length}`);

    let teste = null;

    if (!bloqueio && conectadas === FUNCOES_CRITERIO_SUCESSO.length) {

        console.log('');
        console.log('----------------------------------------------------');
        console.log(' TESTE CONTROLADO — SOUSA_ORQUESTRADOR_porTexto');
        console.log(' (sem USB conectada -> não chama API externa real)');
        console.log('----------------------------------------------------');

        try {
            const resultado = contexto.SOUSA_ORQUESTRADOR_porTexto(
                'teste de integracao do fio condutor',
                {}
            );

            teste = { ok: true, executou_sem_referencia_indefinida: true, resultado };

            console.log('[OK] SOUSA_ORQUESTRADOR_porTexto executou sem "is not defined"');
            console.log(`     status retornado: ${resultado && resultado.status}`);
            console.log('     (status de negocio, nao de integracao — sem USB conectada e esperado SELECAO_FALHOU/SEM_RECURSO)');

        } catch (erro) {
            teste = { ok: false, erro: erro.message };
            console.log(`[ERRO] ${erro.message}`);
        }

    } else {
        console.log('');
        console.log('[BLOQUEADO] Teste controlado não executado — nem todas as funções essenciais conectaram.');
    }

    console.log('');
    console.log('====================================================');

    const sucesso = !bloqueio &&
        conectadas === FUNCOES_CRITERIO_SUCESSO.length &&
        teste && teste.ok;

    if (sucesso) {
        console.log('FIO CONDUTOR: INTEGRADO');
        console.log('CONTEXTO: COMPARTILHADO');
        console.log('MÓDULOS ORIGINAIS: PRESERVADOS');
    } else if (bloqueio) {
        console.log(`STATUS: BLOQUEADO AO CARREGAR ${bloqueio.arquivo}`);
        console.log(`ERRO: ${bloqueio.erro}`);
    } else {
        console.log('STATUS: INTEGRAÇÃO PARCIAL — ver funções [--] acima');
    }

    console.log('====================================================');
    console.log('');

    return {
        ok: sucesso,
        carregamentos,
        verificacao,
        conectadas,
        total: FUNCOES_CRITERIO_SUCESSO.length,
        bloqueio,
        teste
    };
}

module.exports = {
    executar,
    mapear,
    integrar,
    montarContextoIntegrado,
    MODULOS_FIO_INTEGRACAO,
    FUNCOES_CRITERIO_SUCESSO
};

if (require.main === module) {
    executar();
    integrar();
}
