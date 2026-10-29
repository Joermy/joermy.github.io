# Design: Portfolio und Agentic OS

Wie das Portfolio zur Marke des Agentic OS und von FAIG passt, ohne deren Oberfläche zu kopieren.
Stand: 29.10.2026.

## Ausgangslage

Das Portfolio (Commit `fb24f97`) funktioniert: großes Startbild mit Chromband aus Blender,
klare Typografie, ruhige Bewegung, Laufbänder, Kacheln, Projektkarten, Systemstart-Vorhang.
Es passte aber in der Marke nicht zu den eigenen Programmen:

| Element | Portfolio (vorher) | Agentic OS / FAIG |
| --- | --- | --- |
| Logo | bunter Kreis mit Farbverlauf | Sechseck-Rahmen mit gefülltem Kern |
| Akzent | Verlauf Orange, Pink, Violett, Blau | Teal `#06D6A0` |
| Spiegelungen im 3D | Pink, Blau, Orange, Violett | — |
| Grund | Schwarz | fast Schwarz `#08090B` |

## Zwei verworfene Wege

1. **Oberfläche des OS nachbauen** (Commit `ef1257e`): Dashboard mit drei Spalten, Uhr,
   Skills-Deck, Orbit aus Knoten, Titel „JOERMY Portfolio“ im Stil von „JOERMY Agentic OS“.
   Verworfen: eine App-Oberfläche ist keine Portfolio-Seite, und das Original war besser.
2. **Logo als 3D-Körper statt des Bands**: Sechseck aus Chrom mit leuchtendem Kern,
   in Blender gebaut. Verworfen: wirkte billig. Ein extrudiertes Logo als Startbild ist der
   bekannte Fall dafür; das Band ist eine abstrakte Form, und genau die trägt das Original.

## Recherche

Durchgesehen über Suchergebnisse und Fallstudien (die Seiten selbst waren aus der Arbeitsumgebung
nicht erreichbar, die Netzwerkregel blockt sie): Bruno Simon, Lusion (Studio-Seite, Oryzo),
Igloo Inc (Abeto), Rogier de Boevé, Stefan Vitasović, Corentin Bernadou, Arnaud Rocca,
Gianluca Gradogna, Gabriel (Federico Valla), Ronin161, Merouane Bali, Robin Mastromarino,
Keita Yamada, Joseph Santamaria, Kenta Toshikura, Aidan Nelson, Renaud Rohlinger, Tao Tajima,
Guillaume Colombel, Gionatan Nese, Cathy Dolle, Minh Pham, Maximilian Berndt,
Mario Sanchez Maselli, Jean Mazouni, Adrián Gubrica, Artem Shcherban, Etienne Barbedette,
Bruno Arizio, Messenger, Don't Board Me, Opal Tadpole.

Was sich daraus für diese Seite ableitet:

- **Eine Familie teilt Marke, nicht Layout.** Mehrmarken-Systeme halten Aufbau und Komponenten
  gemeinsam und legen die Identität in wenige Werte: Farbe, Logo, Schrift. Jedes Produkt behält
  sein eigenes Layout. Hier also: Logo und Farbe vom OS, Aufbau vom Portfolio.
- **Akzent ist ein Signal.** Eine Akzentfarbe wirkt nur, wenn sie selten ist; überall eingesetzt
  verliert sie ihre Wirkung. Deshalb bleiben die Knöpfe weiß, Teal steht nur in Logo,
  Verlauf, Auswahl und Fokus.
- **Abstrakte Form statt Logo-Körper.** Ein glänzend extrudiertes Logo wirkt als Startbild
  schnell billig, abstrakte Formen mit zurückhaltendem Material wirken hochwertiger.
- **Licht kommt aus der Umgebung.** Hochwertige Szenen beleuchten über eine Umgebungs-Map,
  Glühen bleibt mit hoher Schwelle und geringer Stärke dezent. Das Original macht das schon so;
  geändert werden nur die Farben der Leuchtflächen, die sich im Band spiegeln.
- **Ein Objekt, kein Effekt-Sammelsurium.** „3D um des 3D willen“ schadet; ein starkes Objekt mit
  viel Freiraum trägt.
- **Feine Linien, wenig Deckkraft.** Rahmen und Linien wirken ruhig bei 1 px und geringer Deckkraft;
  ein einziger Markenakzent statt mehrerer Farben, eher dezent als glänzend.

## Umsetzung: Logo, Farben, Klarheit

Grundsatz: Aus dem Agentic OS wird **kein Element und keine Funktion** übernommen. Keine Status-Punkte,
Fensterleisten, Raster, Eck-Leuchten, Uhren oder Panels. Die Funktionen gibt es im OS schon,
das Portfolio braucht sie nicht doppelt. Übernommen wird nur, wie das OS aussieht.

**Logo.** Das Logo ist Hex-Zeichen plus Schriftzug JOERMY in Großbuchstaben, wie im OS. Es steht
gleich in Kopfzeile, Plakette, Favicon und im Startvorhang, der jetzt das Hex-Zeichen Kante für Kante
zeichnet statt des alten Kristalls.

**Farben.** Die Palette des OS, Werte in `assets/css/basis.css`:

| Rolle | vorher | jetzt |
| --- | --- | --- |
| Grund `--bg` | `#000000` | `#08090B` |
| Fläche `--surface` | `#0B0B0D` | `#0E1013` |
| Fläche 2 `--surface-2` | `#141417` | `#13161A` |
| Linie `--border` | Weiß 9 % | Weiß 7,5 % |
| Text `--text` | `#F5F5F7` | `#E8EAEE` |
| Text leise `--muted` | `#A1A1A6` | `#9A9DA4` |
| Beschriftung `--leise` | `#6E6E73` | `#7B7E85` |
| Akzent `--accent` | Pink `#FF4F7B` | Teal `#06D6A0` |
| Verlauf `--spektrum` | Orange bis Blau | Teal, fast einfarbig |
| Spiegelungen im Band | Pink, Blau, Orange, Violett | Teal, Blau, Weiß, Bernstein |

Teal ist der einzige Akzent und bleibt selten: Logo, das Wort „auslösen.“, Zahlen, Unterstreichung
der Navigation, Auswahl und Fokus. Knöpfe bleiben hell, nicht teal.

**Klarheit.** Das Layout bleibt, es wird ruhiger:

- Überschriften einfarbig statt Weiß-Grau-Verlauf
- Karten, Kacheln, Plakette und Kennzahlen als flache Flächen mit feiner Linie statt Verlauf und Milchglas
- farbiges Glühen stark zurückgenommen: Lichtflecken im Startbild, in den Kacheln, im Abschluss
  und bei Bildrahmen; was bleibt, ist leise und einheitlich Teal
- Rundungen einheitlich: 16 px für Flächen, 10 px für Knöpfe; Knöpfe als klare Rechtecke statt Pillen,
  Filter und Plakette bleiben Pillen
- die 3D-Szene mischt sich per `mix-blend-mode: screen` in den fast schwarzen Grund

Was bleibt: Layout, Texte, Schrift, Chromband und sein Verhalten, Haltung, Laufbänder, Kacheln,
Karten, Zeiger, Klang, alle Unterseiten.

## 3D und Blender

Das Band (`assets/modelle/band.glb`) bleibt das Modell. Blender rendert per Skript das Standbild,
das ohne WebGL und auf dem Telefon als Anker an seiner Stelle steht:

```bash
python scripts/standbild-rendern.py
```

Das Skript braucht Blender als Python-Modul (`pip install bpy`, Python 3.11) und beleuchtet das
Band mit denselben Leuchtflächen wie `assets/js/hintergrund.js`.

Blender MCP lief hier nicht: Es braucht ein laufendes Blender mit Oberfläche und einen
MCP-Server, der beim Start der Sitzung angemeldet ist. Blender selbst war von der Netzwerkregel
blockiert; über PyPI ging Blender 5.0 als Python-Modul, mit derselben Python-Schnittstelle,
die auch Blender MCP benutzt.

## Sicherung

Die alte Seite liegt unverändert auf `main` (Commit `fb24f97`).
