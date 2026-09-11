# =================================================================================================
# INSTALAR_SOUSA_SYNC_GUARD.ps1
# -------------------------------------------------------------------------------------------------
# Script PowerShell para instalar o SOUSA_SYNC_GUARD.js
# diretamente na pasta de produção do SOUSA 2.0
#
# Destino:
#   C:\Users\Dionisio Lima\OneDrive\Área de Trabalho\SOUSA_2.0_PRODUCAO
#
# Uso:
#   1. Abra o PowerShell
#   2. Execute:  .\INSTALAR_SOUSA_SYNC_GUARD.ps1
#   3. Ou clique com o botão direito → Executar com PowerShell
#
# O script cria a pasta se não existir e grava o arquivo completo.
# =================================================================================================

$ErrorActionPreference = "Stop"

# Caminho de destino (ajuste se necessário)
$destinoPasta = "C:\Users\Dionisio Lima\OneDrive\Área de Trabalho\SOUSA_2.0_PRODUCAO"
$arquivoDestino = Join-Path $destinoPasta "SOUSA_SYNC_GUARD.js"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " SOUSA_SYNC_GUARD — Instalador (Modo Observação)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Cria a pasta se não existir
if (-not (Test-Path $destinoPasta)) {
    Write-Host "Criando pasta de destino..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $destinoPasta -Force | Out-Null
    Write-Host "Pasta criada: $destinoPasta" -ForegroundColor Green
} else {
    Write-Host "Pasta de destino já existe." -ForegroundColor Green
}

# Conteúdo completo do SOUSA_SYNC_GUARD.js
$conteudo = @'
/**
 * =================================================================================================
 * SOUSA_SYNC_GUARD.js
 * -------------------------------------------------------------------------------------------------
 * Extensão de SOUSA_AUTOGESTAO_ELO.js
 * Caminho feliz mínimo de sincronização — MODO OBSERVAÇÃO (v0.1.0)
 *
 * Princípios permanentes aplicados:
 * - Automação 99,99% / Soberania 0,01%
 * - Source of Truth único e autoritativo (Git + manifesto canônico)
 * - Runtime NUNCA promove estado divergente a novo Source of Truth
 * - Reutilizar > Aprimorar > Integrar > Reparar > Isolar
 * - Nenhuma mutação de produção nesta versão
 * - Wolverine como comportamento transversal (não agente isolado)
 * - SOUSA cuida do próprio SOUSA
 *
 * Fluxo obrigatório desta versão:
 *   1. Ler manifesto canônico (Source of Truth)
 *   2. Inventariar estado real do runtime
 *   3. Diff (esperado × encontrado)
 *   4. Classificar divergências
 *   5. Consolidar (registro + memória)
 *   6. Relatório soberano ao Fundador
 *
 * Proibido nesta versão:
 *   - Qualquer escrita em arquivos de produção
 *   - Qualquer promoção automática de estado local a SoT
 *   - Qualquer ação destrutiva ou de reparo
 *
 * Referência: Diagnóstico consolidado 10/09/2026 + Diretriz de execução 11/09/2026
 * =================================================================================================
 */

var SOUSA_SYNC_GUARD = (function () {
  'use strict';

  // ==============================================================================================
  // CONSTANTES E CONTRATOS
  // ==============================================================================================

  var VERSION = '0.1.0-observation';
  var MODE = 'OBSERVATION'; // Futuro: 'CONTROLLED_REPAIR' somente após autorização soberana

  /**
   * Categorias oficiais do Classificador.
   * Toda divergência DEVE cair em exatamente uma destas.
   */
  var CATEGORIES = {
    REUTILIZAR: 'REUTILIZAR',
    APRIMORAR: 'APRIMORAR',
    INTEGRAR: 'INTEGRAR',
    REPARAR: 'REPARAR',
    ISOLAR: 'ISOLAR'
  };

  /**
   * Subtipos de isolamento (para tornar as 9.284 inteligíveis).
   */
  var ISOLATE_SUBTYPES = {
    HISTORICO: 'HISTORICO',
    DUPLICATA: 'DUPLICATA',
    ORFAO: 'ORFAO',
    BACKUP: 'BACKUP',
    QUARENTENA: 'QUARENTENA',
    ARTEFATO_DEV: 'ARTEFATO_DEV',
    MEMORIA: 'MEMORIA',
    DIVERGENCIA_REAL_SOBERANIA: 'DIVERGENCIA_REAL_SOBERANIA'
  };

  // ==============================================================================================
  // 1. SOURCE OF TRUTH — Manifesto Canônico
  // ==============================================================================================

  /**
   * Estrutura esperada do manifesto canônico (gerado exclusivamente pelo pipeline CI/CD).
   * O runtime apenas LÊ. Nunca escreve nem sobrescreve.
   *
   * Exemplo de estrutura:
   * {
   *   "version": "1.0.0",
   *   "generatedAt": "2026-09-11T08:00:00Z",
   *   "authority": "git+pipeline",
   *   "modules": [
   *     {
   *       "id": "SOUSA_Core",
   *       "path": "SOUSA_Core.js",
   *       "hash": "sha256:...",
   *       "status": "PRODUCAO",
   *       "version": "x.y.z"
   *     },
   *     ...
   *   ],
   *   "ignoredPatterns": [".claspignore rules expanded"],
   *   "notes": "..."
   * }
   */
  function loadCanonicalManifest_() {
    // TODO: Implementar leitura real a partir de:
    // - PropertiesService (chave oficial)
    // - Drive (arquivo de manifesto versionado)
    // - Endpoint controlado (se houver)
    //
    // Nesta versão de observação, retorna estrutura mínima para não quebrar o fluxo.
    // Em produção o manifesto virá do pipeline.

    try {
      // Placeholder seguro — substituir pela fonte autoritativa
      var raw = PropertiesService.getScriptProperties().getProperty('SOUSA_SOT_MANIFEST');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // Wolverine-style: registrar e continuar com manifesto vazio (observação)
      logWolverine_('loadCanonicalManifest_', e);
    }

    // Manifesto mínimo de observação (não é Source of Truth real)
    return {
      version: '0.0.0-observation',
      generatedAt: new Date().toISOString(),
      authority: 'OBSERVATION_PLACEHOLDER',
      modules: [],
      ignoredPatterns: [],
      notes: 'Manifesto placeholder. Substituir pela autoridade Git+pipeline.'
    };
  }

  // ==============================================================================================
  // 2. INVENTÁRIO — Estado real do runtime
  // ==============================================================================================

  /**
   * Inventaria o estado atual do projeto Apps Script.
   * Nesta versão usa o que é possível via APIs disponíveis sem mutação.
   * Futuro: expansão com ScriptApp / Drive / listagem de arquivos via API.
   */
  function inventoryRuntimeState_() {
    var inventory = {
      timestamp: new Date().toISOString(),
      environment: 'APPS_SCRIPT_RUNTIME',
      files: [],
      properties: {},
      notes: []
    };

    try {
      // Exemplo de inventário mínimo seguro
      // Em evolução: listar todos os arquivos do projeto via Apps Script API
      // ou via estrutura conhecida + .claspignore expandido.

      // Placeholder: registrar que o inventário foi executado
      inventory.notes.push('Inventário em modo observação. Expandir com listagem real de arquivos.');
      inventory.properties = PropertiesService.getScriptProperties().getProperties();

      // Simulação de estrutura para permitir teste do fluxo completo
      // Remover quando a listagem real estiver disponível.
      inventory.files = [
        // Exemplos estruturais — serão substituídos pelo inventário real
        // { path: 'SOUSA_Core.js', hash: null, status: 'PRESENT' },
      ];
    } catch (e) {
      logWolverine_('inventoryRuntimeState_', e);
      inventory.notes.push('Falha parcial no inventário: ' + e.message);
    }

    return inventory;
  }

  // ==============================================================================================
  // 3. DIFF — Esperado × Encontrado
  // ==============================================================================================

  /**
   * Produz a lista bruta de divergências.
   * Ainda sem julgamento de categoria.
   */
  function computeDiff_(manifest, inventory) {
    var diff = {
      timestamp: new Date().toISOString(),
      expectedCount: (manifest.modules || []).length,
      foundCount: (inventory.files || []).length,
      divergences: [],
      summary: {
        missingInRuntime: [],
        unexpectedInRuntime: [],
        hashMismatch: [],
        statusMismatch: []
      }
    };

    // Lógica de comparação determinística (esqueleto)
    // 1. Indexar manifesto por path/id
    var expectedMap = {};
    (manifest.modules || []).forEach(function (m) {
      expectedMap[m.path || m.id] = m;
    });

    // 2. Percorrer inventário
    (inventory.files || []).forEach(function (f) {
      var key = f.path;
      if (!expectedMap[key]) {
        diff.summary.unexpectedInRuntime.push(f);
        diff.divergences.push({
          type: 'UNEXPECTED',
          path: key,
          found: f,
          expected: null
        });
      } else {
        // Comparar hash / status quando disponíveis
        var exp = expectedMap[key];
        if (exp.hash && f.hash && exp.hash !== f.hash) {
          diff.summary.hashMismatch.push({ path: key, expected: exp.hash, found: f.hash });
          diff.divergences.push({
            type: 'HASH_MISMATCH',
            path: key,
            found: f,
            expected: exp
          });
        }
        delete expectedMap[key];
      }
    });

    // 3. O que restou no expectedMap está missing
    Object.keys(expectedMap).forEach(function (key) {
      diff.summary.missingInRuntime.push(expectedMap[key]);
      diff.divergences.push({
        type: 'MISSING',
        path: key,
        found: null,
        expected: expectedMap[key]
      });
    });

    return diff;
  }

  // ==============================================================================================
  // 4. CLASSIFICADOR
  // ==============================================================================================

  /**
   * Classifica cada divergência em exatamente uma categoria oficial.
   * Regras iniciais (extensíveis pelo próprio organismo depois).
   */
  function classifyDivergences_(diff) {
    var classified = {
      timestamp: new Date().toISOString(),
      byCategory: {
        REUTILIZAR: [],
        APRIMORAR: [],
        INTEGRAR: [],
        REPARAR: [],
        ISOLAR: []
      },
      byIsolateSubtype: {},
      totals: {},
      rawCount: (diff.divergences || []).length
    };

    // Inicializar subtipos
    Object.keys(ISOLATE_SUBTYPES).forEach(function (k) {
      classified.byIsolateSubtype[ISOLATE_SUBTYPES[k]] = [];
    });

    (diff.divergences || []).forEach(function (d) {
      var decision = classifyOne_(d);
      classified.byCategory[decision.category].push({
        divergence: d,
        reason: decision.reason,
        subtype: decision.subtype || null,
        confidence: decision.confidence || 'MEDIUM'
      });

      if (decision.category === CATEGORIES.ISOLAR && decision.subtype) {
        classified.byIsolateSubtype[decision.subtype].push(d);
      }
    });

    // Totais
    Object.keys(classified.byCategory).forEach(function (cat) {
      classified.totals[cat] = classified.byCategory[cat].length;
    });

    return classified;
  }

  /**
   * Regra de classificação de uma única divergência.
   * Nesta versão é deliberadamente conservadora (preferência por ISOLAR).
   */
  function classifyOne_(divergence) {
    // Regras iniciais — evoluir com aprendizado do próprio SOUSA
    if (divergence.type === 'UNEXPECTED') {
      // Heurística simples de observação
      var path = (divergence.path || '').toLowerCase();
      if (path.indexOf('backup') !== -1 || path.indexOf('bak') !== -1) {
        return { category: CATEGORIES.ISOLAR, subtype: ISOLATE_SUBTYPES.BACKUP, reason: 'Padrão de backup detectado', confidence: 'HIGH' };
      }
      if (path.indexOf('quarentena') !== -1 || path.indexOf('quarantine') !== -1) {
        return { category: CATEGORIES.ISOLAR, subtype: ISOLATE_SUBTYPES.QUARENTENA, reason: 'Padrão de quarentena', confidence: 'HIGH' };
      }
      if (path.indexOf('old') !== -1 || path.indexOf('historico') !== -1 || path.indexOf('history') !== -1) {
        return { category: CATEGORIES.ISOLAR, subtype: ISOLATE_SUBTYPES.HISTORICO, reason: 'Padrão histórico', confidence: 'MEDIUM' };
      }
      if (path.indexOf('test') !== -1 || path.indexOf('dev') !== -1 || path.indexOf('tmp') !== -1) {
        return { category: CATEGORIES.ISOLAR, subtype: ISOLATE_SUBTYPES.ARTEFATO_DEV, reason: 'Artefato de desenvolvimento', confidence: 'MEDIUM' };
      }
      // Default conservador
      return { category: CATEGORIES.ISOLAR, subtype: ISOLATE_SUBTYPES.ORFAO, reason: 'Não mapeado no manifesto canônico', confidence: 'LOW' };
    }

    if (divergence.type === 'MISSING') {
      // Missing em runtime = potencial reparo futuro, mas nesta versão só observa
      return { category: CATEGORIES.REPARAR, reason: 'Ausente no runtime em relação ao manifesto', confidence: 'MEDIUM' };
    }

    if (divergence.type === 'HASH_MISMATCH') {
      return { category: CATEGORIES.APRIMORAR, reason: 'Hash diverge do canônico', confidence: 'HIGH' };
    }

    // Fallback
    return { category: CATEGORIES.ISOLAR, subtype: ISOLATE_SUBTYPES.DIVERGENCIA_REAL_SOBERANIA, reason: 'Classificação não determinada', confidence: 'LOW' };
  }

  // ==============================================================================================
  // 5. CONSOLIDAÇÃO (somente registro)
  // ==============================================================================================

  /**
   * Persiste o resultado da observação para memória / continuidade.
   * Nenhuma mutação de código de produção.
   */
  function consolidateObservation_(manifest, inventory, diff, classified) {
    var record = {
      version: VERSION,
      mode: MODE,
      executedAt: new Date().toISOString(),
      manifestAuthority: manifest.authority || 'UNKNOWN',
      manifestVersion: manifest.version || null,
      inventoryTimestamp: inventory.timestamp,
      diffSummary: {
        expected: diff.expectedCount,
        found: diff.foundCount,
        divergenceCount: (diff.divergences || []).length
      },
      classificationTotals: classified.totals,
      isolateBreakdown: {},
      notes: [
        'Observação concluída. Nenhuma mutação realizada.',
        'Runtime não promoveu nenhum estado divergente a Source of Truth.'
      ]
    };

    Object.keys(classified.byIsolateSubtype).forEach(function (sub) {
      record.isolateBreakdown[sub] = classified.byIsolateSubtype[sub].length;
    });

    try {
      // Persistência segura (PropertiesService tem limite de tamanho — em evolução usar Drive)
      var key = 'SOUSA_SYNC_GUARD_LAST_OBSERVATION';
      PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(record));

      // Opcional: também gravar histórico curto
      var historyKey = 'SOUSA_SYNC_GUARD_HISTORY';
      var historyRaw = PropertiesService.getScriptProperties().getProperty(historyKey);
      var history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(record);
      if (history.length > 10) history = history.slice(0, 10); // manter só as 10 últimas
      PropertiesService.getScriptProperties().setProperty(historyKey, JSON.stringify(history));
    } catch (e) {
      logWolverine_('consolidateObservation_', e);
      record.notes.push('Falha ao persistir consolidação: ' + e.message);
    }

    return record;
  }

  // ==============================================================================================
  // 6. RELATÓRIO SOBERANO AO FUNDADOR
  // ==============================================================================================

  /**
   * Gera o relatório que chega ao Fundador.
   * Contém apenas o que exige atenção soberana + resumo executivo.
   */
  function buildSovereignReport_(manifest, inventory, diff, classified, consolidation) {
    var report = {
      title: 'SOUSA_SYNC_GUARD — Relatório de Observação',
      version: VERSION,
      mode: MODE,
      generatedAt: new Date().toISOString(),
      authority: manifest.authority,
      executiveSummary: {
        totalDivergences: classified.rawCount,
        byCategory: classified.totals,
        isolateBreakdown: consolidation.isolateBreakdown,
        actionRequiredFromFounder: []
      },
      details: {
        missingCritical: [],
        hashMismatches: [],
        itemsRequiringSovereignty: []
      },
      fullClassificationAvailable: true,
      notes: [
        'Este relatório foi gerado em modo OBSERVAÇÃO.',
        'Nenhuma alteração foi feita no ambiente de produção.',
        'O runtime respeitou a regra: estado divergente NÃO foi promovido a Source of Truth.'
      ]
    };

    // Extrair o que realmente precisa de soberania
    (classified.byCategory.ISOLAR || []).forEach(function (item) {
      if (item.subtype === ISOLATE_SUBTYPES.DIVERGENCIA_REAL_SOBERANIA || item.confidence === 'LOW') {
        report.details.itemsRequiringSovereignty.push(item);
        report.executiveSummary.actionRequiredFromFounder.push({
          path: item.divergence.path,
          reason: item.reason,
          suggested: 'Avaliar e autorizar destino (isolar definitivamente / integrar / descartar)'
        });
      }
    });

    (classified.byCategory.REPARAR || []).forEach(function (item) {
      report.details.missingCritical.push(item);
    });

    (classified.byCategory.APRIMORAR || []).forEach(function (item) {
      if (item.divergence.type === 'HASH_MISMATCH') {
        report.details.hashMismatches.push(item);
      }
    });

    return report;
  }

  // ==============================================================================================
  // WOLVERINE — registro transversal de recuperação
  // ==============================================================================================

  function logWolverine_(context, error) {
    try {
      var entry = {
        timestamp: new Date().toISOString(),
        context: context,
        message: error.message || String(error),
        stack: error.stack || null
      };
      // Em evolução: gravar em canal de continuidade / memória
      console.error('[WOLVERINE][SYNC_GUARD]', JSON.stringify(entry));
    } catch (e) {
      // silêncio absoluto se o próprio log falhar
    }
  }

  // ==============================================================================================
  // PONTO DE ENTRADA PRINCIPAL — CAMINHO FELIZ DE OBSERVAÇÃO
  // ==============================================================================================

  /**
   * Executa o ciclo completo de observação.
   * Esta é a função que o Autogestão Elo deve chamar.
   *
   * @returns {Object} Relatório soberano + consolidação
   */
  function runObservationCycle() {
    var result = {
      success: false,
      version: VERSION,
      mode: MODE,
      report: null,
      consolidation: null,
      error: null
    };

    try {
      // 1. Source of Truth
      var manifest = loadCanonicalManifest_();

      // 2. Inventário
      var inventory = inventoryRuntimeState_();

      // 3. Diff
      var diff = computeDiff_(manifest, inventory);

      // 4. Classificação
      var classified = classifyDivergences_(diff);

      // 5. Consolidação (somente registro)
      var consolidation = consolidateObservation_(manifest, inventory, diff, classified);

      // 6. Relatório soberano
      var report = buildSovereignReport_(manifest, inventory, diff, classified, consolidation);

      result.success = true;
      result.report = report;
      result.consolidation = consolidation;

    } catch (e) {
      logWolverine_('runObservationCycle', e);
      result.error = {
        message: e.message,
        stack: e.stack
      };
    }

    return result;
  }

  // ==============================================================================================
  // API PÚBLICA (para SOUSA_AUTOGESTAO_ELO e Orquestrador)
  // ==============================================================================================

  return {
    VERSION: VERSION,
    MODE: MODE,
    CATEGORIES: CATEGORIES,
    ISOLATE_SUBTYPES: ISOLATE_SUBTYPES,

    /**
     * Ponto de entrada principal — modo observação apenas.
     */
    runObservationCycle: runObservationCycle,

    /**
     * Utilitários expostos para testes e para o Elo.
     */
    _internal: {
      loadCanonicalManifest_: loadCanonicalManifest_,
      inventoryRuntimeState_: inventoryRuntimeState_,
      computeDiff_: computeDiff_,
      classifyDivergences_: classifyDivergences_,
      consolidateObservation_: consolidateObservation_,
      buildSovereignReport_: buildSovereignReport_
    }
  };
})();


/**
 * Função global de conveniência para clasp run / triggers / Elo.
 * Exemplo de uso futuro:
 *   SOUSA_AUTOGESTAO_ELO.invoke('SYNC_GUARD_OBSERVATION');
 */
function SOUSA_SYNC_GUARD_RUN_OBSERVATION() {
  return SOUSA_SYNC_GUARD.runObservationCycle();
}
'@

# Grava o arquivo
Write-Host "Gravando SOUSA_SYNC_GUARD.js..." -ForegroundColor Yellow
$conteudo | Out-File -FilePath $arquivoDestino -Encoding utf8 -Force

if (Test-Path $arquivoDestino) {
    $tamanho = (Get-Item $arquivoDestino).Length
    Write-Host ""
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host "Arquivo instalado em:" -ForegroundColor Green
    Write-Host "  $arquivoDestino" -ForegroundColor White
    Write-Host "Tamanho: $tamanho bytes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Modo: OBSERVAÇÃO (inventário → diff → classificação → consolidação → relatório)" -ForegroundColor Cyan
    Write-Host "Nenhuma mutação de produção será realizada." -ForegroundColor Cyan
} else {
    Write-Host "ERRO: Não foi possível gravar o arquivo." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
