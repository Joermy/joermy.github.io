#!/usr/bin/env python3
"""Wandelt ein Quellvideo in einen webtauglichen Endlos-Loop um."""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
MEDIEN = WURZEL / "medien"

VARIANTEN = [
    {"kante": 1280, "crf": 30},
    {"kante": 640, "crf": 32},
]

def ffmpeg_vorhanden() -> bool:
    return shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None

def lauf(befehl: list[str]) -> None:
    ergebnis = subprocess.run(befehl, capture_output=True, text=True)
    if ergebnis.returncode != 0:
        letzte_zeile = ergebnis.stderr.strip().splitlines()[-1:] or ["unbekannter Fehler"]
        raise SystemExit(f"ffmpeg fehlgeschlagen: {letzte_zeile[0]}")

def umwandeln(quelle: Path, zielname: str, start: float, dauer: float) -> list[Path]:
    if not quelle.is_file():
        raise SystemExit(f"Quelle nicht gefunden: {quelle}")

    ziel_ordner = MEDIEN / zielname
    ziel_ordner.mkdir(parents=True, exist_ok=True)
    geschrieben: list[Path] = []

    for variante in VARIANTEN:
        kante = variante["kante"]
        ziel = ziel_ordner / f"loop-{kante}.mp4"
        lauf([
            "ffmpeg", "-loglevel", "error", "-y",
            "-ss", str(start), "-t", str(dauer), "-i", str(quelle),
            "-vf", f"scale={kante}:-2:flags=lanczos",
            "-an",
            "-c:v", "libx264", "-preset", "slow", "-crf", str(variante["crf"]),
            "-profile:v", "main", "-pix_fmt", "yuv420p",
            "-g", "24", "-keyint_min", "24",
            "-movflags", "+faststart",
            str(ziel),
        ])
        geschrieben.append(ziel)

    poster = ziel_ordner / "poster.webp"
    lauf([
        "ffmpeg", "-loglevel", "error", "-y",
        "-ss", str(start), "-i", str(quelle), "-frames:v", "1",
        "-vf", "scale=1280:-2:flags=lanczos",
        "-quality", "72",
        str(poster),
    ])
    geschrieben.append(poster)

    return geschrieben

def kb(pfad: Path) -> str:
    return f"{pfad.stat().st_size / 1024:.0f} KB"

def main() -> None:
    zerleger = argparse.ArgumentParser(description=__doc__)
    zerleger.add_argument("quelle", nargs="?", help="Pfad zur Quelldatei")
    zerleger.add_argument("zielname", nargs="?", help="Ordnername unter medien/")
    zerleger.add_argument("--start", type=float, default=0.0, help="Sekunde, ab der geschnitten wird")
    zerleger.add_argument("--dauer", type=float, default=5.0, help="Laenge des Loops in Sekunden")
    zerleger.add_argument("--liste", help="Textdatei: je Zeile 'quelle|zielname|start|dauer'")
    argumente = zerleger.parse_args()

    if not ffmpeg_vorhanden():
        raise SystemExit("ffmpeg und ffprobe muessen auf dem PATH liegen.")

    auftraege: list[tuple[Path, str, float, float]] = []

    if argumente.liste:
        for zeile in Path(argumente.liste).read_text(encoding="utf-8").splitlines():
            zeile = zeile.strip()
            if not zeile or zeile.startswith("#"):
                continue
            teile = [t.strip() for t in zeile.split("|")]
            auftraege.append((
                Path(teile[0]),
                teile[1],
                float(teile[2]) if len(teile) > 2 and teile[2] else 0.0,
                float(teile[3]) if len(teile) > 3 and teile[3] else 5.0,
            ))
    elif argumente.quelle and argumente.zielname:
        auftraege.append((Path(argumente.quelle), argumente.zielname, argumente.start, argumente.dauer))
    else:
        zerleger.print_help()
        sys.exit(1)

    gesamt = 0
    for quelle, zielname, start, dauer in auftraege:
        for datei in umwandeln(quelle, zielname, start, dauer):
            gesamt += datei.stat().st_size
            print(f"{datei.relative_to(WURZEL)}  {kb(datei)}")

    print(f"\nGesamt: {gesamt / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    main()
