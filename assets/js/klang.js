(() => {
  "use strict";

  const SPEICHER = "klang-an";
  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduziert) return;
  if (!("AudioContext" in window || "webkitAudioContext" in window)) return;

  let an = false;
  try {
    an = localStorage.getItem(SPEICHER) === "ja";
  } catch (fehler) {
  }

  let ctx = null;
  let summe = null;
  let hall = null;
  let raumOsz = null;
  let raumPegel = null;

  function hallraumBauen(dauer, abfall) {
    const rate = ctx.sampleRate;
    const laenge = Math.floor(rate * dauer);
    const puffer = ctx.createBuffer(2, laenge, rate);

    for (let kanal = 0; kanal < 2; kanal++) {
      const daten = puffer.getChannelData(kanal);
      for (let i = 0; i < laenge; i++) {
        daten[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / laenge, abfall);
      }
    }
    return puffer;
  }

  function aufbauen() {
    if (ctx) return;

    const AudioKlasse = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioKlasse();

    summe = ctx.createGain();
    summe.gain.value = 0.0001;
    summe.connect(ctx.destination);

    hall = ctx.createConvolver();
    hall.buffer = hallraumBauen(2.4, 2.6);

    const hallPegel = ctx.createGain();
    hallPegel.gain.value = 0.22;
    hall.connect(hallPegel);
    hallPegel.connect(summe);

    raumPegel = ctx.createGain();
    raumPegel.gain.value = 0;
    raumPegel.connect(summe);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    filter.connect(raumPegel);

    raumOsz = [55, 55.35, 82.5].map((frequenz) => {
      const osz = ctx.createOscillator();
      osz.type = "sine";
      osz.frequency.value = frequenz;
      const pegel = ctx.createGain();
      pegel.gain.value = frequenz > 80 ? 0.35 : 1;
      osz.connect(pegel);
      pegel.connect(filter);
      osz.start();
      return osz;
    });

    lautstaerkeSetzen(an);
  }

  function lautstaerkeSetzen(einschalten) {
    if (!ctx) return;
    const jetzt = ctx.currentTime;
    summe.gain.cancelScheduledValues(jetzt);
    summe.gain.setValueAtTime(Math.max(summe.gain.value, 0.0001), jetzt);
    summe.gain.exponentialRampToValueAtTime(einschalten ? 0.6 : 0.0001, jetzt + 0.4);
  }

  function ton({ frequenz, dauer = 0.12, art = "sine", pegel = 0.12, gleiten = 0, hallAnteil = 0.5 }) {
    if (!ctx || !an) return;

    const jetzt = ctx.currentTime;
    const osz = ctx.createOscillator();
    osz.type = art;
    osz.frequency.setValueAtTime(frequenz, jetzt);
    if (gleiten) {
      osz.frequency.exponentialRampToValueAtTime(Math.max(frequenz + gleiten, 20), jetzt + dauer);
    }

    const huelle = ctx.createGain();
    huelle.gain.setValueAtTime(0.0001, jetzt);
    huelle.gain.exponentialRampToValueAtTime(pegel, jetzt + 0.008);
    huelle.gain.exponentialRampToValueAtTime(0.0001, jetzt + dauer);

    osz.connect(huelle);

    const trocken = ctx.createGain();
    trocken.gain.value = 1 - hallAnteil;
    huelle.connect(trocken);
    trocken.connect(summe);

    const nass = ctx.createGain();
    nass.gain.value = hallAnteil;
    huelle.connect(nass);
    nass.connect(hall);

    osz.start(jetzt);
    osz.stop(jetzt + dauer + 0.05);
  }

  function rauschstoss({ dauer = 0.35, von = 1800, bis = 260, pegel = 0.09 }) {
    if (!ctx || !an) return;

    const jetzt = ctx.currentTime;
    const laenge = Math.floor(ctx.sampleRate * dauer);
    const puffer = ctx.createBuffer(1, laenge, ctx.sampleRate);
    const daten = puffer.getChannelData(0);
    for (let i = 0; i < laenge; i++) daten[i] = Math.random() * 2 - 1;

    const quelle = ctx.createBufferSource();
    quelle.buffer = puffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(von, jetzt);
    filter.frequency.exponentialRampToValueAtTime(bis, jetzt + dauer);

    const huelle = ctx.createGain();
    huelle.gain.setValueAtTime(0.0001, jetzt);
    huelle.gain.exponentialRampToValueAtTime(pegel, jetzt + 0.05);
    huelle.gain.exponentialRampToValueAtTime(0.0001, jetzt + dauer);

    quelle.connect(filter);
    filter.connect(huelle);
    huelle.connect(summe);

    const nass = ctx.createGain();
    nass.gain.value = 0.7;
    huelle.connect(nass);
    nass.connect(hall);

    quelle.start(jetzt);
  }

  const KLANG = {
    tippen: () => ton({ frequenz: 2100, dauer: 0.05, pegel: 0.035, hallAnteil: 0.35 }),

    klick: () => {
      ton({ frequenz: 660, dauer: 0.09, pegel: 0.1, art: "triangle" });
      setTimeout(() => ton({ frequenz: 990, dauer: 0.16, pegel: 0.07, art: "triangle" }), 28);
    },

    aufdecken: () => rauschstoss({ dauer: 0.5, von: 2400, bis: 300, pegel: 0.05 }),

    fertig: () => {
      [110, 165, 220, 247].forEach((frequenz, i) => {
        setTimeout(() => ton({
          frequenz,
          dauer: 1.6,
          pegel: 0.09,
          art: "triangle",
          hallAnteil: 0.75,
        }), i * 70);
      });
      rauschstoss({ dauer: 1.1, von: 5200, bis: 400, pegel: 0.04 });
    },
  };

  let letztesY = window.scrollY;
  let schub = 0;

  window.addEventListener("scroll", () => {
    schub = Math.min(schub + Math.abs(window.scrollY - letztesY), 240);
    letztesY = window.scrollY;
  }, { passive: true });

  function raumRegeln() {
    if (ctx && an && raumPegel) {
      const ziel = 0.04 + Math.min(schub / 240, 1) * 0.07;
      raumPegel.gain.setTargetAtTime(ziel, ctx.currentTime, 0.4);
    }
    schub *= 0.9;
    setTimeout(raumRegeln, 120);
  }
  raumRegeln();

  const schalter = document.createElement("button");
  schalter.type = "button";
  schalter.className = "klang-schalter";
  schalter.setAttribute("aria-pressed", String(an));
  schalter.title = "Ton an oder aus";

  function schalterZeichnen() {
    schalter.innerHTML =
      '<span class="klang-schalter__balken" aria-hidden="true">' +
      '<i></i><i></i><i></i><i></i>' +
      "</span>" +
      `<span class="klang-schalter__text">Ton ${an ? "an" : "aus"}</span>`;
    schalter.setAttribute("aria-pressed", String(an));
    schalter.classList.toggle("ist-an", an);
  }
  schalterZeichnen();

  schalter.addEventListener("click", () => {
    an = !an;
    try {
      localStorage.setItem(SPEICHER, an ? "ja" : "nein");
    } catch (fehler) {
    }
    aufbauen();
    if (ctx.state === "suspended") ctx.resume();
    lautstaerkeSetzen(an);
    schalterZeichnen();
    if (an) KLANG.klick();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const leiste = document.querySelector(".kopfzeile__inhalt");
    if (leiste) leiste.appendChild(schalter);
  });

  function ersteGeste() {
    if (!an) return;
    aufbauen();
    if (ctx.state === "suspended") ctx.resume();
    lautstaerkeSetzen(true);
  }

  ["pointerdown", "keydown", "wheel"].forEach((art) => {
    window.addEventListener(art, ersteGeste, { once: true, passive: true });
  });

  document.addEventListener("pointerover", (ev) => {
    if (!an || !ctx) return;
    if (ev.target.closest("a, button, .projekt-karte")) KLANG.tippen();
  });

  document.addEventListener("pointerdown", (ev) => {
    if (!an || !ctx) return;
    if (ev.target.closest("a, button, .projekt-karte")) KLANG.klick();
  });

  document.addEventListener("vorhang:offen", () => {
    if (an && ctx) KLANG.fertig();
  });

  if ("IntersectionObserver" in window) {
    const beobachter = new IntersectionObserver((eintraege) => {
      eintraege.forEach((eintrag) => {
        if (eintrag.isIntersecting && an && ctx) {
          KLANG.aufdecken();
          beobachter.unobserve(eintrag.target);
        }
      });
    }, { threshold: 0.4 });

    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("main > section").forEach((s) => beobachter.observe(s));
    });
  }
})();
