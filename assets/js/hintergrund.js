(async () => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const canvas = document.querySelector(".hero__canvas");
  if (!canvas || !window.WebGLRenderingContext) return;

  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const istHeld = canvas.dataset.variante !== "feld";

  let THREE, GLTFLoader, EffectComposer, RenderPass, UnrealBloomPass, OutputPass;
  try {
    [THREE, { GLTFLoader }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] =
      await Promise.all([
        import("./vendor/three.module.min.js"),
        import("./vendor/GLTFLoader.min.js"),
        import("./vendor/EffectComposer.min.js"),
        import("./vendor/RenderPass.min.js"),
        import("./vendor/UnrealBloomPass.min.js"),
        import("./vendor/OutputPass.min.js"),
      ]);
  } catch (fehler) {
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
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
      { farbe: 0xff3d7f, staerke: 3.2, pos: [-4.5, 0.6, 1.5], groesse: [1.4, 7] },
      { farbe: 0x38b6ff, staerke: 3.0, pos: [4.5, -0.2, 1.2], groesse: [1.4, 7] },
      { farbe: 0xffffff, staerke: 4.0, pos: [0, 4.6, 1.5], groesse: [7, 1.1] },
      { farbe: 0xff7a3d, staerke: 2.4, pos: [0, -4.2, -2.5], groesse: [6, 1.6] },
      { farbe: 0x9b5cff, staerke: 2.2, pos: [0, 0.5, -5], groesse: [4, 4] },
    ];
    flaechen.forEach((f) => {
      const farbe = new THREE.Color(f.farbe).multiplyScalar(f.staerke);
      const platte = new THREE.Mesh(
        new THREE.PlaneGeometry(f.groesse[0], f.groesse[1]),
        new THREE.MeshBasicMaterial({ color: farbe, side: THREE.DoubleSide })
      );
      platte.position.set(...f.pos);
      platte.lookAt(0, 0, 0);
      raum.add(platte);
    });
    return raum;
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(lichtwand(), 0.02).texture;

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xe6e6ee,
    metalness: 1,
    roughness: 0.13,
    iridescence: 0.6,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [180, 620],
    clearcoat: 0.5,
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
  band.scale.setScalar(1.55 / (band.geometry.boundingSphere?.radius || 1));
  band.material = material;
  const halter = new THREE.Group();
  halter.add(band);
  szene.add(halter);

  const hatWelle = Array.isArray(band.morphTargetInfluences) && band.morphTargetInfluences.length > 0;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(szene, kamera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.65, 0.78));
  composer.addPass(new OutputPass());

  function groesseAnpassen() {
    const b = window.innerWidth;
    const h = Math.max(window.innerHeight, 1);
    const dichte = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dichte);
    renderer.setSize(b, h, false);
    composer.setPixelRatio(dichte);
    composer.setSize(b, h);
    kamera.aspect = b / h;
    kamera.updateProjectionMatrix();
  }
  groesseAnpassen();
  window.addEventListener("resize", groesseAnpassen, { passive: true });

  let seite = 0;
  let held = 0;
  function scrollLesen() {
    const strecke = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    seite = Math.min(Math.max(window.scrollY / strecke, 0), 1);
    held = Math.min(Math.max(window.scrollY / Math.max(window.innerHeight, 1), 0), 1);
  }
  scrollLesen();
  window.addEventListener("scroll", scrollLesen, { passive: true });
  window.addEventListener("resize", scrollLesen, { passive: true });

  let zeigerX = 0;
  let zeigerY = 0;
  window.addEventListener("pointermove", (ev) => {
    zeigerX = ev.clientX / window.innerWidth - 0.5;
    zeigerY = ev.clientY / window.innerHeight - 0.5;
  });
  document.addEventListener("pointerleave", () => {
    zeigerX = 0;
    zeigerY = 0;
  });

  const weich = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };

  const ist = { x: 0, y: 0, s: 1, w: 0, rx: 0, ry: 0, zx: 0, zy: 0 };

  function ziele(sek) {
    const rechts = Math.min((window.innerWidth / Math.max(window.innerHeight, 1)) * 0.95, 2.2);
    if (!istHeld) {
      return {
        x: rechts * 1.05,
        y: 0.2 - seite * 0.6,
        s: 0.78,
        w: 0.25 + seite * 0.45,
        rx: 0.55 + seite * 1.4,
        ry: sek * 0.08 + seite * 2.4,
      };
    }
    const mitte = weich(0, 1, held);
    return {
      x: rechts * (1 - mitte * 0.2) - weich(0.5, 1, seite) * rechts * 0.5,
      y: -mitte * 0.25 - weich(0.86, 1, seite) * 0.9,
      s: 1 + mitte * 0.18 - weich(0.6, 1, seite) * 0.25,
      w: weich(0.04, 0.55, seite) * 0.85 + Math.sin(sek * 0.5) * 0.03,
      rx: 0.6 + seite * 2.6,
      ry: sek * 0.1 + seite * 3.6,
    };
  }

  let kontextWeg = false;
  canvas.addEventListener("webglcontextlost", (ev) => {
    ev.preventDefault();
    kontextWeg = true;
    canvas.classList.remove("ist-bereit");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    kontextWeg = false;
    groesseAnpassen();
    canvas.classList.add("ist-bereit");
    requestAnimationFrame(schleife);
  });

  function bild(sek, folgen) {
    const z = ziele(sek);
    ist.x += (z.x - ist.x) * folgen;
    ist.y += (z.y - ist.y) * folgen;
    ist.s += (z.s - ist.s) * folgen;
    ist.w += (z.w - ist.w) * folgen;
    ist.rx += (z.rx - ist.rx) * folgen;
    ist.ry += (z.ry - ist.ry) * folgen;
    ist.zx += (zeigerX - ist.zx) * 0.05;
    ist.zy += (zeigerY - ist.zy) * 0.05;

    halter.position.set(ist.x, ist.y, 0);
    halter.scale.setScalar(ist.s);
    halter.rotation.set(ist.rx + ist.zy * 0.5, ist.ry + ist.zx * 0.7, 0.22);
    if (hatWelle) band.morphTargetInfluences[0] = Math.max(0, Math.min(ist.w, 1));

    kamera.position.x = ist.zx * 0.35;
    kamera.position.y = -ist.zy * 0.25;
    kamera.lookAt(0, 0, 0);

    composer.render();
  }

  function bereitMelden() {
    canvas.classList.add("ist-bereit");
    document.documentElement.classList.add("szene-laeuft");
    document.dispatchEvent(new CustomEvent("szene:bereit"));
  }

  if (reduziert) {
    bild(0, 1);
    bereitMelden();
    window.addEventListener("scroll", () => bild(0, 1), { passive: true });
    return;
  }

  let erstes = true;
  function schleife(zeit) {
    if (kontextWeg) return;
    try {
      bild(zeit / 1000, erstes ? 1 : 0.07);
    } catch (fehler) {
      return;
    }
    if (erstes) {
      erstes = false;
      bereitMelden();
    }
    requestAnimationFrame(schleife);
  }

  bild(0, 1);
  bereitMelden();
  erstes = false;
  requestAnimationFrame(schleife);
})();
