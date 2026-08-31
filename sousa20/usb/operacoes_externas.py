"""
SOUSA 2.0 — USB de Operações Externas para Capacidades

Missão: descobrir, adaptar e ampliar capacidades do SOUSA 2.0
usando fontes externas — sempre sob soberania do núcleo.

Não é um cliente HTTP genérico. É o braço externo de evolução de
capacidades, alinhado à governança (valor comprovado) e à automação 99,99%.

Operações principais:
  mapear_lacunas   → o que falta no SOUSA (AUTO)
  descobrir        → fontes externas candidatas para uma capacidade (AUTO)
  adaptar          → contrato USB de adaptação da fonte ao SOUSA (AUTO/SUPERVISIONADO)
  ampliar          → acrescenta implementador a capacidade existente (SUPERVISIONADO)
  integrar         → registra capacidade nova + implementador (SUPERVISIONADO)
  ciclo_expansao   → lacunas → descobrir → adaptar → ampliar/integrar (loop)
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid

USB_ID = "OPERACOES_EXTERNAS"
USB_CAPACIDADES = [
    "DESCOBERTA_CAPACIDADE",
    "AMPLIACAO_CAPACIDADE",
    "ADAPTACAO_EXTERNA",
    "INTEGRACAO_CAPACIDADE",
    "MAPEAR_LACUNAS",
]

# Catálogo de fontes externas conhecidas → capacidades SOUSA
# (adaptáveis; não substituem o núcleo)
_FONTES_CONHECIDAS: List[Dict[str, Any]] = [
    {
        "id": "GEMINI_VISION",
        "provedor": "Google Gemini",
        "capacidades_sousa": ["IMAGEM", "ANALISE"],
        "tipo": "api_llm_multimodal",
        "risco": "BAIXO",
        "adaptacao": "core.gemini_client + prompt multimodal",
        "valor": "Análise e descrição de imagem via modelo já integrado",
    },
    {
        "id": "GEMINI_TEXTO",
        "provedor": "Google Gemini",
        "capacidades_sousa": ["TEXTO", "CODIGO", "ANALISE", "PRODUCAO_LIVRO"],
        "tipo": "api_llm",
        "risco": "BAIXO",
        "adaptacao": "já integrado (gemini_client)",
        "valor": "Ampliação de qualidade/contexto em capacidades textuais",
    },
    {
        "id": "ELEVENLABS_TTS",
        "provedor": "ElevenLabs",
        "capacidades_sousa": ["AUDIO", "VOZ_CLONADA"],
        "tipo": "api_tts",
        "risco": "MEDIO",
        "adaptacao": "voice/clone.py como USB TTS",
        "valor": "TTS e clonagem de voz de alta fidelidade",
    },
    {
        "id": "OPENAI_TTS",
        "provedor": "OpenAI",
        "capacidades_sousa": ["AUDIO"],
        "tipo": "api_tts",
        "risco": "MEDIO",
        "adaptacao": "voice/clone.py provider openai",
        "valor": "Síntese de voz alternativa",
    },
    {
        "id": "STABLE_DIFFUSION",
        "provedor": "Stability / Replicate / local",
        "capacidades_sousa": ["IMAGEM"],
        "tipo": "api_image_gen",
        "risco": "MEDIO",
        "adaptacao": "novo módulo image/generate.py como USB",
        "valor": "Geração de imagem sob intenção Ruflo",
    },
    {
        "id": "DALL_E",
        "provedor": "OpenAI",
        "capacidades_sousa": ["IMAGEM"],
        "tipo": "api_image_gen",
        "risco": "MEDIO",
        "adaptacao": "USB image provider dalle",
        "valor": "Geração de imagem",
    },
    {
        "id": "REPORTLAB_PDF",
        "provedor": "biblioteca local reportlab/weasyprint",
        "capacidades_sousa": ["DOCUMENTO_PDF"],
        "tipo": "lib_local",
        "risco": "BAIXO",
        "adaptacao": "docs/pdf_builder.py como USB",
        "valor": "Geração local de PDF sem API externa",
    },
    {
        "id": "FFMPEG_VIDEO",
        "provedor": "ffmpeg local",
        "capacidades_sousa": ["VIDEO"],
        "tipo": "cli_local",
        "risco": "MEDIO",
        "adaptacao": "video/pipeline.py orquestrado pela Ruflo",
        "valor": "Edição/composição de vídeo sob ciclo",
    },
    {
        "id": "HEYGEN_AVATAR",
        "provedor": "HeyGen / D-ID",
        "capacidades_sousa": ["AVATAR", "VIDEO"],
        "tipo": "api_avatar",
        "risco": "MEDIO",
        "adaptacao": "avatar/multilingual.py provider",
        "valor": "Avatar falante multilíngue",
    },
    {
        "id": "SOCIAL_PUBLISH",
        "provedor": "APIs sociais / webhooks",
        "capacidades_sousa": ["DISTRIBUICAO"],
        "tipo": "api_publish",
        "risco": "MEDIO",
        "adaptacao": "distribution/global_publish.py canais",
        "valor": "Publicação multi-canal sob política",
    },
]


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def registrar_no_contrato() -> Dict[str, Any]:
    from core.soberania import contrato_soberania
    return contrato_soberania.registrar_usb(
        USB_ID,
        tipo="camada_externa_capacidades",
        descricao=(
            "USB de descoberta, adaptação e ampliação de capacidades SOUSA 2.0. "
            "Fontes externas sob soberania; nunca eleva USB a núcleo."
        ),
        capacidades=USB_CAPACIDADES,
        pode_alterar_nucleo=False,
    )


def classificar_risco_operacao(operacao: str) -> str:
    op = str(operacao or "").lower().strip()
    if op in ("mapear_lacunas", "descobrir", "listar_fontes", "status"):
        return "BAIXO"
    if op in ("adaptar", "ampliar", "integrar", "ciclo_expansao"):
        return "MEDIO"
    if op in ("remover_implementador", "desativar_capacidade"):
        return "ALTO"
    return "MEDIO"


def _autorizar(operacao: str, *,
               autorizada: bool,
               auth_id: Optional[str],
               ciclo_id: Optional[str]) -> Dict[str, Any]:
    risco = classificar_risco_operacao(operacao)
    try:
        from core.soberania import contrato_soberania
        check = contrato_soberania.validar_operacao(
            f"capacidade_externa:{operacao}",
            origem=USB_ID,
            dominio=None,
            sinal_risco={"risco": risco, "externa": True, "capacidade": "AMPLIACAO_CAPACIDADE"},
            autorizada=autorizada or risco == "BAIXO",
            auth_id=auth_id,
            ciclo_id=ciclo_id,
        )
        if check.get("ok"):
            return check
        if risco in ("BAIXO", "MEDIO"):
            from core.automacao import politica_automacao
            dec = politica_automacao.decidir(
                "operacao_externa_baixa" if risco == "BAIXO" else "operacao_externa_media",
                risco=risco,
                externa=True,
                autorizada_humana=autorizada,
                auth_id=auth_id,
                ciclo_id=ciclo_id,
            )
            if dec.get("executar"):
                return {"ok": True, "status": "PERMITIDA_AUTOMACAO", "nivel": dec.get("nivel")}
        return check
    except Exception as e:
        if risco == "BAIXO" or autorizada:
            return {"ok": True, "status": "PERMITIDA_FALLBACK"}
        return {"ok": False, "status": "BLOQUEADO", "erro": str(e)}


def mapear_lacunas() -> Dict[str, Any]:
    """Lacunas de capacidade do SOUSA (sem implementador real)."""
    try:
        from core.auto_evolucao import motor_auto_evolucao
        lacunas = motor_auto_evolucao.detectar_lacunas()
    except Exception as e:
        return {"ok": False, "erro": str(e)}

    # Cruza com fontes conhecidas
    oportunidades = []
    for item in (lacunas.get("ausentes") or []) + (lacunas.get("parciais") or []):
        cid = item.get("id")
        fontes = [f for f in _FONTES_CONHECIDAS if cid in f.get("capacidades_sousa", [])]
        oportunidades.append({
            "capacidade": cid,
            "motivo_lacuna": item.get("motivo"),
            "fontes_candidatas": [
                {"id": f["id"], "provedor": f["provedor"], "valor": f["valor"], "risco": f["risco"]}
                for f in fontes
            ],
        })

    return {
        "ok": True,
        "status": "LACUNAS_MAPEADAS",
        "lacunas": lacunas,
        "oportunidades": oportunidades,
        "principio": "Evolução por valor comprovado — fontes externas adaptadas ao SOUSA",
        "timestamp": _utcnow(),
    }


def descobrir(capacidade: str) -> Dict[str, Any]:
    """Lista fontes externas candidatas para uma capacidade SOUSA."""
    cid = str(capacidade or "").upper().strip()
    if not cid:
        return {"ok": False, "status": "CAPACIDADE_OBRIGATORIA"}

    fontes = [f for f in _FONTES_CONHECIDAS if cid in f.get("capacidades_sousa", [])]

    # Estado atual no registro
    estado = None
    try:
        from core.registro_capacidades import registro_capacidades
        estado = registro_capacidades.obter(cid)
    except Exception:
        pass

    return {
        "ok": True,
        "status": "FONTES_DESCOBERTAS",
        "capacidade": cid,
        "estado_atual": estado,
        "fontes": fontes,
        "total": len(fontes),
        "proximo_passo": "adaptar" if fontes else "cadastrar_fonte_manual",
        "timestamp": _utcnow(),
    }


def adaptar(
    fonte_id: str,
    *,
    capacidade: Optional[str] = None,
    comando: str = "",
) -> Dict[str, Any]:
    """
    Gera contrato de adaptação da fonte externa ao SOUSA 2.0
    (USB pattern: pode_alterar_nucleo=False).
    Não instala SDK — define o adaptador estrutural.
    """
    fonte = next((f for f in _FONTES_CONHECIDAS if f["id"] == str(fonte_id).upper()), None)
    if not fonte:
        return {"ok": False, "status": "FONTE_DESCONHECIDA", "fonte_id": fonte_id}

    caps = fonte.get("capacidades_sousa") or []
    alvo = (capacidade or (caps[0] if caps else "")).upper()

    contrato = {
        "tipo": "ADAPTADOR_USB",
        "fonte": fonte,
        "capacidade_alvo": alvo,
        "contrato_sousa": {
            "usb_id": f"EXT_{fonte['id']}",
            "pode_alterar_nucleo": False,
            "capacidades": caps,
            "orquestracao": "Ruflo",
            "soberania": "valida_operacao antes de cada chamada",
            "memoria": "resultados relevantes em namespace=capacidades",
            "falha": "cooldown + fallback via politica.selecionar_recurso",
        },
        "passos_implementacao": [
            f"1. Criar/estender módulo sugerido: {fonte.get('adaptacao')}",
            "2. Registrar USB no contrato_soberania (pode_alterar_nucleo=False)",
            f"3. Registrar implementador '{fonte['id'].lower()}' em registro_capacidades para {alvo}",
            "4. Ligar handler Ruflo EXECUTANDO quando capacidade == alvo",
            "5. Testar ciclo Ruflo com intenção da capacidade",
            "6. Consolidar na memória canônica (namespace=evolucao)",
        ],
        "comando_operador": comando or None,
        "criado_em": _utcnow(),
    }

    try:
        from core.memoria import memoria_canonica
        memoria_canonica.guardar(
            f"adaptador:{fonte['id']}:{alvo}",
            contrato,
            namespace="capacidades",
            origem=USB_ID,
        )
    except Exception:
        pass

    return {
        "ok": True,
        "status": "ADAPTADOR_DEFINIDO",
        "contrato": contrato,
        "proximo_passo": "ampliar ou integrar",
    }


def ampliar(
    capacidade: str,
    *,
    implementador: str,
    fonte_id: Optional[str] = None,
    comando: str = "",
) -> Dict[str, Any]:
    """
    Amplia capacidade EXISTENTE com novo implementador
    (não cria capacidade nova — só adiciona braço externo).
    """
    cid = str(capacidade or "").upper().strip()
    impl = str(implementador or "").strip().lower()
    if not cid or not impl:
        return {"ok": False, "status": "CAPACIDADE_E_IMPLEMENTADOR_OBRIGATORIOS"}

    try:
        from core.registro_capacidades import registro_capacidades
        atual = registro_capacidades.obter(cid)
        if not atual:
            return {
                "ok": False,
                "status": "CAPACIDADE_INEXISTENTE",
                "dica": "Use integrar para registrar capacidade nova",
            }

        r = registro_capacidades.registrar(
            cid,
            descricao=atual.get("descricao") or cid,
            risco=atual.get("risco") or "MEDIO",
            exige_autorizacao=bool(atual.get("exige_autorizacao")),
            implementadores=[impl],
            tags=list(atual.get("tags") or []) + ["ampliado_externo"],
            origem=USB_ID,
        )

        registro = {
            "ok": True,
            "status": "CAPACIDADE_AMPLIADA",
            "capacidade": cid,
            "implementador": impl,
            "fonte_id": fonte_id,
            "comando": comando or None,
            "registro": r,
            "timestamp": _utcnow(),
            "principio": "Ampliação por valor comprovado; núcleo intacto",
        }

        try:
            from core.memoria import memoria_canonica
            memoria_canonica.guardar(
                f"ampliacao:{cid}:{impl}:{uuid.uuid4().hex[:6]}",
                registro,
                namespace="capacidades",
                origem=USB_ID,
            )
        except Exception:
            pass

        return registro
    except Exception as e:
        return {"ok": False, "status": "FALHA_AMPLIACAO", "erro": str(e)}


def integrar(
    capacidade: str,
    *,
    descricao: str = "",
    implementador: str,
    risco: str = "MEDIO",
    fonte_id: Optional[str] = None,
    tags: Optional[List[str]] = None,
    comando: str = "",
) -> Dict[str, Any]:
    """Registra capacidade nova (ou garante existência) e liga implementador externo."""
    cid = str(capacidade or "").upper().strip()
    impl = str(implementador or "").strip().lower()
    if not cid or not impl:
        return {"ok": False, "status": "CAPACIDADE_E_IMPLEMENTADOR_OBRIGATORIOS"}

    try:
        from core.registro_capacidades import registro_capacidades

        r = registro_capacidades.registrar(
            cid,
            descricao=descricao or f"Capacidade integrada via fonte externa ({fonte_id or impl})",
            risco=risco,
            exige_autorizacao=(str(risco).upper() == "ALTO"),
            implementadores=[impl],
            tags=list(tags or []) + ["integracao_externa", "sousa_adaptado"],
            origem=USB_ID,
        )

        registro = {
            "ok": True,
            "status": "CAPACIDADE_INTEGRADA",
            "capacidade": cid,
            "implementador": impl,
            "fonte_id": fonte_id,
            "comando": comando or None,
            "registro": r,
            "timestamp": _utcnow(),
        }

        try:
            from core.memoria import memoria_canonica
            memoria_canonica.guardar(
                f"integracao:{cid}:{impl}:{uuid.uuid4().hex[:6]}",
                registro,
                namespace="capacidades",
                origem=USB_ID,
            )
        except Exception:
            pass

        return registro
    except Exception as e:
        return {"ok": False, "status": "FALHA_INTEGRACAO", "erro": str(e)}


def ciclo_expansao(
    *,
    capacidade: Optional[str] = None,
    fonte_id: Optional[str] = None,
    comando: str = "",
    autorizada: bool = False,
    auth_id: Optional[str] = None,
    ciclo_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Loop: mapear lacunas → descobrir → adaptar → ampliar/integrar.
    Se capacidade/fonte não informadas, pega a primeira oportunidade com fonte.
    """
    etapas: List[Dict[str, Any]] = []

    mapa = mapear_lacunas()
    etapas.append({"etapa": "mapear_lacunas", "resultado": {
        "total_oportunidades": len(mapa.get("oportunidades") or []),
        "ok": mapa.get("ok"),
    }})

    cid = (capacidade or "").upper().strip()
    fid = (fonte_id or "").upper().strip()

    if not cid:
        for op in mapa.get("oportunidades") or []:
            if op.get("fontes_candidatas"):
                cid = op["capacidade"]
                fid = fid or op["fontes_candidatas"][0]["id"]
                break

    if not cid:
        return {
            "ok": True,
            "status": "SEM_LACUNA_COM_FONTE",
            "etapas": etapas,
            "mensagem": "Nenhuma lacuna com fonte candidata conhecida no momento",
        }

    desc = descobrir(cid)
    etapas.append({"etapa": "descobrir", "resultado": {"total": desc.get("total"), "capacidade": cid}})

    if not fid and desc.get("fontes"):
        fid = desc["fontes"][0]["id"]

    if not fid:
        return {"ok": False, "status": "SEM_FONTE", "capacidade": cid, "etapas": etapas}

    adp = adaptar(fid, capacidade=cid, comando=comando)
    etapas.append({"etapa": "adaptar", "resultado": {"status": adp.get("status"), "fonte": fid}})

    # Ampliar se capacidade existe; senão integrar
    existe = False
    try:
        from core.registro_capacidades import registro_capacidades
        existe = registro_capacidades.obter(cid) is not None
    except Exception:
        pass

    impl = fid.lower()
    if existe:
        fin = ampliar(cid, implementador=impl, fonte_id=fid, comando=comando)
        etapas.append({"etapa": "ampliar", "resultado": fin})
    else:
        fin = integrar(cid, implementador=impl, fonte_id=fid, comando=comando)
        etapas.append({"etapa": "integrar", "resultado": fin})

    return {
        "ok": bool(fin.get("ok")),
        "status": "CICLO_EXPANSAO_CONCLUIDO" if fin.get("ok") else "CICLO_EXPANSAO_PARCIAL",
        "capacidade": cid,
        "fonte_id": fid,
        "etapas": etapas,
        "resultado_final": fin,
        "timestamp": _utcnow(),
        "principio": "Capacidades externas adaptadas ao SOUSA; núcleo soberano",
    }


def listar_fontes() -> Dict[str, Any]:
    return {
        "ok": True,
        "total": len(_FONTES_CONHECIDAS),
        "fontes": _FONTES_CONHECIDAS,
        "usb": USB_ID,
    }


def executar(
    operacao: str,
    *,
    payload: Optional[Dict[str, Any]] = None,
    url: Optional[str] = None,  # mantido por compat; não é o foco
    autorizada: bool = False,
    auth_id: Optional[str] = None,
    ciclo_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Entrada única da USB.
    operacao: mapear_lacunas | descobrir | adaptar | ampliar | integrar |
              ciclo_expansao | listar_fontes | status
    payload: capacidade, fonte_id, implementador, descricao, risco, comando, tags
    """
    payload = payload or {}
    op = str(operacao or "mapear_lacunas").lower().strip()
    op_id = f"CAP_{uuid.uuid4().hex[:10]}"

    auth = _autorizar(op, autorizada=autorizada, auth_id=auth_id, ciclo_id=ciclo_id)
    if not auth.get("ok"):
        return {
            "ok": False,
            "op_id": op_id,
            "operacao": op,
            "status": auth.get("status", "BLOQUEADO"),
            "soberania": auth,
            "usb": USB_ID,
        }

    if op in ("mapear_lacunas", "lacunas"):
        resultado = mapear_lacunas()
    elif op in ("descobrir", "discover"):
        resultado = descobrir(payload.get("capacidade") or payload.get("capacidade_alvo") or "")
    elif op == "adaptar":
        resultado = adaptar(
            payload.get("fonte_id") or payload.get("fonte") or "",
            capacidade=payload.get("capacidade"),
            comando=payload.get("comando") or "",
        )
    elif op == "ampliar":
        resultado = ampliar(
            payload.get("capacidade") or "",
            implementador=payload.get("implementador") or payload.get("fonte_id") or "",
            fonte_id=payload.get("fonte_id"),
            comando=payload.get("comando") or "",
        )
    elif op == "integrar":
        resultado = integrar(
            payload.get("capacidade") or "",
            descricao=payload.get("descricao") or "",
            implementador=payload.get("implementador") or payload.get("fonte_id") or "",
            risco=payload.get("risco") or "MEDIO",
            fonte_id=payload.get("fonte_id"),
            tags=payload.get("tags"),
            comando=payload.get("comando") or "",
        )
    elif op in ("ciclo_expansao", "expandir", "ciclo"):
        resultado = ciclo_expansao(
            capacidade=payload.get("capacidade"),
            fonte_id=payload.get("fonte_id"),
            comando=payload.get("comando") or "",
            autorizada=autorizada,
            auth_id=auth_id,
            ciclo_id=ciclo_id,
        )
    elif op in ("listar_fontes", "fontes"):
        resultado = listar_fontes()
    elif op == "status":
        resultado = {
            "ok": True,
            "usb": USB_ID,
            "missao": "descobrir, adaptar e ampliar capacidades SOUSA 2.0",
            "operacoes": [
                "mapear_lacunas", "descobrir", "adaptar",
                "ampliar", "integrar", "ciclo_expansao", "listar_fontes",
            ],
            "fontes_catalogadas": len(_FONTES_CONHECIDAS),
        }
    else:
        resultado = {
            "ok": False,
            "status": "OPERACAO_DESCONHECIDA",
            "operacao": op,
            "operacoes_validas": [
                "mapear_lacunas", "descobrir", "adaptar",
                "ampliar", "integrar", "ciclo_expansao", "listar_fontes", "status",
            ],
        }

    out = {
        "ok": bool(resultado.get("ok")),
        "op_id": op_id,
        "operacao": op,
        "usb": USB_ID,
        "risco": classificar_risco_operacao(op),
        "resultado": resultado,
        "timestamp": _utcnow(),
    }

    try:
        from core.memoria import memoria_canonica
        memoria_canonica.guardar(
            f"ext:{op_id}",
            {"operacao": op, "ok": out["ok"], "resumo": resultado.get("status")},
            namespace="operacoes_externas",
            origem=USB_ID,
            ciclo_id=ciclo_id,
        )
    except Exception:
        pass

    return out
