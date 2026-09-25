"""
SOUSA 2.0 - USB de Voz (TTS)
=============================
Camada de Text-to-Speech. Estrutura pronta para Piper (local, $0)
e provedores externos (ElevenLabs, Google TTS, etc.).

Princípio: maximizar Piper local antes de gastar quota paga.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional


class TTSConfigError(Exception):
    """Configuração de TTS ausente ou inválida."""


class TTSUnavailableError(Exception):
    """Motor de TTS indisponível."""


class TTSClient:
    """
    Cliente de voz (Text-to-Speech).

    Prioridade:
    1. Piper local (PIPER_BIN + PIPER_MODEL) — custo zero
    2. Fallback externo (futuro: ElevenLabs / Google)
    """

    def __init__(
        self,
        engine: str = "auto",
        piper_bin: Optional[str] = None,
        piper_model: Optional[str] = None,
        voice: Optional[str] = None,
    ):
        self.engine = engine  # auto | piper | external
        self.piper_bin = piper_bin or os.getenv("PIPER_BIN", "piper")
        self.piper_model = piper_model or os.getenv("PIPER_MODEL")
        self.voice = voice or os.getenv("TTS_VOICE", "pt_BR")

    def speak(self, text: str, output_path: Optional[str] = None) -> str:
        """
        Converte texto em áudio.
        Retorna o caminho do arquivo WAV gerado.
        """
        if not text or not text.strip():
            raise TTSConfigError("Texto vazio para TTS.")

        engine = self._resolve_engine()
        if engine == "piper":
            return self._speak_piper(text, output_path)
        raise TTSUnavailableError(
            f"Engine TTS '{engine}' ainda não implementado. "
            "Configure PIPER_BIN e PIPER_MODEL para usar Piper local."
        )

    def _resolve_engine(self) -> str:
        if self.engine != "auto":
            return self.engine
        if self.piper_model and self._piper_available():
            return "piper"
        return "external"

    def _piper_available(self) -> bool:
        try:
            subprocess.run(
                [self.piper_bin, "--help"],
                capture_output=True,
                timeout=5,
            )
            return True
        except Exception:
            return False

    def _speak_piper(self, text: str, output_path: Optional[str]) -> str:
        if not self.piper_model:
            raise TTSConfigError(
                "PIPER_MODEL não configurado. "
                "Ex: export PIPER_MODEL=/path/to/pt_BR-model.onnx"
            )

        out = output_path or tempfile.mktemp(suffix=".wav", prefix="sousa_tts_")
        cmd = [
            self.piper_bin,
            "--model",
            self.piper_model,
            "--output_file",
            out,
        ]
        try:
            subprocess.run(
                cmd,
                input=text.encode("utf-8"),
                check=True,
                capture_output=True,
                timeout=60,
            )
        except FileNotFoundError as exc:
            raise TTSUnavailableError(
                f"Piper não encontrado em '{self.piper_bin}'."
            ) from exc
        except subprocess.CalledProcessError as exc:
            raise TTSUnavailableError(
                f"Piper falhou: {exc.stderr.decode(errors='replace')[:300]}"
            ) from exc

        if not Path(out).exists():
            raise TTSUnavailableError("Piper não gerou arquivo de áudio.")
        return out

    def status(self) -> dict:
        engine = self._resolve_engine()
        piper_ok = self._piper_available() and bool(self.piper_model)
        return {
            "name": "TTS_VOICE",
            "tipo": "usb_voz",
            "engine_preferido": engine,
            "piper_disponivel": piper_ok,
            "piper_bin": self.piper_bin,
            "piper_model": self.piper_model or "(não configurado)",
            "voice": self.voice,
            "ativo": piper_ok or engine == "external",
            "capacidades": ["tts", "piper_local"],
        }

    def registrar_como_usb(self, contrato) -> dict:
        return contrato.registrar_usb(
            "TTS_VOICE",
            tipo="usb_voz",
            descricao="Text-to-Speech (Piper local prioritário, fallback externo)",
            capacidades=["tts", "piper_local"],
            pode_alterar_nucleo=False,
        )
