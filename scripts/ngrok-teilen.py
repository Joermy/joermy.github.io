#!/usr/bin/env python3
import http.server
import json
import os
import shutil
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GESPERRTE_ORDNER = {"scripts", "__pycache__", "node_modules"}
GESPERRTE_ENDUNGEN = {".md", ".bat", ".py", ".pyc", ".bak", ".vorlage", ".ps1", ".log"}


class OeffentlicherHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WURZEL, **kwargs)

    def gesperrt(self):
        pfad = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)
        teile = [t for t in pfad.split("/") if t]
        if any(t.startswith(".") for t in teile):
            return True
        if teile and teile[0] in GESPERRTE_ORDNER:
            return True
        if teile and os.path.splitext(teile[-1])[1].lower() in GESPERRTE_ENDUNGEN:
            return True
        return False

    def send_head(self):
        if self.gesperrt():
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Robots-Tag", "noindex")
        super().end_headers()

    def log_message(self, format, *args):
        pass


def tunnel_adresse(frist=25.0):
    ende = time.monotonic() + frist
    while time.monotonic() < ende:
        try:
            with urllib.request.urlopen("http://127.0.0.1:4040/api/tunnels", timeout=1) as antwort:
                daten = json.load(antwort)
            for t in daten.get("tunnels", []):
                if t.get("public_url", "").startswith("https://"):
                    return t["public_url"]
        except Exception:
            pass
        time.sleep(0.5)
    return None


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8089

    ngrok = shutil.which("ngrok")
    if not ngrok:
        print("  FEHLER: ngrok nicht gefunden.")
        return 1

    try:
        server = http.server.ThreadingHTTPServer(("127.0.0.1", port), OeffentlicherHandler)
    except OSError:
        print(f"  FEHLER: Port {port} ist belegt. Laeuft das Teilen schon in einem anderen Fenster?")
        return 1
    threading.Thread(target=server.serve_forever, daemon=True).start()

    prozess = subprocess.Popen(
        [ngrok, "http", str(port), "--log", "stdout", "--log-level", "warn"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    zeilen = []
    threading.Thread(target=lambda: zeilen.extend(prozess.stdout), daemon=True).start()

    adresse = tunnel_adresse()
    if not adresse:
        if prozess.poll() is None:
            prozess.terminate()
        time.sleep(0.5)
        ausgabe = "".join(zeilen)
        server.shutdown()
        print("  FEHLER: ngrok hat keinen Tunnel geoeffnet.")
        if "authtoken" in ausgabe.lower() or "4018" in ausgabe:
            print("  Es fehlt der Authtoken. Einmalig ausfuehren:")
            print("    ngrok config add-authtoken DEIN_TOKEN")
            print("  Den Token gibt es nach der kostenlosen Anmeldung unter dashboard.ngrok.com.")
        elif ausgabe.strip():
            print("  Ausgabe von ngrok:")
            print("  " + ausgabe.strip()[-800:].replace("\n", "\n  "))
        return 1

    try:
        subprocess.run("clip", input=adresse, text=True, shell=True, check=False)
        kopiert = " (in der Zwischenablage)"
    except Exception:
        kopiert = ""

    print()
    print("  Portfolio ist oeffentlich erreichbar:")
    print()
    print(f"    {adresse}{kopiert}")
    print()
    print(f"  Lokal:      http://localhost:{port}/")
    print("  Uebersicht: http://127.0.0.1:4040/  (Zugriffe live)")
    print()
    print("  Jeder mit dem Link sieht die Seite. Zum Beenden: Strg+C oder Fenster schliessen.")
    print()
    webbrowser.open(adresse)

    try:
        while prozess.poll() is None:
            time.sleep(0.5)
        print("  ngrok wurde beendet.")
    except KeyboardInterrupt:
        pass
    finally:
        if prozess.poll() is None:
            prozess.terminate()
        server.shutdown()
    return 0


if __name__ == "__main__":
    sys.exit(main())
