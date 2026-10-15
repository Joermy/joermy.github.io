# Portfolio — Joermy

Statische Portfolio-Website. HTML, CSS und JavaScript, kein Framework, kein Build-Schritt.
Bibliotheken sind Three.js für die 3D-Szene und Lenis für weiches Scrollen, beide selbst
gehostet. Im Hintergrund liegt ein in Blender modelliertes Chromband
(`assets/modelle/band.glb`), das beim Scrollen seine Form ändert.

## Auf dem Telefon

Das Band läuft auch auf Touch-Geräten. Im Hochformat sitzt es dort, wo sonst das Standbild
über der Überschrift steht, und wandert beim Scrollen mit. Auflösung und Glühen richten
sich nach dem Gerät, ein Wächter senkt beides, wenn die Bildrate fällt. Die Höhe der
Szene wird über `100lvh` gemessen, damit die Adressleiste beim Scrollen nichts verzieht.
Wischen im Startbild dreht das Band, losgelassen schwingt es aus.

## Starten

Doppelklick auf `Start Website.bat`, oder:

```bash
python scripts/dev-server.py 8090
```

Dann `http://localhost:8090` öffnen.

Öffentlich teilen über ngrok: `Portfolio mit ngrok teilen.bat`. Ausgeliefert wird nur die
Website selbst.

## Eine neue Arbeit hinzufügen

Eintrag in `daten/projekte.js` ergänzen und Bilder unter `bilder/<slug>/` ablegen. Startseite
und Übersicht entstehen aus diesem Datensatz, die Projektseite liegt unter `work/<slug>/`.

## Prüfen

```bash
python scripts/site-audit.py
python scripts/sitemap-bauen.py
```

## Lizenzen

- Schrift Inter: SIL Open Font License 1.1, `assets/fonts/OFL-Inter.txt`
- Three.js: MIT-Lizenz, `assets/js/vendor/LICENSE-three.txt`
- Fotos der Musterseiten: Urheber und Lizenz im Impressum der jeweiligen Seite
