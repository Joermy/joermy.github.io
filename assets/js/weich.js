import Lenis from "./vendor/lenis.min.js";

const wurzel = document.documentElement;
const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fein = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (!reduziert && fein) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true, autoRaf: false });
  wurzel.classList.add("weich-scroll");
  if (document.querySelector(".vorhang")) {
    lenis.stop();
    document.addEventListener("vorhang:offen", () => lenis.start(), { once: true });
    setTimeout(() => lenis.start(), 4000);
  }
  const schleife = (t) => {
    lenis.raf(t);
    requestAnimationFrame(schleife);
  };
  requestAnimationFrame(schleife);
}
