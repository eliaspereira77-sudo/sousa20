# Workflow GitHub — SOUSA 2.0 / Ruflo

## Arquivo

`.github/workflows/sousa-ciclo.yml`

## Como disparar

### Manual
1. Aba **Actions** no repositório
2. Workflow **SOUSA 2.0 – Ciclo Ruflo**
3. **Run workflow**
4. Escolha `ciclo_padrao` ou `status` e informe a intenção

### Automático
- **Schedule:** todo dia às 12:00 UTC
- **Push:** alterações em `ruflo/`, `core/`, `scripts/` ou no próprio workflow

## Secret necessário

No repositório → **Settings → Secrets and variables → Actions**:

| Secret | Uso |
|--------|-----|
| `GEMINI_API_KEY` | Execução via SOUSA IA (Gemini). Sem ela o ciclo roda em modo estrutural. |

## CLI local (mesmo comportamento)

```bash
export GEMINI_API_KEY="sua_chave"
python scripts/run_ciclo.py status
python scripts/run_ciclo.py ciclo_padrao -i "resumir o estado do sistema" --json
```

## Alto risco (teste de governança)

```bash
python scripts/run_ciclo.py ciclo_padrao -i "alterar núcleo" --sinal-risco '{"risco":"ALTO"}' --json
```

O ciclo deve parar em `AGUARDANDO_AUTORIZACAO`.
