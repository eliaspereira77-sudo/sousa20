/**
 * SOUSA 2.0 — AUTORUN DE GATILHO
 * ============================================================
 * Arquivo ADITIVO. Nao altera nada existente.
 *
 * Funcao: instalar o gatilho SOUSA_CICLO_SINCRONIA automaticamente
 * quando o projeto GAS for aberto (via onOpen).
 *
 * Uma vez instalado, o SOUSA roda sozinho a cada 24h.
 * ============================================================
 */

/**
 * Executado automaticamente quando o GAS e aberto.
 * Instala o gatilho se ainda nao existir.
 */
function onOpen() {
    try {
        // Verifica se o gatilho SOUSA_CICLO_SINCRONIA ja existe
        var gatilhos = ScriptApp.getProjectTriggers();
        var jaExiste = false;

        for (var i = 0; i < gatilhos.length; i++) {
            if (gatilhos[i].getHandlerFunction() === 'SOUSA_CICLO_SINCRONIA') {
                jaExiste = true;
                break;
            }
        }

        // Se ja existe, nao faz nada
        if (jaExiste) {
            return;
        }

        // Cria o gatilho automaticamente
        ScriptApp.newTrigger('SOUSA_CICLO_SINCRONIA')
            .timeBased()
            .everyHours(24)
            .create();

        // Registra o evento
        try {
            SOUSA_INSTALAR_GATILHO();
        } catch (e) {
            // Se SOUSA_INSTALAR_GATILHO nao existir, ignora
        }
    } catch (e) {
        // Silencioso. Nao quebra nada.
    }
}

/**
 * Executado manualmente para instalar o gatilho.
 * Chama a funcao do SOUSA_GERENCIADOR_VERSAO.
 */
function SOUSA_INSTALAR_GATILHO_AUTO() {
    if (typeof SOUSA_INSTALAR_GATILHO === 'function') {
        return SOUSA_INSTALAR_GATILHO();
    }

    // Fallback: instala direto
    try {
        var existentes = ScriptApp.getProjectTriggers();
        var removidos = 0;
        existentes.forEach(function(t) {
            if (t.getHandlerFunction() === 'SOUSA_CICLO_SINCRONIA') {
                ScriptApp.deleteTrigger(t);
                removidos++;
            }
        });

        ScriptApp.newTrigger('SOUSA_CICLO_SINCRONIA')
            .timeBased()
            .everyHours(24)
            .create();

        return { ok: true, removidos: removidos, proximo_ciclo: 'em 24h' };
    } catch (e) {
        return { ok: false, erro: e.message };
    }
}
