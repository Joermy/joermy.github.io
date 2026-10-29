(() => {
  "use strict";

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  // Leuchtkante folgt dem Zeiger über Panels und Karten
  const FLAECHEN = ".panel, .projekt-karte, .projekt-abschnitt__inhalt, .rechtstext";

  function lichtkante(el) {
    if (el.dataset.lichtkante) return;
    el.dataset.lichtkante = "1";
    el.addEventListener("pointermove", (ev) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--kx", `${ev.clientX - rect.left}px`);
      el.style.setProperty("--ky", `${ev.clientY - rect.top}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.removeProperty("--kx");
      el.style.removeProperty("--ky");
    });
  }

  document.querySelectorAll(FLAECHEN).forEach(lichtkante);
  document.addEventListener("raster:bereit", () => {
    document.querySelectorAll(FLAECHEN).forEach(lichtkante);
  });
})();
