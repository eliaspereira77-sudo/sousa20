"""
SOUSA 2.0 - Pacote core
"""

from .gemini_client import GeminiClient, SOUSA_SYSTEM_INSTRUCTION

__all__ = [
    "GeminiClient",
    "SOUSA_SYSTEM_INSTRUCTION",
]

try:
    from .omniroute_client import OmniRouteClient
    __all__.append("OmniRouteClient")
except ImportError:
    pass

try:
    from .modulo_ads import ModuloADS
    __all__.append("ModuloADS")
except ImportError:
    pass

try:
    from .api_client import ExternalAPIClient
    __all__.append("ExternalAPIClient")
except ImportError:
    pass
