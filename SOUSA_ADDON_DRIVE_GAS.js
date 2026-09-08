/**
 * SOUSA 2.0 — ADD-ON DE GOOGLE DRIVE
 *
 * Papel deste arquivo: CASCA FINA (thin shell).
 * Não decide nada sozinho. Toda decisão real continua na SOUSA IA
 * (núcleo GAS de 13 módulos já existente, ou futuramente o backend
 * Python via chamarSousaIA_Externa()).
 *
 * Princípio respeitado: Zero Duplicidade — este arquivo não reimplementa
 * lógica de coordenação, só monta a interface (CardService) e repassa
 * a chamada.
 *
 * Nada aqui altera nada em disco/repositório sozinho. Ações que
 * modificam algo (ex.: aplicar uma correção do Módulo ADS) devem
 * pedir confirmação explícita dentro do próprio Card antes de agir,
 * seguindo a regra de Elias: rotina pode ser automática, o crítico
 * exige autorização.
 */

'use strict';

// ============================================================
// PONTO DE ENTRADA — TELA INICIAL DO ADD-ON (barra lateral)
// ============================================================
function onHomepage(e) {
  return construirCardPrincipal_();
}

// ============================================================
// AÇÃO UNIVERSAL — atalho no menu do Add-on
// ============================================================
function onExecutarDiagnosticoRapido(e) {
  var resultado = chamarSousaIA_('diagnostico_rapido', {});
  return construirCardResultado_('Diagnóstico Rápido', resultado);
}

// ============================================================
// GATILHO — quando o usuário seleciona um item no Drive
// ============================================================
function onDriveItemsSelected(e) {
  var itens = (e && e.drive && e.drive.activeCursorItem)
    ? [e.drive.activeCursorItem]
    : [];

  if (itens.length === 0) {
    return construirCardMensagem_('Nenhum item selecionado.');
  }

  var item = itens[0];
  var info = {
    id: item.id,
    titulo: item.title,
    mimeType: item.mimeType
  };

  var resultado = chamarSousaIA_('analisar_item_drive', info);
  return construirCardResultado_('Análise: ' + info.titulo, resultado);
}

// ============================================================
// CARDS (interface do Add-on)
// ============================================================
function construirCardPrincipal_() {
  var secaoStatus = CardService.newCardSection()
    .setHeader('SOUSA 2.0 — Painel')
    .addWidget(CardService.newTextParagraph()
      .setText('Coordenação: SOUSA IA\nSob comando de Elias Pereira de Sousa'));

  var secaoAcoes = CardService.newCardSection()
    .addWidget(CardService.newTextButton()
      .setText('Rodar Diagnóstico Rápido')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('onExecutarDiagnosticoRapido')));

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('SOUSA 2.0'))
    .addSection(secaoStatus)
    .addSection(secaoAcoes)
    .build();
}

function construirCardResultado_(titulo, resultado) {
  var texto = resultado && resultado.mensagem
    ? resultado.mensagem
    : 'Sem retorno da SOUSA IA (verifique conexão/quota).';

  var secao = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText(texto));

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(titulo))
    .addSection(secao)
    .build();
}

function construirCardMensagem_(msg) {
  var secao = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText(msg));

  return CardService.newCardBuilder()
    .addSection(secao)
    .build();
}

// ============================================================
// PONTE PARA A SOUSA IA (coordenação central)
// ============================================================
/**
 * Esta função é o único ponto de contato entre o Add-on e a
 * SOUSA IA. Hoje, tenta chamar uma função interna do núcleo GAS
 * (se os módulos SOUSA_IA_*.gs estiverem no mesmo projeto).
 * Se não existir, cai para um retorno padrão — nunca quebra o Card.
 *
 * Quando o backend Python (core/) estiver acessível via URL pública
 * (ex.: Cloud Run/App Engine), trocar o corpo desta função para usar
 * UrlFetchApp.fetch(), no mesmo padrão já usado em omniroute_client.py
 * (config obrigatória, sem default silencioso, erros separados).
 */
function chamarSousaIA_(acao, payload) {
  try {
    if (typeof SOUSA_IA_processarAcao === 'function') {
      return SOUSA_IA_processarAcao(acao, payload);
    }
    return {
      ok: false,
      mensagem: 'SOUSA IA (núcleo GAS) não encontrada neste projeto. ' +
        'Ação recebida: ' + acao
    };
  } catch (erro) {
    return {
      ok: false,
      mensagem: 'Erro ao chamar SOUSA IA: ' + erro.message
    };
  }
}
