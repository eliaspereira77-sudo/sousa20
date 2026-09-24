# Validacao na cascata — deploy minimo

## Arquivos

1. **Novo:** `SOUSA_VALIDACAO_CASCATA.js`
2. **Alterado:** `01_CORE/SOUSA_Core.js` (ping, diagnostico, chat_conselho)

Nao altera Cofre nem a lista `SOUSA_APIS_CASCATA`.

## Deploy GAS

```bash
cd ~/sousa20   # ou clone
git pull origin main
clasp push
```

No editor GAS, executar:

```javascript
function testeValidacaoCascata() {
  Logger.log(JSON.stringify(SOUSA_pingComEvidencia(), null, 2));
}
```

Esperado se Cofre e rede OK: `success: true`, `estado_verdade: "CONFIRMADO"`, `provedor` preenchido.
