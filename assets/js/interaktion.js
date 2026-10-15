(() => {
  "use strict";

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  function gluehfleckVerfolgen(el) {
    el.addEventListener("pointermove", (ev) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${ev.clientX - rect.left}px`);
      el.style.setProperty("--my", `${ev.clientY - rect.top}px`);
    });
  }

  document.querySelectorAll(".projekt-karte__medien").forEach(gluehfleckVerfolgen);

  function lichtkante(el) {
    if (el.dataset.lichtkante) return;
    el.dataset.lichtkante = "1";
    el.addEventListener("pointermove", (ev) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--kx", `${ev.clientX - rect.left}px`);
      el.style.setProperty("--ky", `${ev.clientY - rect.top}px`);
    });
  }

  document.querySelectorAll(".kachel, .projekt-karte").forEach(lichtkante);
  document.addEventListener("raster:bereit", () => {
    document.querySelectorAll(".projekt-karte").forEach(lichtkante);
  });

  function magnetisieren(el) {
    const staerke = 14;
    el.addEventListener("pointermove", (ev) => {
      const rect = el.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width - 0.5;
      const y = (ev.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translate(${(x * staerke).toFixed(1)}px, ${(y * staerke).toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  }

  document.querySelectorAll(".knopf").forEach(magnetisieren);

  function neigen(karte) {
    const medien = karte.querySelector(".projekt-karte__medien");
    if (!medien) return;

    const MAX_GRAD = 3.2;
    let imBild = false;

    karte.addEventListener("pointerenter", () => {
      imBild = true;
      karte.style.transition = "transform 120ms ease-out";
      if (medien) medien.style.transition = "transform 120ms ease-out";
    });

    karte.addEventListener("pointermove", (ev) => {
      if (!imBild) return;
      const rect = karte.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width - 0.5;
      const y = (ev.clientY - rect.top) / rect.height - 0.5;

      karte.style.transform =
        `perspective(1400px) rotateX(${(-y * MAX_GRAD).toFixed(2)}deg) ` +
        `rotateY(${(x * MAX_GRAD).toFixed(2)}deg)`;
      medien.style.transform = `translate3d(${(x * 14).toFixed(1)}px, ${(y * 10).toFixed(1)}px, 0)`;
    });

    karte.addEventListener("pointerleave", () => {
      imBild = false;
      karte.style.transition = "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      medien.style.transition = "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      karte.style.transform = "";
      medien.style.transform = "";
    });
  }

  function kartenBinden() {
    document.querySelectorAll(".projekt-karte:not([data-geneigt])").forEach((karte) => {
      karte.setAttribute("data-geneigt", "");
      neigen(karte);
    });
  }

  kartenBinden();
  document.addEventListener("raster:bereit", () => {
    kartenBinden();
    document.querySelectorAll(".projekt-karte__medien").forEach(gluehfleckVerfolgen);
  });
})();
