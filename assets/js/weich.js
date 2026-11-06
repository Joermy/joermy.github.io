import Lenis from "./vendor/lenis.min.js";

const wurzel = document.documentElement;
const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fein = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let lenis = null;
if (!reduziert && fein) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true, autoRaf: false });
  wurzel.classList.add("weich-scroll");
  if (document.querySelector(".vorhang")) {
    lenis.stop();
    document.addEventListener("vorhang:offen", () => lenis.start(), { once: true });
    setTimeout(() => lenis.start(), 4000);
  }
}

const baender = Array.from(document.querySelectorAll("[data-laufband]")).map((el) => {
  const spur = el.querySelector(".laufband__spur");
  return { el, spur, x: 0, breite: 0 };
});
function baenderMessen() {
  baender.forEach((b) => {
    const erstes = b.spur && b.spur.firstElementChild;
    b.breite = erstes ? erstes.getBoundingClientRect().width : 0;
  });
}
baenderMessen();
window.addEventListener("resize", baenderMessen, { passive: true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(baenderMessen);

let letzteY = window.scrollY;
let tempo = 0;
let vorher = 0;
function schleife(t) {
  requestAnimationFrame(schleife);
  if (lenis) lenis.raf(t);
  const dt = vorher ? Math.min((t - vorher) / 1000, 0.1) : 0.016;
  vorher = t;
  const y = window.scrollY;
  const roh = (y - letzteY) / Math.max(dt, 0.001);
  letzteY = y;
  tempo += (roh - tempo) * Math.min(dt * 8, 1);
  const schub = Math.max(-1, Math.min(1, tempo / 3000));

  if (!reduziert) {
    const h = window.innerHeight || 1;
    baender.forEach((b, i) => {
      if (!b.breite || !b.spur) return;
      const r = b.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > h + 50) return;
      const richtung = i % 2 ? 1 : -1;
      b.x += richtung * (40 + Math.abs(tempo) * 0.35) * dt * (schub < 0 ? -1 : 1);
      b.x = ((b.x % b.breite) + b.breite) % b.breite;
      b.spur.style.transform = `translate3d(${(-b.x).toFixed(1)}px,0,0) skewX(${(schub * -8).toFixed(2)}deg)`;
    });
    wurzel.style.setProperty("--schub", schub.toFixed(3));
    wurzel.style.setProperty("--schub-abs", Math.abs(schub).toFixed(3));
  }
}
requestAnimationFrame(schleife);
