/**
 * AUTORREFINO DE CÓDIGO DO SOUSA 2.0
 * Analisa código, identifica padrões ruins, sugere e aplica melhorias
 */

const AutoRefinoCodigo = {
  
  // ===== CONFIGURAÇÕES =====
  CONFIG: {
    max_linhas_funcao: 50,
    max_linhas_arquivo: 500,
    complexidade_maxima: 10,
    duplicacao_minima: 5 // linhas mínimas para considerar duplicação
  },
  
  // ===== ANÁLISE COMPLETA DE CÓDIGO =====
  analisarTodoCodigo: function() {
    const pastaProd = DriveApp.getFolderById(Sandbox.PASTA_PRODUCAO);
    const arquivos = pastaProd.getFilesByType(MimeType.GOOGLE_SCRIPTS);
    const relatorio = {
      timestamp: new Date().toISOString(),
      total_arquivos: 0,
      problemas: [],
      sugestoes: [],
      score_qualidade: 100
    };
    
    while (arquivos.hasNext()) {
      const arquivo = arquivos.next();
      relatorio.total_arquivos++;
      
      try {
        const conteudo = arquivo.getBlob().getDataAsString();
        const analise = this.analisarArquivo(arquivo.getName(), conteudo);
        
        relatorio.problemas = relatorio.problemas.concat(analise.problemas);
        relatorio.sugestoes = relatorio.sugestoes.concat(analise.sugestoes);
        
      } catch (e) {
        MetaMonitor.registrarErro('AutoRefinoCodigo', e, 'analisarTodoCodigo');
      }
    }
    
    // Calcula score de qualidade
    relatorio.score_qualidade = this.calcularScoreQualidade(relatorio);
    
    // Registra no log
    MetaMonitor.registrarMetrica({
      tipo: 'analise_codigo',
      dados: relatorio
    });
    
    return relatorio;
  },
  
  // ===== ANÁLISE DE ARQUIVO INDIVIDUAL =====
  analisarArquivo: function(nomeArquivo, conteudo) {
    const linhas = conteudo.split('\n');
    const resultado = {
      arquivo: nomeArquivo,
      total_linhas: linhas.length,
      problemas: [],
      sugestoes: []
    };
    
    // 1. Verifica tamanho do arquivo
    if (linhas.length > this.CONFIG.max_linhas_arquivo) {
      resultado.problemas.push({
        tipo: 'arquivo_grande',
        severidade: 'media',
        mensagem: 'Arquivo com ' + linhas.length + ' linhas (máx: ' + this.CONFIG.max_linhas_arquivo + ')',
        sugestao: 'Dividir em módulos menores'
      });
    }
    
    // 2. Analisa funções
    const funcoes = this.extrairFuncoes(conteudo);
    funcoes.forEach(funcao => {
      if (funcao.linhas > this.CONFIG.max_linhas_funcao) {
        resultado.problemas.push({
          tipo: 'funcao_grande',
          severidade: 'media',
          mensagem: 'Função "' + funcao.nome + '" com ' + funcao.linhas + ' linhas',
          sugestao: 'Extrair subfunções'
        });
      }
      
      // Detecta complexidade (muitos ifs/loops aninhados)
      if (funcao.complexidade > this.CONFIG.complexidade_maxima) {
        resultado.problemas.push({
          tipo: 'complexidade_alta',
          severidade: 'alta',
          mensagem: 'Função "' + funcao.nome + '" muito complexa',
          sugestao: 'Simplificar lógica ou usar padrões de design'
        });
      }
    });
    
    // 3. Detecta código duplicado
    const duplicacoes = this.detectarDuplicacao(conteudo);
    duplicacoes.forEach(dup => {
      resultado.sugestoes.push({
        tipo: 'codigo_duplicado',
        severidade: 'media',
        mensagem: 'Código duplicado detectado (' + dup.linhas + ' linhas)',
        sugestao: 'Extrair para função reutilizável',
        trecho: dup.trecho
      });
    });
    
    // 4. Verifica padrões ruins
    const padroesRuins = this.detectarPadroesRuins(conteudo);
    resultado.problemas = resultado.problemas.concat(padroesRuins);
    
    // 5. Verifica documentação
    if (!this.temDocumentacaoMinima(conteudo)) {
      resultado.sugestoes.push({
        tipo: 'falta_documentacao',
        severidade: 'baixa',
        mensagem: 'Arquivo sem documentação adequada',
        sugestao: 'Adicionar comentários JSDoc nas funções principais'
      });
    }
    
    return resultado;
  },
  
  // ===== EXTRAI FUNÇÕES DO CÓDIGO =====
  extrairFuncoes: function(conteudo) {
    const funcoes = [];
    const regex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    let match;
    
    while ((match = regex.exec(conteudo)) !== null) {
      const nomeFuncao = match[1];
      const inicio = match.index;
      
      // Conta linhas da função (simplificado)
      let profundidade = 0;
      let fim = inicio;
      let complexidade = 0;
      
      for (let i = inicio; i < conteudo.length; i++) {
        if (conteudo[i] === '{') profundidade++;
        if (conteudo[i] === '}') {
          profundidade--;
          if (profundidade === 0) {
            fim = i;
            break;
          }
        }
        // Conta complexidade (ifs, loops, switches)
        if (conteudo.substr(i, 2) === 'if' || 
            conteudo.substr(i, 3) === 'for' ||
            conteudo.substr(i, 5) === 'while' ||
            conteudo.substr(i, 6) === 'switch') {
          complexidade++;
        }
      }
      
      const corpoFuncao = conteudo.substring(inicio, fim);
      const linhas = corpoFuncao.split('\n').length;
      
      funcoes.push({
        nome: nomeFuncao,
        linhas: linhas,
        complexidade: complexidade,
        inicio: inicio,
        fim: fim
      });
    }
    
    return funcoes;
  },
  
  // ===== DETECTA CÓDIGO DUPLICADO =====
  detectarDuplicacao: function(conteudo) {
    const duplicacoes = [];
    const linhas = conteudo.split('\n');
    const blocos = new Map();
    
    // Analisa blocos de N linhas
    for (let i = 0; i < linhas.length - this.CONFIG.duplicacao_minima; i++) {
      const bloco = linhas.slice(i, i + this.CONFIG.duplicacao_minima).join('\n').trim();
      
      if (bloco.length < 20) continue; // ignora blocos muito pequenos
      
      if (blocos.has(bloco)) {
        duplicacoes.push({
          linhas: this.CONFIG.duplicacao_minima,
          primeira_ocorrencia: blocos.get(bloco),
          segunda_ocorrencia: i,
          trecho: bloco
        });
      } else {
        blocos.set(bloco, i);
      }
    }
    
    return duplicacoes;
  },
  
  // ===== DETECTA PADRÕES RUINS =====
  detectarPadroesRuins: function(conteudo) {
    const problemas = [];
    
    // 1. console.log em produção
    if (conteudo.includes('console.log')) {
      problemas.push({
        tipo: 'debug_producao',
        severidade: 'baixa',
        mensagem: 'console.log encontrado em produção',
        sugestao: 'Remover ou usar sistema de logs adequado'
      });
    }
    
    // 2. TODOs não resolvidos
    const todos = (conteudo.match(/TODO/gi) || []).length;
    if (todos > 5) {
      problemas.push({
        tipo: 'muitos_todos',
        severidade: 'baixa',
        mensagem: todos + ' TODOs não resolvidos',
        sugestao: 'Resolver ou remover TODOs antigos'
      });
    }
    
    // 3. Números mágicos
    if (/\b\d{2,}\b/.test(conteudo) && !/const|let|var/.test(conteudo)) {
      problemas.push({
        tipo: 'numeros_magicos',
        severidade: 'baixa',
        mensagem: 'Números mágicos detectados',
        sugestao: 'Extrair para constantes nomeadas'
      });
    }
    
    // 4. Variáveis com nomes ruins
    const varsRuins = conteudo.match(/\b(let|var|const)\s+[a-z]\s*=/g);
    if (varsRuins && varsRuins.length > 0) {
      problemas.push({
        tipo: 'nomes_ruins',
        severidade: 'baixa',
        mensagem: 'Variáveis com nomes de uma letra',
        sugestao: 'Usar nomes descritivos'
      });
    }
    
    return problemas;
  },
  
  // ===== VERIFICA DOCUMENTAÇÃO MÍNIMA =====
  temDocumentacaoMinima: function(conteudo) {
    const funcoes = this.extrairFuncoes(conteudo);
    let documentadas = 0;
    
    funcoes.forEach(f => {
      const antes = conteudo.substring(Math.max(0, f.inicio - 200), f.inicio);
      if (antes.includes('/**') || antes.includes('* @')) {
        documentadas++;
      }
    });
    
    return documentadas >= funcoes.length * 0.5; // 50% das funções documentadas
  },
  
  // ===== CALCULA SCORE DE QUALIDADE =====
  calcularScoreQualidade: function(relatorio) {
    let score = 100;
    
    relatorio.problemas.forEach(p => {
      if (p.severidade === 'alta') score -= 10;
      else if (p.severidade === 'media') score -= 5;
      else if (p.severidade === 'baixa') score -= 2;
    });
    
    return Math.max(0, score);
  },
  
  // ===== GERA SUGESTÕES PRIORIZADAS =====
  gerarSugestoesPriorizadas: function(relatorio) {
    const todas = relatorio.problemas.concat(relatorio.sugestoes);
    
    // Ordena por severidade
    const prioridade = { 'alta': 3, 'media': 2, 'baixa': 1 };
    todas.sort((a, b) => prioridade[b.severidade] - prioridade[a.severidade]);
    
    // Retorna top 10
    return todas.slice(0, 10);
  }
};