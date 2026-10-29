(async () => {
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas || !window.WebGLRenderingContext) return;

  const wurzel = document.documentElement;
  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fein = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const istHeld = canvas.dataset.variante !== "feld";
  const platzhalter = istHeld ? document.querySelector(".hero__still") : null;
  const raster = document.getElementById("work-grid");
  const heldBereich = document.querySelector(".hero");

  const kerne = navigator.hardwareConcurrency || 4;
  const speicher = navigator.deviceMemory || 4;
  let stufe = fein ? 3 : speicher <= 2 || kerne <= 2 ? 1 : 2;

  let THREE, GLTFLoader, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, ShaderPass, partikel;
  try {
    [THREE, { GLTFLoader }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }, { ShaderPass }, partikel] = await Promise.all([
      import("./vendor/three.module.min.js"),
      import("./vendor/GLTFLoader.min.js"),
      import("./vendor/EffectComposer.min.js"),
      import("./vendor/RenderPass.min.js"),
      import("./vendor/UnrealBloomPass.min.js"),
      import("./vendor/OutputPass.min.js"),
      import("./vendor/ShaderPass.min.js"),
      import("./partikel.js"),
    ]);
  } catch (fehler) {
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: fein ? "high-performance" : "default", stencil: false });
  } catch (fehler) {
    return;
  }

  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const szene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  kamera.position.set(0, 0, 7);

  function lichtwand() {
    const raum = new THREE.Scene();
    raum.background = new THREE.Color(0x010102);
    const flaechen = [
      { farbe: 0x06d6a0, staerke: 3.2, pos: [-4.5, 0.6, 1.5], groesse: [1.4, 7] },
      { farbe: 0x4cb6e3, staerke: 2.8, pos: [4.5, -0.2, 1.2], groesse: [1.4, 7] },
      { farbe: 0xffffff, staerke: 4.0, pos: [0, 4.6, 1.5], groesse: [7, 1.1] },
      { farbe: 0xf0b45a, staerke: 1.6, pos: [0, -4.2, -2.5], groesse: [6, 1.6] },
      { farbe: 0x06d6a0, staerke: 2.0, pos: [0, 0.5, -5], groesse: [4, 4] },
    ];
    flaechen.forEach((f) => {
      const farbe = new THREE.Color(f.farbe).multiplyScalar(f.staerke);
      const platte = new THREE.Mesh(new THREE.PlaneGeometry(f.groesse[0], f.groesse[1]), new THREE.MeshBasicMaterial({ color: farbe, side: THREE.DoubleSide }));
      platte.position.set(...f.pos);
      platte.lookAt(0, 0, 0);
      raum.add(platte);
    });
    return raum;
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(lichtwand(), 0.02).texture;
  pmrem.dispose();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xe6e6ee,
    metalness: 1,
    roughness: 0.13,
    iridescence: 0.6,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [180, 620],
    clearcoat: stufe >= 2 ? 0.5 : 0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.15,
  });

  let band;
  try {
    const gltf = await new GLTFLoader().loadAsync(new URL("../modelle/band.glb", import.meta.url).href);
    gltf.scene.traverse((kind) => {
      if (!band && kind.isMesh) band = kind;
    });
  } catch (fehler) {
    return;
  }
  if (!band) return;

  band.removeFromParent();
  band.geometry.center();
  band.geometry.computeBoundingSphere();
  const radius = band.geometry.boundingSphere?.radius || 1;
  band.scale.setScalar(1.55 / radius);
  band.material = material;
  band.frustumCulled = false;
  const halter = new THREE.Group();
  halter.add(band);
  szene.add(halter);

  const hatWelle = Array.isArray(band.morphTargetInfluences) && band.morphTargetInfluences.length > 0;

  // Partikel aus der Oberfläche des Bands: so viele, wie das Gerät trägt
  const anzahl = stufe >= 3 ? 65536 : stufe === 2 ? 32768 : 12288;
  const { punkte, uniforms: teilchen } = partikel.partikelBauen(THREE, { geometrie: band.geometry, anzahl, rauschSkala: 2.6 / radius });
  partikel.zerfallAnbringen(material, teilchen);
  szene.add(punkte);

  const ziel = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? (stufe >= 2 ? 4 : 2) : 0 });
  const composer = new EffectComposer(renderer, ziel);
  composer.addPass(new RenderPass(szene, kamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), 0.32, 0.65, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const kino = new ShaderPass(partikel.kinoShader(THREE));
  composer.addPass(kino);
  let mitBloom = stufe >= 2;

  const sonde = document.createElement("div");
  sonde.style.cssText = "position:fixed;left:0;top:0;width:1px;height:100lvh;visibility:hidden;pointer-events:none";
  document.body.appendChild(sonde);

  let grenzeDichte = stufe >= 3 ? 1.5 : stufe === 2 ? 1.5 : 1;
  let breite = 0;
  let hoehe = 0;
  function groesseAnpassen(erzwingen = false) {
    const b = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
    const h = Math.max(1, sonde.offsetHeight || window.innerHeight);
    if (!erzwingen && b === breite && Math.abs(h - hoehe) < 120 && hoehe > 0) return;
    breite = b;
    hoehe = h;
    const dichte = Math.min(window.devicePixelRatio || 1, grenzeDichte);
    renderer.setPixelRatio(dichte);
    renderer.setSize(b, h, false);
    composer.setPixelRatio(dichte);
    composer.setSize(b, h);
    bloom.resolution.set(b * dichte * 0.5, h * dichte * 0.5);
    kino.uniforms.uAufloesung.value.set(b * dichte, h * dichte);
    kamera.aspect = b / h;
    kamera.updateProjectionMatrix();
    teilchen.uSkala.value = (h * dichte) / (2 * Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2)));
    const halbH = kamera.position.z * Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2));
    // Startseite breit: Rahmen um den Abschluss-Text. Schmal: an den Bildschirmrändern entlang.
    // Unterseiten: kleiner rechts, als Abschluss neben dem Inhalt
    const schmal = kamera.aspect < 0.8;
    const halbB = halbH * kamera.aspect;
    if (!istHeld) {
      teilchen.uZeichenGroesse.value = schmal ? halbB * 0.32 : halbH * 0.42;
      teilchen.uZeichenOrt.value.set(schmal ? halbB * 0.55 : halbB * 0.62, schmal ? halbH * 0.62 : 0, 0);
    } else {
      teilchen.uZeichenGroesse.value = schmal ? Math.min(halbH * 0.8, halbB * 1.15) : Math.min(halbH * 0.8, halbB * 0.78);
      teilchen.uZeichenOrt.value.set(0, halbH * (schmal ? 0.19 : 0.06), 0);
    }
  }
  groesseAnpassen(true);
  window.addEventListener("resize", () => groesseAnpassen(), { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(() => groesseAnpassen(true), 250), { passive: true });

  let seite = 0;
  let held = 0;
  let letzteY = window.scrollY;
  let tempo = 0;
  function scrollLesen() {
    const strecke = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    seite = Math.min(Math.max(window.scrollY / strecke, 0), 1);
    held = Math.min(Math.max(window.scrollY / Math.max(window.innerHeight, 1), 0), 1);
  }
  scrollLesen();
  window.addEventListener("scroll", scrollLesen, { passive: true });
  window.addEventListener("resize", scrollLesen, { passive: true });

  // Zeiger in Bildschirmkoordinaten für die Partikel; auch Wischen auf dem Telefon zählt
  const zeigerNdc = new THREE.Vector2(9, 9);
  let zuletztBewegt = -1e9;
  window.addEventListener("pointermove", (ev) => {
    zeigerNdc.set((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1);
    zuletztBewegt = performance.now();
  }, { passive: true });
  const strahl = new THREE.Vector3();
  function zeigerInDerWelt(ziel) {
    strahl.set(zeigerNdc.x, zeigerNdc.y, 0.5).unproject(kamera).sub(kamera.position).normalize();
    const t = -kamera.position.z / (strahl.z || -1);
    ziel.copy(kamera.position).addScaledVector(strahl, t);
  }

  let zeigerX = 0;
  let zeigerY = 0;
  if (fein) {
    window.addEventListener("pointermove", (ev) => {
      zeigerX = ev.clientX / window.innerWidth - 0.5;
      zeigerY = ev.clientY / window.innerHeight - 0.5;
    });
    document.addEventListener("pointerleave", () => {
      zeigerX = 0;
      zeigerY = 0;
    });
  }
  const zug = { aktiv: false, x0: 0, y0: 0, dx: 0, dy: 0, wx: 0, wy: 0, vw: 0 };
  if (heldBereich && !reduziert) {
    heldBereich.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest("a, button")) return;
      zug.aktiv = true;
      zug.x0 = ev.clientX;
      zug.y0 = ev.clientY;
    });
    window.addEventListener("pointermove", (ev) => {
      if (!zug.aktiv) return;
      zug.dx = (ev.clientX - zug.x0) / window.innerWidth;
      zug.dy = (ev.clientY - zug.y0) / window.innerHeight;
    });
    const los = () => {
      if (!zug.aktiv) return;
      zug.aktiv = false;
      zug.vw += zug.dx * 6;
      zug.wy += zug.dx * 3.2;
      zug.dx = 0;
      zug.dy = 0;
    };
    window.addEventListener("pointerup", los);
    window.addEventListener("pointercancel", los);
  }

  const weich = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };

  const ist = { x: 0, y: 0, s: 1, w: 0, rx: 0, ry: 0, zx: 0, zy: 0, ox: 0, oy: 0, dimm: 0, auf: 0, zeichen: 0, kraft: 0, tempo: 0 };

  // Zerfall beim Verlassen des Startbilds, Logo am Ende der Seite. Kurze Seiten behalten das Band
  function verlaufLesen() {
    const vh = Math.max(window.innerHeight, 1);
    const lang = document.documentElement.scrollHeight - vh > vh * 1.5;
    const gescrollt = window.scrollY / vh;
    if (!lang) return { auf: 0, zeichen: 0 };
    return {
      auf: istHeld ? weich(0.35, 1.7, gescrollt) : weich(0.3, 1.5, gescrollt),
      zeichen: weich(0.86, 0.985, seite),
    };
  }

  function ankerHochformat() {
    if (!platzhalter) return null;
    const r = platzhalter.getBoundingClientRect();
    if (!r.width) return null;
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height, sicht: r.bottom / Math.max(window.innerHeight, 1) };
  }

  let imFluss = false;
  const flussPruefen = () => {
    imFluss = !!platzhalter && getComputedStyle(platzhalter).position !== "absolute";
  };
  flussPruefen();
  window.addEventListener("resize", flussPruefen, { passive: true });

  function ziele(sek) {
    const hoch = istHeld ? imFluss : kamera.aspect < 0.85;
    const rechts = Math.min(kamera.aspect * 0.95, 2.2);
    const unruhe = Math.min(Math.abs(tempo) / 2600, 0.45);
    if (!istHeld || (hoch && !platzhalter)) {
      return {
        x: hoch ? 0 : rechts * 1.05,
        y: hoch ? 0.6 - seite * 1.2 : 0.2 - seite * 0.6,
        s: hoch ? 0.7 : 0.78,
        w: 0.25 + seite * 0.45 + unruhe,
        rx: 0.55 + seite * 1.4,
        ry: sek * 0.08 + seite * 2.4,
        ox: 0,
        oy: 0,
      };
    }
    if (hoch) {
      const a = ankerHochformat();
      const W = breite || window.innerWidth;
      const H = hoehe || window.innerHeight;
      const hr = heldBereich ? heldBereich.getBoundingClientRect() : { bottom: 0 };
      const imBild = a ? weich(0.08, 0.5, hr.bottom / Math.max(window.innerHeight, 1)) : 0;
      const zielGroesse = a ? (a.h * 1.12) / H : 0.5;
      const sichtbarH = 2 * kamera.position.z * Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2));
      const cy = a ? a.cy : H / 2;
      const sHeld = (zielGroesse * sichtbarH) / 3.1;
      const ox = a ? (W / 2 - a.cx) * imBild : 0;
      const oy = a ? (H / 2 - cy) * imBild : 0;
      return {
        x: 0,
        y: 0,
        s: sHeld * imBild + 0.95 * (1 - imBild),
        w: weich(0.04, 0.55, seite) * 0.85 + Math.sin(sek * 0.5) * 0.03 + unruhe,
        rx: 0.6 + seite * 2.6,
        ry: sek * 0.12 + seite * 3.6,
        ox,
        oy,
      };
    }
    const mitte = weich(0, 1, held);
    return {
      x: rechts * (1 - mitte * 0.2) - weich(0.5, 1, seite) * rechts * 0.5,
      y: -mitte * 0.25 - weich(0.86, 1, seite) * 0.9,
      s: 1 + mitte * 0.18 - weich(0.6, 1, seite) * 0.25,
      w: weich(0.04, 0.55, seite) * 0.85 + Math.sin(sek * 0.5) * 0.03 + unruhe,
      rx: 0.6 + seite * 2.6,
      ry: sek * 0.1 + seite * 3.6,
      ox: 0,
      oy: 0,
    };
  }

  function dimmenLesen() {
    if (!raster) return 0;
    const r = raster.getBoundingClientRect();
    const h = window.innerHeight || 1;
    const ueberlappung = Math.min(r.bottom, h) - Math.max(r.top, 0);
    return Math.min(Math.max(ueberlappung / (h * 0.6), 0), 1);
  }

  let kontextWeg = false;
  canvas.addEventListener("webglcontextlost", (ev) => {
    ev.preventDefault();
    kontextWeg = true;
    canvas.classList.remove("ist-bereit");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    kontextWeg = false;
    groesseAnpassen(true);
    canvas.classList.add("ist-bereit");
    requestAnimationFrame(schleife);
  });

  function bild(sek, folgen, dt) {
    const z = ziele(sek);
    for (const k of ["x", "y", "s", "w", "rx", "ry", "ox", "oy"]) ist[k] += (z[k] - ist[k]) * folgen;
    ist.zx += (zeigerX - ist.zx) * 0.05;
    ist.zy += (zeigerY - ist.zy) * 0.05;
    ist.dimm += (dimmenLesen() - ist.dimm) * 0.08;

    zug.vw *= Math.exp(-dt * 2.2);
    zug.wy += zug.vw * dt;
    zug.wy *= Math.exp(-dt * 1.6);
    const zugY = zug.wy + (zug.aktiv ? zug.dx * 3.2 : 0);
    const zugX = zug.aktiv ? zug.dy * 1.4 : 0;

    halter.position.set(ist.x, ist.y, 0);
    halter.scale.setScalar(ist.s);
    halter.rotation.set(ist.rx + ist.zy * 0.5 + zugX, ist.ry + ist.zx * 0.7 + zugY, 0.22);
    const welle = Math.max(0, Math.min(ist.w, 1));
    if (hatWelle) band.morphTargetInfluences[0] = welle;

    const verlauf = verlaufLesen();
    ist.auf += (verlauf.auf - ist.auf) * folgen;
    ist.zeichen += (verlauf.zeichen - ist.zeichen) * folgen * 0.7;
    const bewegt = performance.now() - zuletztBewegt < 1400;
    ist.kraft += ((bewegt ? 1 : 0) - ist.kraft) * Math.min(dt * 3, 1);
    ist.tempo += (Math.max(-1, Math.min(1, tempo / 2600)) - ist.tempo) * Math.min(dt * 5, 1);
    band.visible = ist.auf < 0.995;
    band.updateWorldMatrix(true, false);
    teilchen.uBand.value.copy(band.matrixWorld);
    teilchen.uWelle.value = hatWelle ? welle : 0;
    teilchen.uAuf.value = ist.auf;
    teilchen.uZeichen.value = ist.zeichen;
    teilchen.uZeit.value = sek;
    teilchen.uTempo.value = ist.tempo;
    teilchen.uZeigerKraft.value = ist.kraft;
    teilchen.uDeckkraft.value = (istHeld ? 1 : 0.7) * (kamera.aspect < 0.8 ? 1 - ist.zeichen * 0.4 : 1);
    kino.uniforms.uZeit.value = sek;
    kino.uniforms.uTempo.value = Math.abs(ist.tempo);

    kamera.position.x = ist.zx * 0.35;
    kamera.position.y = -ist.zy * 0.25;
    kamera.lookAt(0, 0, 0);
    if (Math.abs(ist.ox) > 0.5 || Math.abs(ist.oy) > 0.5) {
      kamera.setViewOffset(breite, hoehe, ist.ox, ist.oy, breite, hoehe);
    } else if (kamera.view && kamera.view.enabled) {
      kamera.clearViewOffset();
    }
    canvas.style.setProperty("--dimm", ist.dimm.toFixed(3));
    zeigerInDerWelt(teilchen.uZeiger.value);

    if (mitBloom) composer.render();
    else renderer.render(szene, kamera);
  }

  function bereitMelden() {
    canvas.classList.add("ist-bereit");
    wurzel.classList.add("szene-laeuft");
    document.dispatchEvent(new CustomEvent("szene:bereit"));
  }

  if (reduziert) {
    bild(0, 1, 0.016);
    bereitMelden();
    window.addEventListener("scroll", () => bild(0, 1, 0.016), { passive: true });
    return;
  }

  let proben = [];
  let warten = 2;
  function waechter(dt) {
    warten -= dt;
    if (warten > 0) return;
    proben.push(dt);
    if (proben.length < 75) return;
    const mittel = proben.reduce((a, b) => a + b, 0) / proben.length;
    proben = [];
    if (mittel < 1 / 40) return;
    if (grenzeDichte > 1) {
      grenzeDichte = Math.max(1, grenzeDichte - 0.25);
      groesseAnpassen(true);
    } else if (mitBloom) {
      mitBloom = false;
    } else if (punkte.geometry.drawRange.count > 8192) {
      punkte.geometry.setDrawRange(0, Math.floor(Math.min(punkte.geometry.drawRange.count, anzahl) / 2));
    }
    warten = 1;
  }

  let vorher = 0;
  let sek = 0;
  function schleife(zeit) {
    if (kontextWeg) return;
    requestAnimationFrame(schleife);
    const dt = vorher ? Math.min((zeit - vorher) / 1000, 0.1) : 0.016;
    vorher = zeit;
    if (document.hidden) return;
    sek += dt;
    const y = window.scrollY;
    const roh = (y - letzteY) / Math.max(dt, 0.001);
    letzteY = y;
    tempo += (roh - tempo) * Math.min(dt * 6, 1);
    waechter(dt);
    try {
      bild(sek, 1 - Math.exp(-dt * 4.2), dt);
    } catch (fehler) {
    }
  }

  bild(0, 1, 0.016);
  bereitMelden();
  requestAnimationFrame(schleife);
})();
