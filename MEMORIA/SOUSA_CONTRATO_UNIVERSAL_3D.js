/**
 * SOUSA 2.0
 * CONTRATO UNIVERSAL 3D
 * Automação: 99,99%
 * Soberania humana: 0,01%
 */

'use strict';

const SOUSA_CONTRATO_UNIVERSAL_3D = Object.freeze({

    versao: '1.0.0',
    nome: 'SOUSA_CONTRATO_UNIVERSAL_3D',

    automacao: Object.freeze({
        percentual: 99.99,
        soberania_humana: 0.01,
        regra: 'INTERVENCAO_HUMANA_E_EXCECAO'
    }),

    visao_3d: Object.freeze({

        transversal: Object.freeze({
            nome: 'LARGURA',
            abrangencia: 'TODO_ECOSISTEMA_SOUSA_2_0',
            componentes: [
                'agentes',
                'workers',
                'modulos',
                'core',
                'apis',
                'conectores',
                'memoria',
                'interfaces',
                'capacidades',
                'automacoes',
                'playbooks',
                'wolverine'
            ]
        }),

        longitudinal: Object.freeze({
            nome: 'PROFUNDIDADE',
            ciclo: [
                'DETECCAO',
                'DIAGNOSTICO',
                'CLASSIFICACAO',
                'DECISAO',
                'EXECUCAO',
                'VALIDACAO',
                'RECUPERACAO',
                'REGISTRO',
                'APRENDIZADO',
                'PREVENCAO'
            ]
        }),

        diagonal: Object.freeze({
            nome: 'CONEXAO',
            principio:
                'Toda capacidade autorizada pode ser reutilizada ' +
                'por qualquer componente compatível do ecossistema.',
            compartilhamento: true,
            isolamento_de_capacidade: false
        })
    }),

    soberania: Object.freeze({
        proprietario: 'SOUSA_2_0',
        autoridade_final: 'FUNDADOR',

        regras: Object.freeze([
            'CAPACIDADES_PERTENCEM_AO_ECOSISTEMA',
            'AGENTES_NAO_SAO_DONOS_DE_CAPACIDADES',
            'AGENTES_NAO_PODEM_ELEVAR_SUA_PROPRIA_AUTONOMIA',
            'PLAYBOOKS_DEVEM_SER_HOMOLOGADOS',
            'SUCESSO_EXIGE_VALIDACAO',
            'INTERVENCAO_HUMANA_E_EXCECAO',
            'ALTERACAO_ESTRUTURAL_EXIGE_AUTORIZACAO'
        ])
    }),

    wolverine: Object.freeze({
        ativo: true,
        escopo: 'TODO_ECOSISTEMA_SOUSA_2_0',

        funcoes: Object.freeze([
            'DETECTAR',
            'DIAGNOSTICAR',
            'SELECIONAR_CAPACIDADE',
            'SELECIONAR_PLAYBOOK',
            'EXECUTAR',
            'VALIDAR',
            'RECUPERAR',
            'REGISTRAR',
            'APRENDER',
            'PREVENIR'
        ]),

        regra:
            'NAO_DECLARAR_CORRECAO_SEM_VALIDACAO'
    }),

    estados: Object.freeze([
        'NORMAL',
        'WOLVERINE_ATIVO',
        'ALERTA_TRAVA'
    ]),

    fonte_da_verdade: 'SOUSA_SOURCE_OF_TRUTH.json'
});

if (typeof module !== 'undefined') {
    module.exports = SOUSA_CONTRATO_UNIVERSAL_3D;
}
