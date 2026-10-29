(() => {
  "use strict";

  const raster = document.getElementById("work-grid");
  if (!raster) return;

  const hinweis = document.getElementById("lade-hinweis");
  const noscriptListe = document.getElementById("vollstaendige-liste");
  const basis = raster.dataset.basis || ".";
  const limit = raster.dataset.limit ? parseInt(raster.dataset.limit, 10) : null;

  const TYP_LABEL = { ai: "KI", website: "Websites", software: "Software", game: "Spiele", design: "Design" };

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function bildHtml(pfad, alt, breitePx, hoehePx) {
    if (!pfad) return "";
    const voll = `${basis}/${pfad}`;
    const sizes = "(min-width: 960px) 900px, 90vw";
    return `<picture>
      <source type="image/webp" srcset="${voll}-400.webp 400w, ${voll}-800.webp 800w, ${voll}-1600.webp 1600w" sizes="${sizes}">
      <img src="${voll}-800.jpg" srcset="${voll}-400.jpg 400w, ${voll}-800.jpg 800w, ${voll}-1600.jpg 1600w" sizes="${sizes}"
        width="${breitePx || 1600}" height="${hoehePx || 1000}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
    </picture>`;
  }

  function medienHtml(p) {
    if (p.type === "design" && p.heroRueckseite) {
      return `<div class="papier-buehne"><div class="papier-paar">
        <div class="papier">${bildHtml(p.heroImage, p.heroAlt, p.heroBreitePx, p.heroHoehePx)}</div>
        <div class="papier">${bildHtml(p.heroRueckseite, p.heroAlt, p.heroBreitePx, p.heroHoehePx)}</div>
      </div></div>`;
    }
    if (p.type === "design") {
      return `<div class="papier-buehne"><div class="papier">${bildHtml(p.heroImage, p.heroAlt, p.heroBreitePx, p.heroHoehePx)}</div></div>`;
    }
    if (p.type === "software" && !p.heroImage) {
      return `<div class="code-karte"><pre>${escapeHtml(p.codeOutput || "")}</pre></div>`;
    }
    if (!p.heroImage) {
      const kuerzel = escapeHtml(String(p.title || "").slice(0, 2).toUpperCase());
      return `<div class="platte" data-typ="${escapeHtml(p.type)}" role="img" aria-label="${escapeHtml(p.heroAlt || p.title)}">
        <span class="platte__gitter" aria-hidden="true"></span>
        <span class="platte__marke" aria-hidden="true">${escapeHtml(TYP_LABEL[p.type] || p.type)}</span>
        <span class="platte__kuerzel" aria-hidden="true">${kuerzel}</span>
      </div>`;
    }

    return `<div class="rahmen">
      <div class="rahmen__leiste" aria-hidden="true"><span class="rahmen__punkt"></span><span class="rahmen__punkt"></span><span class="rahmen__punkt"></span></div>
      <div class="projekt-karte__bild-wrap">${bildHtml(p.heroImage, p.heroAlt, p.heroBreitePx, p.heroHoehePx)}</div>
    </div>`;
  }

  function karteHtml(p) {
    const label = TYP_LABEL[p.type] || p.type;
    return `<a class="projekt-karte einblenden" href="${basis}/work/${p.slug}/index.html" data-typ="${p.type}">
      <div class="projekt-karte__medien">${medienHtml(p)}</div>
      <div class="projekt-karte__zeile">
        <div>
          <div class="projekt-karte__eyebrow"><span>${escapeHtml(label)}</span><span>${escapeHtml(String(p.year))}</span></div>
          <div class="projekt-karte__titel">${escapeHtml(p.title)}</div>
          <p class="projekt-karte__kurz">${escapeHtml(p.description)}</p>
        </div>
        <span class="projekt-karte__pfeil"><span class="projekt-karte__pfeil-text">Projekt ansehen</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
    </a>`;
  }

  const quelle = Array.isArray(window.PROJEKTE) ? window.PROJEKTE : null;

  if (!quelle) {
    if (hinweis) hinweis.hidden = false;
    if (noscriptListe && raster) {
      raster.innerHTML = noscriptListe.textContent;
      raster.classList.add("einfache-liste");
    }
  } else {
    let projekte = quelle.slice();
    if (limit) projekte = projekte.slice(0, limit);
    raster.innerHTML = projekte.map(karteHtml).join("");
    document.dispatchEvent(new CustomEvent("raster:bereit"));
  }
})();
