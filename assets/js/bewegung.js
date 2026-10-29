(() => {
  "use strict";

  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const kopfzeile = document.querySelector(".kopfzeile");
  if (kopfzeile) {
    const aktualisieren = () => {
      kopfzeile.classList.toggle("blur", window.scrollY > 8);
    };
    aktualisieren();
    window.addEventListener("scroll", aktualisieren, { passive: true });
  }

  if (reduziert) return;

  document.documentElement.classList.add("js-bewegung");

  function beobachten(elemente) {
    if (!("IntersectionObserver" in window)) {
      elemente.forEach((e) => e.classList.add("ist-sichtbar"));
      return;
    }
    const beobachter = new IntersectionObserver(
      (eintraege, obs) => {
        eintraege.forEach((eintrag) => {
          if (eintrag.isIntersecting) {
            eintrag.target.classList.add("ist-sichtbar");
            obs.unobserve(eintrag.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elemente.forEach((e, i) => {
      e.style.transitionDelay = `${(i % 4) * 60}ms`;
      beobachter.observe(e);
    });
  }

  beobachten(Array.from(document.querySelectorAll(".einblenden")));
  document.addEventListener("raster:bereit", () => {
    beobachten(Array.from(document.querySelectorAll("#work-grid .einblenden:not(.ist-sichtbar)")));
  });

  function nachzuegler() {
    const hoehe = window.innerHeight || 0;
    document.querySelectorAll(".einblenden:not(.ist-sichtbar)").forEach((el) => {
      const kasten = el.getBoundingClientRect();
      if (kasten.top < hoehe && kasten.bottom > 0) el.classList.add("ist-sichtbar");
    });
  }

  setTimeout(nachzuegler, 1200);
  window.addEventListener("load", () => setTimeout(nachzuegler, 400));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) setTimeout(nachzuegler, 200);
  });

  // Nach dem Einblenden die Übergänge abschalten, damit Hover-Effekte nicht nachziehen
  function endzustandFestschreiben() {
    document.querySelectorAll(".einblenden.ist-sichtbar:not(.ist-fertig)").forEach((el) => {
      el.style.transitionDelay = "";
      el.classList.add("ist-fertig");
    });
  }
  setInterval(endzustandFestschreiben, 1500);

  // Antwort im Chat tippt sich, sobald das Fenster im Bild ist
  document.querySelectorAll("[data-tippen]").forEach((blase) => {
    const text = blase.textContent.trim();
    const hervor = blase.dataset.tippen.split(/\s+/).filter(Boolean);
    const vorlesen = document.createElement("span");
    vorlesen.className = "sr-only";
    vorlesen.textContent = text;
    const sicht = document.createElement("span");
    sicht.setAttribute("aria-hidden", "true");
    const zeiger = document.createElement("span");
    zeiger.className = "blase__zeiger";
    zeiger.setAttribute("aria-hidden", "true");
    blase.replaceChildren(vorlesen, sicht, zeiger);
    blase.style.minHeight = "";

    const fassen = (stand) => {
      const teil = text.slice(0, stand);
      sicht.innerHTML = "";
      teil.split(/(\s+)/).forEach((wort) => {
        if (!wort) return;
        if (hervor.includes(wort.replace(/[.,]/g, "")) && /\S/.test(wort)) {
          const em = document.createElement("em");
          em.textContent = wort;
          sicht.appendChild(em);
        } else {
          sicht.appendChild(document.createTextNode(wort));
        }
      });
    };

    let gestartet = false;
    const starten = () => {
      if (gestartet) return;
      gestartet = true;
      let stand = 0;
      const schritt = () => {
        stand = Math.min(stand + 1 + Math.floor(Math.random() * 2), text.length);
        fassen(stand);
        if (stand < text.length) setTimeout(schritt, 26 + Math.random() * 30);
        else {
          blase.style.minHeight = "";
          setTimeout(() => zeiger.remove(), 2400);
        }
      };
      schritt();
    };

    // Platz für den ganzen Text reservieren, damit nichts springt
    fassen(text.length);
    const hoehe = blase.getBoundingClientRect().height;
    if (hoehe) blase.style.minHeight = `${hoehe}px`;
    fassen(0);

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) {
          obs.disconnect();
          setTimeout(starten, 350);
        }
      }, { threshold: 0.5 });
      obs.observe(blase);
    } else {
      starten();
    }
  });
})();
