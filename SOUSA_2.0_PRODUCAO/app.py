"""
SOUSA 2.0 - Entry Point Principal
Sistema de IA Pessoal Avançado
"""

import os
from flask import Flask, request, jsonify, Response, stream_with_context
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Importações dos módulos
# ---------------------------------------------------------------------------
try:
    from core.gemini_client import GeminiClient, SOUSA_SYSTEM_INSTRUCTION
    from core.sousa_ia import SousaIA
except ImportError:
    GeminiClient = None
    SousaIA = None
    SOUSA_SYSTEM_INSTRUCTION = None

try:
    from core.omniroute_client import (
        OmniRouteClient,
        OmniRouteUnavailableError,
        OmniRouteAPIError,
        registrar_omniroute_como_usb,
    )
    if os.getenv("OMNIROUTE_BASE_URL"):
        try:
            registrar_omniroute_como_usb()
        except Exception:
            pass
except ImportError:
    OmniRouteClient = None
    OmniRouteUnavailableError = Exception
    OmniRouteAPIError = Exception

try:
    from core.modulo_ads import ModuloADS
except ImportError:
    ModuloADS = None

try:
    from core.api_client import ExternalAPIClient, APIConfigError
except ImportError:
    ExternalAPIClient = None
    APIConfigError = Exception

try:
    from voice.tts_client import TTSClient
except ImportError:
    TTSClient = None


# ---------------------------------------------------------------------------
# Rotas básicas
# ---------------------------------------------------------------------------
@app.route("/")
def home():
    return jsonify({
        "system": "SOUSA 2.0",
        "status": "operational",
        "version": "0.4.0-apis",
        "message": "Sistema de IA Pessoal Avançado - APIs externas integradas",
        "modules": {
            "core": "active",
            "gemini": "modern-sdk" if GeminiClient else "unavailable",
            "omniroute": "configured" if os.getenv("OMNIROUTE_BASE_URL") else "not_configured",
            "ads": "available" if ModuloADS else "unavailable",
            "voice": "structure_ready" if TTSClient else "unavailable",
            "api_client": "available" if ExternalAPIClient else "unavailable",
            "ruflo": "preparing",
            "avatar": "planned",
            "distribution": "planned",
        },
    })


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "system": "SOUSA 2.0"})


@app.route("/status")
def status():
    return jsonify({
        "system": "SOUSA 2.0",
        "version": "0.4.0-apis",
        "components": {
            "sousa_ia": "ready",
            "gemini_client": "modern" if GeminiClient else "missing",
            "omniroute": "configured" if os.getenv("OMNIROUTE_BASE_URL") else "not_configured",
            "modulo_ads": "available" if ModuloADS else "missing",
            "tts_voice": "structure_ready" if TTSClient else "missing",
            "api_client": "available" if ExternalAPIClient else "missing",
            "ruflo_layer": "structure_ready",
        },
        "gemini_model_default": "gemini-3.8-flash",
        "next_priorities": [
            "Configurar GEMINI_API_KEY e testar /chat/gemini",
            "Subir OmniRoute local (opcional, prioridade $0)",
            "Instalar Piper + modelo pt_BR para voz",
            "Integrar canal WhatsApp/Telegram",
        ],
    })


# ---------------------------------------------------------------------------
# Catálogo e status de APIs externas
# ---------------------------------------------------------------------------
@app.route("/apis/status")
def apis_status():
    """Lista integrações externas e se estão ativas/configuradas."""
    apis = []

    # Gemini
    gemini_key = bool(os.getenv("GEMINI_API_KEY"))
    apis.append({
        "name": "GEMINI",
        "tipo": "llm",
        "ativo": gemini_key and GeminiClient is not None,
        "configurado": gemini_key,
        "modulo_carregado": GeminiClient is not None,
        "capacidades": ["generate", "chat", "stream"],
        "env": ["GEMINI_API_KEY"],
        "detalhe": "SDK google-genai | modelo gemini-3.8-flash",
    })

    # OmniRoute
    omni_url = os.getenv("OMNIROUTE_BASE_URL")
    omni_ativo = False
    omni_detalhe = "não configurado"
    if omni_url and OmniRouteClient is not None:
        try:
            # smoke check leve — não envia prompt
            omni_ativo = True
            omni_detalhe = f"configurado em {omni_url}"
        except Exception as e:
            omni_detalhe = str(e)[:120]
    apis.append({
        "name": "OMNIROUTE",
        "tipo": "gateway_llm",
        "ativo": bool(omni_url) and OmniRouteClient is not None,
        "configurado": bool(omni_url),
        "modulo_carregado": OmniRouteClient is not None,
        "capacidades": ["roteamento_llm", "fallback_provedor"],
        "env": ["OMNIROUTE_BASE_URL", "OMNIROUTE_API_KEY", "OMNIROUTE_MODEL"],
        "detalhe": omni_detalhe,
    })

    # TTS / Piper
    tts_status = {"ativo": False, "detalhe": "módulo não carregado"}
    if TTSClient is not None:
        try:
            tts_status = TTSClient().status()
        except Exception as e:
            tts_status = {"ativo": False, "detalhe": str(e)[:120]}
    apis.append({
        "name": "TTS_VOICE",
        "tipo": "usb_voz",
        "ativo": tts_status.get("ativo", False),
        "configurado": bool(os.getenv("PIPER_MODEL")),
        "modulo_carregado": TTSClient is not None,
        "capacidades": tts_status.get("capacidades", ["tts"]),
        "env": ["PIPER_BIN", "PIPER_MODEL", "TTS_VOICE"],
        "detalhe": tts_status.get("detalhe") or tts_status.get("engine_preferido", ""),
    })

    # Módulo ADS
    apis.append({
        "name": "MODULO_ADS",
        "tipo": "analise_codigo",
        "ativo": ModuloADS is not None and (gemini_key or bool(omni_url)),
        "configurado": ModuloADS is not None,
        "modulo_carregado": ModuloADS is not None,
        "capacidades": ["diagnostico", "proposta_correcao"],
        "env": [],
        "detalhe": "Usa Gemini ou OmniRoute como backend LLM",
    })

    # Cliente genérico
    apis.append({
        "name": "API_CLIENT",
        "tipo": "http_generico",
        "ativo": ExternalAPIClient is not None,
        "configurado": ExternalAPIClient is not None,
        "modulo_carregado": ExternalAPIClient is not None,
        "capacidades": ["get", "post", "status"],
        "env": [],
        "detalhe": "Factory para novas APIs HTTP externas (padrão USB)",
    })

    # Drive (Apps Script — documentação)
    apis.append({
        "name": "GOOGLE_DRIVE",
        "tipo": "persistencia",
        "ativo": False,  # roda no Apps Script, não neste processo Python
        "configurado": True,
        "modulo_carregado": False,
        "capacidades": ["salvar", "ler", "pastas", "logs", "backup"],
        "env": [],
        "detalhe": "Módulo JS (SOUSA_DRIVE_API.js) — custo zero via DriveApp",
    })

    ativos = sum(1 for a in apis if a["ativo"])
    return jsonify({
        "system": "SOUSA 2.0",
        "total": len(apis),
        "ativos": ativos,
        "apis": apis,
    })


# ---------------------------------------------------------------------------
# Chat legado (OmniRoute → Gemini fallback)
# ---------------------------------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "message is required"}), 400

    omniroute_base_url = os.getenv("OMNIROUTE_BASE_URL")
    if omniroute_base_url and OmniRouteClient is not None:
        try:
            client = OmniRouteClient(
                api_key=os.getenv("OMNIROUTE_API_KEY", "local"),
                model_name=os.getenv("OMNIROUTE_MODEL", "auto/cheap"),
                base_url=omniroute_base_url,
            )
            response = client.generate(message)
            return jsonify({
                "system": "SOUSA 2.0",
                "response": response,
                "model": "omniroute",
            })
        except (OmniRouteUnavailableError, OmniRouteAPIError) as e:
            app.logger.warning("OmniRoute indisponível, caindo para Gemini: %s", e)

    return _gemini_chat_internal(message, data.get("history"))


# ---------------------------------------------------------------------------
# Endpoint dedicado Gemini
# ---------------------------------------------------------------------------
@app.route("/chat/gemini", methods=["POST"])
def chat_gemini():
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    stream = bool(data.get("stream", False))
    if stream:
        return Response(
            stream_with_context(_stream_gemini(message, data)),
            mimetype="text/plain",
        )

    return _gemini_chat_internal(
        message,
        history=data.get("history"),
        temperature=data.get("temperature", 0.7),
        model_name=data.get("model"),
    )


def _gemini_chat_internal(message, history=None, temperature=0.7, model_name=None):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({
            "error": "GEMINI_API_KEY not configured",
            "hint": "Defina a variável de ambiente GEMINI_API_KEY",
        }), 500

    if GeminiClient is None:
        return jsonify({"error": "GeminiClient module not available"}), 503

    try:
        client = GeminiClient(
            api_key=api_key,
            model_name=model_name or GeminiClient.DEFAULT_MODEL,
        )
        if history:
            response_text = client.chat(message, history=history, temperature=temperature)
        else:
            response_text = client.generate(message, temperature=temperature)

        return jsonify({
            "system": "SOUSA 2.0",
            "response": response_text,
            "model": client.model_name,
            "sdk": "google-genai",
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.exception("Erro no Gemini")
        return jsonify({"error": str(e)}), 500


def _stream_gemini(message, data):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or GeminiClient is None:
        yield "Erro: GEMINI_API_KEY ou GeminiClient indisponível"
        return
    try:
        client = GeminiClient(
            api_key=api_key,
            model_name=data.get("model") or GeminiClient.DEFAULT_MODEL,
        )
        for chunk in client.generate_stream(
            message, temperature=data.get("temperature", 0.7)
        ):
            yield chunk
    except Exception as e:
        yield f"\n[Erro: {e}]"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"Starting SOUSA 2.0 v0.4.0-apis on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
