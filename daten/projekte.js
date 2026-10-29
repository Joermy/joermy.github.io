window.PROJEKTE = [
  {
    slug: "muster-fahrradwerkstatt",
    title: "Radhaus Fuhse",
    subtitle: "Musterwebsite mit Kundenbereich für eine Fahrradwerkstatt",
    type: "website",
    year: 2026,
    role: "Konzept, Gestaltung, 3D-Modell, Backend, Umsetzung",
    technologies: ["PHP", "SQLite", "libsodium", "JavaScript", "Blender", "Cycles", "Python"],
    description:
      "Terminbuchung, Reparaturstatus und Kostenvoranschläge mit Online-Freigabe, dazu eine Verwaltung mit Zwei-Faktor-Anmeldung, Rollen und Zugriffsprotokoll. Auf der Startseite zerlegt sich ein fotorealistisch gerendertes E-Bike.",
    overview:
      "Eine Website für eine erfundene Fahrradwerkstatt in Peine, die nicht nur zeigt, sondern arbeitet: Kundinnen und Kunden buchen einen Termin, verfolgen ihre Reparatur über einen persönlichen Link und geben Zusatzarbeiten online frei. Die Werkstatt erledigt alles Übrige in einem eigenen, geschützten Bereich. Die Startseite erzählt eine Reparatur in sieben Kapiteln, an einem E-Bike, das vollständig als 3D-Modell gebaut ist.",
    problem:
      "Sobald eine Website Kundendaten annimmt, wird aus der Visitenkarte ein System mit Pflichten: Die Daten müssen sicher liegen und nach festen Fristen wieder verschwinden, Einwilligungen müssen nachweisbar sein, Aufträge über die Website brauchen Widerrufsbelehrung und Widerrufsbutton. Kleine Betriebe lösen das oft mit drei Fremddiensten, die jeder eigene Cookies, Verträge und Kosten mitbringen.",
    idea:
      "Alles aus einer Hand und ohne Fremdanbieter. Buchung, Status, Freigabe und Verwaltung laufen auf dem eigenen Server, Personendaten liegen verschlüsselt und löschen sich nach Ablauf der Fristen selbst. Die Kundschaft kann ihre Daten jederzeit herunterladen oder löschen, und ohne Klick lädt nichts von fremden Servern.",
    system:
      "PHP 8.3 ohne Framework, SQLite als Datenbank. Name, E-Mail, Telefon und Notizen liegen mit XChaCha20-Poly1305 verschlüsselt in der Datenbank, jedes Feld an seinen Auftrag gebunden; gesucht wird über einen HMAC-Index statt über Klartext. Die Verwaltung meldet mit Argon2id und Zwei-Faktor-Code an, jede Änderung braucht einen CSRF-Token, jeder Zugriff auf einen Auftrag landet im Protokoll. E-Bike und Werkstatt entstehen per Python-Skript in Blender und werden mit Cycles fotorealistisch als Bildfolge gerendert; die Kette ist physikalisch gelegt, 130 Glieder über Kettenblatt, Ritzel und Schaltröllchen.",
    result:
      "84 automatische Tests, PHPStan auf Stufe 8 ohne Fehler, eigener Rechtscheck nach DSGVO, TDDDG, BGB und BFSG ohne offene Befunde, WCAG-Prüfung mit axe ohne Verstöße. Die Vorführfassung läuft auf GitHub Pages; dort spielt ein nachgebauter Server im Browser die Schnittstelle nach, Eingaben bleiben im Tab.",
    github: "https://github.com/Joermy/muster-fahrradwerkstatt",
    website: "https://joermy.github.io/muster-fahrradwerkstatt/",
    heroImage: "bilder/muster-fahrradwerkstatt/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite der Musterwebsite für eine Fahrradwerkstatt: Überschrift Fahrradwerkstatt in Peine, daneben ein vollgefedertes E-Mountainbike mit petrolfarbenem Rahmen und goldener Federgabel im Montageständer einer hellen Werkstatt mit Werkbank und Werkzeugwand",
    galerie: []
  },
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
      "Eine in Blender gebaute Handaufzugsuhr mit echtem Werk: beim Scrollen schraubt sich der Boden ab, die Uhr zerlegt sich, die Kamera fährt bis an die Unruh.",
    overview:
      "Fünf Seiten für eine erfundene Meisterwerkstatt in Peine. Die Startseite erzählt eine Revision in fünf Kapiteln — Öffnen, Reinigen, Prüfen, Ölen, Regulieren. Die Uhr dazu, die Kessler K-1, ist ein vollständiges 3D-Modell mit Gehäuse, Lederband und einem Glashütter Handaufzugswerk.",
    problem:
      "Uhrmacherei ist unsichtbare Arbeit: der Kunde gibt eine Uhr ab und bekommt sie Wochen später zurück. Was dazwischen passiert und warum eine Revision ihren Preis hat, sieht niemand. Eine stilisierte Uhr ohne Werk erzählt davon nichts.",
    idea:
      "Die Arbeit selbst zeigen, an einer Uhr, die echt wirkt. Der Boden wird abgeschraubt, das Werk zerlegt, die Räder liegen nebeneinander auf der Ablage, ein Öler setzt einen Tropfen auf den Lagerstein, und auf der Zeitwaage glättet sich die Gangkurve, während reguliert wird.",
    system:
      "Das Modell entsteht per Python-Skript in Blender: 26 Teile mit rund 195.000 Dreiecken, darunter Dreiviertelplatine, Goldchatons mit gebläuten Schrauben, Ankerrad mit 15 Kolbenzähnen und eine Schraubenunruh mit 18 Regulierschrauben. Glashütter Streifenschliff, Perlage, Sonnenschliff, die Gravur des Unruhklobens und der Zifferblattdruck werden beim Laden im Browser als Texturen erzeugt. Three.js rendert mit Anisotropie, Dünnschicht-Interferenz auf gebläutem Stahl, Schatten, Tiefenschärfe und einem eigenen Lichtzelt. Das Werk läuft mit 28.800 Halbschwingungen pro Stunde, die Spirale atmet mit, die Zeiger zeigen die Ortszeit von Peine. Ein Leistungswächter senkt auf schwachen Geräten Auflösung und Effekte.",
    result:
      "Statischer Erstaufruf rund 100 KB komprimiert, 3D-Modell und Three.js laden danach. Läuft auf Desktop und Telefon, ohne WebGL steht ein gerendertes Standbild. Keine externe Ressource, keine Konsolenfehler, kein Überlauf bei 390 px.",
    github: "https://github.com/Joermy/muster-uhrmacher",
    website: "https://joermy.github.io/muster-uhrmacher/",
    heroImage: "bilder/muster-uhrmacher/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Startseite der Musterwebsite für eine Uhrmacherei: große Überschrift Zeit, in guten Händen, daneben eine 3D-Handaufzugsuhr mit silbernem Zifferblatt, gebläuten Zeigern und braunem Lederband",
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
    subtitle: "Stellen finden, Unterlagen gestalten, erst nach Freigabe senden",
    type: "ai",
    year: 2026,
    role: "Konzept und Umsetzung",
    technologies: ["Python", "Jinja2", "LM Studio", "Ollama", "Claude", "MCP", "Chromium-Druck"],
    description:
      "Ein lokaler Agent, der Stellen aus mehreren Quellen sammelt, Anschreiben mit einem lokalen Modell oder Claude schreibt, Lebenslauf und Bewerbungsmappe gestaltet — und nichts verschickt, bevor ein Mensch wörtlich SENDEN eintippt.",
    overview:
      "Der Bewerbungsagent sucht in der Jobbörse der Arbeitsagentur, bei Adzuna und Jooble und in den eigenen Jobalarmen, filtert nach Profil und Umkreis und schreibt je Stelle ein Anschreiben. Aus einer Lebenslauf-Datei setzt er Lebenslauf, Anschreiben, Deckblatt und Projektseite im selben Design — mit Zeitleiste, Symbolen, Projektbildern und QR-Codes. In der lokalen Oberfläche wird alles geprüft, mit Live-Vorschau bearbeitet und erst dann verschickt.",
    problem:
      "Viele Bewerbungen pro Woche kosten Stunden: Anzeigen auf mehreren Portalen lesen, Adressen suchen, Anschreiben anpassen, den Lebenslauf für Bewerbungsportale lesbar halten, alles nachweisen. Kleine lokale Sprachmodelle helfen dabei nur, wenn man sie eng führt — sonst erfinden sie Abschlüsse und Jahreszahlen. Und ein Automat darf nie etwas an Firmen schicken, das niemand gelesen hat.",
    idea:
      "Der Agent übernimmt die Fleißarbeit, der Mensch die Entscheidung. Für Modelle um 8B gibt es eigene Systemprompts, JSON-Schemas als Grammatik und ein Anschreiben in zwei Schritten: erst Anforderungen und Belege zuordnen, dann schreiben. Ein Faktencheck markiert alles, was weder in Profil, Lebenslauf noch Anzeige steht. Senden gibt es nur in der Oberfläche — auch über den MCP-Server, an den sich Hermes, Claude Code oder Claude Desktop anbinden, lässt sich keine Mail auslösen.",
    system:
      "Python mit Standardbibliothek für Oberfläche und Server. Die Unterlagen sind Jinja2-Vorlagen auf festen A4-Blättern; ein kleines Skript verteilt die Abschnitte auf Seiten, gedruckt wird mit dem Edge oder Chrome, der ohnehin installiert ist. Modelle laufen über LM Studio, Ollama oder jeden OpenAI-kompatiblen Server, alternativ Claude über das eigene Abo oder die API. Dazu ein ATS-Check, ein Portfolio-Import aus der eigenen Website, Lesezeichen zum Übernehmen von Anzeigen und Ausfüllen von Formularen und ein Prompt-Labor mit Tokens pro Sekunde.",
    result:
      "97 automatische Tests, darunter ein Versand an einen lokalen Test-Mailserver und echte PDF-Drucke mit Seitenzählung. Beim Lesen von 27 echten Anzeigen wollten 7 keine Mail-Bewerbung, obwohl eine Adresse im Text stand — genau diese Fälle fängt der Agent ab. Captchas und Bot-Schutz umgeht er bewusst nicht: dafür gibt es das Lesezeichen im eigenen Browser. Die Bilder zeigen eine Vorführung mit erfundenen Daten.",
    github: "https://github.com/Joermy/bewerbungsagent",
    website: "",
    heroImage: "bilder/bewerbungsagent/hero",
    heroBreitePx: 1600,
    heroHoehePx: 1000,
    heroAlt: "Lebenslauf-Editor des Bewerbungsagenten im dunklen Modus: links Abschnitte und der Import aus der Portfolio-Website, rechts die Live-Vorschau eines zweispaltigen Lebenslaufs mit Zeitleiste, Kenntnis-Skalen und Projektkarten mit QR-Codes",
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
      "Statische Mehrseiten-Website mit eigenem Datensystem für Projekte, selbst gehosteten Schriften, einer eigenen WebGL-Szene mit einem in Blender modellierten Chromband, das beim Scrollen in Partikel zerfällt und sich am Ende zum Logo sammelt — kein Baukasten, kein CMS, kein CDN.",
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
    heroAlt: "Startseite dieses Portfolios: fast schwarzer Grund, Überschrift Websites, die etwas auslösen, das letzte Wort in Teal, rechts ein schimmerndes 3D-Chromband",
    galerie: []
  }
];
