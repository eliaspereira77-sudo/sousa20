# Camada Ruflo — SOUSA 2.0

## O que é

A **Ruflo** é a camada de orquestração do SOUSA 2.0.  
Implementa a máquina de estados do ciclo autônomo, política de governança e **persistência de ciclos**.

```
INTENÇÃO → PLANEJAR → EXECUTAR → VERIFICAR → RECUPERAR →
CONSOLIDAR → REGISTRAR → CONCLUIR
```

## Persistência

Cada mudança de estado grava o ciclo em disco:

```
data/ciclos/
  CICLO_xxxxxxxxxxxx.json   # snapshot completo do ciclo
  _index.json               # índice dos ciclos recentes
```

- Variável opcional: `SOUSA_DATA_DIR` (raiz dos dados)
- Conteúdo operacional **não** é versionado no Git (`.gitignore`)
- No start, o orquestrador recarrega os ciclos mais recentes na memória

### CLI de consulta

```bash
# Listar ciclos persistidos
python scripts/run_ciclo.py listar
python scripts/run_ciclo.py listar --estado CONCLUIDA --limite 10

# Carregar um ciclo específico
python scripts/run_ciclo.py carregar --ciclo-id CICLO_abc123def456
```

## Uso rápido

```bash
python scripts/run_ciclo.py status
python scripts/run_ciclo.py ciclo_padrao --intencao "sincronizar memória"
python scripts/run_ciclo.py ciclo_padrao -i "teste" --json
```

## API Python

```python
from ruflo import RufloOrchestrator, persistencia

r = RufloOrchestrator()  # já carrega ciclos persistidos

resultado = r.execute("ciclo_padrao", {"intencao": "gerar resumo"})
print(resultado["ciclo"]["id"], resultado["status"])

# Consulta
ciclo = r.get_ciclo("CICLO_...")
lista = r.listar_ciclos(estado="CONCLUIDA")
print(persistencia.estatisticas())
```

## Módulos

| Módulo | Função |
|--------|--------|
| `orchestrator.py` | Máquina de estados + execute |
| `politica.py` | Capacidade, alto risco, saúde, cooldown |
| `persistencia.py` | Salvar / carregar / listar ciclos |
| `handlers.py` | EXECUTANDO via SOUSA IA (Gemini) |

## Versão

Ruflo **0.5.0** — orquestração + governança + persistência.
