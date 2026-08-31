# Automação 99,99% — SOUSA 2.0

## Meta

- **Interno (manutenção/correção):** 99,99% das ações seguras sem humano
- **Externo (expansão de capacidades):** descoberta/adaptação/ampliação automática em BAIXO/MÉDIO
- **Núcleo / irreversível / ALTO:** autorização explícita (soberania)

## Regimes

| Regime | Quando | Quem decide |
|--------|--------|-------------|
| **AUTO** | Diagnóstico, saúde, mapear lacunas, descobrir fontes | Política |
| **SUPERVISIONADO** | Adaptar, ampliar, integrar, ciclo_expansao | Standing auth |
| **AUTORIZADO** | Núcleo, irreversível, risco ALTO | Operador |

## Equipe de Manutenção (interno)

Loop: `SENSOR → DIAG → REPAIR → VERIFY`

```bash
curl -X POST http://localhost:5000/manutencao
curl http://localhost:5000/automacao
```

## Expansão de Capacidades (externo)

Ver **[CAPACIDADES_EXTERNAS.md](./CAPACIDADES_EXTERNAS.md)**.

```bash
# Visão geral
curl http://localhost:5000/capacidades

# Ciclo de expansão
curl -X POST http://localhost:5000/operacao-externa \
  -H 'Content-Type: application/json' \
  -d '{"operacao":"ciclo_expansao","comando":"expandir próxima lacuna"}'
```

## Endpoints

| Método | Rota | Função |
|--------|------|--------|
| GET | `/automacao` | Taxa e status da política |
| POST | `/manutencao` | Ciclo da equipe interna |
| GET | `/capacidades` | Registro + lacunas + fontes |
| POST | `/operacao-externa` | Expansão de capacidades |
| GET | `/diagnostico` | Diagnóstico (AUTO) |
| POST | `/evoluir` | Evolução estrutural |

## O que NÃO é automático

- Reescrever código-fonte do repositório
- Apagar memória canônica
- Alterar identidade / política / arquitetura do núcleo
- Operações externas irreversíveis / risco ALTO

## Métricas

`GET /automacao` → `taxa_pct` (meta 99.99).
