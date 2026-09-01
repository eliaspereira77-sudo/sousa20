# USB de Enriquecimento — SOUSA 2.0

## Papel

Camada **USB**, não núcleo.

- Opera **sob** soberania do núcleo
- É **orquestrada** pela Ruflo (todos os estados, persistência, política)
- **Não** altera identidade, política, governança nem arquitetura
- Objetivo: enriquecer resposta/contexto maximizando recursos da Ruflo

## Princípio

Tecnologia (ou módulo) entra por **valor comprovado**.  
Esta USB agrega enriquecimento; o núcleo permanece soberano.

## Recursos Ruflo utilizados

| Recurso | Uso pela USB |
|---------|----------------|
| Máquina de estados | Entra só em EXECUTANDO, via handler |
| Política | Capacidade já inferida no PLANEJANDO |
| Governança / soberania | `validar_operacao(origem=ENRIQUECIMENTO)` |
| Persistência | Ciclo completo gravado a cada estado |
| CLI / Actions | `--usb enriquecimento` (padrão) |

## Uso

```bash
# Padrão: USB enriquecimento
python scripts/run_ciclo.py ciclo_padrao -i "sua intenção" --json

# Só handler IA antigo
python scripts/run_ciclo.py ciclo_padrao -i "..." --usb ia

# Só estrutura Ruflo
python scripts/run_ciclo.py ciclo_padrao -i "..." --usb nenhuma
```

```python
from ruflo import RufloOrchestrator
from usb.enriquecimento import registrar_no_contrato, registrar_handler_na_ruflo

r = RufloOrchestrator()
registrar_no_contrato()
registrar_handler_na_ruflo(r)
r.execute("ciclo_padrao", {"intencao": "enriquecer este contexto"})
```

## O que esta USB NÃO faz

- Não altera `core/soberania` regras de domínio
- Não se registra com `pode_alterar_nucleo=True`
- Não substitui Ruflo nem o núcleo
- Não bypassa `AGUARDANDO_AUTORIZACAO`

## Sincronização com SOUSA 2.0

Mesmo ciclo oficial: intenção → plano → execução (USB) → verificar → consolidar → registrar → concluir.  
Mesma governança e mesmo contrato de soberania.
