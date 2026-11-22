#!/usr/bin/env python3
"""
SOUSA 2.0 — DISPARADOR UNIVERSAL MULTICANAL (ZERO GARGALO • REGRA 0800)
Compatível com Windows (DESKTOP-MQDG3GM), Termux (ANDROID-001) e GitHub Actions (Nuvem 24/7).
100% Python padrão (zero pip install). Descobre vídeos direto no Drive e publica no
YouTube (@EliasPereiradeSousa1977) + Meta/Instagram/Facebook + Telegram + fila TikTok/Kwai.
"""

import hashlib
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional

SCOPES_OBRIGATORIOS = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/drive.readonly",
]

LINKS_OFICIAIS = (
    "\n\nPortal Tecnologia Viva: https://eliaspereiradesousa77.blogspot.com\n"
    "Instagram: https://www.instagram.com/eliasdesousa1977/ | "
    "https://www.instagram.com/pereiradesousaelias/\n"
    "#TecnologiaViva #SOUSA20 #Shorts"
)


def carregar_json(path: Path, padrao):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return padrao


def salvar_json(path: Path, dados) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(dados, indent=2, ensure_ascii=False), encoding="utf-8")


def montar_metadados(nome_arquivo: str) -> Dict[str, object]:
    low = nome_arquivo.lower()
    if "ep01" in low:
        return {
            "title": "O REI DA GLÓRIA E OS 12 GUARDIÕES: EP 01 - ARAM DE ÁRIES! ⚔️✨ #shorts #guardioes #jesus",
            "description": "Série Épica Original SOUSA 2.0: O Homem da Galileia confronta Aram de Áries." + LINKS_OFICIAIS,
            "tags": ["o rei da gloria e os 12 guardioes", "aram de aries", "tecnologia viva", "sousa 2.0"],
            "categoryId": "1",
        }
    if "ep02" in low:
        return {
            "title": "O REI DA GLÓRIA E OS 12 GUARDIÕES: EP 02 - GIDION DE TOURO! ⚔️✨ #shorts #guardioes #jesus",
            "description": "No 2º Templo da Cidadela do Firmamento, Gidion de Touro dobra os joelhos diante de Cristo." + LINKS_OFICIAIS,
            "tags": ["o rei da gloria e os 12 guardioes", "gidion de touro", "tecnologia viva", "sousa 2.0"],
            "categoryId": "1",
        }
    if "ep03" in low:
        return {
            "title": "O REI DA GLÓRIA E OS 12 GUARDIÕES: EP 03 - KADOSH & SHALOM! ⚔️✨ #shorts #guardioes #jesus",
            "description": "No 3º Templo da Cidadela do Firmamento, o labirinto de espelhos se rende à paz de Cristo." + LINKS_OFICIAIS,
            "tags": ["o rei da gloria e os 12 guardioes", "kadosh e shalom", "tecnologia viva", "sousa 2.0"],
            "categoryId": "1",
        }
    limpo = nome_arquivo.replace("video_", "").replace("_shorts.mp4", "").replace(".mp4", "").replace("_", " ").upper()
    return {
        "title": f"{limpo[:72]} #shorts #tecnologiaviva #sousa20",
        "description": "Conteúdo automatizado da esteira SOUSA 2.0 sob a Regra 0800." + LINKS_OFICIAIS,
        "tags": ["tecnologia viva", "sousa 2.0", "elias pereira de sousa", "regra 0800"],
        "categoryId": "28",
    }


def renovar_token_google(token_data: Dict[str, object]) -> str:
    payload = urllib.parse.urlencode({
        "client_id": token_data["client_id"],
        "client_secret": token_data["client_secret"],
        "refresh_token": token_data["refresh_token"],
        "grant_type": "refresh_token",
    }).encode("utf-8")
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=payload, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))["access_token"]


def listar_videos_pendentes_drive(access_token: str, historico: Dict[str, object]) -> List[Dict[str, str]]:
    q = urllib.parse.quote("(name contains 'video_guardioes' or name contains 'video_dia') and mimeType='video/mp4' and trashed=false")
    url = f"https://www.googleapis.com/drive/v3/files?q={q}&orderBy=createdTime%20asc&fields=files(id,name,createdTime,size)"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        arquivos = json.loads(resp.read().decode("utf-8")).get("files", [])
    return [f for f in arquivos if f["id"] not in historico.get("youtube_ids", {})]


def baixar_video_drive(access_token: str, file_id: str, destino: Path) -> Path:
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    with urllib.request.urlopen(req, timeout=120) as resp, destino.open("wb") as out:
        while chunk := resp.read(65536):
            out.write(chunk)
    return destino


def upload_youtube_resumable(access_token: str, video_path: Path, meta: Dict[str, object]) -> str:
    body = json.dumps({
        "snippet": {
            "title": str(meta["title"])[:100],
            "description": meta["description"],
            "tags": meta["tags"],
            "categoryId": meta["categoryId"],
        },
        "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False},
    }).encode("utf-8")
    init_req = urllib.request.Request(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        data=body,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Length": str(video_path.stat().st_size),
            "X-Upload-Content-Type": "video/mp4",
        },
        method="POST",
    )
    with urllib.request.urlopen(init_req, timeout=60) as resp:
        upload_url = resp.headers["Location"]

    raw_video = video_path.read_bytes()
    up_req = urllib.request.Request(
        upload_url,
        data=raw_video,
        headers={"Content-Type": "video/mp4", "Content-Length": str(len(raw_video))},
        method="PUT",
    )
    with urllib.request.urlopen(up_req, timeout=300) as resp:
        res = json.loads(resp.read().decode("utf-8"))
    return f"https://youtu.be/{res['id']}"


def notificar_telegram(mensagem: str) -> bool:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    if not bot_token or not chat_id:
        return False
    payload = urllib.parse.urlencode({"chat_id": chat_id, "text": mensagem}).encode("utf-8")
    req = urllib.request.Request(f"https://api.telegram.org/bot{bot_token}/sendMessage", data=payload, method="POST")
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.status == 200


def disparar_meta_reels_se_configurado(video_public_url: str, caption: str) -> Optional[str]:
    ig_id = os.getenv("IG_USER_ID", "").strip()
    meta_token = os.getenv("META_ACCESS_TOKEN", "").strip()
    if not ig_id or not meta_token:
        return None
    payload = urllib.parse.urlencode({
        "media_type": "REELS",
        "video_url": video_public_url,
        "caption": caption,
        "access_token": meta_token,
    }).encode("utf-8")
    req = urllib.request.Request(f"https://graph.facebook.com/v21.0/{ig_id}/media", data=payload, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8")).get("id")


def executar_ciclo(token_path: Path, hist_path: Path, limite: int = 5) -> Dict[str, object]:
    token_data = carregar_json(token_path, {})
    if not token_data and os.getenv("YOUTUBE_REFRESH_TOKEN"):
        token_data = {
            "client_id": os.environ["YOUTUBE_CLIENT_ID"],
            "client_secret": os.environ["YOUTUBE_CLIENT_SECRET"],
            "refresh_token": os.environ["YOUTUBE_REFRESH_TOKEN"],
        }
    if not token_data:
        raise RuntimeError("Credenciais Google não encontradas (token_youtube.json ou variáveis de ambiente).")

    access_token = renovar_token_google(token_data)
    historico = carregar_json(hist_path, {"youtube_ids": {}, "multicanal": {}})
    pendentes = listar_videos_pendentes_drive(access_token, historico)[:limite]

    publicados = []
    tmp_dir = Path("tmp_sousa_upload")
    tmp_dir.mkdir(exist_ok=True)

    for item in pendentes:
        mp4_local = baixar_video_drive(access_token, item["id"], tmp_dir / item["name"])
        meta = montar_metadados(item["name"])
        yt_url = upload_youtube_resumable(access_token, mp4_local, meta)
        sha = hashlib.sha256(mp4_local.read_bytes()).hexdigest()[:16]
        historico["youtube_ids"][item["id"]] = {"name": item["name"], "url": yt_url, "sha256": sha}
        drive_direct = f"https://drive.google.com/uc?export=download&id={item['id']}"
        ig_creation = disparar_meta_reels_se_configurado(drive_direct, f"{meta['title']}\n\n{meta['description']}")
        if ig_creation:
            historico["multicanal"][item["id"]] = {"instagram_container": ig_creation}
        notificar_telegram(f"[SOUSA 2.0 PUBLICADO]\n{meta['title']}\nYouTube: {yt_url}")
        publicados.append({"name": item["name"], "youtube": yt_url, "instagram": ig_creation})
        mp4_local.unlink(missing_ok=True)

    salvar_json(hist_path, historico)
    return {"status": "OK", "publicados": publicados, "pendentes_restantes": max(0, len(pendentes) - len(publicados))}


if __name__ == "__main__":
    t_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("token_youtube.json")
    h_path = Path("sousa_publicados_multicanal.json")
    print(json.dumps(executar_ciclo(t_path, h_path), indent=2, ensure_ascii=False))
