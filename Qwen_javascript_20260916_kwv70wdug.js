/**
 * TELEGRAM BOT COMPLETO DO SOUSA 2.0
 * Interface de controle via Telegram com todos os comandos
 */

const TelegramBotCompleto = {
  
  // ===== CONFIGURAÇÃO =====
  CONFIG: {
    BOT_TOKEN: PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN') || '',
    CHAT_ID: PropertiesService.getScriptProperties().getProperty('TELEGRAM_CHAT_ID') || '',
    API_URL: 'https://api.telegram.org/bot'
  },
  
  // ===== ENVIA MENSAGEM =====
  enviarMensagem: function(texto, parseMode = 'HTML') {
    if (!this.CONFIG.BOT_TOKEN || !this.CONFIG.CHAT_ID) {
      MetaMonitor.registrarErro('TelegramBot', 'Configuração incompleta', 'enviarMensagem');
      return false;
    }
    
    try {
      const url = this.CONFIG.API_URL + this.CONFIG.BOT_TOKEN + '/sendMessage';
      const payload = {
        chat_id: this.CONFIG.CHAT_ID,
        text: texto,
        parse_mode: parseMode
      };
      
      UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      MetaMonitor.registrarChamadaAPI();
      return true;
      
    } catch (e) {
      MetaMonitor.registrarErro('TelegramBot', e, 'enviarMensagem');
      return false;
    }
  },
  
  // ===== PROCESSA COMANDOS RECEBIDOS =====
  processarComando: function(texto) {
    const comando = texto.trim().split(' ')[0].toLowerCase();
    const args = texto.trim().split(' ').slice(1).join(' ');
    
    const comandos = {
      '/status': () => this.cmdStatus(),
      '/saude': () => this.cmdSaude(),
      '/api': () => this.cmdAPI(),
      '/pausar': () => this.cmdPausar(),
      '/retomar': () => this.cmdRetomar(),
      '/refino': () => this.cmdRefino(),
      '/refino_aplicar': () => this.cmdRefinoAplicar(),
      '/rollback': () => this.cmdRollback(args),
      '/logs': () => this.cmdLogs(args),
      '/ajuda': () => this.cmdAjuda(),
      '/teste': () => this.cmdTeste()
    };
    
    if (comandos[comando]) {
      return comandos[comando]();
    }
    
    return '❌ Comando não reconhecido\nUse /ajuda para ver comandos disponíveis';
  },
  
  // ===== COMANDO: STATUS =====
  cmdStatus: function() {
    const score = MetaMonitor.calcularSaude();
    const uso = MetaMonitor.controlarUsoAPI();
    const pausado = Seguranca.estaPausado();
    
    const emoji = score >= 85 ? '💚' : score >= 70 ? '💛' : '💔';
    
    const mensagem = 
      '📊 <b>STATUS SOUSA 2.0</b>\n\n' +
      emoji + ' <b>Saúde:</b> ' + score + '/100\n' +
      '🔌 <b>API:</b> ' + uso.uso + '/' + uso.limite + ' (' + uso.percentual.toFixed(1) + '%)\n' +
      '🤖 <b>Autorrefino:</b> ' + (pausado ? '⏸️ PAUSADO' : '▶️ ATIVO') + '\n' +
      '📅 <b>Data:</b> ' + new Date().toLocaleString('pt-BR');
    
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== COMANDO: SAÚDE DETALHADA =====
  cmdSaude: function() {
    const data = new Date().toISOString().split('T')[0];
    const nomeArquivo = 'metricas_' + data + '.json';
    
    let metricas = [];
    try {
      const arquivo = DriveApp.getFolderById(MetaMonitor.PASTA_LOGS_ID)
                               .getFilesByName(nomeArquivo);
      if (arquivo.hasNext()) {
        metricas = JSON.parse(arquivo.next().getBlob().getDataAsString());
      }
    } catch (e) {}
    
    const erros = metricas.filter(m => m.tipo === 'erro').length;
    const performances = metricas.filter(m => m.tipo === 'performance');
    const tempoMedio = performances.length > 0 
      ? (performances.reduce((s, p) => s + p.duracao_ms, 0) / performances.length).toFixed(0)
      : 'N/A';
    
    const mensagem = 
      '🏥 <b>SAÚDE DETALHADA</b>\n\n' +
      '📊 Score: ' + MetaMonitor.calcularSaude() + '/100\n' +
      '❌ Erros hoje: ' + erros + '\n' +
      '⚡ Tempo médio: ' + tempoMedio + 'ms\n' +
      '📝 Total métricas: ' + metricas.length;
    
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== COMANDO: API =====
  cmdAPI: function() {
    const uso = MetaMonitor.controlarUsoAPI();
    
    const barra = this.criarBarraProgresso(uso.percentual);
    
    const mensagem = 
      '🔌 <b>USO DA API</b>\n\n' +
      barra + '\n' +
      uso.uso + ' / ' + uso.limite + ' chamadas\n' +
      uso.percentual.toFixed(1) + '% utilizado\n\n' +
      (uso.percentual > 80 ? '⚠️ <b>Atenção:</b> Perto do limite!' : '✅ Uso normal');
    
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  criarBarraProgresso: function(percentual) {
    const preenchido = Math.round(percentual / 5);
    const vazio = 20 - preenchido;
    return '▓'.repeat(preenchido) + '░'.repeat(vazio);
  },
  
  // ===== COMANDO: PAUSAR =====
  cmdPausar: function() {
    Seguranca.pausarAutorrefino();
    const mensagem = '🛑 Autorrefino <b>PAUSADO</b>\nUse /retomar para reativar';
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== COMANDO: RETOMAR =====
  cmdRetomar: function() {
    Seguranca.retomarAutorrefino();
    const mensagem = '✅ Autorrefino <b>RETOMADO</b>';
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== COMANDO: REFINO =====
  cmdRefino: function() {
    this.enviarMensagem('🔍 Analisando código...');
    
    try {
      const relatorio = AutoRefinoCodigo.analisarTodoCodigo();
      const sugestoes = IntegracaoAntigravity.gerarSugestoesLocais(relatorio);
      
      let mensagem = '📝 <b>ANÁLISE DE CÓDIGO</b>\n\n';
      mensagem += '📊 Score qualidade: ' + relatorio.score_qualidade + '/100\n';
      mensagem += '📁 Arquivos: ' + relatorio.total_arquivos + '\n';
      mensagem += '⚠️ Problemas: ' + relatorio.problemas.length + '\n\n';
      
      if (sugestoes.sugestoes && sugestoes.sugestoes.length > 0) {
        mensagem += '<b>Top 5 sugestões:</b>\n';
        sugestoes.sugestoes.slice(0, 5).forEach((s, i) => {
          mensagem += (i + 1) + '. ' + s.sugestao.descricao + '\n';
          mensagem += '   Impacto: ' + s.sugestao.impacto + ' | Esforço: ' + s.sugestao.esforco + '\n';
        });
        mensagem += '\nUse /refino_aplicar para aplicar automaticamente';
      } else {
        mensagem += '✅ Código em bom estado!';
      }
      
      this.enviarMensagem(mensagem);
      return mensagem;
      
    } catch (e) {
      const erro = '❌ Erro na análise: ' + e.toString();
      this.enviarMensagem(erro);
      return erro;
    }
  },
  
  // ===== COMANDO: APLICAR REFINO =====
  cmdRefinoAplicar: function() {
    const validacao = Seguranca.podeAplicarMudanca();
    if (!validacao.pode) {
      const msg = '❌ Não posso aplicar: ' + validacao.motivo;
      this.enviarMensagem(msg);
      return msg;
    }
    
    this.enviarMensagem('⚙️ Aplicando melhorias automáticas...');
    
    try {
      const relatorio = AutoRefinoCodigo.analisarTodoCodigo();
      const sugestoes = IntegracaoAntigravity.gerarSugestoesLocais(relatorio);
      
      let aplicadas = 0;
      if (sugestoes.sugestoes) {
        sugestoes.sugestoes.forEach(s => {
          if (s.sugestao.automatico && s.sugestao.impacto !== 'baixo') {
            const resultado = IntegracaoAntigravity.aplicarSugestaoAutomatica(s);
            if (resultado.sucesso) aplicadas++;
          }
        });
      }
      
      const mensagem = '✅ <b>REFINO APLICADO</b>\n\nMelhorias aplicadas: ' + aplicadas;
      this.enviarMensagem(mensagem);
      return mensagem;
      
    } catch (e) {
      const erro = '❌ Erro: ' + e.toString();
      this.enviarMensagem(erro);
      return erro;
    }
  },
  
  // ===== COMANDO: ROLLBACK =====
  cmdRollback: function(backupId) {
    if (!backupId) {
      const msg = '❌ Informe o ID do backup\nEx: /rollback 1ABC2xyz';
      this.enviarMensagem(msg);
      return msg;
    }
    
    try {
      Sandbox.rollback(backupId);
      const mensagem = '🔄 <b>ROLLBACK EXECUTADO</b>\nBackup restaurado: ' + backupId;
      this.enviarMensagem(mensagem);
      return mensagem;
    } catch (e) {
      const erro = '❌ Erro no rollback: ' + e.toString();
      this.enviarMensagem(erro);
      return erro;
    }
  },
  
  // ===== COMANDO: LOGS =====
  cmdLogs: function(dias) {
    dias = parseInt(dias) || 1;
    
    let mensagem = '📋 <b>LOGS ÚLTIMOS ' + dias + ' DIA(S)</b>\n\n';
    
    for (let i = 0; i < dias; i++) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      const nomeArquivo = 'metricas_' + dataStr + '.json';
      
      try {
        const arquivo = DriveApp.getFolderById(MetaMonitor.PASTA_LOGS_ID)
                                 .getFilesByName(nomeArquivo);
        if (arquivo.hasNext()) {
          const metricas = JSON.parse(arquivo.next().getBlob().getDataAsString());
          const erros = metricas.filter(m => m.tipo === 'erro').length;
          const mudancas = metricas.filter(m => m.tipo === 'mudanca').length;
          
          mensagem += '📅 ' + dataStr + '\n';
          mensagem += '   Erros: ' + erros + ' | Mudanças: ' + mudancas + '\n';
        }
      } catch (e) {}
    }
    
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== COMANDO: AJUDA =====
  cmdAjuda: function() {
    const mensagem = 
      '📖 <b>COMANDOS SOUSA 2.0</b>\n\n' +
      '<b>Monitoramento:</b>\n' +
      '/status - Status geral\n' +
      '/saude - Saúde detalhada\n' +
      '/api - Uso da API\n' +
      '/logs [dias] - Ver logs\n\n' +
      '<b>Controle:</b>\n' +
      '/pausar - Pausa autorrefino\n' +
      '/retomar - Retoma autorrefino\n\n' +
      '<b>Refino:</b>\n' +
      '/refino - Analisa código\n' +
      '/refino_aplicar - Aplica melhorias\n' +
      '/rollback [id] - Rollback\n\n' +
      '<b>Outros:</b>\n' +
      '/ajuda - Esta mensagem\n' +
      '/teste - Teste de conexão';
    
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== COMANDO: TESTE =====
  cmdTeste: function() {
    const mensagem = '✅ Bot funcionando!\n' + new Date().toLocaleString('pt-BR');
    this.enviarMensagem(mensagem);
    return mensagem;
  },
  
  // ===== WEBHOOK (RECEBE COMANDOS) =====
  doPost: function(e) {
    try {
      const data = JSON.parse(e.postData.contents);
      
      if (data.message && data.message.text) {
        const texto = data.message.text;
        const resposta = this.processarComando(texto);
        
        // Envia resposta
        this.enviarMensagem(resposta);
      }
      
      return ContentService.createTextOutput('OK');
      
    } catch (e) {
      MetaMonitor.registrarErro('TelegramBot', e, 'doPost');
      return ContentService.createTextOutput('ERRO');
    }
  }
};

// Alias para compatibilidade
const TelegramBot = TelegramBotCompleto;