(() => {
  "use strict";

  const leiste = document.getElementById("filterleiste");
  const raster = document.getElementById("work-grid");
  if (!leiste || !raster) return;

  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUSBLEND_DAUER = 220;

  const TYP_LABEL = { ai: "KI", website: "Websites", software: "Software", game: "Spiele", design: "Design" };
  const REIHENFOLGE = ["ai", "website", "software", "game", "design"];

  function leisteAufbauen() {
    const projekte = Array.isArray(window.PROJEKTE) ? window.PROJEKTE : [];
    if (!projekte.length) return;

    const anzahl = new Map();
    projekte.forEach((p) => anzahl.set(p.type, (anzahl.get(p.type) || 0) + 1));

    const typen = Array.from(anzahl.keys()).sort((a, b) => {
      const ia = REIHENFOLGE.indexOf(a);
      const ib = REIHENFOLGE.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    if (typen.length < 2) {
      leiste.hidden = true;
      return;
    }

    const knopfHtml = (wert, beschriftung, menge, gedrueckt) =>
      `<button type="button" data-filter="${wert}" aria-pressed="${gedrueckt}">` +
      `${beschriftung}<span class="filter-zahl" aria-hidden="true">${menge}</span>` +
      `</button>`;

    leiste.innerHTML =
      knopfHtml("all", "Alle", projekte.length, "true") +
      typen.map((t) => knopfHtml(t, TYP_LABEL[t] || t, anzahl.get(t), "false")).join("");

    leiste.hidden = false;
  }

  let hinweis = document.getElementById("filter-leer");
  if (!hinweis) {
    hinweis = document.createElement("p");
    hinweis.id = "filter-leer";
    hinweis.className = "lade-hinweis";
    hinweis.hidden = true;
    hinweis.setAttribute("role", "status");
    raster.insertAdjacentElement("afterend", hinweis);
  }

  function anwenden(filter) {
    let sichtbar = 0;

    raster.querySelectorAll(".projekt-karte").forEach((karte) => {
      const passt = filter === "all" || karte.dataset.typ === filter;
      if (passt) sichtbar++;

      if (passt) {
        karte.hidden = false;
        karte.classList.add("ist-sichtbar");
        requestAnimationFrame(() => karte.classList.remove("projekt-karte--gefiltert"));
      } else if (reduziert) {
        karte.classList.add("projekt-karte--gefiltert");
        karte.hidden = true;
      } else {
        karte.classList.add("projekt-karte--gefiltert");
        setTimeout(() => {
          if (karte.classList.contains("projekt-karte--gefiltert")) karte.hidden = true;
        }, AUSBLEND_DAUER);
      }
    });

    const label = TYP_LABEL[filter] || filter;
    hinweis.textContent = `Unter "${label}" liegt derzeit keine Arbeit.`;
    hinweis.hidden = sichtbar > 0;
  }

  leiste.addEventListener("click", (ev) => {
    const knopf = ev.target.closest("button[data-filter]");
    if (!knopf) return;

    leiste.querySelectorAll("button[data-filter]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === knopf));
    });

    anwenden(knopf.dataset.filter);
  });

  document.addEventListener("raster:bereit", leisteAufbauen);
  leisteAufbauen();
})();
