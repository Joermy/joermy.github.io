(async () => {
  const canvas = document.querySelector("canvas[data-szene]");
  if (!canvas || !window.WebGLRenderingContext) return;

  const wurzel = document.documentElement;
  const art = canvas.dataset.szene;
  const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fein = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const kerne = navigator.hardwareConcurrency || 4;
  const speicher = navigator.deviceMemory || 4;
  const stufe = fein ? 3 : speicher <= 2 || kerne <= 2 ? 1 : 2;

  let THREE, GLTFLoader, EffectComposer, RenderPass, UnrealBloomPass, OutputPass;
  try {
    [THREE, { GLTFLoader }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
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
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: fein ? "high-performance" : "default", stencil: false });
  } catch (fehler) {
    return;
  }

  // Schwarzer Grund, das Canvas mischt sich per mix-blend-mode: screen in die Seite
  const AKZENT = new THREE.Color(0x06d6a0);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.NoToneMapping;

  const szene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  // Lichtwand fürs Spiegeln: grüne und weiße Flächen wie die Leuchtkanten der Panels
  function lichtwand() {
    const raum = new THREE.Scene();
    raum.background = new THREE.Color(0x020303);
    [
      { farbe: 0x06d6a0, staerke: 3.2, pos: [-4.5, 0.8, 1.5], groesse: [1.4, 7] },
      { farbe: 0x06d6a0, staerke: 2.2, pos: [4.5, -0.4, 1.2], groesse: [1.4, 7] },
      { farbe: 0xffffff, staerke: 3.4, pos: [0, 4.6, 1.5], groesse: [7, 1.1] },
      { farbe: 0x4cb6e3, staerke: 1.4, pos: [0, -4.2, -2.5], groesse: [6, 1.6] },
    ].forEach((f) => {
      const farbe = new THREE.Color(f.farbe).multiplyScalar(f.staerke);
      const platte = new THREE.Mesh(new THREE.PlaneGeometry(...f.groesse), new THREE.MeshBasicMaterial({ color: farbe, side: THREE.DoubleSide }));
      platte.position.set(...f.pos);
      platte.lookAt(0, 0, 0);
      raum.add(platte);
    });
    return raum;
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(lichtwand(), 0.02).texture;
  pmrem.dispose();

  let gltf;
  try {
    const datei = art === "kern" ? "kern.glb" : "hex.glb";
    gltf = await new GLTFLoader().loadAsync(new URL(`../modelle/${datei}`, import.meta.url).href);
  } catch (fehler) {
    return;
  }
  const teile = {};
  gltf.scene.traverse((kind) => {
    if (kind.isMesh) teile[kind.name] = kind;
  });

  const halter = new THREE.Group();
  szene.add(halter);

  function weicherPunkt() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const verlauf = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    verlauf.addColorStop(0, "rgba(255,255,255,1)");
    verlauf.addColorStop(0.35, "rgba(255,255,255,0.7)");
    verlauf.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = verlauf;
    g.fillRect(0, 0, 64, 64);
    const textur = new THREE.CanvasTexture(c);
    textur.colorSpace = THREE.SRGBColorSpace;
    return textur;
  }

  const zustand = { fokus: AKZENT.clone(), ziel: AKZENT.clone(), puls: 0 };
  let aufbauen;

  if (art === "kern") {
    const kern = new THREE.Group();
    const ring = new THREE.Group();
    halter.add(kern, ring);

    const gitterMat = new THREE.MeshStandardMaterial({ color: AKZENT, emissive: AKZENT, emissiveIntensity: 0.85, metalness: 0.3, roughness: 0.4 });
    const knotenMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb4ffe9) });
    const innenMat = new THREE.MeshBasicMaterial({ color: AKZENT, transparent: true, opacity: 0.38, depthWrite: false });
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x14382d, metalness: 1, roughness: 0.3, emissive: AKZENT, emissiveIntensity: 0.16, envMapIntensity: 1.2 });
    const spurMat = new THREE.MeshBasicMaterial({ color: AKZENT, transparent: true, opacity: 0.55 });

    const zuordnen = (name, mat, ziel) => {
      const teil = teile[name];
      if (!teil) return null;
      teil.removeFromParent();
      teil.material = mat;
      teil.position.set(0, 0, 0);
      ziel.add(teil);
      return teil;
    };
    zuordnen("Gitter", gitterMat, kern);
    zuordnen("Knoten", knotenMat, kern);
    const innen = zuordnen("Innen", innenMat, kern);
    zuordnen("Ring", ringMat, ring);
    zuordnen("Spur", spurMat, ring);

    // Partikelwolke im Inneren, wie der Wissensspeicher im Agentic OS
    const anzahl = stufe >= 3 ? 1600 : stufe === 2 ? 1100 : 700;
    const lagen = new Float32Array(anzahl * 3);
    const farben = new Float32Array(anzahl * 3);
    const bunt = [0xf0b45a, 0xf2448f, 0x4cb6e3, 0xa274f2].map((c) => new THREE.Color(c));
    const gauss = () => {
      let u = 0;
      let v = 0;
      while (!u) u = Math.random();
      while (!v) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    for (let i = 0; i < anzahl; i++) {
      const richtung = new THREE.Vector3(gauss(), gauss(), gauss()).normalize();
      const r = Math.min(Math.abs(gauss()) * 0.3, 0.86);
      richtung.multiplyScalar(r);
      lagen.set([richtung.x, richtung.y, richtung.z], i * 3);
      const farbe = Math.random() < 0.86 ? AKZENT.clone().lerp(new THREE.Color(0xffffff), Math.random() * 0.35) : bunt[i % bunt.length];
      farben.set([farbe.r, farbe.g, farbe.b], i * 3);
    }
    const wolkeGeo = new THREE.BufferGeometry();
    wolkeGeo.setAttribute("position", new THREE.BufferAttribute(lagen, 3));
    wolkeGeo.setAttribute("color", new THREE.BufferAttribute(farben, 3));
    const punktTextur = weicherPunkt();
    const wolkeMat = new THREE.PointsMaterial({ size: 0.05, map: punktTextur, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const wolke = new THREE.Points(wolkeGeo, wolkeMat);
    kern.add(wolke);

    const glutMat = new THREE.SpriteMaterial({ map: punktTextur, color: AKZENT, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending });
    const glut = new THREE.Sprite(glutMat);
    glut.scale.setScalar(1.3);
    halter.add(glut);

    ring.rotation.set(0.46, 0, 0.1);
    halter.rotation.z = 0.06;

    aufbauen = (sek, dt, zeiger) => {
      kern.rotation.y = sek * 0.12;
      kern.rotation.x = 0.32 + Math.sin(sek * 0.21) * 0.05;
      if (innen) {
        innen.rotation.y = -sek * 0.3;
        innen.rotation.z = sek * 0.13;
      }
      wolke.rotation.y = sek * 0.05;
      ring.children.forEach((teil) => {
        teil.rotation.y = sek * 0.06;
      });
      halter.rotation.x += (zeiger.y * 0.22 - halter.rotation.x) * Math.min(dt * 3, 1);
      halter.rotation.y += (zeiger.x * 0.32 - halter.rotation.y) * Math.min(dt * 3, 1);

      zustand.fokus.lerp(zustand.ziel, Math.min(dt * 5, 1));
      gitterMat.color.copy(zustand.fokus);
      gitterMat.emissive.copy(zustand.fokus);
      innenMat.color.copy(zustand.fokus);
      glutMat.color.copy(zustand.fokus);
      zustand.puls *= Math.exp(-dt * 2.5);
      gitterMat.emissiveIntensity = 0.85 + zustand.puls * 0.9;
      glutMat.opacity = 0.12 + zustand.puls * 0.14;
      wolkeMat.size = 0.05 + zustand.puls * 0.025;
    };

    document.addEventListener("orbit:fokus", (ev) => {
      const farbe = ev.detail && ev.detail.farbe;
      zustand.ziel.set(farbe || "#06d6a0");
      if (farbe) zustand.puls = 1;
      if (reduziert) einzelbild();
    });
  } else {
    const huelleMat = new THREE.MeshPhysicalMaterial({ color: AKZENT, metalness: 0.9, roughness: 0.22, emissive: AKZENT, emissiveIntensity: 0.14, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.2 });
    const kernMat = new THREE.MeshStandardMaterial({ color: AKZENT, emissive: AKZENT, emissiveIntensity: 0.95, metalness: 0.2, roughness: 0.35 });
    const huelle = teile.Huelle;
    const kernTeil = teile.HexKern;
    [huelle, kernTeil].forEach((teil) => {
      if (!teil) return;
      teil.removeFromParent();
      halter.add(teil);
    });
    if (huelle) huelle.material = huelleMat;
    if (kernTeil) kernTeil.material = kernMat;

    aufbauen = (sek, dt, zeiger, scroll) => {
      const schwung = Math.sin(sek * 0.35) * 0.45 + scroll * 2.4;
      if (huelle) huelle.rotation.set(zeiger.y * 0.3 + 0.18, schwung + zeiger.x * 0.4, 0);
      if (kernTeil) kernTeil.rotation.set(zeiger.y * 0.3 + 0.18, -schwung * 0.6 + zeiger.x * 0.4, 0);
      halter.position.y = 0.25 - scroll * 0.9 + Math.sin(sek * 0.6) * 0.04;
    };
  }

  const ziel = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? (stufe >= 2 ? 4 : 2) : 0 });
  const composer = new EffectComposer(renderer, ziel);
  composer.addPass(new RenderPass(szene, kamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(4, 4), art === "kern" ? 0.62 : 0.5, 0.42, art === "kern" ? 0.2 : 0.22);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let mitBloom = stufe >= 2;

  let grenzeDichte = stufe >= 2 ? 1.75 : 1;
  let breite = 0;
  let hoehe = 0;

  function lageLogo() {
    // Logo sitzt rechts neben dem Inhalt, auf schmalen Schirmen oben rechts und kleiner
    const schmal = breite < 900;
    const sichtH = 2 * kamera.position.z * Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2));
    const sichtB = sichtH * kamera.aspect;
    const groesse = schmal ? 0.16 : 0.24;
    halter.scale.setScalar((sichtH * groesse) / 2);
    halter.position.x = sichtB / 2 - sichtB * (schmal ? 0.16 : 0.17);
  }

  function groesseAnpassen(erzwingen = false) {
    const rect = canvas.getBoundingClientRect();
    const b = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (!erzwingen && b === breite && Math.abs(h - hoehe) < (art === "kern" ? 2 : 120)) return;
    breite = b;
    hoehe = h;
    const dichte = Math.min(window.devicePixelRatio || 1, grenzeDichte);
    renderer.setPixelRatio(dichte);
    renderer.setSize(b, h, false);
    composer.setPixelRatio(dichte);
    composer.setSize(b, h);
    bloom.resolution.set(b * dichte * 0.5, h * dichte * 0.5);
    kamera.aspect = b / h;
    if (art === "kern") {
      // Kugelradius 1 soll 22 % der Kantenlänge einnehmen
      kamera.position.set(0, 0, 1 / (0.44 * Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2))));
    } else {
      kamera.position.set(0, 0, 9);
      lageLogo();
    }
    kamera.updateProjectionMatrix();
  }
  groesseAnpassen(true);
  if ("ResizeObserver" in window) new ResizeObserver(() => groesseAnpassen()).observe(canvas);
  else window.addEventListener("resize", () => groesseAnpassen(), { passive: true });

  const zeiger = { x: 0, y: 0, zx: 0, zy: 0 };
  if (fein && !reduziert) {
    window.addEventListener("pointermove", (ev) => {
      zeiger.zx = ev.clientX / window.innerWidth - 0.5;
      zeiger.zy = ev.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    document.addEventListener("pointerleave", () => {
      zeiger.zx = 0;
      zeiger.zy = 0;
    });
  }

  let scroll = 0;
  const scrollLesen = () => {
    const strecke = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    scroll = Math.min(Math.max(window.scrollY / strecke, 0), 1);
  };
  scrollLesen();
  window.addEventListener("scroll", scrollLesen, { passive: true });

  let sichtbar = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((eintraege) => {
      sichtbar = eintraege[0].isIntersecting;
    }).observe(canvas);
  }

  let kontextWeg = false;
  canvas.addEventListener("webglcontextlost", (ev) => {
    ev.preventDefault();
    kontextWeg = true;
    canvas.classList.remove("ist-bereit");
    wurzel.classList.remove("kern-laeuft");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    kontextWeg = false;
    groesseAnpassen(true);
    bereitMelden();
    requestAnimationFrame(schleife);
  });

  function bild(sek, dt) {
    zeiger.x += (zeiger.zx - zeiger.x) * Math.min(dt * 4, 1);
    zeiger.y += (zeiger.zy - zeiger.y) * Math.min(dt * 4, 1);
    aufbauen(sek, dt, zeiger, scroll);
    if (mitBloom) composer.render();
    else renderer.render(szene, kamera);
  }

  function bereitMelden() {
    canvas.classList.add("ist-bereit");
    if (art === "kern") wurzel.classList.add("kern-laeuft");
  }

  function einzelbild() {
    bild(8, 0.016);
  }

  if (reduziert) {
    einzelbild();
    bereitMelden();
    if (art !== "kern") window.addEventListener("scroll", einzelbild, { passive: true });
    return;
  }

  // Wächter: fällt die Bildrate, sinken erst Auflösung, dann Glühen
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
    }
    warten = 1;
  }

  let vorher = 0;
  let sek = 4;
  function schleife(zeit) {
    if (kontextWeg) return;
    requestAnimationFrame(schleife);
    const dt = vorher ? Math.min((zeit - vorher) / 1000, 0.1) : 0.016;
    vorher = zeit;
    if (document.hidden || !sichtbar) return;
    sek += dt;
    waechter(dt);
    try {
      bild(sek, dt);
    } catch (fehler) {
    }
  }

  bild(sek, 0.016);
  bereitMelden();
  requestAnimationFrame(schleife);
})();
