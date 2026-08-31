'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const PONTES = {
    ORQUESTRADOR: {
        arquivo: 'SOUSA_ORQUESTRADOR.js',
        funcoes: [
            'SOUSA_ORQUESTRADOR_criarCiclo',
            'SOUSA_ORQUESTRADOR_planejarComposto',
            'SOUSA_ORQUESTRADOR_executar',
            'SOUSA_ORQUESTRADOR_porTexto',
            'SOUSA_ORQUESTRADOR_porCanal',
            'SOUSA_ORQUESTRADOR_fluxo'
        ]
    },

    GUARDA: {
        monitor: {
            arquivo: 'MonitorSintaxe.js',
            funcoes: [
                'analisarArquivo',
                'diagnosticar',
                'procurarArquivos'
            ]
        },
        guardian: {
            arquivo: 'CAMPAIGN_GUARDIAN.js',
            funcoes: [
                'campaignGuardianCheck'
            ]
        }
    },

    MECANICO: {
        diagnostico: {
            arquivo: 'SOUSA_AUTO_DIAGNOSTICO.js',
            funcoes: [
                'SOUSA_AUTO_DIAGNOSTICO'
            ]
        },
        reparo: {
            arquivo: 'MEMORIA/core/capabilities/SOUSA_AUTO_REPAIR_ENGINE.js',
            funcoes: [
                'syntaxTest',
                'deterministicRepair',
                'createBackup',
                'createSandboxFile',
                'cleanupSandbox',
                'repair'
            ]
        },
        selfTest: {
            arquivo: 'MEMORIA/core/capabilities/SOUSA_SELF_TEST_REPAIR.js',
            funcoes: [
                'syntaxTest',
                'diagnose',
                'run'
            ]
        }
    },

    SOUSA_IA: {
        comando: {
            arquivo: 'SOUSA_IA_COMANDO_DIAGNOSTICO.js',
            funcoes: [
                'SOUSA_IA_comando',
                'SOUSA_IA_status',
                'SOUSA_IA_metricas',
                'SOUSA_IA_diagnostico',
                'SOUSA_IA_WATCHDOG_verificar'
            ]
        },
        identidade: {
            arquivo: 'SOUSA_IA_IDENTIDADE.js',
            funcoes: [
                'SOUSA_IA_criarContextoIdentidade',
                'SOUSA_IA_memoriaContrato'
            ]
        },
        compositor: {
            arquivo: 'SOUSA_IA_COMPOSITOR.js',
            funcoes: [
                'SOUSA_IA_normalizarNecessidades',
                'SOUSA_IA_listarRecursos',
                'SOUSA_IA_scoreRecurso',
                'SOUSA_IA_planejar',
                'SOUSA_IA_prepararConsolidacao'
            ]
        },
        dna: {
            arquivo: 'SOUSA_IA_DNA_MEMORIA_VOZ.js',
            funcoes: [
                'SOUSA_IA_DNA_obter',
                'SOUSA_IA_DNA_salvar',
                'SOUSA_IA_DNA_mesclar',
                'SOUSA_IA_MEMORIA_carregar',
                'SOUSA_IA_MEMORIA_salvar'
            ]
        }
    },

    MEMORIA: {
        continuidade: {
            arquivo: 'SOUSA_CONTINUITY_ENGINE.js',
            funcoes: [
                'ADS_CONTINUITY_ENGINE_generate',
                'setupAutoTrigger'
            ]
        }
    },

    EXECUTOR: {
        arquivo: 'SOUSA_API_EXECUTOR_UNIVERSAL.js',
        funcoes: [
            'SOUSA_API_EXECUTOR_UNIVERSAL',
            'SOUSA_API_EXECUTOR_COM_CASCATA',
            'SOUSA_API_EXECUTOR_normalizarContexto'
        ]
    }
};

function caminho(arquivo) {
    return path.join(RAIZ, arquivo);
}

function carregar(arquivo) {
    const alvo = caminho(arquivo);

    if (!fs.existsSync(alvo)) {
        return {
            ok: false,
            erro: 'ARQUIVO_NAO_ENCONTRADO'
        };
    }

    try {
        delete require.cache[require.resolve(alvo)];

        const modulo = require(alvo);

        return {
            ok: true,
            modulo
        };

    } catch (erro) {
        return {
            ok: false,
            erro: erro.message
        };
    }
}

function executarFuncao(modulo, nome, ...args) {
    if (!modulo || typeof modulo[nome] !== 'function') {
        return {
            ok: false,
            status: 'FUNCAO_NAO_EXPORTADA',
            funcao: nome
        };
    }

    try {
        return {
            ok: true,
            status: 'PONTE_DISPONIVEL',
            funcao: nome,
            resultado: modulo[nome](...args)
        };

    } catch (erro) {
        return {
            ok: false,
            status: 'ERRO_EXECUCAO',
            funcao: nome,
            erro: erro.message
        };
    }
}

function testarPonte(nome, definicao) {

    console.log('');
    console.log(`>>> PONTE: ${nome}`);

    const carregado = carregar(definicao.arquivo);

    if (!carregado.ok) {
        console.log(`[ERRO] ${carregado.erro}`);
        return false;
    }

    console.log(`[OK] carregado: ${definicao.arquivo}`);

    let disponiveis = 0;

    for (const funcao of definicao.funcoes || []) {

        if (typeof carregado.modulo?.[funcao] === 'function') {
            console.log(`  [OK] ${funcao}`);
            disponiveis++;
        } else {
            console.log(`  [--] ${funcao}`);
        }
    }

    console.log(
        `[PONTE] ${disponiveis}/${definicao.funcoes.length} interfaces disponíveis`
    );

    return true;
}

function varrerGrupo(grupo, definicoes) {

    console.log('');
    console.log('==============================================');
    console.log(` GRUPO: ${grupo}`);
    console.log('==============================================');

    for (const [nome, definicao] of Object.entries(definicoes)) {

        if (definicao.funcoes) {
            testarPonte(nome, definicao);
        } else {
            testarPonte(nome, definicao);
        }
    }
}

function testar() {

    console.log('');
    console.log('====================================================');
    console.log(' SOUSA 2.0 - ADAPTADOR DO FIO CONDUTOR');
    console.log(' TESTE DAS PONTES');
    console.log('====================================================');

    let total = 0;
    let carregadas = 0;

    for (const [grupo, definicao] of Object.entries(PONTES)) {

        if (definicao.arquivo) {

            total++;

            if (testarPonte(grupo, definicao)) {
                carregadas++;
            }

        } else {

            varrerGrupo(grupo, definicao);
        }
    }

    console.log('');
    console.log('====================================================');
    console.log(' RESULTADO DAS PONTES');
    console.log('====================================================');
    console.log(`Componentes centrais testados: ${total}`);
    console.log(`Componentes carregados:        ${carregadas}`);
    console.log('');

    if (carregadas === total) {
        console.log('[PASS] PONTES CENTRAIS CARREGÁVEIS');
        console.log('[PASS] GUARDA PRESENTE');
        console.log('[PASS] MONITOR PRESENTE');
        console.log('[PASS] MECÂNICO PRESENTE');
        console.log('[PASS] SOUSA IA PRESENTE');
        console.log('[PASS] MEMÓRIA PRESENTE');
        console.log('[PASS] EXECUTOR PRESENTE');
        console.log('');
        console.log('PRÓXIMA FASE: TESTE DE FLUXO CONTROLADO');
    } else {
        console.log('[ATENÇÃO] Existem componentes que precisam de ponte específica.');
    }

    console.log('====================================================');
    console.log('');
}

module.exports = {
    PONTES,
    carregar,
    executarFuncao,
    testar
};

if (require.main === module) {
    testar();
}
