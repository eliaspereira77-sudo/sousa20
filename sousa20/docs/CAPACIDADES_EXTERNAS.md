# Operações Externas = Expansão de Capacidades — SOUSA 2.0

## Missão

As operações externas **não são HTTP genérico**.  
São o braço externo de **descoberta, adaptação e ampliação de capacidades**
alinhadas ao modelo SOUSA (USB + soberania + Ruflo + memória canônica).

Princípio: *evolução por valor comprovado, sem perder coerência nem soberania.*

## Fluxo canônico

```
mapear_lacunas  →  o que falta no SOUSA
     ↓
descobrir       →  fontes externas candidatas (catálogo adaptável)
     ↓
adaptar         →  contrato USB (pode_alterar_nucleo=False)
     ↓
ampliar         →  capacidade já existe: adiciona implementador
  ou
integrar        →  capacidade nova: registra + liga implementador
```

Atalho: **`ciclo_expansao`** roda o loop inteiro (AUTO/SUPERVISIONADO).

## Operações

| Operação | Regime | Efeito |
|----------|--------|--------|
| `mapear_lacunas` | AUTO | Cruza lacunas do núcleo com fontes candidatas |
| `descobrir` | AUTO | Lista fontes para uma capacidade |
| `listar_fontes` | AUTO | Catálogo de fontes conhecidas |
| `adaptar` | SUPERVISIONADO | Gera contrato de adaptador USB |
| `ampliar` | SUPERVISIONADO | Novo implementador em capacidade existente |
| `integrar` | SUPERVISIONADO | Capacidade nova + implementador |
| `ciclo_expansao` | SUPERVISIONADO | Loop completo |

## Exemplos

### Ver lacunas e oportunidades

```bash
curl http://localhost:5000/capacidades
```

### Mapear só lacunas

```json
POST /operacao-externa
{ "operacao": "mapear_lacunas" }
```

### Descobrir fontes para IMAGEM

```json
POST /operacao-externa
{
  "operacao": "descobrir",
  "capacidade": "IMAGEM"
}
```

### Adaptar uma fonte ao SOUSA

```json
POST /operacao-externa
{
  "operacao": "adaptar",
  "fonte_id": "STABLE_DIFFUSION",
  "capacidade": "IMAGEM",
  "comando": "preparar USB de geração de imagem"
}
```

### Ampliar capacidade existente

```json
POST /operacao-externa
{
  "operacao": "ampliar",
  "capacidade": "AUDIO",
  "implementador": "elevenlabs_tts",
  "fonte_id": "ELEVENLABS_TTS"
}
```

### Ciclo completo (escolhe primeira lacuna com fonte)

```json
POST /operacao-externa
{
  "operacao": "ciclo_expansao",
  "comando": "expandir próxima capacidade viável"
}
```

Ou mirando uma capacidade:

```json
POST /operacao-externa
{
  "operacao": "ciclo_expansao",
  "capacidade": "DOCUMENTO_PDF",
  "fonte_id": "REPORTLAB_PDF"
}
```

## Fontes catalogadas (adaptáveis)

| Fonte | Capacidades SOUSA | Risco |
|-------|-------------------|-------|
| GEMINI_VISION | IMAGEM, ANALISE | BAIXO |
| GEMINI_TEXTO | TEXTO, CODIGO, ANALISE, PRODUCAO_LIVRO | BAIXO |
| ELEVENLABS_TTS | AUDIO, VOZ_CLONADA | MEDIO |
| OPENAI_TTS | AUDIO | MEDIO |
| STABLE_DIFFUSION | IMAGEM | MEDIO |
| DALL_E | IMAGEM | MEDIO |
| REPORTLAB_PDF | DOCUMENTO_PDF | BAIXO |
| FFMPEG_VIDEO | VIDEO | MEDIO |
| HEYGEN_AVATAR | AVATAR, VIDEO | MEDIO |
| SOCIAL_PUBLISH | DISTRIBUICAO | MEDIO |

Novas fontes entram no catálogo `_FONTES_CONHECIDAS` em
`usb/operacoes_externas.py` — sempre como USB, nunca como núcleo.

## O que a expansão NÃO faz

- Não reescreve o núcleo
- Não eleva USB a núcleo (`pode_alterar_nucleo=False`)
- Não instala SDKs sozinha (define o adaptador estrutural; código real sob PR/comando)
- Não publica em canais ALTO sem autorização humana

## Integração com o resto do SOUSA

- **Registro** → `registro_capacidades` atualizado em `ampliar`/`integrar`
- **Soberania** → toda operação passa por `validar_operacao`
- **Automação 99,99%** → BAIXO=AUTO, MEDIO=SUPERVISIONADO
- **Memória** → namespace `capacidades` e `operacoes_externas`
- **Auto-evolução** → lacunas detectadas alimentam `mapear_lacunas`
