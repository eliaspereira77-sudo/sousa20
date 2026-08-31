import json
import hashlib
import platform
from pathlib import Path
from datetime import datetime

NOME_RAIZ = "SOUSA 2.0 PRODUÇÃO"
MANIFESTO = "SOUSA_SOURCE_OF_TRUTH.json"
INVENTARIO = "SOUSA_INVENTARIO_PRODUCAO.json"
ARQUIVO = "SOUSA_SINCRONIZADOR_OFICIAL.py"

EXCLUIR = {
    ".git", "node_modules", "__pycache__",
    "backup", "backups", "_QUARENTENA_RESIDUOS"
}

def agora():
    return datetime.now().astimezone().isoformat()

def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for bloco in iter(lambda: f.read(1024 * 1024), b""):
            h.update(bloco)
    return h.hexdigest()

def descobrir_raiz():
    atual = Path(__file__).resolve().parent

    if atual.name.upper() != NOME_RAIZ.upper():
        raise RuntimeError(
            f"RAIZ_INVALIDA: esperado '{NOME_RAIZ}', encontrado '{atual.name}'"
        )

    return atual

def inventariar(raiz):
    arquivos = []

    for path in raiz.rglob("*"):
        if not path.is_file():
            continue

        partes = set(path.relative_to(raiz).parts)

        if partes & EXCLUIR:
            continue

        if path.name in {MANIFESTO, INVENTARIO}:
            continue

        try:
            stat = path.stat()
            arquivos.append({
                "arquivo": path.relative_to(raiz).as_posix(),
                "bytes": stat.st_size,
                "modificado": datetime.fromtimestamp(
                    stat.st_mtime
                ).astimezone().isoformat(),
                "sha256": sha256(path)
            })
        except Exception as e:
            arquivos.append({
                "arquivo": path.relative_to(raiz).as_posix(),
                "erro": str(e)
            })

    return sorted(arquivos, key=lambda x: x["arquivo"].lower())

def detectar_anomalias(arquivos):
    anomalias = []
    nomes = {}

    suspeitos = (
        "backup", "bak", "old", "copia",
        "copy", "final", "corrigido"
    )

    for item in arquivos:
        nome = Path(item["arquivo"]).name.lower()

        nomes.setdefault(nome, []).append(item["arquivo"])

        if any(x in nome for x in suspeitos):
            anomalias.append({
                "tipo": "POSSIVEL_ARQUIVO_HISTORICO",
                "arquivo": item["arquivo"]
            })

    for nome, caminhos in nomes.items():
        if len(caminhos) > 1:
            anomalias.append({
                "tipo": "NOME_DUPLICADO",
                "nome": nome,
                "arquivos": caminhos
            })

    return anomalias

def main():
    raiz = descobrir_raiz()
    manifesto_path = raiz / MANIFESTO

    if not manifesto_path.exists():
        raise RuntimeError("MANIFESTO_NAO_ENCONTRADO")

    manifesto = json.loads(manifesto_path.read_text(encoding="utf-8-sig"))

    arquivos = inventariar(raiz)
    anomalias = detectar_anomalias(arquivos)

    inventario = {
        "protocolo": "SOUSA_INVENTARIO_PRODUCAO",
        "gerado_em": agora(),
        "raiz": str(raiz),
        "host": platform.node(),
        "arquivos": arquivos,
        "total_arquivos": len(arquivos),
        "anomalias": anomalias
    }

    (raiz / INVENTARIO).write_text(
        json.dumps(inventario, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print("")
    print("=== SOUSA 2.0 — IDENTIDADE OPERACIONAL ===")
    print(f"RAIZ: {raiz}")
    print(f"FONTE DA VERDADE: {manifesto['raiz_oficial']['nome']}")
    print(f"ARQUIVOS: {len(arquivos)}")
    print(f"ANOMALIAS: {len(anomalias)}")
    print(f"VIA BIDIRECIONAL EXISTENTE: "
          f"{manifesto['sincronizacao']['via_bidirecional_existente']}")
    print("SINCRONIZADOR: ATIVO")
    print("ALTERAÇÕES DESTRUTIVAS: NENHUMA")
    print("============================================")
    print("")

if __name__ == "__main__":
    main()
