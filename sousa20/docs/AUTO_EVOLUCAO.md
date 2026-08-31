# Auto-Manutenção, Auto-Correção e Evolução sob Comando — SOUSA 2.0

## Princípio

O SOUSA 2.0 cuida de si **sob seu comando**.

| Ação | Liberdade |
|------|-----------|
| Diagnosticar saúde e lacunas | Sempre permitido (leitura) |
| Propor plano de adaptação | Sempre permitido (não executa) |
| Registrar capacidade / marcar saúde / aplicar plano | **Só com autorização explícita** |
| Alterar código-fonte do repositório | Fora do motor — permanece humano (PR) |

O núcleo é soberano. Nenhuma USB nem o motor de evolução altera identidade, política, governança ou arquitetura sem passar pelo contrato de soberania.

---

## Capacidades formais

| ID | Risco | Exige autorização |
|----|-------|-------------------|
| `AUTO_MANUTENCAO` | ALTO | Sim |
| `AUTO_CORRECAO` | ALTO | Sim |
| `AUTO_EVOLUCAO` | ALTO | Sim |

---

## Fluxo operacional

```
1. Você pede diagnóstico     → GET  /diagnostico
2. Sistema reporta lacunas   → leitura
3. Você pede proposta        → POST /evoluir { "acao": "propor", "capacidade_alvo": "IMAGEM" }
4. Sistema devolve plano     → plano_id
5. Você autoriza             → POST /autorizar { "acao": "auto_evolucao:aplicar_plano" }
6. Você manda executar       → POST /evoluir { "acao": "aplicar_plano", "autorizada": true, "auth_id": "..." }
```

---

## Endpoints

### `GET /diagnostico`
Relatório completo: módulos, lacunas, soberania, memória.

### `POST /evoluir`
```json
{
  "acao": "diagnosticar | propor | consolidar_diagnostico | registrar_capacidade_stub | marcar_saude | aplicar_plano",
  "capacidade_alvo": "IMAGEM",
  "plano_id": "PLANO_...",
  "comando": "quero geração de imagem via API X",
  "autorizada": false,
  "auth_id": null
}
```

### `POST /autorizar`
```json
{
  "acao": "auto_evolucao:aplicar_plano",
  "valida_por_segundos": 3600,
  "motivo": "Operador autoriza evolução estrutural"
}
```

---

## CLI

```bash
python scripts/run_evolucao.py diagnostico
python scripts/run_evolucao.py propor --capacidade IMAGEM --comando "integrar gerador de imagem"
python scripts/run_evolucao.py aplicar --capacidade IMAGEM --autorizada --comando "autorizo evolução estrutural"
```

---

## O que o motor faz e o que não faz

**Faz**
- Diagnosticar módulos e capacidades
- Detectar lacunas (stubs, implementadores vazios)
- Propor planos passo a passo
- Registrar capacidades no catálogo formal (autorizado)
- Atualizar saúde de recursos na política Ruflo
- Persistir histórico na memória canônica (`namespace=evolucao`)

**Não faz (de propósito)**
- Reescrever arquivos do repositório sozinho
- Bypass de soberania
- Evoluir sem comando/autorização
- Substituir o núcleo

Alterações de código continuam sendo feitas por você (ou por PR assistido), sob o mesmo princípio de valor comprovado.

---

## Referência de código

- `core/auto_evolucao.py` — motor
- `core/soberania.py` — autorização
- `core/registro_capacidades.py` — catálogo
- `core/memoria.py` — histórico (`namespace=evolucao`)
- `app.py` — endpoints `/diagnostico`, `/evoluir`, `/autorizar`
