"""Suíte de testes automatizados e auto-auditoria MAX_LINES <= 350 do SOUSA-QODER."""

import sys
import tempfile
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sousa_qoder.cli import main as cli_main
from sousa_qoder.modes import SousaQoderEngine
from sousa_qoder.self_evolution import AutoEvolutionEngine
from sousa_qoder.usinagem_soldagem import UsinagemAutosoldagemEngine


class TestSousaQoder(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "app.py").write_text(
            '"""Modulo principal."""\n\ndef hello():\n    return "ok"\n',
            encoding="utf-8",
        )

    def tearDown(self):
        self.tmp.cleanup()

    def test_repo_wiki_and_ask_mode(self):
        engine = SousaQoderEngine(str(self.root))
        wiki_path = engine.wiki.save_wiki()
        self.assertTrue(wiki_path.exists())
        res = engine.ask_mode("hello app")
        self.assertTrue(res["read_only"])
        self.assertEqual(res["cost_usd"], 0.0)
        self.assertGreaterEqual(len(res["matches"]), 1)

    def test_agent_mode_checkpoint_and_revert(self):
        engine = SousaQoderEngine(str(self.root))
        res = engine.agent_mode("Atualizar saudação", ["app.py"])
        cp_id = res["checkpoint_id"]
        self.assertTrue(res["audits"][0]["ok"])

        (self.root / "app.py").write_text("# alterado\n", encoding="utf-8")
        rev = engine.guard.revert(cp_id)
        self.assertIn("app.py", rev["restored"])
        self.assertIn("def hello", (self.root / "app.py").read_text(encoding="utf-8"))

    def test_quest_mode_and_cli(self):
        rc = cli_main(["--workspace", str(self.root), "quest", "--title", "MVP", "--goal", "Criar arquitetura limpa"])
        self.assertEqual(rc, 0)
        self.assertTrue((self.root / "QUEST_SPEC.md").exists())
        self.assertTrue((self.root / "TASK_REPORT.md").exists())

    def test_self_evolution_and_installer_manifest(self):
        (self.root / "gigante.py").write_text("\n".join(["x = 1"] * 360), encoding="utf-8")
        evo = AutoEvolutionEngine(str(self.root))
        propostas = evo.escanear_oportunidades()
        self.assertEqual(len(propostas), 1)
        self.assertFalse(propostas[0].aprovada)
        self.assertTrue(propostas[0].autorizar_soberano("SOUSA_GUARDIAN_001"))
        manifest = evo.exportar_manifesto_instalador()
        self.assertTrue(manifest["latente_no_instalador"])
        self.assertTrue(manifest["regra_0800"])

    def test_usinagem_autosoldagem_cao_de_guarda_e_faxineiro(self):
        (self.root / "quebrado.py").write_text("def falha(:\n    return 1\n", encoding="utf-8")
        (self.root / "lixo.tmp").write_text("residuo\n", encoding="utf-8")
        oficina = UsinagemAutosoldagemEngine(str(self.root))

        diag = oficina.inspecionar_arquivo("quebrado.py")
        self.assertFalse(diag.sintaxe_ok)

        malicioso = oficina.autosoldar_codigo_quebrado("quebrado.py", "eval('rm -rf /')\n")
        self.assertEqual(malicioso["status"], "BLOQUEADO_CAO_DE_GUARDA")

        soldado = oficina.autosoldar_codigo_quebrado("quebrado.py", "def falha():\n    return 1\n")
        self.assertEqual(soldado["status"], "AUTOSOLDAGEM_CONCLUIDA")
        self.assertIn("lixo.tmp", soldado["residuos_removidos"])
        self.assertTrue(oficina.inspecionar_arquivo("quebrado.py").sintaxe_ok)

    def test_self_max_lines_compliance(self):
        pkg_dir = Path(__file__).resolve().parent.parent
        for py_file in pkg_dir.rglob("*.py"):
            lines = len(py_file.read_text(encoding="utf-8").splitlines())
            self.assertLessEqual(lines, 350, f"{py_file.name} excedeu 350 linhas ({lines})")


if __name__ == "__main__":
    unittest.main()
