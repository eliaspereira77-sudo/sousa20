"""
SOUSA 2.0 - Entry Point Principal
Sistema de IA Pessoal Avançado
"""

import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Importações dos módulos (serão implementados progressivamente)
try:
    from core.gemini_client import GeminiClient
    from core.sousa_ia import SousaIA
    from ruflo.orchestrator import RufloOrchestrator
except ImportError:
    GeminiClient = None
    SousaIA = None
    RufloOrchestrator = None


@app.route("/")
def home():
    return jsonify({
        "system": "SOUSA 2.0",
        "status": "operational",
        "version": "0.2.0-foundation",
        "message": "Sistema de IA Pessoal Avançado - Fundação estabelecida",
        "modules": {
            "core": "active",
            "ruflo": "preparing",
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
    """Endpoint básico de chat (Gemini)."""
    data = request.get_json() or {}
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "message is required"}), 400

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({
            "error": "GEMINI_API_KEY not configured",
            "hint": "Set the environment variable GEMINI_API_KEY"
        }), 500

    if GeminiClient is None:
        return jsonify({"error": "GeminiClient module not available yet"}), 503

    try:
        client = GeminiClient(api_key=api_key)
        response = client.generate(message)
        return jsonify({
            "system": "SOUSA 2.0",
            "response": response,
            "model": "gemini"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/status")
def status():
    """Status consolidado do sistema."""
    return jsonify({
        "system": "SOUSA 2.0",
        "version": "0.2.0-foundation",
        "components": {
            "sousa_ia": "ready_for_enrichment",
            "ruflo_layer": "structure_ready",
            "internal_capabilities": "planned",
            "external_capabilities": "planned",
            "multimedia": "planned",
            "voice_clone": "planned",
            "multilingual_avatar": "planned",
            "global_distribution": "planned"
        },
        "next_priorities": [
            "Prepare Ruflo layer",
            "Integrate SOUSA IA enrichment",
            "Structure voice + avatar modules",
            "Global distribution pipeline"
        ]
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"Starting SOUSA 2.0 on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
