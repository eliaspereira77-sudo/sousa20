# SOUSA 2.0 — Relatório de Convergência

- Arquivos preservados/consolidados: **196**
- Itens excluídos da candidatura: **78**
- Árvores `.git`, `node_modules`, temporários e backups históricos não entram na base consolidada.
- A árvore `src/` duplicada não entra; componentes já existentes no núcleo oficial permanecem apenas uma vez.
- O monólito `SOUSA_Core_2.0_Consolidado_Turbinado.gs` não entra por conter símbolos duplicados com o núcleo oficial.
- O `package.json` legado foi mantido fora da candidatura de sincronização por apontar para `iniciar.js`, que não existe na base recebida.
- Correções de mojibake aplicadas: nenhuma

## Sincronização

A publicação no Apps Script/Google Cloud permanece deliberadamente separada: este pacote é a base limpa; a sincronização deve ocorrer depois da validação e autenticação do ambiente de nuvem.

## Itens excluídos

- `SOUSA_API_EXECUTOR_UNIVERSAL.js.BACKUP_ANTES_RODADA_20260809` — backup/old/tmp artifact
- `SOUSA_Core.js.API_MANAGER_BACKUP_2` — backup/old/tmp artifact
- `SOUSA_API_USB.js.BACKUP_CONTRATO_UNIVERSAL` — backup/old/tmp artifact
- `.claspignore.bak_20260726_073545` — backup/old/tmp artifact
- `SOUSA_API_EXECUTOR_UNIVERSAL.js.BACKUP_CAMPAIGN_20260811` — backup/old/tmp artifact
- `SOUSA_APIS_CASCATA.gs.js.COFRE_BACKUP` — backup/old/tmp artifact
- `SOUSA_Core.js.bak_20260726_065426` — backup/old/tmp artifact
- `Gemini.gs.OLD.js` — backup/old/tmp artifact
- `SOUSA_APIS_CASCATA.gs.js.PROTOCOLO_BACKUP` — backup/old/tmp artifact
- `SOUSA_API_EXECUTOR_UNIVERSAL.js.BACKUP` — backup/old/tmp artifact
- `SOUSA_Core.js.BACKUP_CAMPAIGN_GUARDIAN_20260811` — backup/old/tmp artifact
- `SOUSA_API_EXECUTOR_UNIVERSAL.js.BACKUP_ANTES_REFINO` — backup/old/tmp artifact
- `SOUSA_Core.js.BACKUP_CAMPAIGN_TUNNEL_20260811` — backup/old/tmp artifact
- `NucleoOrquestrador_V2.js.bak_20260809_1` — backup/old/tmp artifact
- `.claspignore.txt` — obsolete clasp ignore variant
- `.claspignore.bak_20260726_063002` — backup/old/tmp artifact
- `SOUSA_APIS_CASCATA.gs.js.BACKUP_AGNES_PERPLEXITY` — backup/old/tmp artifact
- `SOUSA_Core.js.POSTDATA_BACKUP` — backup/old/tmp artifact
- `SOUSA_Core.js.BACKUP_ANTES_EXECUTOR_UNIVERSAL_20260809` — backup/old/tmp artifact
- `SOUSA_APIS_CASCATA.gs.js.PROTOCOLO_FINAL_BACKUP` — backup/old/tmp artifact
- `package-lock.json` — dependency lock not needed by Apps Script deployment
- `SOUSA_APIS_CASCATA.gs.js.SINTAXE_BACKUP` — backup/old/tmp artifact
- `SOUSA_API_EXECUTOR_UNIVERSAL.js.BACKUP_ENCODING` — backup/old/tmp artifact
- `SOUSA_USB_BACKUP_MANAGER.js` — backup/old/tmp artifact
- `RELATORIO_CAPACIDADES_AUTONOMAS_SOUSA_2.0.md.gdoc` — backup/old/tmp artifact
- `PAINEL_SOUSA.html.bak_encoding_20260726_082358` — backup/old/tmp artifact
- `Code.gs.OLD.js` — backup/old/tmp artifact
- `SOUSA_Core.js.BACKUP_ANTES_REMOCAO_GEMINI_20260809` — backup/old/tmp artifact
- `SOUSA_2.0_PAINEL_OPERACIONAL_BACKUP_CMD.html` — backup/old/tmp artifact
- `SOUSA_Core.js.API_USB_BACKUP` — backup/old/tmp artifact
- `SOUSA_API_USB.js.ANTES_EXECUCAO_GEMINI_BACKUP` — backup/old/tmp artifact
- `SOUSA_Connect_v1.gs.OLD.js` — backup/old/tmp artifact
- `.claspignore.bak_20260726_074601` — backup/old/tmp artifact
- `SOUSA_Core.js.API_MANAGER_BACKUP` — backup/old/tmp artifact
- `SOUSA_Orquestrador_Recuperacao (1).js` — exact duplicate of SOUSA_Orquestrador_Recuperacao.js
- `SOUSA_Core.js.POSTDATA_BACKUP_2` — backup/old/tmp artifact
- `.claspignore.bak_20260726_072543` — backup/old/tmp artifact
- `SOUSA_Core.js.BACKUP_ANTES_RODADA_20260809` — backup/old/tmp artifact
- `PAINEL_SOUSA.html.bak_20260726_081648` — backup/old/tmp artifact
- `SOUSA_API_MANAGER.js.CONTRATO_BACKUP` — backup/old/tmp artifact
- `src/SOUSA_USB_TESTES_LIVE.js` — duplicate source tree (handled separately)
- `src/SOUSA_APIS_CASCATA.js` — duplicate source tree (handled separately)
- `src/SOUSA_IA_DNA_MEMORIA_VOZ.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_TESTES.js` — duplicate source tree (handled separately)
- `src/SOUSA_IA_AVATAR_TESTES.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_BOOT.js` — duplicate source tree (handled separately)
- `src/SOUSA_IA_COMANDO_DIAGNOSTICO.js` — duplicate source tree (handled separately)
- `src/SOUSA_FERRAMENTAS_COMPLETAS.js` — duplicate source tree (handled separately)
- `src/SOUSA_CANAIS_OPERACIONAIS.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_PONTE_LOCAL.js` — duplicate source tree (handled separately)
- `src/SOUSA_CONFIG.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_CONTRATO.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_SOUSA_IA.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_PERSISTENCIA.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_ADAPTERS.js` — duplicate source tree (handled separately)
- `src/SOUSA_IA_COMPOSITOR.js` — duplicate source tree (handled separately)
- `src/SOUSA_AUTONOMIA_CONTRATO.js` — duplicate source tree (handled separately)
- `src/SOUSA_DEVICE_AUTH.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_REGISTRY.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_STT.js` — duplicate source tree (handled separately)
- `src/SOUSA_AVATAR_CONTRATO.js` — duplicate source tree (handled separately)
- `src/SOUSA_MARKETPLACE_CASCATA.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_TRANSPORTES.js` — duplicate source tree (handled separately)
- `src/SOUSA_ORQUESTRADOR.js` — duplicate source tree (handled separately)
- `src/SOUSA_PROTOCOLO_DAILEON.js` — duplicate source tree (handled separately)
- `src/SOUSA_META_BUILDER.js` — duplicate source tree (handled separately)
- `src/SOUSA_USB_TTS_PIPER.js` — duplicate source tree (handled separately)
- `src/SOUSA_INTENCAO.js` — duplicate source tree (handled separately)
- `src/SOUSA_Core_2.0_Consolidado_Turbinado.gs` — duplicate source tree (handled separately)
- `src/SOUSA_API_EXECUTOR_UNIVERSAL.js` — duplicate source tree (handled separately)
- `src/SOUSA_CONTINUITY_ENGINE.js` — duplicate source tree (handled separately)
- `src/SOUSA_IA_IDENTIDADE.js` — duplicate source tree (handled separately)
- `src/SOUSA_CICLO_AUTONOMO.js` — duplicate source tree (handled separately)
- `src/SOUSA_CAPACIDADES.js` — duplicate source tree (handled separately)
- `src/SOUSA_POLITICA.js` — duplicate source tree (handled separately)
- `_QUARENTENA_RESIDUOS/CAMPAIGN_RUNTIME_GAS.tmp` — backup/old/tmp artifact
- `_QUARENTENA_RESIDUOS/CAMPAIGN_GUARDIAN_GAS.tmp` — backup/old/tmp artifact
- `_QUARENTENA_RESIDUOS/CAMPAIGN_CONTROLLER_IMPORT.tmp` — backup/old/tmp artifact

## Segunda camada de saneamento

- Foram eliminadas colisões de globais entre variantes `.gs.js` e `.js` quando a versão canônica `.js` já existia.
- Arquivos locais explicitamente excluídos do envio pelo `.claspignore` foram retirados da candidatura de sincronização.
- Uma configuração alternativa contendo credencial embutida foi excluída; a configuração canônica baseada em `PropertiesService` permanece.
- Foi adicionada a ponte `SOUSA_NUVEM_SINCRONIZADOR.gs.js`, limitada a persistência/recuperação de estado, sem credenciais e sem deploy automático.
