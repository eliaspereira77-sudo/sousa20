# LangGraph — Grafo do Ciclo Operacional SOUSA 2.0

## Nodes (etapas)
1. entry_node          ← RECEBIDA
2. plan_node           ← PLANEJANDO
3. authorization_gate  ← AGUARDANDO_AUTORIZACAO (HITL)
4. execute_node        ← EXECUTANDO (chama CrewAI / OpenManus / Especialistas)
5. verify_node         ← VERIFICANDO
6. recover_node        ← RECUPERANDO (opcional)
7. consolidate_node    ← CONSOLIDANDO
8. register_node       ← REGISTRANDO
9. end_node            ← CONCLUIDA
10. failure_node       ← FALHA

## Edges principais
entry → plan → (auth_gate?) → execute → verify
verify → (ok?) consolidate → register → end
verify → (falha?) recover → verify
qualquer falha grave → failure

## Human-in-the-loop
authorization_gate usa interrupt/resume do LangGraph
quando a política de governança exigir autorização do Fundador.