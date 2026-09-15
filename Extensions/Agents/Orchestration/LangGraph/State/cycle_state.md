# Estado do Ciclo (LangGraph State)

Campos mínimos do estado compartilhado:

- ciclo_id
- intencao
- estado_atual
- capacidade_inferida
- plano
- resultados
- autorizacoes
- historico_estados
- erro (se houver)
- timestamp

O estado é persistido a cada transição (alinhado à persistência Ruflo).