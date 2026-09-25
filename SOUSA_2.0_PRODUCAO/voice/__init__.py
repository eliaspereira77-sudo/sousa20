"""SOUSA 2.0 - Camada de voz."""

from .tts_client import TTSClient, TTSConfigError, TTSUnavailableError

__all__ = ["TTSClient", "TTSConfigError", "TTSUnavailableError"]
