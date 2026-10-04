(() => {
  "use strict";

  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const echteMaus = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const vorhang = document.querySelector(".vorhang");

  if (vorhang && !reduziert) {
    document.documentElement.classList.add("js-schau");
    document.documentElement.style.overflow = "hidden";

    const zahl = vorhang.querySelector(".vorhang__zahl");

    let stand = 0;
    let szeneBereit = false;
    let fertigGemeldet = false;

    function setzen(wert) {
      vorhang.style.setProperty("--fortschritt", (wert / 100).toFixed(4));
      if (zahl) zahl.textContent = String(Math.floor(wert)).padStart(3, "0");
    }

    document.addEventListener("szene:bereit", () => {
      szeneBereit = true;
    });

    if (!document.querySelector(".hero__canvas")) szeneBereit = true;

    setTimeout(() => {
      szeneBereit = true;
    }, 1800);

    const schliessen = () => {
      if (fertigGemeldet) return;
      fertigGemeldet = true;
      setzen(100);
      vorhang.setAttribute("data-fertig", "");
      document.documentElement.style.overflow = "";
      document.dispatchEvent(new CustomEvent("vorhang:offen"));
      setTimeout(() => vorhang.remove(), 1400);
    };

    const zaehlen = () => {
      const schritt = stand < 70 ? Math.random() * 9 + 3 : Math.random() * 3 + 0.7;
      const grenze = szeneBereit ? 100 : 94;
      stand = Math.min(stand + schritt, grenze);

      setzen(stand);

      if (stand < 100) {
        setTimeout(zaehlen, 60);
      } else {
        setTimeout(schliessen, 420);
      }
    };

    setzen(0);
    zaehlen();
    setTimeout(schliessen, 3200);
  } else if (vorhang) {
    vorhang.remove();
    document.dispatchEvent(new CustomEvent("vorhang:offen"));
  } else {
    document.dispatchEvent(new CustomEvent("vorhang:offen"));
  }

  if (echteMaus && !reduziert) {
    const punkt = document.createElement("div");
    punkt.className = "zeiger";
    const ring = document.createElement("div");
    ring.className = "zeiger__ring";
    document.body.append(punkt, ring);

    let zielX = -100;
    let zielY = -100;
    let ringX = -100;
    let ringY = -100;

    document.addEventListener("pointermove", (ev) => {
      zielX = ev.clientX;
      zielY = ev.clientY;
      punkt.style.setProperty("--zx", `${zielX}px`);
      punkt.style.setProperty("--zy", `${zielY}px`);
    });

    const nachlaufen = () => {
      ringX += (zielX - ringX) * 0.16;
      ringY += (zielY - ringY) * 0.16;
      ring.style.setProperty("--rx", `${ringX.toFixed(1)}px`);
      ring.style.setProperty("--ry", `${ringY.toFixed(1)}px`);
      requestAnimationFrame(nachlaufen);
    };
    requestAnimationFrame(nachlaufen);

    const anfassbar = "a, button, .knopf, .projekt-karte, input, textarea, select, summary";

    document.addEventListener("pointerover", (ev) => {
      if (ev.target.closest(anfassbar)) {
        punkt.style.setProperty("--zs", "0");
        ring.style.setProperty("--rs", "1.75");
      }
    });

    document.addEventListener("pointerout", (ev) => {
      if (ev.target.closest(anfassbar) && !ev.relatedTarget?.closest(anfassbar)) {
        punkt.style.setProperty("--zs", "1");
        ring.style.setProperty("--rs", "1");
      }
    });
  }

  const RAUSCHEN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}*#%&";

  function entschluesseln(el) {
    const original = el.textContent;
    const zeichen = Array.from(original);
    const dauer = 620;
    const start = performance.now();
    el.setAttribute("aria-hidden", "true");

    function schritt(jetzt) {
      const anteil = Math.min((jetzt - start) / dauer, 1);
      const feststehend = Math.floor(anteil * zeichen.length * 1.35);
      el.textContent = zeichen
        .map((z, i) => {
          if (i < feststehend || z === " ") return z;
          return RAUSCHEN[Math.floor(Math.random() * RAUSCHEN.length)];
        })
        .join("");

      if (anteil < 1) {
        requestAnimationFrame(schritt);
      } else {
        el.textContent = original;
        el.removeAttribute("aria-hidden");
      }
    }

    requestAnimationFrame(schritt);
  }

  if (!reduziert && "IntersectionObserver" in window) {
    const ziele = document.querySelectorAll("[data-entschluesseln]");
    if (ziele.length) {
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
    }
  }

  (() => {
    if (reduziert) return;

    const felder = Array.from(document.querySelectorAll("[data-zaehlziel]"));
    if (!felder.length) return;

    function hochzaehlen(el) {
      const ziel = el.dataset.zaehlquelle === "projekte" && Array.isArray(window.PROJEKTE)
        ? window.PROJEKTE.length : Number(el.dataset.zaehlziel);
      if (!Number.isFinite(ziel)) return;

      const dauer = 900;
      const start = performance.now();
      let fertig = false;

      function schritt(jetzt) {
        const anteil = Math.min(Math.max((jetzt - start) / dauer, 0), 1);
        const weich = 1 - Math.pow(1 - anteil, 3);
        el.textContent = String(Math.round(ziel * weich));
        if (anteil < 1) {
          requestAnimationFrame(schritt);
        } else {
          fertig = true;
        }
      }

      el.textContent = "0";
      requestAnimationFrame(schritt);

      setTimeout(() => {
        if (!fertig) el.textContent = String(ziel);
      }, dauer + 600);
    }

    document.addEventListener("vorhang:offen", () => {
      setTimeout(() => felder.forEach(hochzaehlen), 520);
    });
  })();

})();
