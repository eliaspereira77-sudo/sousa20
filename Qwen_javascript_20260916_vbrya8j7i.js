/**
 * ============================================================================
 * GUIA TÉCNICO COMPLETO - SOUSA 2.0
 * ============================================================================
 * 
 * Este arquivo contém toda a documentação do sistema embutida no código.
 * Para versão externa, execute: gerarDocumentacaoExterna()
 * 
 * ============================================================================
 * ÍNDICE
 * ============================================================================
 * 
 * 1. VISÃO GERAL
 * 2. ARQUITETURA
 * 3. MÓDULOS
 * 4. COMANDOS TELEGRAM
 * 5. SEGURANÇA
 * 6. MANUTENÇÃO
 * 7. TROUBLESHOOTING
 * 8. MIGRAÇÃO
 * 
 * ============================================================================
 * 1. VISÃO GERAL
 * ============================================================================
 * 
 * SOUSA 2.0 é um sistema de automação pessoal modular desenvolvido por Elias Souza.
 * 
 * CARACTERÍSTICAS PRINCIPAIS:
 * - 99.99% automatizado
 * - Autorrefino e autoajuste contínuo
 * - Portabilidade total (Drive, Windows, Android, USB)
 * - Armazenamento principal: Google Drive (5TB/18 meses)
 * - Execução: Google Apps Script via CLASP
 * 
 * LIMITAÇÕES CONHECIDAS:
 * - Google Apps Script: 60 req/min, 1500 chamadas API/dia
 * - Não usa Azure (decisão estratégica)
 * - Não usa MAKE (abandonado por complexidade)
 * 
 * ============================================================================
 * 2. ARQUITETURA
 * ============================================================================
 * 
 * CAMADAS DO SISTEMA:
 * 
 * Camada 1: Meta-Monitoramento (MetaMonitor.gs)
 *   - Monitor_Performance: Mede tempo de execução
 *   - Monitor_Erros: Conta e classifica erros
 *   - Monitor_Recursos: Controla uso de API
 *   - Monitor_Qualidade: Analisa sintaxe
 *   - Monitor_Logs: Gera relatórios
 * 
 * Camada 2: Loop de Feedback (MonitorDiario.gs)
 *   - monitoramentoDiario(): Roda às 6h
 *   - autoAjusteContinuo(): Roda a cada hora
 *   - refinoSemanal(): Roda domingo às 3h
 * 
 * Camada 3: Autorrefino de Código (AutoRefinoCodigo.gs)
 *   - Analisa código automaticamente
 *   - Detecta problemas e sugere melhorias
 *   - Aplica refatorações seguras
 * 
 * Camada 4: Integração IA (IntegracaoAntigravity.gs)
 *   - Envia análises para IA externa
 *   - Gera sugestões inteligentes
 *   - Fallback local se IA indisponível
 * 
 * Camada 5: Sandbox (Sandbox.gs)
 *   - Testa mudanças em ambiente isolado
 *   - Backup automático antes de aplicar
 *   - Rollback automático se falhar
 * 
 * Camada 6: Segurança (Seguranca.gs)
 *   - Limites rígidos (3 mudanças/dia)
 *   - Kill switch via Telegram
 *   - Validação antes de aplicar
 * 
 * Camada 7: Interface (TelegramBotCompleto.gs)
 *   - Comandos via Telegram
 *   - Monitoramento em tempo real
 *   - Controle total do sistema
 * 
 * ============================================================================
 * 3. MÓDULOS PRINCIPAIS
 * ============================================================================
 * 
 * NÚCLEO ORQUESTRADOR
 *   - Cérebro do sistema
 *   - Coordena todos os módulos
 *   - Delega tarefas para executores
 * 
 * CÃO DE GUARDA (MetaMonitor)
 *   - Monitora saúde do sistema
 *   - Detecta anomalias
 *   - Gera alertas
 * 
 * SOUSAILEON
 *   - Assistente pessoal
 *   - Interface natural
 * 
 * AFILIADOS PRO
 *   - Métricas de tráfego/vendas
 *   - Integração com plataformas
 * 
 * MÓDULO PRODUTOR
 *   - Criação de conteúdo
 *   - Organização de arquivos
 * 
 * MÓDULO ESTRATEGISTA
 *   - Análise de mercado
 *   - Planejamento
 * 
 * ============================================================================
 * 4. COMANDOS TELEGRAM
 * ============================================================================
 * 
 * MONITORAMENTO:
 *   /status - Status geral do sistema
 *   /saude - Saúde detalhada com métricas
 *   /api - Uso da API Google
 *   /logs [dias] - Ver logs dos últimos dias
 * 
 * CONTROLE:
 *   /pausar - Pausa autorrefino (emergência)
 *   /retomar - Retoma autorrefino
 * 
 * REFINO:
 *   /refino - Analisa código e sugere melhorias
 *   /refino_aplicar - Aplica melhorias automáticas
 *   /rollback [id] - Restaura backup específico
 * 
 * OUTROS:
 *   /ajuda - Lista todos os comandos
 *   /teste - Testa conexão do bot
 * 
 * ============================================================================
 * 5. SEGURANÇA
 * ============================================================================
 * 
 * LIMITES RÍGIDOS:
 *   - Máximo 3 mudanças automáticas por dia
 *   - Máximo 10 mudanças por semana
 *   - Máximo 2 rollbacks por dia
 *   - Score mínimo 70 para autoajuste
 *   - API máximo 85% para aplicar mudanças
 * 
 * KILL SWITCH:
 *   - /pausar via Telegram para imediatamente
 *   - Sistema pausa automaticamente se >10 erros/dia
 *   - Rollback automático se teste falhar
 * 
 * BACKUP:
 *   - Backup completo antes de cada mudança
 *   - Retenção de 7 dias no sandbox
 *   - Logs completos de todas as ações
 * 
 * ============================================================================
 * 6. MANUTENÇÃO
 * ============================================================================
 * 
 * DIÁRIA:
 *   - Verificar /status no Telegram
 *   - Checar se score > 80
 *   - Verificar uso de API
 * 
 * SEMANAL:
 *   - Executar /refino para analisar código
 *   - Revisar logs com /logs 7
 *   - Aplicar melhorias com /refino_aplicar
 * 
 * MENSAL:
 *   - Revisar documentação
 *   - Limpar backups antigos
 *   - Atualizar integrações se necessário
 * 
 * ============================================================================
 * 7. TROUBLESHOOTING
 * ============================================================================
 * 
 * PROBLEMA: Bot não responde
 * SOLUÇÃO: 
 *   1. Verificar TOKEN e CHAT_ID nas propriedades
 *   2. Executar /teste
 *   3. Verificar logs em MetaMonitor
 * 
 * PROBLEMA: Score de saúde baixo
 * SOLUÇÃO:
 *   1. Executar /saude para ver detalhes
 *   2. Verificar erros com /logs 1
 *   3. Aplicar correções com /refino_aplicar
 * 
 * PROBLEMA: API no limite
 * SOLUÇÃO:
 *   1. Verificar uso com /api
 *   2. Sistema reduz batch size automaticamente
 *   3. Aguardar reset diário (meia-noite)
 * 
 * PROBLEMA: Mudança quebrou o sistema
 * SOLUÇÃO:
 *   1. Identificar backup ID nos logs
 *   2. Executar /rollback [id]
 *   3. Sistema restaura automaticamente
 * 
 * ============================================================================
 * 8. MIGRAÇÃO
 * ============================================================================
 * 
 * PARA OUTRO DISPOSITIVO:
 *   1. Todos os dados estão no Google Drive
 *   2. Copiar IDs das pastas para propriedades
 *   3. Recriar triggers com setupTriggers()
 *   4. Testar com /teste no Telegram
 * 
 * PARA HARDWARE PRÓPRIO (futuro):
 *   1. Manter Google Drive como fonte de verdade
 *   2. Executar localmente se necessário
 *   3. Sincronizar automaticamente
 *   4. Considerar Oracle Cloud Free Tier para VM
 * 
 * ============================================================================
 * FIM DA DOCUMENTAÇÃO
 * ============================================================================
 */

function gerarDocumentacaoExterna() {
  // Gera arquivo README no Drive
  const pasta = DriveApp.getFolderById(MetaMonitor.PASTA_LOGS_ID).getParents().next();
  
  const readme = 
    '# SOUSA 2.0 - Guia Técnico\n\n' +
    '