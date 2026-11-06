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

  const woerterBuehnen = Array.from(document.querySelectorAll("[data-woerter]")).map((el) => {
    const text = el.textContent.trim();
    const hervor = new Set((el.dataset.hervor || "").split(/\s+/).filter(Boolean));
    el.setAttribute("aria-label", text);
    el.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="wort${hervor.has(w) ? " ist-hervor" : ""}" aria-hidden="true">${w}</span>`)
      .join(" ");
    const rahmen = el.closest(".statement") || el;
    return { spannen: Array.from(el.querySelectorAll(".wort")), rahmen, buehne: rahmen.querySelector(".statement__buehne") };
  });

  function woerterAktualisieren() {
    const hoehe = window.innerHeight || 1;
    woerterBuehnen.forEach(({ spannen, rahmen, buehne }) => {
      const kasten = rahmen.getBoundingClientRect();
      const strecke = Math.max(kasten.height - hoehe, 1);
      const anteil = Math.min(Math.max((-kasten.top + hoehe * 0.35) / (strecke * 0.85), 0), 1);
      const n = spannen.length;
      spannen.forEach((w, i) => {
        const lokal = Math.min(Math.max(anteil * (n + 1.5) - i, 0), 1);
        w.style.setProperty("--an", lokal.toFixed(3));
        w.classList.toggle("ist-vorne", lokal > 0.02 && lokal < 0.98);
      });
      if (buehne) buehne.style.setProperty("--fortschritt", anteil.toFixed(4));
    });
  }

  const scrollAktualisieren = () => {
    const bezug = window.innerHeight || 1;
    const fortschritt = Math.min(Math.max(window.scrollY / bezug, 0), 1);
    document.documentElement.style.setProperty("--scroll", fortschritt.toFixed(3));
    if (woerterBuehnen.length) woerterAktualisieren();
  };
  scrollAktualisieren();
  window.addEventListener("resize", scrollAktualisieren, { passive: true });
  window.addEventListener(
    "scroll",
    scrollAktualisieren,
    { passive: true }
  );

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

  let aufgedeckt = false;
  function titelAufdecken() {
    if (aufgedeckt) return;
    aufgedeckt = true;
    document.querySelectorAll(".zeile__inner").forEach((zeile, i) => {
      setTimeout(() => zeile.classList.add("ist-aufgedeckt"), i * 110);
    });
  }

  function endzustandFestschreiben() {
    document
      .querySelectorAll(".zeile__inner.ist-aufgedeckt:not(.ist-fertig), .ist-sichtbar:not(.ist-fertig)")
      .forEach((el) => el.classList.add("ist-fertig"));
  }

  setTimeout(endzustandFestschreiben, 2600);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) setTimeout(endzustandFestschreiben, 100);
  });
  window.addEventListener("focus", () => setTimeout(endzustandFestschreiben, 100));

  document.addEventListener("vorhang:offen", titelAufdecken);
  setTimeout(titelAufdecken, 3600);
})();
