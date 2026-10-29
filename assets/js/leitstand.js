(() => {
  "use strict";

  const projekte = Array.isArray(window.PROJEKTE) ? window.PROJEKTE : [];
  const orbit = document.getElementById("orbit");
  if (!orbit || !projekte.length) return;

  const basis = orbit.dataset.basis || ".";
  const SVG_NS = "http://www.w3.org/2000/svg";

  const symbol = (pfad) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pfad}</svg>`;

  const SYMBOL = {
    website: symbol('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>'),
    ai: symbol('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>'),
    software: symbol('<path d="M4 17l6-5-6-5M12 19h8"/>'),
    game: symbol('<path d="M8 5l11 7-11 7z"/>'),
    design: symbol('<path d="M12 3l9 9-9 9-9-9z"/>'),
    werkzeug: symbol('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    pfeil: symbol('<path d="M7 17L17 7M17 7H9M17 7V15"/>'),
  };

  const TYP = {
    website: { label: "Websites", einzel: "Website", farbe: "#4cb6e3" },
    ai: { label: "KI", einzel: "KI-Werkzeug", farbe: "#06d6a0" },
    software: { label: "Software", einzel: "Software", farbe: "#f2448f" },
    game: { label: "Spiele", einzel: "Spiel", farbe: "#a274f2" },
    design: { label: "Design", einzel: "Design", farbe: "#f0b45a" },
  };
  const REIHENFOLGE = ["website", "ai", "software", "game", "design"];
  const WERKZEUG_FARBE = "#f0b45a";

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  const rang = (typ) => {
    const i = REIHENFOLGE.indexOf(typ);
    return i === -1 ? 99 : i;
  };

  const sortiert = projekte
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rang(a.p.type) - rang(b.p.type) || a.i - b.i)
    .map(({ p }) => p);

  // Werkzeuge: Name ohne Zusatz in Klammern, dazu die Projekte, die es nutzen
  const werkzeuge = new Map();
  sortiert.forEach((p) => {
    (p.technologies || []).forEach((t) => {
      const name = String(t).replace(/\s*\(.*\)\s*$/, "").trim();
      if (!name) return;
      if (!werkzeuge.has(name)) werkzeuge.set(name, new Set());
      werkzeuge.get(name).add(p.slug);
    });
  });

  // Lage: Projekte auf dem inneren Ring nach Art gruppiert, ab 12 Uhr im Uhrzeigersinn
  const R_PROJEKT = 385;
  const R_WERKZEUG = 470;
  const winkel = new Map();
  sortiert.forEach((p, i) => winkel.set(p.slug, -Math.PI / 2 + (i / sortiert.length) * Math.PI * 2));

  // Werkzeuge sitzen nah bei den Projekten, die sie nutzen: Sortierung nach mittlerem Winkel
  const liste = Array.from(werkzeuge.entries()).map(([name, slugs]) => {
    let sx = 0;
    let sy = 0;
    slugs.forEach((s) => {
      sx += Math.cos(winkel.get(s));
      sy += Math.sin(winkel.get(s));
    });
    let w = Math.atan2(sy, sx) + Math.PI / 2;
    if (w < 0) w += Math.PI * 2;
    return { name, slugs, w };
  });
  liste.sort((a, b) => a.w - b.w || b.slugs.size - a.slugs.size);
  const versatz = Math.PI / liste.length;
  liste.forEach((wz, i) => {
    wz.winkel = -Math.PI / 2 + versatz + (i / liste.length) * Math.PI * 2;
  });

  const lage = (w, r) => ({ x: 500 + Math.cos(w) * r, y: 500 + Math.sin(w) * r });

  const ebene = orbit.querySelector(".orbit__knoten");
  const faeden = orbit.querySelector(".orbit__faeden");
  const info = orbit.querySelector(".orbit__info");
  const knotenProjekt = new Map();
  const knotenWerkzeug = new Map();

  sortiert.forEach((p) => {
    const { x, y } = lage(winkel.get(p.slug), R_PROJEKT);
    const a = document.createElement("a");
    a.className = "knoten";
    a.href = `${basis}/work/${p.slug}/index.html`;
    a.dataset.typ = p.type;
    a.dataset.slug = p.slug;
    a.tabIndex = -1;
    a.style.setProperty("--x", (x / 10).toFixed(2));
    a.style.setProperty("--y", (y / 10).toFixed(2));
    a.innerHTML = SYMBOL[p.type] || SYMBOL.design;
    ebene.appendChild(a);
    knotenProjekt.set(p.slug, { el: a, x, y, p });
  });

  liste.forEach((wz) => {
    const { x, y } = lage(wz.winkel, R_WERKZEUG);
    const el = document.createElement("span");
    el.className = "knoten knoten--werkzeug";
    el.style.setProperty("--x", (x / 10).toFixed(2));
    el.style.setProperty("--y", (y / 10).toFixed(2));
    el.innerHTML = SYMBOL.werkzeug + (wz.slugs.size > 1 ? `<span class="knoten__zahl">${wz.slugs.size}</span>` : "");
    ebene.appendChild(el);
    knotenWerkzeug.set(wz.name, { el, x, y, wz });
  });

  // Fäden: gebogen Richtung Kern, gezeichnet beim Fokus
  function faden(a, b, farbe) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const cx = 500 + (mx - 500) * 0.45;
    const cy = 500 + (my - 500) * 0.45;
    const pfad = document.createElementNS(SVG_NS, "path");
    pfad.setAttribute("d", `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
    pfad.setAttribute("class", "orbit__faden");
    pfad.style.setProperty("--farbe", farbe);
    faeden.appendChild(pfad);
    const laenge = pfad.getTotalLength ? pfad.getTotalLength() : 1000;
    pfad.style.setProperty("--laenge", laenge.toFixed(0));
  }

  let filter = "all";
  const listenEintraege = new Map();

  function infoZeigen(x, y, oben, titel) {
    info.innerHTML = `<span>${escapeHtml(oben)}</span><strong>${escapeHtml(titel)}</strong>`;
    info.style.left = `${x / 10}%`;
    info.style.top = `${y / 10}%`;
    info.style.transform = y < 260 ? "translate(-50%, 34px)" : "translate(-50%, calc(-100% - 34px))";
    info.hidden = false;
  }

  function leeren() {
    orbit.classList.remove("ist-fokus");
    faeden.replaceChildren();
    info.hidden = true;
    orbit.querySelectorAll(".knoten.ist-an").forEach((k) => k.classList.remove("ist-an"));
    listenEintraege.forEach((el) => el.classList.remove("ist-an"));
    document.dispatchEvent(new CustomEvent("orbit:fokus", { detail: {} }));
  }

  function projektFokus(slug) {
    const k = knotenProjekt.get(slug);
    if (!k || (filter !== "all" && k.p.type !== filter)) return;
    leeren();
    orbit.classList.add("ist-fokus");
    k.el.classList.add("ist-an");
    const farbe = (TYP[k.p.type] || TYP.design).farbe;
    werkzeuge.forEach((slugs, name) => {
      if (!slugs.has(slug)) return;
      const w = knotenWerkzeug.get(name);
      w.el.classList.add("ist-an");
      faden(k, w, farbe);
    });
    const eintrag = listenEintraege.get(slug);
    if (eintrag) eintrag.classList.add("ist-an");
    infoZeigen(k.x, k.y, `${(TYP[k.p.type] || TYP.design).einzel} · ${k.p.year}`, k.p.title);
    document.dispatchEvent(new CustomEvent("orbit:fokus", { detail: { farbe } }));
  }

  function werkzeugFokus(name) {
    const w = knotenWerkzeug.get(name);
    if (!w) return;
    leeren();
    orbit.classList.add("ist-fokus");
    w.el.classList.add("ist-an");
    let sichtbar = 0;
    w.wz.slugs.forEach((slug) => {
      const k = knotenProjekt.get(slug);
      if (filter !== "all" && k.p.type !== filter) return;
      sichtbar++;
      k.el.classList.add("ist-an");
      faden(w, k, WERKZEUG_FARBE);
      const eintrag = listenEintraege.get(slug);
      if (eintrag) eintrag.classList.add("ist-an");
    });
    const zahl = filter === "all" ? w.wz.slugs.size : sichtbar;
    infoZeigen(w.x, w.y, `Werkzeug · ${zahl} ${zahl === 1 ? "Projekt" : "Projekte"}`, name);
    document.dispatchEvent(new CustomEvent("orbit:fokus", { detail: { farbe: WERKZEUG_FARBE } }));
  }

  knotenProjekt.forEach(({ el }, slug) => {
    el.addEventListener("pointerenter", () => projektFokus(slug));
    el.addEventListener("pointerleave", leeren);
  });
  knotenWerkzeug.forEach(({ el }, name) => {
    el.addEventListener("pointerenter", () => werkzeugFokus(name));
    el.addEventListener("pointerleave", leeren);
    el.addEventListener("click", () => werkzeugFokus(name));
  });

  // Filter über dem Orbit
  const leiste = document.getElementById("orbit-filter");
  if (leiste) {
    const anzahl = new Map();
    projekte.forEach((p) => anzahl.set(p.type, (anzahl.get(p.type) || 0) + 1));
    const typen = Array.from(anzahl.keys()).sort((a, b) => rang(a) - rang(b));
    const knopf = (wert, text, menge, an) =>
      `<button type="button" data-filter="${wert}"${wert === "all" ? "" : ` data-typ="${wert}"`} aria-pressed="${an}">${escapeHtml(text)} <span class="filter-zahl">${menge}</span></button>`;
    leiste.innerHTML = knopf("all", "Alle", projekte.length, "true") + typen.map((t) => knopf(t, (TYP[t] || { label: t }).label, anzahl.get(t), "false")).join("");
    leiste.hidden = false;

    leiste.addEventListener("click", (ev) => {
      const b = ev.target.closest("button[data-filter]");
      if (!b) return;
      filter = b.dataset.filter;
      leiste.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      leeren();
      const aktiv = new Set(projekte.filter((p) => filter === "all" || p.type === filter).map((p) => p.slug));
      knotenProjekt.forEach(({ el }, slug) => el.classList.toggle("ist-gefiltert", !aktiv.has(slug)));
      knotenWerkzeug.forEach(({ el, wz }) => el.classList.toggle("ist-gefiltert", ![...wz.slugs].some((s) => aktiv.has(s))));
      listenEintraege.forEach((el, slug) => {
        el.closest("li").hidden = !aktiv.has(slug);
      });
      if (filter !== "all") document.dispatchEvent(new CustomEvent("orbit:fokus", { detail: { farbe: (TYP[filter] || TYP.design).farbe } }));
    });
  }

  // Projekte-Panel: die zugängliche Fassung des Orbits
  const projektListe = document.getElementById("projekt-liste");
  if (projektListe) {
    projektListe.innerHTML = sortiert
      .map(
        (p) => `<li><a class="liste__eintrag" href="${basis}/work/${p.slug}/index.html" data-slug="${p.slug}">
          <span class="punkt" data-typ="${p.type}" aria-hidden="true"></span>
          <span class="liste__text"><span class="liste__titel">${escapeHtml(p.title)}</span><span class="liste__unter">${escapeHtml((TYP[p.type] || TYP.design).einzel)} · ${escapeHtml(p.subtitle)}</span></span>
          <span class="aktion" aria-hidden="true">${SYMBOL.pfeil}</span>
        </a></li>`
      )
      .join("");
    projektListe.querySelectorAll("a[data-slug]").forEach((a) => {
      listenEintraege.set(a.dataset.slug, a);
      a.addEventListener("pointerenter", () => projektFokus(a.dataset.slug));
      a.addEventListener("pointerleave", leeren);
      a.addEventListener("focus", () => projektFokus(a.dataset.slug));
      a.addEventListener("blur", leeren);
    });
  }

  // Werkzeug-Deck: die meistgenutzten Werkzeuge
  const deck = document.getElementById("werkzeug-deck");
  if (deck) {
    const oben = Array.from(werkzeuge.entries()).sort((a, b) => b[1].size - a[1].size).slice(0, 6);
    deck.innerHTML = oben
      .map(([name, slugs]) => {
        const arten = [...new Set([...slugs].map((s) => knotenProjekt.get(s).p.type))].sort((a, b) => rang(a) - rang(b));
        return `<li class="deck__karte" data-werkzeug="${escapeHtml(name)}">
          <strong>${escapeHtml(name)}</strong>
          <span>${slugs.size}× im Einsatz</span>
          <span class="deck__arten">${arten.map((t) => `<i class="punkt" data-typ="${t}"></i>`).join("")}</span>
        </li>`;
      })
      .join("");
    deck.querySelectorAll("[data-werkzeug]").forEach((el) => {
      el.addEventListener("pointerenter", () => werkzeugFokus(el.dataset.werkzeug));
      el.addEventListener("pointerleave", leeren);
    });
  }

  // Zahlen aus dem Datensatz
  const anzahlArt = new Map();
  projekte.forEach((p) => anzahlArt.set(p.type, (anzahlArt.get(p.type) || 0) + 1));
  document.querySelectorAll('[data-zahl="projekte"]').forEach((el) => {
    el.textContent = String(projekte.length);
  });
  document.querySelectorAll('[data-zahl="werkzeuge"]').forEach((el) => {
    el.textContent = String(werkzeuge.size);
  });

  const kennzahlen = document.querySelector("[data-kennzahlen]");
  if (kennzahlen) {
    const LANG = { website: "Websites", ai: "KI-Werkzeuge", software: "Software", game: "Spiele", design: "Gestaltung" };
    kennzahlen.querySelectorAll("[data-art]").forEach((el) => el.remove());
    const zeilen = Array.from(anzahlArt.keys())
      .sort((a, b) => rang(a) - rang(b))
      .map((t) => `<div data-art><dt><span class="punkt" data-typ="${t}" aria-hidden="true"></span>${escapeHtml(LANG[t] || t)}</dt><dd>${anzahlArt.get(t)}</dd></div>`)
      .join("");
    kennzahlen.insertAdjacentHTML("afterbegin", zeilen);
  }

  const ring = document.querySelector("[data-kennring] svg");
  const band = document.querySelector("[data-kennband]");
  if (ring) {
    const umfang = 2 * Math.PI * 52;
    const luecke = 4;
    let start = 0;
    let html = `<circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="9"/>`;
    Array.from(anzahlArt.keys())
      .sort((a, b) => rang(a) - rang(b))
      .forEach((t) => {
        const laenge = (anzahlArt.get(t) / projekte.length) * umfang;
        html += `<circle cx="60" cy="60" r="52" fill="none" stroke="${(TYP[t] || TYP.design).farbe}" stroke-width="9" stroke-linecap="butt" stroke-dasharray="${Math.max(laenge - luecke, 1).toFixed(2)} ${umfang.toFixed(2)}" stroke-dashoffset="${(-start).toFixed(2)}"/>`;
        start += laenge;
      });
    ring.innerHTML = html;
  }
  if (band) {
    band.innerHTML = Array.from(anzahlArt.keys())
      .sort((a, b) => rang(a) - rang(b))
      .map((t) => `<i data-typ="${t}" style="--anteil:${anzahlArt.get(t)}"></i>`)
      .join("");
  }

  const meta = document.querySelector("[data-meta-zeile]");
  if (meta) meta.textContent = `${projekte.length} Projekte · ${werkzeuge.size} Werkzeuge · ${anzahlArt.get("website") || 0} Websites`;

  // Uhr in Peiner Ortszeit
  const zeitFeld = document.querySelector("[data-uhr]");
  const datumFeld = document.querySelector("[data-datum]");
  if (zeitFeld && window.Intl) {
    const zeit = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const datum = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "short" });
    const ticken = () => {
      const jetzt = new Date();
      zeitFeld.textContent = zeit.format(jetzt);
      if (datumFeld) datumFeld.textContent = datum.format(jetzt);
    };
    ticken();
    setInterval(ticken, 1000);
  }

  document.dispatchEvent(new CustomEvent("leitstand:bereit"));
})();
