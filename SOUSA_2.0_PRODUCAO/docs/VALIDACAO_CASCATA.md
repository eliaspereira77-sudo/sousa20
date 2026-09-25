# Validação na cascata — deploy mínimo

## Arquivos

1. **Novo:** `SOUSA_VALIDACAO_CASCATA.js` (no projeto GAS / raiz do repo)
2. **Alterado:** `01_CORE/SOUSA_Core.js` (ping, diagnostico, chat_conselho)

Não altera Cofre nem a lista `SOUSA_APIS_CASCATA`.

## O que passa a valer

| Action | Antes | Agora |
|--------|--------|--------|
| `ping` | `success: true` fixo | `SOUSA_pingComEvidencia()` → cascata + validação |
| `diagnostico` | 100% OK fixo | `SOUSA_diagnosticoComEvidencia()` |
| `chat_conselho` | require Gemini / keywords + success true | `SOUSA_cascataComValidacao` ou fallback **sem** success |

Evidência mínima de conclusão:

- `ok === true`
- `provedor` (ou vencedor da cascata)
- `texto` não vazio
- não é simulação (salvo opção explícita)

## Deploy GAS

1. Colar/push `SOUSA_VALIDACAO_CASCATA.js` no mesmo projeto do Core.
2. Substituir `SOUSA_Core.js` pela versão com validação.
3. Garantir que executor + adapters + transportes + cascata já estão no projeto (já estavam).
4. Executar no editor:

```javascript
function testeValidacaoCascata() {
  Logger.log(JSON.stringify(SOUSA_pingComEvidencia(), null, 2));
  Logger.log(JSON.stringify(SOUSA_diagnosticoComEvidencia(), null, 2));
}
```

Esperado se Cofre e rede OK: `success: true`, `estado_verdade: "CONFIRMADO"`, `provedor` preenchido.

Se Cofre/rede falhar: `success: false` — **correto** (não mente saúde).

## Funções públicas

- `SOUSA_validarResultadoCascata(resultado, opcoes)`
- `SOUSA_cascataComValidacao(capacidade, contexto, opcoes)`
- `SOUSA_pingComEvidencia()`
- `SOUSA_diagnosticoComEvidencia()`
