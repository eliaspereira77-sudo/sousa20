# SOUSA 2.0 - Model Context Protocol (MCP)
> **SOUSA**: **S**istema **O**rquestrador **U**nificado **S**eguro **A**utomatizado

Este diretório contém a especificação e o servidor **Model Context Protocol (MCP)** para o ecossistema **SOUSA 2.0**, permitindo que assistentes de IA, Claude Desktop, Cursor, IDEs e agentes externos interajam diretamente com o núcleo operacional.

---

## 📁 Arquivos Incluídos

1. **`sousa20_mcp.json`**: Manifesto oficial de configuração MCP contendo declarações de ferramentas (`tools`), recursos (`resources`) e comando de execução via `stdio`.
2. **`SOUSA_MCP_SERVER.js`**: Servidor Node.js que implementa o protocolo JSON-RPC 2.0 / MCP via `stdio`, utilizando os handlers existentes do `01_CORE/SOUSA_Core.js`.
3. **`SOUSA_INTERFACE_ENXUTA.html`**: Interface operacional minimalista (< 30KB) com 4 abas e disparo direto dos 9 comandos principais.

---

## 🛠️ Ferramentas Disponíveis no MCP (`tools`)

| Ferramenta | Descrição | Parâmetros |
| :--- | :--- | :--- |
| `ping` | Verifica conexão e prontidão operacional do SOUSA | `{}` |
| `status` | Retorna o estado do sistema, módulos ativos e memórias | `{}` |
| `diagnostico` | Executa diagnóstico operacional completo | `{ "nivel": "rapido" \| "completo" \| "profundo" }` |
| `chat_conselho`| Interação conversacional direta com SOUSA IA (comportamento e habilidades JARVIS) | `{ "mensagem": "string" }` |
| `executar_modulo` | Executa ação em um dos 9 módulos integrados | `{ "modulo": "string", "acao": "string", "dados": {} }` |

---

## 📚 Recursos Expostos (`resources`)

- `sousa://catalogo_capacidades`: Catálogo de capacidades do SOUSA (`SOUSA_CATALOGO_CAPACIDADES.json`).
- `sousa://logs_sistema`: Listagem e acesso aos logs operacionais do diretório `07_LOG/`.

---

## 🚀 Como Executar e Integrar

### 1. Teste Manual via Linha de Comando

```bash
node SOUSA_MCP_SERVER.js
```

Envie um comando JSON-RPC via stdin:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ping","arguments":{}}}
```

Resposta esperada:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"action\": \"ping\",\n  \"success\": true,\n  \"data\": {\n    \"status\": \"online\",\n    \"mensagem\": \"SOUSA IA operacional\",\n    \"versao\": \"2.0\",\n    \"identidade\": \"SOUSA IA\",\n    \"comportamento\": \"JARVIS\",\n    \"capacidades\": 13\n  }\n}"
      }
    ]
  }
}
```

### 2. Configuração no Claude Desktop (`claude_desktop_config.json`)

Adicione o SOUSA 2.0 à seção `mcpServers`:

```json
{
  "mcpServers": {
    "sousa20": {
      "command": "node",
      "args": ["/caminho/absoluto/para/SOUSA_MCP_SERVER.js"]
    }
  }
}
```

### 3. Integração com outros clientes MCP

O arquivo `sousa20_mcp.json` pode ser importado diretamente por qualquer cliente compatível com o padrão MCP standard.
