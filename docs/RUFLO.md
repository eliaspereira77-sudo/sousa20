# Camada Ruflo — SOUSA 2.0

## O que é

A **Ruflo** é a camada de orquestração do SOUSA 2.0.  
Ela implementa a máquina de estados do ciclo autônomo definido no pacote oficial:

```
INTENÇÃO → PLANEJAR → EXECUTAR → VERIFICAR → RECUPERAR →
CONSOLIDAR → REGISTRAR → CONCLUIR
```

Estados extras de governança:
- `AGUARDANDO_AUTORIZACAO`
- `FALHA`

## Uso rápido

```bash
# Status
python scripts/run_ciclo.py status

# Ciclo padrão com intenção
python scripts/run_ciclo.py ciclo_padrao --intencao "sincronizar memória"

# JSON puro (útil para Actions)
python scripts/run_ciclo.py ciclo_padrao -i "teste" --json
```

## API Python

```python
from ruflo import RufloOrchestrator

r = RufloOrchestrator()

# Status
print(r.get_status())

# Executar ciclo
resultado = r.execute("ciclo_padrao", {"intencao": "gerar resumo do dia"})
print(resultado["status"], resultado["ok"])

# Registrar handler customizado para a etapa EXECUTANDO
def meu_executor(ciclo, context):
    return {"ok": True, "status": "CUSTOM", "data": "..."}

r.register_handler("EXECUTANDO", meu_executor)
```

## Integração com o Orquestrador JS

O `SOUSA_ORQUESTRADOR.js` do pacote oficial segue o mesmo fluxo.  
A Ruflo é a implementação Python equivalente, pensada para:

- GitHub Actions
- CLI (`scripts/run_ciclo.py`)
- API Flask (`app.py`)
- Futura ponte com os módulos USB / SOUSA IA

## Próximos passos

1. Conectar handlers reais (SOUSA IA, Executor Universal, voz, avatar)
2. Workflow GitHub Actions que chama `run_ciclo.py`
3. Persistência de ciclos (memória / Drive)
4. Ponte bidirecional com os módulos JS do `pacote_oficial/src/`
