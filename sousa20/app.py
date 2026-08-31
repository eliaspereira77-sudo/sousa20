"""
SOUSA 2.0 - Entry Point Principal
Sistema de IA Pessoal Avançado — automação 99,99% + expansão de capacidades
"""

import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

try:
    from core.gemini_client import GeminiClient
    from core.ads import ads
    from core.sousa_ia import SousaIA
    from core.memoria import memoria_canonica
    from core.soberania import contrato_soberania
    from core.auto_evolucao import motor_auto_evolucao
    from core.automacao import politica_automacao
    from core.equipe_manutencao import equipe_manutencao
    from core.registro_capacidades import registro_capacidades
    from ruflo.orchestrator import RufloOrchestrator
    from ruflo.handlers import registrar_handlers_padrao
except ImportError as e:
    GeminiClient = None
    ads = None
    SousaIA = None
    memoria_canonica = None
    contrato_soberania = None
    motor_auto_evolucao = None
    politica_automacao = None
    equipe_manutencao = None
    registro_capacidades = None
    RufloOrchestrator = None
    registrar_handlers_padrao = None
    _import_error = str(e)
else:
    _import_error = None
    try:
        from usb.operacoes_externas import registrar_no_contrato
        registrar_no_contrato()
    except Exception:
        pass

try:
    from core.omniroute_client import (
        OmniRouteClient,
        OmniRouteUnavailableError,
        OmniRouteAPIError,
        registrar_omniroute_como_usb,
    )
    if os.getenv("OMNIROUTE_BASE_URL"):
        registrar_omniroute_como_usb()
except ImportError:
    OmniRouteClient = None
    OmniRouteUnavailableError = Exception
    OmniRouteAPIError = Exception
    registrar_omniroute_como_usb = None

_orchestrator = None


def get_orchestrator():
    global _orchestrator
    if _orchestrator is None and RufloOrchestrator is not None:
        _orchestrator = RufloOrchestrator()
        if registrar_handlers_padrao:
            registrar_handlers_padrao(_orchestrator)
    return _orchestrator


@app.route("/")
def home():
    return jsonify({
        "system": "SOUSA 2.0",
        "status": "operational",
        "version": "0.5.1-capacidades",
        "message": "SOUSA 2.0 — automação 99,99% + expansão externa de capacidades sob soberania",
        "modules": {
            "core": "active",
            "soberania": "active",
            "memoria_canonica": "active",
            "ruflo": "active",
            "usb_enriquecimento": "active",
            "auto_evolucao": "active",
            "automacao": "active",
            "equipe_manutencao": "active",
            "operacoes_externas": "active",
            "expansao_capacidades": "active",
            "ads": "active" if ads else "unavailable",
            "voice": "planned",
            "avatar": "planned",
            "distribution": "planned"
        }
    })


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "system": "SOUSA 2.0"})


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
                model_name=os.getenv("OMNIROUTE_MODEL", "auto"),
                base_url=omniroute_base_url,
            )
            return jsonify({
                "system": "SOUSA 2.0",
                "response": client.generate(message),
                "model": "omniroute",
            })
        except (OmniRouteUnavailableError, OmniRouteAPIError) as exc:
            app.logger.warning("OmniRoute indisponível; usando Gemini: %s", exc)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured"}), 500
    if GeminiClient is None:
        return jsonify({"error": "GeminiClient unavailable", "detail": _import_error}), 503
    try:
        client = GeminiClient(api_key=api_key)
        return jsonify({"system": "SOUSA 2.0", "response": client.generate(message), "model": "gemini"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/ciclo", methods=["POST"])
def ciclo():
    data = request.get_json() or {}
    intencao = data.get("intencao") or data.get("message") or data.get("texto") or ""
    if not intencao:
        return jsonify({"error": "intencao is required"}), 400
    orch = get_orchestrator()
    if orch is None:
        return jsonify({"error": "Ruflo unavailable", "detail": _import_error}), 503
    contexto = {
        "intencao": intencao,
        "texto": intencao,
        "capacidade": data.get("capacidade"),
        "sinal_risco": data.get("sinal_risco"),
        "autorizada": bool(data.get("autorizada", False)),
        "auth_id": data.get("auth_id"),
        "acao_evolucao": data.get("acao_evolucao"),
        "capacidade_alvo": data.get("capacidade_alvo"),
        "plano_id": data.get("plano_id"),
        "tentar_recuperacao": data.get("tentar_recuperacao", True),
    }
    return jsonify({"system": "SOUSA 2.0", "resultado": orch.execute("ciclo_padrao", contexto)})


@app.route("/status")
def status():
    orch = get_orchestrator()
    ruflo_status = orch.get_status() if orch else {"status": "unavailable"}
    memoria_status = {}
    if memoria_canonica:
        memoria_status = memoria_canonica.status() if hasattr(memoria_canonica, "status") else memoria_canonica.estatisticas()
    return jsonify({
        "system": "SOUSA 2.0",
        "version": "0.5.1-capacidades",
        "components": {
            "sousa_ia": "active",
            "memoria_canonica": memoria_status,
            "soberania": contrato_soberania.status() if contrato_soberania else {},
            "ruflo_layer": ruflo_status,
            "auto_evolucao": motor_auto_evolucao.status() if motor_auto_evolucao else {},
            "automacao": politica_automacao.status() if politica_automacao else {},
            "equipe_manutencao": equipe_manutencao.status() if equipe_manutencao else {},
            "registro_capacidades": registro_capacidades.status() if registro_capacidades else {},
            "usb_enriquecimento": "active",
            "operacoes_externas": "active",
            "expansao_capacidades": "active",
            "ads": ads.status() if ads else {"status": "unavailable"},
            "voice_clone": "planned",
            "multilingual_avatar": "planned",
            "global_distribution": "planned"
        }
    })


@app.route("/memoria", methods=["GET", "POST"])
def memoria_endpoint():
    if memoria_canonica is None:
        return jsonify({"error": "memoria unavailable"}), 503
    if request.method == "GET":
        termo = request.args.get("q") or request.args.get("termo") or ""
        if termo:
            return jsonify({"resultados": memoria_canonica.buscar(termo)})
        return jsonify(memoria_canonica.status() if hasattr(memoria_canonica, "status") else memoria_canonica.estatisticas())
    data = request.get_json() or {}
    chave = data.get("chave")
    if not chave:
        return jsonify({"error": "chave is required"}), 400
    if hasattr(memoria_canonica, "lembrar"):
        return jsonify(memoria_canonica.lembrar(
            chave, data.get("valor"), tags=data.get("tags"),
            namespace=data.get("namespace", "default"),
            origem=data.get("origem", "api"), ciclo_id=data.get("ciclo_id"),
        ))
    return jsonify(memoria_canonica.guardar(chave, data.get("valor"), namespace=data.get("namespace", "default")))


@app.route("/diagnostico", methods=["GET"])
def diagnostico():
    if motor_auto_evolucao is None:
        return jsonify({"error": "motor unavailable", "detail": _import_error}), 503
    return jsonify({"system": "SOUSA 2.0", "diagnostico": motor_auto_evolucao.diagnosticar()})


@app.route("/evoluir", methods=["POST"])
def evoluir():
    if motor_auto_evolucao is None:
        return jsonify({"error": "motor unavailable"}), 503
    data = request.get_json() or {}
    acao = data.get("acao") or "diagnosticar"
    autorizada = bool(data.get("autorizada", False))
    if politica_automacao and not autorizada:
        dec = politica_automacao.decidir(acao if acao.startswith("auto_") else acao)
        if dec.get("executar"):
            autorizada = True
    resultado = motor_auto_evolucao.executar_sob_comando(
        acao=acao,
        capacidade_alvo=data.get("capacidade_alvo") or data.get("capacidade"),
        plano_id=data.get("plano_id"),
        comando=data.get("comando") or data.get("intencao") or "",
        autorizada=autorizada,
        auth_id=data.get("auth_id"),
        ciclo_id=data.get("ciclo_id"),
    )
    return jsonify({"system": "SOUSA 2.0", "resultado": resultado})


@app.route("/autorizar", methods=["POST"])
def autorizar():
    if contrato_soberania is None:
        return jsonify({"error": "soberania unavailable"}), 503
    data = request.get_json() or {}
    acao = data.get("acao")
    if not acao:
        return jsonify({"error": "acao is required"}), 400
    resultado = contrato_soberania.conceder_autorizacao(
        acao=acao,
        concedida_por=data.get("concedida_por", "operador"),
        origem=data.get("origem"),
        ciclo_id=data.get("ciclo_id"),
        escopo=data.get("escopo"),
        motivo=data.get("motivo", "AUTORIZACAO_OPERADOR"),
        valida_por_segundos=data.get("valida_por_segundos", 3600),
    )
    return jsonify({"system": "SOUSA 2.0", "autorizacao": resultado})


@app.route("/automacao", methods=["GET"])
def automacao_status():
    if politica_automacao is None:
        return jsonify({"error": "politica_automacao unavailable"}), 503
    return jsonify({"system": "SOUSA 2.0", "automacao": politica_automacao.status()})


@app.route("/manutencao", methods=["POST", "GET"])
def manutencao():
    if equipe_manutencao is None:
        return jsonify({"error": "equipe_manutencao unavailable"}), 503
    data = request.get_json(silent=True) or {}
    resultado = equipe_manutencao.ciclo_completo(
        autorizada_humana=bool(data.get("autorizada", False)),
        auth_id=data.get("auth_id"),
    )
    return jsonify({"system": "SOUSA 2.0", "manutencao": resultado})


@app.route("/capacidades", methods=["GET"])
def capacidades():
    """Registro formal + lacunas + fontes externas candidatas."""
    reg = registro_capacidades.status() if registro_capacidades else {}
    lista = registro_capacidades.listar() if registro_capacidades else []
    lacunas = {}
    fontes = {}
    try:
        from usb.operacoes_externas import mapear_lacunas, listar_fontes
        lacunas = mapear_lacunas()
        fontes = listar_fontes()
    except Exception as e:
        lacunas = {"ok": False, "erro": str(e)}
        fontes = {"ok": False, "erro": str(e)}
    return jsonify({
        "system": "SOUSA 2.0",
        "registro": reg,
        "capacidades": lista,
        "lacunas_e_oportunidades": lacunas,
        "fontes_externas": fontes,
        "missao": "Operações externas ampliam e adaptam capacidades ao SOUSA 2.0",
    })


@app.route("/operacao-externa", methods=["POST"])
def operacao_externa():
    """
    Expansão de capacidades via fontes externas.
    operacao: mapear_lacunas | descobrir | adaptar | ampliar | integrar | ciclo_expansao | listar_fontes
    """
    data = request.get_json() or {}
    operacao = data.get("operacao") or data.get("acao") or "mapear_lacunas"
    # Aceita campos no topo ou em payload
    payload = dict(data.get("payload") or {})
    for k in ("capacidade", "capacidade_alvo", "fonte_id", "fonte", "implementador",
              "descricao", "risco", "comando", "tags"):
        if k in data and k not in payload:
            payload[k] = data[k]
    try:
        from usb.operacoes_externas import executar
        resultado = executar(
            operacao,
            payload=payload,
            autorizada=bool(data.get("autorizada", False)),
            auth_id=data.get("auth_id"),
            ciclo_id=data.get("ciclo_id"),
        )
        return jsonify({"system": "SOUSA 2.0", "resultado": resultado})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/ads", methods=["GET"])
def ads_status():
    if ads is None:
        return jsonify({"error": "ADS unavailable"}), 503
    return jsonify({"system": "SOUSA 2.0", "ads": ads.status()})


@app.route("/ads/diagnostico", methods=["GET"])
def ads_diagnostico():
    if ads is None:
        return jsonify({"error": "ADS unavailable"}), 503
    return jsonify({"system": "SOUSA 2.0", "diagnostico": ads.diagnosticar()})


@app.route("/ads/planejar", methods=["POST"])
def ads_planejar():
    if ads is None:
        return jsonify({"error": "ADS unavailable"}), 503
    data = request.get_json(silent=True) or {}
    plano = ads.planejar_correcao(
        data.get("componente", ""),
        data.get("problema", ""),
        evidencias=data.get("evidencias") or [],
        risco=data.get("risco", "MEDIO"),
        comando_usuario=data.get("comando_usuario", ""),
    )
    return jsonify({"system": "SOUSA 2.0", "plano": plano}), (200 if plano.get("ok") else 400)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"Starting SOUSA 2.0 (capacidades) on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
