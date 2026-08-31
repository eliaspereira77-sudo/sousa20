"""SOUSA 2.0 — USBs (camadas sob o núcleo, orquestradas pela Ruflo)"""

from .enriquecimento import (
    USB_ID,
    enriquecer,
    registrar_no_contrato,
    registrar_handler_na_ruflo,
    handler_executar_enriquecimento,
)

__all__ = [
    "USB_ID",
    "enriquecer",
    "registrar_no_contrato",
    "registrar_handler_na_ruflo",
    "handler_executar_enriquecimento",
]
