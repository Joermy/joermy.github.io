(() => {
  "use strict";

  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vorhang = document.querySelector(".vorhang");
  const SCHLUESSEL = "systemstart-gesehen";

  let schonGesehen = false;
  try {
    schonGesehen = sessionStorage.getItem(SCHLUESSEL) === "ja";
  } catch (fehler) {
  }

  const melden = () => setTimeout(() => document.dispatchEvent(new CustomEvent("vorhang:offen")), 0);

  // Systemstart: einmal pro Sitzung, danach nur ein kurzes Abblenden
  if (vorhang && !reduziert && !schonGesehen) {
    const zahl = vorhang.querySelector(".vorhang__zahl");
    let stand = 0;
    let fertig = false;

    const setzen = (wert) => {
      vorhang.style.setProperty("--fortschritt", (wert / 100).toFixed(4));
      if (zahl) zahl.textContent = `${String(Math.floor(wert)).padStart(3, "0")} %`;
    };

    const schliessen = () => {
      if (fertig) return;
      fertig = true;
      setzen(100);
      try {
        sessionStorage.setItem(SCHLUESSEL, "ja");
      } catch (fehler) {
      }
      setTimeout(() => {
        vorhang.setAttribute("data-fertig", "");
        melden();
        setTimeout(() => vorhang.remove(), 700);
      }, 260);
    };

    const zaehlen = () => {
      stand = Math.min(stand + (stand < 70 ? Math.random() * 11 + 5 : Math.random() * 6 + 2), 100);
      setzen(stand);
      if (stand < 100) setTimeout(zaehlen, 45);
      else schliessen();
    };

    setzen(0);
    setTimeout(zaehlen, 120);
    setTimeout(schliessen, 2600);
  } else if (vorhang) {
    vorhang.setAttribute("data-sofort", "");
    vorhang.setAttribute("data-fertig", "");
    melden();
    setTimeout(() => vorhang.remove(), 300);
  } else {
    melden();
  }

  // Beschriftungen setzen sich aus Zeichenrauschen zusammen
  const RAUSCHEN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}*#%&";

  function entschluesseln(el) {
    const original = el.textContent;
    const zeichen = Array.from(original);
    const dauer = 620;
    const start = performance.now();
    el.setAttribute("aria-label", original);

    function schritt(jetzt) {
      const anteil = Math.min((jetzt - start) / dauer, 1);
      const feststehend = Math.floor(anteil * zeichen.length * 1.35);
      el.textContent = zeichen
        .map((z, i) => (i < feststehend || z === " " || z === "·" ? z : RAUSCHEN[Math.floor(Math.random() * RAUSCHEN.length)]))
        .join("");
      if (anteil < 1) {
        requestAnimationFrame(schritt);
      } else {
        el.textContent = original;
        el.removeAttribute("aria-label");
      }
    }

    requestAnimationFrame(schritt);
  }

  if (!reduziert && "IntersectionObserver" in window) {
    const starten = () => {
      const ziele = document.querySelectorAll("[data-entschluesseln]");
      if (!ziele.length) return;
      const beobachter = new IntersectionObserver(
        (eintraege, obs) => {
          eintraege.forEach((eintrag) => {
            if (!eintrag.isIntersecting) return;
            obs.unobserve(eintrag.target);
            entschluesseln(eintrag.target);
          });
        },
        { threshold: 0.6 }
      );
      ziele.forEach((el) => beobachter.observe(el));
    };
    document.addEventListener("vorhang:offen", () => setTimeout(starten, 120), { once: true });
  }

  // Zahlen zählen nach dem Start hoch
  if (!reduziert) {
    const felder = Array.from(document.querySelectorAll("[data-zaehlen]"));
    const hochzaehlen = (el) => {
      const ziel = Number(el.textContent);
      if (!Number.isFinite(ziel) || ziel <= 0) return;
      const dauer = 900;
      const start = performance.now();
      const schritt = (jetzt) => {
        const anteil = Math.min(Math.max((jetzt - start) / dauer, 0), 1);
        el.textContent = String(Math.round(ziel * (1 - Math.pow(1 - anteil, 3))));
        if (anteil < 1) requestAnimationFrame(schritt);
        else el.textContent = String(ziel);
      };
      requestAnimationFrame(schritt);
      setTimeout(() => {
        el.textContent = String(ziel);
      }, dauer + 600);
    };
    document.addEventListener("vorhang:offen", () => setTimeout(() => felder.forEach(hochzaehlen), 300), { once: true });
  }
})();
