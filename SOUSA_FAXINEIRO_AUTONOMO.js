/**
 * SOUSA 2.0 - FAXINEIRO AUTONOMO
 * ==========================================================
 * Motor de limpeza automatica.
 *
 * FUNCAO:
 *   - Escaneia o projeto
 *   - Identifica lixo (tmp, backups antigos, venvs, node_modules)
 *   - Move para quarentena OU exclui
 *   - Registra tudo
 *   - Reporta
 *
 * PRINCIPIO:
 *   - Aditivo puro. Nao altera nada existente.
 *   - Sempre preserva: .gs, .js, .html, .json, .git, .github
 *   - Sempre move pra quarentena primeiro (opcao de excluir depois)
 *   - Falha silenciosa: nunca quebra o SOUSA
 * ==========================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const QUARENTENA = path.join(RAIZ, '.QUARENTENA_AUTO');
const LOG_DIR = path.join(RAIZ, 'logs', 'faxineiro');

const CONFIG = {
    versao: '1.0.0',
    // O que considerar lixo
    lixo: {
        pastas_tmp: [
            '.tmp.driveupload',
            '.tmp.drivedownload',
            '.pytest_cache',
            '__pycache__'
        ],
        pastas_ambiente: [
            'node_modules',
            '.venv',
            '.venv-piper',
            'venv'
        ],
        pastas_backup: [
            'Backups',
            '.QUARENTENA_SOUSA',
            '.QUARENTENA_CONSOLIDACAO',
            'BACKUP_GITHUB_CONFLITOS_20260825_120349',
            '_SOUSA_SYNC_HISTORY'
        ],
        pastas_arquivo: [
            'models',
            'data',
            'avatar',
            'voice',
            'usb',
            'src',
            'distribution',
            'docs',
            'EXTENSOES',
            'Extensions',
            'CONTRATOS_SOUSA',
            'DIAGNOSTICO_SOUSA',
            'CENTRAL',
            'OPERACAO',
            'TOOLS_SOUSA',
            'SOUSA_MEDIA_INFERENCE_WORKER'
        ],
        arquivos_por_extensao: [
            '.pdf', '.docx', '.zip', '.wav', '.jpeg', '.png'
        ]
    },
    // Preservar sempre
    preservar: [
        '.gs', '.js', '.html', '.json',
        '.git', '.github',
        'appsscript.json',
        '.clasp.json',
        '.claspignore',
        'SOUSA_FAXINEIRO_AUTONOMO.js'
    ],
    // Modo: 'quarentena' (padrao) ou 'excluir'
    modo: 'quarentena',
    // Tamanho minimo para reportar (bytes)
    tamanho_minimo_pasta: 1024 * 1024 // 1 MB
};

// ==========================================================
// UTILITARIOS
// ==========================================================
function tamanhoDir(dir) {
    let total = 0;
    try {
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, item.name);
            if (item.isDirectory()) {
                total += tamanhoDir(p);
            } else {
                try { total += fs.statSync(p).size; } catch (e) {}
            }
        }
    } catch (e) {}
    return total;
}

function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function garantirDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// ==========================================================
// 1. ESCANEAR
// ==========================================================
function escanear() {
    const inventario = {
        pastas_tmp: [],
        pastas_ambiente: [],
        pastas_backup: [],
        pastas_arquivo: [],
        arquivos_lixo: []
    };

    // Pastas tmp
    CONFIG.lixo.pastas_tmp.forEach(nome => {
        const p = path.join(RAIZ, nome);
        if (fs.existsSync(p)) {
            inventario.pastas_tmp.push({
                nome, caminho: p, tamanho: tamanhoDir(p)
            });
        }
    });

    // Pastas de ambiente
    CONFIG.lixo.pastas_ambiente.forEach(nome => {
        const p = path.join(RAIZ, nome);
        if (fs.existsSync(p)) {
            inventario.pastas_ambiente.push({
                nome, caminho: p, tamanho: tamanhoDir(p)
            });
        }
    });

    // Pastas de backup
    CONFIG.lixo.pastas_backup.forEach(nome => {
        const p = path.join(RAIZ, nome);
        if (fs.existsSync(p)) {
            inventario.pastas_backup.push({
                nome, caminho: p, tamanho: tamanhoDir(p)
            });
        }
    });

    // Pastas de arquivo morto
    CONFIG.lixo.pastas_arquivo.forEach(nome => {
        const p = path.join(RAIZ, nome);
        if (fs.existsSync(p)) {
            inventario.pastas_arquivo.push({
                nome, caminho: p, tamanho: tamanhoDir(p)
            });
        }
    });

    // Arquivos por extensao
    try {
        for (const item of fs.readdirSync(RAIZ, { withFileTypes: true })) {
            if (item.isFile()) {
                const ext = path.extname(item.name).toLowerCase();
                if (CONFIG.lixo.arquivos_por_extensao.includes(ext)) {
                    const p = path.join(RAIZ, item.name);
                    inventario.arquivos_lixo.push({
                        nome: item.name,
                        caminho: p,
                        tamanho: fs.statSync(p).size
                    });
                }
            }
        }
    } catch (e) {}

    return inventario;
}

// ==========================================================
// 2. CALCULAR ESPACO
// ==========================================================
function calcularEspaco(inventario) {
    let total = 0;
    const categorias = {};

    for (const chave of Object.keys(inventario)) {
        const itens = inventario[chave];
        const soma = itens.reduce((acc, x) => acc + (x.tamanho || 0), 0);
        categorias[chave] = {
            quantidade: itens.length,
            bytes: soma,
            formatado: formatarTamanho(soma)
        };
        total += soma;
    }

    return {
        total_bytes: total,
        total_formatado: formatarTamanho(total),
        categorias
    };
}

// ==========================================================
// 3. LIMPAR
// ==========================================================
function limpar(inventario, opcoes) {
    const opts = opcoes || {};
    const modo = opts.modo || CONFIG.modo;
    const dryRun = opts.dryRun !== false; // padrao: dry-run
    const resultado = {
        movidos: [],
        excluidos: [],
        pulados: [],
        erros: []
    };

    garantirDir(QUARENTENA);

    const todos = [
        ...inventario.pastas_tmp,
        ...inventario.pastas_ambiente,
        ...inventario.pastas_backup,
        ...inventario.pastas_arquivo,
        ...inventario.arquivos_lixo
    ];

    for (const item of todos) {
        if (dryRun) {
            resultado.pulados.push(item.nome);
            continue;
        }

        try {
            if (modo === 'excluir') {
                fs.rmSync(item.caminho, { recursive: true, force: true });
                resultado.excluidos.push(item.nome);
            } else {
                const destino = path.join(QUARENTENA, item.nome);
                if (fs.existsSync(destino)) {
                    fs.rmSync(destino, { recursive: true, force: true });
                }
                fs.renameSync(item.caminho, destino);
                resultado.movidos.push(item.nome);
            }
        } catch (e) {
            resultado.erros.push({
                nome: item.nome,
                erro: e.message
            });
        }
    }

    return resultado;
}

// ==========================================================
// 4. REGISTRAR
// ==========================================================
function registrar(inventario, espaco, resultado) {
    garantirDir(LOG_DIR);

    const log = {
        timestamp: new Date().toISOString(),
        versao: CONFIG.versao,
        modo: CONFIG.modo,
        espaco: espaco,
        inventario: inventario,
        resultado: resultado
    };

    const nome = 'faxina_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    const caminho = path.join(LOG_DIR, nome);

    try {
        fs.writeFileSync(caminho, JSON.stringify(log, null, 2), 'utf8');
        return { ok: true, log: caminho };
    } catch (e) {
        return { ok: false, erro: e.message };
    }
}

// ==========================================================
// 5. CICLO COMPLETO
// ==========================================================
function cicloCompleto(opcoes) {
    const opts = opcoes || {};
    const inventario = escanear();
    const espaco = calcularEspaco(inventario);

    let limpeza = null;
    if (opts.executar) {
        limpeza = limpar(inventario, {
            modo: opts.modo || CONFIG.modo,
            dryRun: false
        });
    }

    const log = registrar(inventario, espaco, limpeza);

    return {
        ok: true,
        protocolo: 'SOUSA-FAXINEIRO',
        versao: CONFIG.versao,
        modo: opts.executar ? 'EXECUTADO' : 'SIMULADO',
        espaco: espaco,
        inventario: inventario,
        limpeza: limpeza,
        log: log
    };
}

// ==========================================================
// API PUBLICA
// ==========================================================
module.exports = {
    escanear,
    calcularEspaco,
    limpar,
    registrar,
    cicloCompleto,
    CONFIG
};

// ==========================================================
// EXECUCAO DIRETA
// ==========================================================
if (require.main === module) {
    console.log('\n=== SOUSA FAXINEIRO AUTONOMO - SCAN ===\n');
    const resultado = cicloCompleto({ executar: false });
    console.log(JSON.stringify(resultado, null, 2));
    console.log('\n=== FIM ===\n');
}
