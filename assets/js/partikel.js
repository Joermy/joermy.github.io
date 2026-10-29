// Partikel, Zerfall des Bands und Kino-Finish für die 3D-Szene in hintergrund.js.
// Alles läuft im Shader ohne Simulationspuffer, damit es auch auf schwachen Geräten trägt.

const RAUSCHEN = /* glsl */ `
float zufall3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float rauschen(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = zufall3(i);
  float b = zufall3(i + vec3(1.0, 0.0, 0.0));
  float c = zufall3(i + vec3(0.0, 1.0, 0.0));
  float d = zufall3(i + vec3(1.0, 1.0, 0.0));
  float e = zufall3(i + vec3(0.0, 0.0, 1.0));
  float g = zufall3(i + vec3(1.0, 0.0, 1.0));
  float h = zufall3(i + vec3(0.0, 1.0, 1.0));
  float k = zufall3(i + vec3(1.0, 1.0, 1.0));
  return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
}

float schichten(vec3 p) {
  return rauschen(p) * 0.6 + rauschen(p * 2.03 + 7.1) * 0.28 + rauschen(p * 4.07 + 3.3) * 0.12;
}

vec3 stroemung(vec3 p) {
  return vec3(rauschen(p), rauschen(p + 31.41), rauschen(p + 71.93)) * 2.0 - 1.0;
}

// Wo das Band zerfällt: dieselbe Rechnung im Band und in den Partikeln
float schwelleAus(float auf) {
  return mix(0.06, 0.94, auf);
}
`;

// Punkte gleichmäßig nach Fläche auf der Oberfläche verteilen, dazu die Verschiebung der Welle
export function oberflaecheAbtasten(geometrie, anzahl, zufall) {
  const lage = geometrie.attributes.position;
  const welle = geometrie.morphAttributes.position ? geometrie.morphAttributes.position[0] : null;
  const relativ = geometrie.morphTargetsRelative;
  const index = geometrie.index;
  const dreiecke = Math.floor((index ? index.count : lage.count) / 3);
  const ecke = (d, k) => (index ? index.getX(d * 3 + k) : d * 3 + k);

  const summe = new Float64Array(dreiecke);
  let gesamt = 0;
  for (let d = 0; d < dreiecke; d++) {
    const a = ecke(d, 0);
    const b = ecke(d, 1);
    const c = ecke(d, 2);
    const ux = lage.getX(b) - lage.getX(a);
    const uy = lage.getY(b) - lage.getY(a);
    const uz = lage.getZ(b) - lage.getZ(a);
    const vx = lage.getX(c) - lage.getX(a);
    const vy = lage.getY(c) - lage.getY(a);
    const vz = lage.getZ(c) - lage.getZ(a);
    const kx = uy * vz - uz * vy;
    const ky = uz * vx - ux * vz;
    const kz = ux * vy - uy * vx;
    gesamt += Math.sqrt(kx * kx + ky * ky + kz * kz) / 2;
    summe[d] = gesamt;
  }

  const punkte = new Float32Array(anzahl * 3);
  const wellen = new Float32Array(anzahl * 3);
  for (let i = 0; i < anzahl; i++) {
    const ziel = zufall() * gesamt;
    let lo = 0;
    let hi = dreiecke - 1;
    while (lo < hi) {
      const mitte = (lo + hi) >> 1;
      if (summe[mitte] < ziel) lo = mitte + 1;
      else hi = mitte;
    }
    let u = zufall();
    let v = zufall();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;
    const ecken = [ecke(lo, 0), ecke(lo, 1), ecke(lo, 2)];
    const gewichte = [w, u, v];
    for (let achse = 0; achse < 3; achse++) {
      const holen = (attr, e) => (achse === 0 ? attr.getX(e) : achse === 1 ? attr.getY(e) : attr.getZ(e));
      let p = 0;
      let d = 0;
      for (let k = 0; k < 3; k++) {
        const basis = holen(lage, ecken[k]);
        p += basis * gewichte[k];
        if (welle) d += (relativ ? holen(welle, ecken[k]) : holen(welle, ecken[k]) - basis) * gewichte[k];
      }
      punkte[i * 3 + achse] = p;
      wellen[i * 3 + achse] = d;
    }
  }
  return { punkte, wellen };
}

function gauss(zufall) {
  let u = 0;
  while (!u) u = zufall();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * zufall());
}

// Kleiner, reproduzierbarer Zufall: jede Seite sieht bei jedem Besuch gleich aus
export function zufallMit(saat) {
  let s = saat >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function partikelBauen(THREE, { geometrie, anzahl, rauschSkala }) {
  const zufall = zufallMit(1906);
  const { punkte, wellen } = oberflaecheAbtasten(geometrie, anzahl, zufall);
  const wirbel = new Float32Array(anzahl * 3);
  const zeichen = new Float32Array(anzahl * 3);
  const merkmale = new Float32Array(anzahl * 4);

  for (let i = 0; i < anzahl; i++) {
    const rolle = zufall();
    const staub = rolle < 0.16;
    // Wirbel: drei Arme wie eine Galaxie; Staub liegt locker im ganzen Raum
    if (staub) {
      wirbel[i * 3] = 1.2 + zufall() * 5.2;
      wirbel[i * 3 + 1] = zufall() * Math.PI * 2;
      wirbel[i * 3 + 2] = gauss(zufall) * 0.9;
    } else {
      const r = 1.25 + Math.pow(zufall(), 0.7) * 3.4;
      const arm = Math.floor(zufall() * 3);
      wirbel[i * 3] = r;
      wirbel[i * 3 + 1] = (arm * Math.PI * 2) / 3 + r * 0.9 + gauss(zufall) * 0.32;
      wirbel[i * 3 + 2] = gauss(zufall) * 0.07 * (0.6 + r * 0.3);
    }
    // Logo: der Sechseck-Rahmen des Hex-Zeichens, Spitze oben, Radius 1
    const kante = Math.floor(zufall() * 6);
    const t = zufall();
    const w0 = Math.PI / 2 + (kante * Math.PI) / 3;
    const w1 = w0 + Math.PI / 3;
    const locker = zufall() < 0.14;
    const s = locker ? 0.7 + zufall() * 0.55 : 0.9 + zufall() * 0.1;
    zeichen[i * 3] = (Math.cos(w0) * (1 - t) + Math.cos(w1) * t) * s;
    zeichen[i * 3 + 1] = (Math.sin(w0) * (1 - t) + Math.sin(w1) * t) * s;
    zeichen[i * 3 + 2] = gauss(zufall) * (locker ? 0.2 : 0.035);

    merkmale[i * 4] = rolle;
    merkmale[i * 4 + 1] = zufall();
    merkmale[i * 4 + 2] = zufall();
    merkmale[i * 4 + 3] = zufall();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(punkte, 3));
  geo.setAttribute("aWelle", new THREE.BufferAttribute(wellen, 3));
  geo.setAttribute("aWirbel", new THREE.BufferAttribute(wirbel, 3));
  geo.setAttribute("aZeichen", new THREE.BufferAttribute(zeichen, 3));
  geo.setAttribute("aZufall", new THREE.BufferAttribute(merkmale, 4));

  const uniforms = {
    uZeit: { value: 0 },
    uAuf: { value: 0 },
    uZeichen: { value: 0 },
    uWelle: { value: 0 },
    uRauschSkala: { value: rauschSkala },
    uSkala: { value: 600 },
    uTempo: { value: 0 },
    uZeichenOrt: { value: new THREE.Vector3() },
    uZeichenGroesse: { value: 1.6 },
    uDeckkraft: { value: 1 },
    uBand: { value: new THREE.Matrix4() },
    uWirbelLage: { value: new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(1.1, 0, 0.28))) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uZeit;
      uniform float uAuf;
      uniform float uZeichen;
      uniform float uWelle;
      uniform float uRauschSkala;
      uniform float uSkala;
      uniform float uTempo;
      uniform vec3 uZeichenOrt;
      uniform float uZeichenGroesse;
      uniform mat4 uBand;
      uniform mat3 uWirbelLage;
      attribute vec3 aWelle;
      attribute vec3 aWirbel;
      attribute vec3 aZeichen;
      attribute vec4 aZufall;
      varying vec3 vFarbe;
      varying float vAlpha;
      ${RAUSCHEN}

      void main() {
        float staub = step(aZufall.x, 0.16);
        vec3 aufBand = (uBand * vec4(position + aWelle * uWelle, 1.0)).xyz;

        // Freigabe genau dort, wo das Band gerade zerfällt
        float n = schichten(position * uRauschSkala);
        float frei = max(staub, smoothstep(n, n + 0.16, schwelleAus(uAuf) + 0.02));

        // Wirbel: innen schneller als außen
        float r = aWirbel.x;
        float w = aWirbel.y + uZeit * 0.3 / r;
        vec3 imWirbel = uWirbelLage * vec3(cos(w) * r, aWirbel.z, sin(w) * r) + vec3(0.0, 0.0, -1.4);
        imWirbel += stroemung(imWirbel * 0.4 + uZeit * 0.06) * 0.3;

        // Weg vom Band in den Wirbel, unterwegs verwirbelt
        float weg = smoothstep(0.0, 1.0, frei);
        vec3 p = mix(aufBand, imWirbel, weg);
        p += stroemung(position * 1.6 + uZeit * 0.35) * frei * (1.0 - frei) * 2.4;

        // Am Ende sammeln sich die Punkte zum Hex-Rahmen, jeder mit eigener Verzögerung
        float sammeln = smoothstep(0.0, 1.0, clamp(uZeichen * 1.6 - aZufall.y * 0.6, 0.0, 1.0));
        vec3 imZeichen = uZeichenOrt + aZeichen * uZeichenGroesse + stroemung(aZeichen * 4.0 + uZeit * 0.5) * 0.025;
        p = mix(p, imZeichen, sammeln);

        // Schnelles Scrollen zieht die Punkte mit
        p.y += uTempo * (0.2 + aZufall.y * 0.5) * 0.35;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float groesse = mix(0.55, 1.6, aZufall.w * aZufall.w) * mix(1.0, 0.8, sammeln);
        gl_PointSize = max(groesse * uSkala * 0.011 / -mv.z, 1.0);

        float funkeln = 0.6 + 0.4 * sin(uZeit * (0.8 + aZufall.w * 2.6) + aZufall.x * 40.0);
        float hitze = frei * (1.0 - frei) * 4.0 * (1.0 - staub);
        vec3 teal = vec3(0.0018, 0.672, 0.352);
        vec3 blau = vec3(0.073, 0.468, 0.768);
        vFarbe = mix(teal, vec3(1.0), aZufall.z * 0.75);
        vFarbe = mix(vFarbe, blau, step(0.88, aZufall.z));
        vFarbe = mix(vFarbe, vec3(0.7, 1.0, 0.88), hitze * 0.8);
        vAlpha = frei * funkeln * mix(1.0, 0.45, staub * (1.0 - sammeln)) * (1.0 + hitze * 1.5);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uDeckkraft;
      varying vec3 vFarbe;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float weich = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vFarbe, weich * weich * vAlpha * uDeckkraft);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

  const punkteObjekt = new THREE.Points(geo, material);
  punkteObjekt.frustumCulled = false;
  return { punkte: punkteObjekt, uniforms };
}

// Das Band zerfällt an denselben Stellen, an denen sich die Partikel lösen; am Rand glüht es
export function zerfallAnbringen(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uAuf = uniforms.uAuf;
    shader.uniforms.uRauschSkala = uniforms.uRauschSkala;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObjekt;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObjekt = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObjekt;\nuniform float uAuf;\nuniform float uRauschSkala;\n${RAUSCHEN}`)
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float kante = 0.0;
        if (uAuf > 0.001) {
          float n = schichten(vObjekt * uRauschSkala);
          float schwelle = schwelleAus(uAuf);
          if (n < schwelle) discard;
          kante = 1.0 - smoothstep(0.0, 0.035, n - schwelle);
        }`
      )
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.02, 0.85, 0.5) * kante * 4.0;");
  };
}

// Kino-Finish: Farbtrennung wächst mit dem Scrolltempo, dazu Vignette und Filmkorn
export function kinoShader(THREE) {
  return {
    uniforms: {
      tDiffuse: { value: null },
      uZeit: { value: 0 },
      uTempo: { value: 0 },
      uKorn: { value: 0.035 },
      uAufloesung: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uZeit;
      uniform float uTempo;
      uniform float uKorn;
      uniform vec2 uAufloesung;
      varying vec2 vUv;

      void main() {
        vec2 mitte = vUv - 0.5;
        float r = length(mitte);
        vec2 versatz = mitte * (0.004 + uTempo * 0.018) * r;
        vec3 farbe;
        farbe.r = texture2D(tDiffuse, vUv + versatz).r;
        farbe.g = texture2D(tDiffuse, vUv).g;
        farbe.b = texture2D(tDiffuse, vUv - versatz).b;
        farbe *= 1.0 - smoothstep(0.42, 0.95, r) * 0.3;
        float korn = fract(sin(dot(floor(vUv * uAufloesung) + fract(uZeit * 7.3) * 91.7, vec2(12.9898, 78.233))) * 43758.5453);
        farbe += (korn - 0.5) * uKorn;
        gl_FragColor = vec4(max(farbe, 0.0), 1.0);
      }
    `,
  };
}
