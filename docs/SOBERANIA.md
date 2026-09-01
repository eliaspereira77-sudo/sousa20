# Contrato de Soberania — Núcleo SOUSA 2.0

## Princípio

O **núcleo** é soberano.  
Camadas e USBs (incluindo a **Ruflo**) operam **sob** o núcleo, nunca no lugar dele.

Evolução por valor comprovado, **sem** perder coerência, soberania, segurança e arquitetura.

---

## Regras do contrato

1. O núcleo **decide**; USBs **executam** sob política.
2. Nenhuma USB altera domínios do núcleo sem autorização explícita.
3. Evolução de capacidades não altera identidade nem arquitetura soberana.
4. Alto risco e ações protegidas passam por governança.
5. Ruflo e demais USBs são **substituíveis**; o núcleo **não** é.

---

## Domínios exclusivos do núcleo

- `identidade`
- `memoria_canonica`
- `politica`
- `governanca`
- `autorizacao`
- `arquitetura`
- `soberania`

Tentativa de USB alterar esses domínios → `VIOLACAO_SOBERANIA` ou `AGUARDANDO_AUTORIZACAO`.

---

## Ações protegidas

- `alterar_identidade`
- `alterar_politica`
- `alterar_arquitetura`
- `substituir_nucleo`
- `desativar_governanca`
- `bypass_autorizacao`
- `apagar_memoria_canonica`
- `elevar_usb_a_nucleo`

Sem autorização → bloqueio / pausa de governança.

---

## Implementação

| Artefato | Função |
|----------|--------|
| `core/soberania.py` | Contrato operacional (`ContratoSoberania`) |
| `contrato_soberania` | Instância padrão do processo |
| Ruflo | Registrada como USB `RUFLO` (camada, não núcleo) |

### Uso

```python
from core.soberania import contrato_soberania, ViolacaoSoberania

# Status do contrato
print(contrato_soberania.status())

# Validar operação
r = contrato_soberania.validar_operacao(
    "executar_ciclo",
    origem="RUFLO",
    sinal_risco=None,
)
# r["ok"] == True → pode seguir

# Ação protegida sem autorização
r = contrato_soberania.validar_operacao(
    "alterar_politica",
    origem="RUFLO",
    autorizada=False,
)
# r["status"] == "AGUARDANDO_AUTORIZACAO"
```

---

## Relação com Ruflo e governança

- Ruflo conduz ciclos e persiste estado.
- Antes de ações sensíveis, o fluxo consulta o contrato de soberania e a política de alto risco.
- O núcleo permanece a âncora; a Ruflo permanece uma USB de orquestração.
