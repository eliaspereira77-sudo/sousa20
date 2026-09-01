# Políticas de Governança — SOUSA 2.0

## 1. Princípio superior

- Tecnologia **nova** não entra por ser nova. Entra somente se agregar **valor comprovado**.
- Tecnologia **antiga** não permanece por tradição. Permanece somente enquanto continuar **cumprindo sua função**.
- O SOUSA observa o ecossistema, identifica capacidades superiores, faz a convergência, elimina obsolescência e evolui continuamente.
- **Ruflo** é apenas uma das possíveis USBs. Outras poderão surgir.
- O SOUSA 2.0 deve incorporar evolução **sem perder** coerência, soberania, segurança e arquitetura.
- Evolução é propriedade do próprio sistema, não tarefa manual recorrente.

---

## 2. Camadas de governança

| Camada | Função |
|--------|--------|
| Política de capacidade | Inferir o que a intenção pede e escolher o recurso adequado |
| Política de autonomia | Definir o que o sistema pode fazer sozinho e quando precisa de autorização |
| Política de dispositivo | Controlar quem/o quê pode operar o SOUSA |
| Política de ciclo (Ruflo) | Conduzir a intenção por estados rastreáveis e pausar em alto risco |
| Contratos de capacidade (USB / Avatar / etc.) | Declarar o que cada módulo entrega e sob quais condições permanece |

---

## 3. Política de capacidade

### 3.1 Inferência de capacidade
A partir do texto da intenção, o sistema classifica a necessidade, por exemplo:

- `TEXTO` (padrão)
- `CODIGO`
- `AUDIO` / voz
- `IMAGEM`
- `VIDEO`
- `DOCUMENTO_PDF`
- `ANALISE`
- `BUSCA_MEMORIA`
- `PRODUCAO_LIVRO`

### 3.2 Seleção de recurso
Critérios reais (não preferência subjetiva):

- disponibilidade operacional
- prioridade declarada
- custo
- latência
- saúde do conector (falhas consecutivas)
- cooldown ativo

### 3.3 Fallback
Se o recurso preferido falha ou está em cooldown, a política busca o próximo candidato válido para a mesma capacidade. Se nenhum restar → `SEM_RECURSO` / `FALLBACK_ESGOTADO`.

### 3.4 Saúde e cooldown
Conectores com falhas consecutivas ou em cooldown são temporariamente excluídos da seleção até recuperação.

---

## 4. Política de autonomia e autorização

O sistema opera de forma autônoma **até** encontrar sinal de alto risco.

### Sinais que exigem autorização

- `risco == "ALTO"`
- `irreversivel == true`
- `altera_nucleo == true`
- `exige_credencial == true`

Quando qualquer um desses sinais estiver presente:

```
estado do ciclo → AGUARDANDO_AUTORIZACAO
```

O ciclo **não avança** para execução até haver decisão de governança (autorizar ou negar).

---

## 5. Política de dispositivo e acesso

- Apenas dispositivos cadastrados e com status válido podem operar.
- Dispositivo não cadastrado → acesso negado (`DEVICE_NAO_CADASTRADO`).
- Eventos de acesso geram log de segurança (device, sessão, resultado, motivo).

---

## 6. Política de ciclo (Ruflo)

Todo ciclo é rastreável e passa por estados definidos:

```
RECEBIDA → PLANEJANDO → EXECUTANDO → VERIFICANDO
         → RECUPERANDO (se necessário)
         → CONSOLIDANDO → REGISTRANDO → CONCLUIDA
```

Estados de governança:

- `AGUARDANDO_AUTORIZACAO` — pausa por alto risco
- `FALHA` — encerramento controlado sem sucesso

Regras:

- Toda tentativa é registrada.
- Nada crítico ocorre sem estado e histórico.
- Alto risco interrompe o fluxo antes da execução.

---

## 7. Política de evolução de capacidades (USB)

| Situação | Decisão |
|----------|--------|
| Nova capacidade com valor comprovado | Pode entrar (convergência) |
| Capacidade antiga que ainda cumpre função | Permanece |
| Capacidade que deixou de cumprir função | Pode ser desativada |
| Capacidade que ameaça coerência, soberania ou segurança | Bloqueada |

USBs (incluindo a Ruflo) são adaptadores. O núcleo soberano permanece acima delas.

---

## 8. O que a governança garante

1. **Soberania** — o núcleo decide; as USBs executam sob política.
2. **Segurança** — dispositivo, autorização e alto risco são controlados.
3. **Rastreabilidade** — ciclos têm histórico de estados e tentativas.
4. **Resiliência** — saúde, cooldown e fallback evitam dependência cega.
5. **Evolução controlada** — entrada e saída de capacidades por valor comprovado.

---

## 9. Referências no código

- `ruflo/orchestrator.py` — máquina de estados + checagem de alto risco
- `ruflo/politica.py` — inferência de capacidade e regras de seleção
- `docs/RUFLO.md` — camada de orquestração
- Pacote oficial: `SOUSA_POLITICA.js`, `SOUSA_AUTONOMIA_CONTRATO.js`, `SOUSA_DEVICE_AUTH.js`
