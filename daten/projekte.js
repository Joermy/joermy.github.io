window.PROJEKTE = [
  {
    slug: "faig-ai-agent",
    title: "FAIG",
    subtitle: "Freier KI-Agent als Desktop-App",
    type: "ai",
    year: 2026,
    role: "Konzept und Umsetzung",
    technologies: ["Electron", "Node.js", "JavaScript", "llama.cpp", "GGUF"],
    description:
      "Ein KI-Agent, der Sprachmodelle lokal auf der eigenen Grafikkarte betreibt — als eigenständige Desktop-App, nicht als Website-Widget.",
    overview:
      "FAIG, kurz für Free AI Agent, ist eine Electron-App, die einen KI-Agenten auf dem eigenen Rechner betreibt. Das Sprachmodell liegt als GGUF-Datei auf der Platte und wird über llama.cpp geladen. Die App kann im Netz suchen, mit Werkzeugen arbeiten und liest einen eigenen Wissensspeicher.",
    problem:
      "Die meisten KI-Werkzeuge sind an einen Anbieter gebunden, brauchen einen Schlüssel und laufen im Browser. Wer an lokalen Projekten arbeitet, gibt damit bei jeder Anfrage Dateiinhalte aus der Hand — und zahlt pro Aufruf.",
    idea:
      "Eine Desktop-App, in der das Modell selbst auf dem Rechner liegt. Austauschbar über einen Modellordner, ohne Schlüssel, ohne laufende Kosten, ohne Verbindung nach außen, solange keine Websuche angestoßen wird.",
    system:
      "Electron als Anwendungsrahmen, llama.cpp für die Modellausführung, lokale Datenhaltung für Chats und Projektordner. Der Denkaufwand ist je Anfrage einstellbar, Werkzeuge wie die Websuche werden einzeln zugeschaltet. Ein angehefteter Wissensspeicher steht allen Chats zur Verfügung.",
    result:
      "Läuft täglich im eigenen Betrieb. Jeder Lauf zeigt Dauer und Geschwindigkeit an, damit sich Modelle und Einstellungen vergleichen lassen.",
    github: "https://github.com/Joermy/faig",
    website: "",
    heroImage: "bilder/faig-ai-agent/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Anwendungsfenster von FAIG: Antwort des lokal geladenen Modells qwen2.5-coder-14b im Chat, darunter Dauer und Geschwindigkeit, links die Seitenleiste mit angeheftetem Wissensspeicher",
    galerie: []
  },
  {
    slug: "muster-uhrmacher",
    title: "Atelier Kessler",
    subtitle: "Musterwebsite für eine Uhrmacherei",
    type: "website",
    year: 2026,
    role: "Konzept, Gestaltung, 3D-Modell, Umsetzung",
    technologies: ["HTML", "CSS", "JavaScript", "Three.js", "Blender", "Python"],
    description:
      "Dunkle Produktseite im Stil von Apple: eine in Blender gebaute Uhr zerlegt sich beim Scrollen in ihre Einzelteile und setzt sich wieder zusammen.",
    overview:
      "Fünf Seiten für eine erfundene Meisterwerkstatt in Peine. Die Startseite erzählt eine Revision in fünf Kapiteln — Öffnen, Reinigen, Prüfen, Ölen, Regulieren — und die Uhr dahinter zeigt jeden Schritt als Explosionsansicht.",
    problem:
      "Uhrmacherei ist unsichtbare Arbeit: der Kunde gibt eine Uhr ab und bekommt sie Wochen später zurück. Was dazwischen passiert und warum eine Revision ihren Preis hat, sieht niemand.",
    idea:
      "Die Arbeit selbst zeigen. Statt Fotos vom Ladengeschäft nimmt die Seite die Uhr beim Scrollen auseinander, Teil für Teil, und erklärt dabei, was an der Werkbank geschieht.",
    system:
      "Das Modell ist in Blender aus 19 benannten Teilen gebaut und als GLB exportiert. Three.js verschiebt die Teile entlang der Uhrachse je nach Scrollstand, die Zeiger folgen der echten Uhrzeit, Räder und Unruh laufen. Ohne WebGL steht ein in Blender gerendertes Standbild. Schrift Geist, Akzent in Blaustahl.",
    result:
      "Statischer Erstaufruf 149 KB, Three.js und Modell kommen danach. Keine externe Ressource, keine Konsolenfehler, kein Überlauf bei 390 px. Kontraste gerechnet: 7,5:1 für Nebentext.",
    github: "https://github.com/Joermy/muster-uhrmacher",
    website: "https://joermy.github.io/muster-uhrmacher/",
    heroImage: "bilder/muster-uhrmacher/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite der Musterwebsite für eine Uhrmacherei: schwarzer Grund, große Überschrift Zeit, in guten Händen, darunter eine 3D-Uhr mit blauen Zeigern",
    galerie: []
  },
  {
    slug: "rift-rush",
    title: "Rift Rush",
    subtitle: "Roblox-Spiel mit Pets, Rennen und Raids",
    type: "game",
    year: 2026,
    role: "Konzept, Programmierung, 3D-Modelle, Umsetzung",
    technologies: ["Luau", "Roblox Studio", "Rojo", "Blender", "Python"],
    description:
      "Ein veröffentlichtes Roblox-Spiel: im Takt trainieren, Pets aus Eiern schlüpfen lassen, eine 60-Kilometer-Strecke fahren. Server-Logik, Speicherstand, Welt und Figuren sind selbst umgesetzt.",
    overview:
      "Rift Rush ist ein Speed-Simulator. Man trainiert auf Laufbändern im Rhythmus, steigert sich über Rebirths und Ascensions, lässt Pets aus Eiern schlüpfen und fährt mit sechs Fahrzeugen eine 60-Kilometer-Strecke. Dazu kommen Raids gegen einen Boss, Runen, Expeditionen und ein wechselndes Rift-Wetter. Sechs Inseln bilden die Welt.",
    problem:
      "Speed-Simulatoren leben von Fortschritt, der sich gut anfühlt, und von Glück, das schnell ins Unfaire kippt. Auf Roblox ist Glücksspiel mit Einsatz verboten, auch mit Spielgegenständen. Ein Spiel muss also spannend bleiben, ohne dass Spieler etwas riskieren, das sie schon haben.",
    idea:
      "Das bekannte Gerüst, darauf eigene Systeme: Training im Takt, bei dem ein perfekter Schritt doppelten Speed gibt, Pets mit Rollen und Ausrüstung, eine lange Rennstrecke mit Pokal-Toren. Glück kostet nie etwas, das man schon besitzt, und alle Quoten stehen im Spiel.",
    system:
      "Geschrieben in Luau: 99 Module mit rund 18.900 Zeilen, gezählt am 04.10.2026. Leitregel ist, dass der Server alles entscheidet und der Client nur Absichten schickt. Pets, Eier, Zonen und Stationen stehen als Datentabellen, nicht im Code. Der Quelltext liegt über Rojo in Git, ein Python-Skript baut die Welt jederzeit neu in den Place. Pets, Fahrzeuge und Inseln entstehen in Blender aus einem eigenen Baukasten, ebenso Symbol und Titelbilder. Die Titelbilder sind Cycles-Renderings mit Randlichtern, Spiegelboden und Tiefenunschärfe, danach folgt eine Nachbearbeitung mit Glühen, Vignette und Farbkorrektur in Python.",
    result:
      "Veröffentlicht seit dem 27.09.2026. Offline-Tests und eine Balance-Simulation rechnen den Fortschritt durch, bevor sich Zahlen im Spiel ändern; die Simulation hat ein zu langsames Ascension-Tempo aufgedeckt, das daraufhin korrigiert wurde. Eine Spielerschaft gibt es noch nicht, das Projekt zeigt die Technik.",
    github: "",
    website: "https://www.roblox.com/games/80050994256081",
    heroImage: "bilder/rift-rush/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Fünf glänzende, würfelförmige Pets in Weiß, Dunkelviolett, Schwarz, Gold und Hellblau stehen auf bunten Sockeln vor einem violetten Hintergrund mit Lichtstrahlen und spiegeln sich im Boden",
    galerie: []
  },
  {
    slug: "bewerbungsagent",
    title: "Bewerbungsagent",
    subtitle: "Stellen finden, Anschreiben schreiben, erst nach Freigabe senden",
    type: "ai",
    year: 2026,
    role: "Konzept und Umsetzung",
    technologies: ["Python", "MCP", "Claude", "LM Studio", "fpdf2", "SMTP"],
    description:
      "Ein lokaler Agent, der Ausbildungs- und Stellenangebote der Arbeitsagentur durchsucht, passende Anschreiben als PDF erzeugt und nichts verschickt, bevor ein Mensch wörtlich SENDEN eintippt.",
    overview:
      "Der Bewerbungsagent liest die öffentliche Jobsuche der Bundesagentur für Arbeit, filtert nach Profil, Umkreis und gefordertem Schulabschluss, bewertet die Passung und schreibt je Stelle ein einseitiges Anschreiben. Eine lokale Oberfläche zeigt alle Entwürfe mit PDF-Vorschau; von dort gehen die Bewerbungen per E-Mail raus, dazu ein Bewerbungsnachweis als PDF.",
    problem:
      "Viele Bewerbungen pro Woche kosten Stunden: Anzeigen lesen, Adressen suchen, Anschreiben anpassen, alles nachweisen. Gleichzeitig darf ein Automat nie etwas an Firmen schicken, das niemand gelesen hat — und eine Adresse im Anzeigentext heißt noch lange nicht, dass dort Bewerbungen erwünscht sind.",
    idea:
      "Der Agent übernimmt die Fleißarbeit, der Mensch die Entscheidung. Er darf suchen, lesen und schreiben, aber nicht senden. Senden gibt es nur in der Oberfläche und nur nach getipptem Bestätigungswort — auch über den MCP-Server, an den sich Claude oder andere Agenten anbinden, lässt sich keine Mail auslösen.",
    system:
      "Python mit Standardbibliothek für Oberfläche und Server, fpdf2 für die PDFs nach DIN 5008, SMTP für den Versand. Die Texte schreibt wahlweise ein lokales Modell über LM Studio oder Claude über MCP. Ein eigener Prüfschritt erkennt aus dem Anzeigentext, ob eine Adresse nur für Rückfragen dasteht oder ein Bewerbungsportal verlangt wird. Jede Stelle landet als Notiz im Obsidian-Wissensspeicher.",
    result:
      "61 automatische Tests, darunter ein Versand an einen lokalen Test-Mailserver. Beim Lesen von 27 echten Anzeigen wollten 7 keine Mail-Bewerbung, obwohl eine Adresse im Text stand — genau diese Fälle fängt der Agent jetzt ab. Die Bilder zeigen eine Vorführung mit erfundenen Daten.",
    github: "https://github.com/Joermy/bewerbungsagent",
    website: "",
    heroImage: "bilder/bewerbungsagent/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Oberfläche des Bewerbungsagenten im dunklen Modus: Liste von sieben Ausbildungsstellen mit Passungswerten, Status Entwurf oder gesendet, unten die Leiste zum Freigeben und Senden",
    galerie: []
  },
  {
    slug: "muster-kosmetik",
    title: "Studio Leyla",
    subtitle: "Musterwebsite für ein Kosmetikstudio",
    type: "website",
    year: 2026,
    role: "Konzept, Gestaltung, Umsetzung",
    technologies: ["HTML", "CSS", "JavaScript", "Python"],
    description:
      "Helles Layout mit lebenden Farbverläufen, Glasflächen und einer Auswahlhilfe, die vollständig im Browser läuft.",
    overview:
      "Sieben Seiten für ein kleines Studio. Die Farbe liegt hinter dem Text: vier weichgezeichnete Verlaufsflächen treiben langsam hinter der Seite, der Text bleibt fast schwarz.",
    problem:
      "Kosmetik ist ein Feld mit strengen Werberegeln. Wirkversprechen, Vorher-Nachher-Bilder und erfundene Ergebnisse sind heikel — die Seite muss ohne sie auskommen und trotzdem verkaufen.",
    idea:
      "Statt eines Buchungssystems eine Auswahlhilfe: drei Fragen filtern die Behandlungsliste. Nichts wird gesendet, nichts gespeichert, kein Auftragsverarbeiter nötig.",
    system:
      "Glasflächen über backdrop-filter, Aufdeckung über Unschärfe statt über Verschiebung, Überschriften Wort für Wort. Eine Maske öffnet sich beim Scrollen über clip-path, gesteuert durch eine einzige Zahl.",
    result:
      "Erster Seitenaufruf 145 KB — die leichteste der drei. Kontraste auf dem farbigen Grund nachgemessen, nicht geschätzt: 5,9:1 im schlechtesten Fall.",
    github: "https://github.com/Joermy/muster-kosmetik",
    website: "https://joermy.github.io/muster-kosmetik/",
    heroImage: "bilder/muster-kosmetik/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite der Musterwebsite für ein Kosmetikstudio, heller Farbverlauf in Rosa und Violett mit großer Überschrift",
    galerie: []
  },
  {
    slug: "muster-roesterei",
    title: "Röstwerk Nord",
    subtitle: "Musterwebsite für eine Kaffeerösterei",
    type: "website",
    year: 2026,
    role: "Konzept, Gestaltung, Umsetzung",
    technologies: ["HTML", "CSS", "JavaScript", "SVG", "Python"],
    description:
      "Dunkles Magazinlayout mit waagerechter Scrollstrecke, Röstkurve als SVG und Duplex-Bildern.",
    overview:
      "Sieben Seiten für eine kleine Rösterei. Redaktioneller Aufbau: klebende Kapitelmarken, asymmetrisches Raster, Serifenschrift in Anzeigengröße.",
    problem:
      "Gastronomie-Seiten sehen einander ähnlich, weil sie alle denselben Baukasten benutzen. Eine eigene Handschrift entsteht erst, wenn Raster, Schrift und Bewegung zusammen etwas erzählen.",
    idea:
      "Der Weg der Bohne als waagerechte Strecke: gescrollt wird senkrecht, bewegt wird waagerecht. Dazu eine Röstkurve, die sich beim Scrollen selbst zeichnet.",
    system:
      "Duplex-Bilder über mix-blend-mode, Körnung als data-URI gegen Streifenbildung auf dunklen Flächen, Laufband aus zwei identischen Spuren. Alle Scrollbindungen rechnen im Scroll-Ereignis, nicht in requestAnimationFrame.",
    result:
      "Erster Seitenaufruf 291 KB. Die Strecke läuft linear über den gesamten verfügbaren Weg, gemessen über acht Stufen.",
    github: "https://github.com/Joermy/muster-roesterei",
    website: "https://joermy.github.io/muster-roesterei/",
    heroImage: "bilder/muster-roesterei/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite der Musterwebsite für eine Rösterei, fast schwarzes Layout mit großer Serifenschrift in Orange",
    galerie: []
  },
  {
    slug: "muster-tischlerei",
    title: "Tischlerei Hallmann",
    subtitle: "Musterwebsite für einen Handwerksbetrieb",
    type: "website",
    year: 2026,
    role: "Konzept, Gestaltung, Umsetzung",
    technologies: ["HTML", "CSS", "JavaScript", "Python"],
    description:
      "Sieben Seiten für einen Tischlerbetrieb: scrollgebundene Bildfolge, strenges Raster, null externe Ressourcen.",
    overview:
      "Eine vollständige Unternehmenswebsite als Arbeitsprobe. Der Betrieb ist erfunden, die Umsetzung nicht: sieben Seiten, 27 Fotos, Impressum und Datenschutzerklärung nach deutschem Recht.",
    problem:
      "Handwerksbetriebe brauchen keine Animation um ihrer selbst willen. Sie brauchen eine Seite, die Arbeit zeigt, schnell lädt und rechtlich sauber ist.",
    idea:
      "Ein Leitmotiv statt vieler Effekte: die Scrollposition wählt das Einzelbild einer siebenteiligen Fotofolge — Aufmaß, Holz, Zuschnitt, Abbund, Schliff, Montage, Übergabe.",
    system:
      "Kein Framework, kein Build-Schritt. Inhalte liegen in einer Datendatei, die Unterseiten erzeugt ein Python-Skript aus gemeinsamen Vorlagen. Bilder werden lokal zugeschnitten und als WebP in mehreren Breiten abgelegt.",
    result:
      "Erster Seitenaufruf 223 KB. 187 interne Links, keiner davon tot. Null Anfragen an fremde Server — maschinell geprüft.",
    github: "https://github.com/Joermy/muster-tischlerei",
    website: "https://joermy.github.io/muster-tischlerei/",
    heroImage: "bilder/muster-tischlerei/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite der Musterwebsite für eine Tischlerei, helles Layout mit großer Überschrift und Werkstattfoto",
    galerie: []
  },
  {
    slug: "comfyui-autoprompter",
    title: "AutoPrompter",
    subtitle: "ComfyUI-Node mit lokalem Sprachmodell",
    type: "ai",
    year: 2026,
    role: "Konzept und Umsetzung",
    technologies: ["Python", "ComfyUI", "llama.cpp", "GGUF", "JavaScript"],
    description:
      "Ein eigener ComfyUI-Node, der Bild- und Video-Prompts mit einem lokal geladenen GGUF-Modell schreibt — ohne API und ohne Netz.",
    overview:
      "Der Node lädt ein GGUF-Sprachmodell über llama.cpp direkt in ComfyUI und erzeugt daraus vollständige Prompts. Er bringt eine eigene Oberfläche im ComfyUI-Frontend mit.",
    problem:
      "Gute Prompts von Hand zu schreiben kostet bei Stapelläufen die meiste Zeit. Fertige Dienste dafür brauchen einen Schlüssel, eine Verbindung und geben Daten aus der Hand.",
    idea:
      "Das Sprachmodell dorthin holen, wo der Bildgenerator ohnehin läuft. Ein Node, ein Modellordner, kein zweiter Dienst.",
    system:
      "738 Zeilen Python. Das geladene Modell bleibt zwischen Warteschlangen-Läufen im Speicher, sonst lädt Auto Queue es vor jedem Bild neu von der Platte. Ein eigener Modellordner (models/llm_gguf) wird beim Start registriert, eine neue Datei dort genügt. Ein Filter entfernt die Gedankengänge, die manche Feinabstimmungen trotz Anweisung ausgeben.",
    result:
      "Läuft täglich im eigenen Betrieb und liefert die Prompts für die H3-Pipeline.",
    github: "https://github.com/Joermy",
    website: "",
    heroImage: "",
    heroAlt: "",
    galerie: [],
    codeOutput:
      "# Modell bleibt zwischen Laeufen im Speicher\n_MODEL_CACHE = {}\n\ndef _get_llm(model_path, n_gpu_layers=99, n_ctx=4096):\n    key = (model_path, n_gpu_layers, n_ctx)\n    if key not in _MODEL_CACHE:\n        from llama_cpp import Llama\n        _MODEL_CACHE.clear()\n        gc.collect()\n        _MODEL_CACHE[key] = Llama(\n            model_path=model_path,\n            n_gpu_layers=n_gpu_layers,\n            n_ctx=n_ctx,\n            verbose=False,\n        )\n    return _MODEL_CACHE[key]"
  },
  {
    slug: "site-audit",
    title: "site-audit",
    subtitle: "Prüfwerkzeug für Websites",
    type: "software",
    year: 2026,
    role: "Konzept und Umsetzung",
    technologies: ["Python", "httpx", "BeautifulSoup", "pytest"],
    description:
      "Ein Kommandozeilenwerkzeug, das die Startseite einer Website auf Technik- und Pflichtmängel prüft und einen Bericht schreibt. Jeder Befund hat Messwert und Fundstelle.",
    overview:
      "site-audit ruft eine Seite ab und führt 25 Prüfungen aus: Zertifikat und Weiterleitung, Impressum und Datenschutzerklärung, Verbindungen zu fremden Domains, Alternativtexte, Überschriften, Kontrast, Gewicht und Sicherheits-Header. Der Bericht kommt als Konsolenansicht, Markdown, HTML oder JSON.",
    problem:
      "Eine Website im Browser Punkt für Punkt auf Mängel zu prüfen, dauert pro Betrieb etwa eine halbe Stunde. Was dabei übersehen wird, bemerkt später der Kunde oder ein Dritter.",
    idea:
      "Jeder Befund trägt einen Messwert und eine Fundstelle, und was nur geschätzt ist, steht als Schätzung im Bericht. Das Werkzeug verhält sich wie ein höflicher Besucher: Es liest die robots.txt, fragt höchstens einmal pro Sekunde und lädt fremde Ressourcen nicht nach.",
    system:
      "Python mit httpx, BeautifulSoup und lxml. Jede Prüfung ist eine Funktion mit Dekorator und meldet sich selbst an. Wirft sie einen Fehler, wird daraus ein Befund „nicht bestimmbar“ und der Lauf geht weiter. Ein kleiner CSS-Leser rechnet Kontraste, die Netzschicht ist austauschbar, damit die Tests ohne Netz laufen.",
    result:
      "96 automatische Tests ohne Netzwerkzugriff. Zwei Testseiten halten das Verhalten fest: Die gute löst keinen Befund aus, die kaputte genau die 16 erwarteten. Der erste Lauf gegen das eigene Portfolio zeigte zwei Fehlalarme bei Kontrast und Überlauf; beide Prüfungen sind danach enger gefasst worden.",
    github: "https://github.com/Joermy/site-audit",
    website: "",
    heroImage: "bilder/site-audit/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Prüfbericht von site-audit im dunklen Modus: Zusammenfassung mit Zahlen je Schweregrad, darunter Befunde mit Messwert und Fundstelle",
    galerie: []
  },
  {
    slug: "portfolio-website",
    title: "Dieses Portfolio",
    subtitle: "Statische Website, selbst umgesetzt",
    type: "website",
    year: 2026,
    role: "Konzept, Design, Umsetzung",
    technologies: ["HTML", "CSS", "JavaScript", "Three.js (selbst gehostet)", "Python"],
    description:
      "Diese Website selbst: reines HTML, CSS und JavaScript, ohne Framework und ohne Build-Schritt, mit einer eigenen 3D-Szene im Hero.",
    overview:
      "Statische Mehrseiten-Website mit eigenem Datensystem für Projekte, selbst gehosteten Schriften, einer eigenen WebGL-Szene mit einem in Blender modellierten Chromband, das beim Scrollen seine Form ändert — kein Baukasten, kein CMS, kein CDN.",
    problem:
      "Ein Portfolio sollte beweisen, was es behauptet: dass echter Code dahintersteckt, nicht ein Vorlagen-Baukasten.",
    idea:
      "Jede Seite ist reines HTML, jede Projektseite entsteht aus einem zentralen Datensatz statt aus Copy-Paste-Markup. Das Bewegtbild kommt aus der eigenen Pipeline, nicht aus einer Stockbibliothek.",
    system:
      "Fünf CSS-Dateien nach Zuständigkeit getrennt, sechs JavaScript-Module, ein zentrales Datenfile pro Sammlung. scripts/site-audit.py prüft vor jedem Deploy Gewicht, Alt-Texte und interne Links.",
    result:
      "Diese Seite, live und in Arbeit.",
    github: "https://github.com/Joermy/joermy.github.io",
    website: "https://joermy.github.io/",
    heroImage: "bilder/portfolio-website/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite dieses Portfolios: schwarzer Grund, Überschrift Websites, die etwas auslösen, rechts ein schimmerndes 3D-Chromband",
    galerie: []
  }
];
