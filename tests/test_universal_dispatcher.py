"""Testes unitários do Disparador Universal Multicanal SOUSA 2.0."""

import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sousa_universal_dispatcher import (
    SCOPES_OBRIGATORIOS,
    montar_metadados,
)


class TestSousaUniversalDispatcher(unittest.TestCase):
    def test_metadados_serie_e_dia(self):
        ep1 = montar_metadados("video_guardioes_ep01_studio_pro_netflix.mp4")
        self.assertIn("ARAM DE ÁRIES", ep1["title"])
        self.assertEqual(ep1["categoryId"], "1")
        self.assertIn("eliaspereiradesousa77.blogspot.com", ep1["description"])

        d34 = montar_metadados("video_dia34_automacao_webhooks_fluxos_visuais_0800_shorts.mp4")
        self.assertEqual(d34["categoryId"], "28")
        self.assertIn("eliasdesousa1977", d34["description"])

    def test_scopes_incluem_drive_e_youtube(self):
        self.assertIn("https://www.googleapis.com/auth/drive.readonly", SCOPES_OBRIGATORIOS)
        self.assertIn("https://www.googleapis.com/auth/youtube.upload", SCOPES_OBRIGATORIOS)

    def test_max_lines_compliance(self):
        src = ROOT_DIR / "sousa_universal_dispatcher.py"
        if not src.exists():
            src = ROOT_DIR / "sousa_dispatcher" / "sousa_universal_dispatcher.py"
        lines = len(src.read_text(encoding="utf-8").splitlines())
        self.assertLessEqual(lines, 350, f"Excedeu MAX_LINES=350 ({lines})")


if __name__ == "__main__":
    unittest.main()
