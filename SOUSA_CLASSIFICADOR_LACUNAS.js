/**
 * ==========================================================
 * SOUSA 2.0 — CLASSIFICADOR DE LACUNAS
 * ==========================================================
 * Método definido por Elias (27/08/2026):
 *   Uma lacuna "[ ]" no checklist não é um buraco desconhecido
 *   a investigar na unha. É um item ainda não classificado.
 *
 * Este script:
 *   1. ENUMERA as lacunas a partir de um checklist em texto
 *      (formato "[ ] descrição" / "[x] descrição").
 *   2. CLASSIFICA cada lacuna em uma de 4 categorias.
 *   3. SEPARA por categoria.
 *   4. GERA uma fila objetiva — só o que for "ERRO_REAL" ou
 *      "NAO_TESTADO" e crítico entra na fila de ação imediata.
 *
 * Categorias:
 *   FALTANTE     — não existe código nenhum pra isso ainda
 *   PLANEJADO    — existe intenção documentada, não implementado
 *   NAO_TESTADO  — código existe, nunca rodou ponta a ponta
 *   ERRO_REAL    — deveria funcionar e está quebrado de fato
 *
 * Este script NÃO corrige nada sozinho. Ele só classifica e
 * organiza — decidir o que entra na fila de correção imediata
 * (passo 5 do método de Elias) continua sendo decisão humana
 * ou do Módulo ADS, não deste classificador.
 *
 * Uso:
 *   node SOUSA_CLASSIFICADOR_LACUNAS.js caminho/para/checklist.txt
 *
 * Se nenhum caminho for passado, tenta ler "CHECKLIST_SOUSA.txt"
 * na pasta atual.
 * ==========================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), '07_LOG', 'ClassificadorLacunas');
const LOG_FILE = path.join(LOG_DIR, 'Lacunas_Classificadas.json');
const RELATORIO_FILE = path.join(LOG_DIR, 'Relatorio_Lacunas.txt');

// ==========================================================
// REGRAS DE CLASSIFICAÇÃO (heurísticas por palavra-chave)
// ==========================================================
// Ajuste estas listas conforme o vocabulário real do seu
// checklist for se consolidando. Isso é intencionalmente
// simples e transparente — nada de "caixa preta" decidindo
// por você sem que se possa auditar a regra.

const REGRAS = [
  {
    categoria: 'PLANEJADO',
    palavras: ['voz clonada', 'avatar', 'copiloto', 'quatro versões', 'fonte única']
  },
  {
    categoria: 'NAO_TESTADO',
    palavras: ['validado', 'confirmado', 'confrontado', 'comprovada', 'testada']
  },
  {
    categoria: 'FALTANTE',
    palavras: ['auditoria final', 'liberar', 'firewall']
  }
  // Qualquer lacuna que não bater em nenhuma regra acima
  // cai em ERRO_REAL por padrão — "seguro por padrão": é
  // melhor investigar um item a mais do que deixar passar
  // um erro real disfarçado de planejamento.
];

// ==========================================================
// PASSO 1 — ENUMERAR
// ==========================================================
function enumerarLacunas(textoChecklist) {
  const linhas = textoChecklist.split('\n');
  const lacunas = [];

  linhas.forEach((linha, indice) => {
    const match = linha.match(/^\s*\[\s\]\s*(.+)$/);
    if (match) {
      lacunas.push({
        id: 'L' + String(lacunas.length + 1).padStart(2, '0'),
        descricao: match[1].trim(),
        linha_origem: indice + 1
      });
    }
  });

  return lacunas;
}

// ==========================================================
// PASSO 2 — CLASSIFICAR
// ==========================================================
function classificarLacuna(lacuna) {
  const descricaoLower = lacuna.descricao.toLowerCase();

  for (const regra of REGRAS) {
    const bateu = regra.palavras.some((palavra) =>
      descricaoLower.includes(palavra.toLowerCase())
    );
    if (bateu) {
      return {
        ...lacuna,
        categoria: regra.categoria,
        confianca: 'HEURISTICA'
      };
    }
  }

  return {
    ...lacuna,
    categoria: 'ERRO_REAL',
    confianca: 'PADRAO_SEGURO' // não bateu em nenhuma regra conhecida
  };
}

// ==========================================================
// PASSO 3 — SEPARAR
// ==========================================================
function separarPorCategoria(lacunasClassificadas) {
  const grupos = {
    FALTANTE: [],
    PLANEJADO: [],
    NAO_TESTADO: [],
    ERRO_REAL: []
  };

  lacunasClassificadas.forEach((item) => {
    grupos[item.categoria].push(item);
  });

  return grupos;
}

// ==========================================================
// PASSO 4 — GERAR FILA OBJETIVA
// ==========================================================
/**
 * Prioridade da fila:
 *   1º ERRO_REAL         (algo quebrado de fato — maior prioridade)
 *   2º NAO_TESTADO        (pode ser erro real ainda não confirmado)
 *   3º FALTANTE           (decisão consciente de construir ou não)
 *   4º PLANEJADO          (fica pra quando houver janela dedicada)
 */
function gerarFilaDeCorrecao(grupos) {
  return [
    ...grupos.ERRO_REAL.map((i) => ({ ...i, prioridade: 1 })),
    ...grupos.NAO_TESTADO.map((i) => ({ ...i, prioridade: 2 })),
    ...grupos.FALTANTE.map((i) => ({ ...i, prioridade: 3 })),
    ...grupos.PLANEJADO.map((i) => ({ ...i, prioridade: 4 }))
  ];
}

// ==========================================================
// EXECUÇÃO
// ==========================================================
function main() {
  const caminhoChecklist = process.argv[2] || 'CHECKLIST_SOUSA.txt';

  if (!fs.existsSync(caminhoChecklist)) {
    console.log('❌ Checklist não encontrado: ' + caminhoChecklist);
    console.log('Uso: node SOUSA_CLASSIFICADOR_LACUNAS.js caminho/checklist.txt');
    process.exit(1);
  }

  const texto = fs.readFileSync(caminhoChecklist, 'utf8');
  const lacunas = enumerarLacunas(texto);
  const classificadas = lacunas.map(classificarLacuna);
  const grupos = separarPorCategoria(classificadas);
  const fila = gerarFilaDeCorrecao(grupos);

  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const resultado = {
    sistema: 'SOUSA 2.0',
    modulo: 'ClassificadorLacunas',
    data: new Date().toISOString(),
    total_lacunas: lacunas.length,
    resumo: {
      FALTANTE: grupos.FALTANTE.length,
      PLANEJADO: grupos.PLANEJADO.length,
      NAO_TESTADO: grupos.NAO_TESTADO.length,
      ERRO_REAL: grupos.ERRO_REAL.length
    },
    fila_de_correcao: fila,
    grupos: grupos
  };

  fs.writeFileSync(LOG_FILE, JSON.stringify(resultado, null, 2), 'utf8');

  // Relatório legível
  let relatorio = '';
  relatorio += '====================================\n';
  relatorio += 'SOUSA 2.0 — CLASSIFICADOR DE LACUNAS\n';
  relatorio += 'DATA: ' + new Date().toLocaleString('pt-BR') + '\n';
  relatorio += '====================================\n\n';
  relatorio += 'TOTAL DE LACUNAS: ' + lacunas.length + '\n\n';
  relatorio += 'RESUMO:\n';
  relatorio += '  FALTANTE:     ' + grupos.FALTANTE.length + '\n';
  relatorio += '  PLANEJADO:    ' + grupos.PLANEJADO.length + '\n';
  relatorio += '  NAO_TESTADO:  ' + grupos.NAO_TESTADO.length + '\n';
  relatorio += '  ERRO_REAL:    ' + grupos.ERRO_REAL.length + '\n\n';
  relatorio += '------------------------------------\n';
  relatorio += 'FILA OBJETIVA DE CORREÇÃO (por prioridade)\n';
  relatorio += '------------------------------------\n\n';

  fila.forEach((item) => {
    relatorio += '[' + item.prioridade + '] (' + item.categoria + ') ' + item.descricao + '\n';
  });

  fs.writeFileSync(RELATORIO_FILE, relatorio, 'utf8');

  // Saída no console
  console.log('🐕 SOUSA 2.0 — CLASSIFICADOR DE LACUNAS');
  console.log('');
  console.log('Total de lacunas encontradas: ' + lacunas.length);
  console.log('  FALTANTE:    ' + grupos.FALTANTE.length);
  console.log('  PLANEJADO:   ' + grupos.PLANEJADO.length);
  console.log('  NAO_TESTADO: ' + grupos.NAO_TESTADO.length);
  console.log('  ERRO_REAL:   ' + grupos.ERRO_REAL.length);
  console.log('');
  console.log('📘 Relatório completo salvo em:');
  console.log('   ' + RELATORIO_FILE);
  console.log('📘 JSON estruturado salvo em:');
  console.log('   ' + LOG_FILE);
  console.log('');
  console.log('⚠️  Revise o relatório antes de agir.');
  console.log('    Este script classifica — não corrige nada sozinho.');
}

try {
  main();
} catch (erro) {
  console.log('❌ Falha no Classificador de Lacunas:');
  console.log(erro.message);
}
