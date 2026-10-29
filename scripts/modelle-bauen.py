#!/usr/bin/env python3
"""Baut die 3D-Modelle der Website in Blender und exportiert sie als glTF.

kern.glb  geodätischer Kern der Startseite: Gitter, Knoten, Innengitter, Hex-Ring
hex.glb   das Logo als Körper: Hülle und Kern eines Sechsecks

Läuft mit Blender als Python-Modul (pip install bpy, Python 3.11) oder in Blender selbst:
    python scripts/modelle-bauen.py [--standbild]
    blender --background --python scripts/modelle-bauen.py -- --standbild

Mit --standbild rendert Cycles zusätzlich das Standbild des Kerns nach bilder/kern-*.webp,
das ohne WebGL an seiner Stelle steht.
"""

import math
import pathlib
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector

WURZEL = pathlib.Path(__file__).resolve().parent.parent
MODELLE = WURZEL / "assets" / "modelle"
BILDER = WURZEL / "bilder"

AKZENT = (0.0018, 0.672, 0.352)
DUNKEL = (0.0045, 0.0055, 0.0068)


def leeren():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, farbe, leuchten=0.0, metall=0.0, rauheit=0.5, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*farbe, 1)
    bsdf.inputs["Metallic"].default_value = metall
    bsdf.inputs["Roughness"].default_value = rauheit
    bsdf.inputs["Alpha"].default_value = alpha
    if leuchten:
        bsdf.inputs["Emission Color"].default_value = (*farbe, 1)
        bsdf.inputs["Emission Strength"].default_value = leuchten
    return m


def objekt(name, bm, mat, kanten_winkel=None):
    if kanten_winkel is not None:
        for f in bm.faces:
            f.smooth = True
        for e in bm.edges:
            if len(e.link_faces) == 2 and e.calc_face_angle(0) > kanten_winkel:
                e.smooth = False
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def rohr(bm, a, b, radius, seiten=6):
    """Zylinder von a nach b, ohne Deckel: die Enden verschwinden in den Knoten."""
    achse = b - a
    laenge = achse.length
    drehung = achse.to_track_quat("Z", "Y").to_matrix().to_4x4()
    m = Matrix.Translation(a) @ drehung
    ringe = []
    for z in (0.0, laenge):
        ring = []
        for i in range(seiten):
            w = 2 * math.pi * i / seiten
            ring.append(bm.verts.new(m @ Vector((math.cos(w) * radius, math.sin(w) * radius, z))))
        ringe.append(ring)
    for i in range(seiten):
        j = (i + 1) % seiten
        bm.faces.new((ringe[0][i], ringe[0][j], ringe[1][j], ringe[1][i]))


def geodaete(unterteilung, radius):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=unterteilung, radius=radius)
    punkte = [v.co.copy() for v in bm.verts]
    kanten = [(e.verts[0].co.copy(), e.verts[1].co.copy()) for e in bm.edges]
    bm.free()
    return punkte, kanten


def gitter(name, unterteilung, radius, staerke, mat):
    _, kanten = geodaete(unterteilung, radius)
    bm = bmesh.new()
    for a, b in kanten:
        rohr(bm, a, b, staerke)
    for f in bm.faces:
        f.smooth = True
    return objekt(name, bm, mat)


def knoten(name, unterteilung, radius, groesse, mat):
    punkte, _ = geodaete(unterteilung, radius)
    bm = bmesh.new()
    for p in punkte:
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=groesse, matrix=Matrix.Translation(p))
    for f in bm.faces:
        f.smooth = True
    return objekt(name, bm, mat)


def sechseck(radius, spitze_oben=True):
    versatz = math.pi / 2 if spitze_oben else 0.0
    return [(math.cos(versatz + i * math.pi / 3) * radius, math.sin(versatz + i * math.pi / 3) * radius) for i in range(6)]


def ring_rohr(bm, radius, staerke, segmente, seiten=6):
    """Geschlossenes Rohr entlang eines Kreises in der XY-Ebene, Ringe geteilt."""
    ringe = []
    for i in range(segmente):
        w = 2 * math.pi * i / segmente
        mitte = Vector((math.cos(w), math.sin(w), 0))
        ring = []
        for k in range(seiten):
            u = 2 * math.pi * k / seiten
            p = mitte * (radius + math.cos(u) * staerke) + Vector((0, 0, math.sin(u) * staerke))
            ring.append(bm.verts.new(p))
        ringe.append(ring)
    for i in range(segmente):
        a, b = ringe[i], ringe[(i + 1) % segmente]
        for k in range(seiten):
            m = (k + 1) % seiten
            bm.faces.new((a[k], b[k], b[m], a[m]))


def hex_prisma(bm, radius, tiefe, matrix, fase, segmente=2):
    """Sechseckiges Prisma mit gefasten Kanten. Lokal: Fläche in XY, Tiefe entlang Z."""
    unten = [bm.verts.new(matrix @ Vector((x, y, -tiefe / 2))) for x, y in sechseck(radius)]
    oben = [bm.verts.new(matrix @ Vector((x, y, tiefe / 2))) for x, y in sechseck(radius)]
    neu = [bm.faces.new(oben), bm.faces.new(list(reversed(unten)))]
    for i in range(6):
        j = (i + 1) % 6
        neu.append(bm.faces.new((unten[i], unten[j], oben[j], oben[i])))
    bmesh.ops.recalc_face_normals(bm, faces=neu)
    kanten = list({e for f in neu for e in f.edges})
    bmesh.ops.bevel(bm, geom=kanten, offset=fase, segments=segmente, profile=0.5, affect="EDGES", clamp_overlap=True)


def hex_rahmen(bm, aussen, innen, tiefe, matrix, fase):
    """Sechseckiger Rahmen: äußere und innere Kontur, verbunden zu einem Ring."""
    stufen = {}
    for z in (-tiefe / 2, tiefe / 2):
        stufen[z] = (
            [bm.verts.new(matrix @ Vector((x, y, z))) for x, y in sechseck(aussen)],
            [bm.verts.new(matrix @ Vector((x, y, z))) for x, y in sechseck(innen)],
        )
    (au, iu), (ao, io) = stufen[-tiefe / 2], stufen[tiefe / 2]
    neu = []
    for i in range(6):
        j = (i + 1) % 6
        neu.append(bm.faces.new((ao[i], ao[j], io[j], io[i])))
        neu.append(bm.faces.new((au[j], au[i], iu[i], iu[j])))
        neu.append(bm.faces.new((au[i], au[j], ao[j], ao[i])))
        neu.append(bm.faces.new((iu[j], iu[i], io[i], io[j])))
    bmesh.ops.recalc_face_normals(bm, faces=neu)
    kanten = list({e for f in neu for e in f.edges if e.calc_face_angle(0) > 0.6})
    bmesh.ops.bevel(bm, geom=kanten, offset=fase, segments=2, profile=0.5, affect="EDGES", clamp_overlap=True)


def exportieren(pfad):
    MODELLE.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(pfad),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_texcoords=False,
        export_tangents=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"  {pfad.relative_to(WURZEL)}  {pfad.stat().st_size / 1024:.1f} KB")


def kern_bauen():
    leeren()
    leuchtend = material("Gitter", AKZENT, leuchten=0.8, metall=0.4, rauheit=0.35)
    hell = material("Knoten", (0.3, 1.0, 0.75), leuchten=1.6, rauheit=0.3)
    zart = material("Innen", AKZENT, leuchten=0.7, rauheit=0.5, alpha=0.6)
    metall = material("Ring", (0.02, 0.09, 0.065), leuchten=0.08, metall=1.0, rauheit=0.28)
    spur = material("Spur", AKZENT, leuchten=1.0, rauheit=0.5)

    gitter("Gitter", 2, 1.0, 0.0075, leuchtend)
    knoten("Knoten", 2, 1.0, 0.024, hell)
    innen = gitter("Innen", 1, 0.56, 0.0055, zart)
    innen.rotation_euler = (0.5, 0.3, 0.9)

    # Hex-Ring: Kacheln auf einem Kreis, in der Breite gestaffelt wie ein Pegel
    bm = bmesh.new()
    anzahl = 42
    for i in range(anzahl):
        w = 2 * math.pi * i / anzahl
        if i % 7 == 3:
            continue
        r = 1.36
        groesse = 0.052 + 0.022 * (0.5 + 0.5 * math.sin(i * 1.7))
        lage = Matrix.Translation((math.cos(w) * r, math.sin(w) * r, 0)) @ Matrix.Rotation(w, 4, "Z")
        hex_prisma(bm, groesse, 0.018, lage, 0.006, segmente=1)
    objekt("Ring", bm, metall, kanten_winkel=0.5)

    bm = bmesh.new()
    ring_rohr(bm, 1.245, 0.0035, 128, seiten=4)
    for f in bm.faces:
        f.smooth = True
    objekt("Spur", bm, spur)

    exportieren(MODELLE / "kern.glb")


def hex_bauen():
    leeren()
    huelle = material("Huelle", AKZENT, leuchten=0.6, metall=0.85, rauheit=0.25)
    kern = material("HexKern", AKZENT, leuchten=1.8, metall=0.2, rauheit=0.35)

    # Fläche in Blenders XZ-Ebene, Tiefe entlang Y: nach dem Export zeigt das Logo zur Kamera (+Z)
    lage = Matrix.Rotation(math.pi / 2, 4, "X")
    bm = bmesh.new()
    hex_rahmen(bm, 1.0, 0.8, 0.26, lage, 0.03)
    objekt("Huelle", bm, huelle, kanten_winkel=0.5)

    bm = bmesh.new()
    hex_prisma(bm, 0.5, 0.34, lage, 0.035)
    objekt("HexKern", bm, kern, kanten_winkel=0.5)

    exportieren(MODELLE / "hex.glb")


def standbild_rendern():
    """Rendert den Kern mit Cycles als Standbild für Geräte ohne WebGL."""
    bpy.ops.import_scene.gltf(filepath=str(MODELLE / "kern.glb"))
    szene = bpy.context.scene
    szene.render.engine = "CYCLES"
    szene.cycles.device = "CPU"
    szene.cycles.samples = 48
    szene.cycles.use_denoising = True
    szene.render.film_transparent = True
    szene.render.resolution_x = 1000
    szene.render.resolution_y = 1000
    szene.view_settings.view_transform = "Standard"

    welt = bpy.data.worlds.new("Welt")
    welt.use_nodes = True
    welt.node_tree.nodes["Background"].inputs["Color"].default_value = (*DUNKEL, 1)
    szene.world = welt

    for obj in szene.objects:
        if obj.type == "MESH":
            obj.rotation_mode = "XYZ"
            obj.rotation_euler.rotate(Matrix.Rotation(0.38, 3, "X").to_euler())
            obj.rotation_euler.rotate(Matrix.Rotation(0.25, 3, "Z").to_euler())

    # Partikelwolke wie im Agentic OS, nur im Standbild: im Browser zeichnet sie three.js
    import random

    zufall = random.Random(7)
    farben = [AKZENT] * 14 + [(0.87, 0.45, 0.1), (0.92, 0.02, 0.24), (0.07, 0.47, 0.77), (0.34, 0.12, 0.79)]
    wolken = {}
    for _ in range(900):
        r = abs(zufall.gauss(0, 0.3))
        if r > 0.85:
            continue
        richtung = Vector((zufall.gauss(0, 1), zufall.gauss(0, 1), zufall.gauss(0, 1))).normalized()
        farbe = zufall.choice(farben)
        bm = wolken.setdefault(farbe, bmesh.new())
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=zufall.uniform(0.006, 0.014), matrix=Matrix.Translation(richtung * r))
    for i, (farbe, bm) in enumerate(wolken.items()):
        objekt(f"Wolke{i}", bm, material(f"Wolke{i}", farbe, leuchten=2.2))

    kamera_daten = bpy.data.cameras.new("Kamera")
    kamera_daten.lens = 70
    kamera = bpy.data.objects.new("Kamera", kamera_daten)
    szene.collection.objects.link(kamera)
    kamera.location = (0, -7.2, 0.35)
    kamera.rotation_euler = (math.radians(87.2), 0, 0)
    szene.camera = kamera

    for name, ort, staerke, farbe in (
        ("Oben", (0, -1.5, 4), 900, (0.75, 1.0, 0.92)),
        ("Links", (-4, -2, 0.5), 500, (0.2, 1.0, 0.75)),
        ("Rechts", (4, -1, -1), 380, (0.95, 0.75, 0.45)),
    ):
        licht = bpy.data.lights.new(name, "AREA")
        licht.energy = staerke
        licht.color = farbe
        licht.size = 3
        objekt_licht = bpy.data.objects.new(name, licht)
        objekt_licht.location = ort
        richtung = Vector((0, 0, 0)) - Vector(ort)
        objekt_licht.rotation_euler = richtung.to_track_quat("-Z", "Y").to_euler()
        szene.collection.objects.link(objekt_licht)

    roh = MODELLE / "_kern-roh.png"
    szene.render.filepath = str(roh)
    bpy.ops.render.render(write_still=True)

    from PIL import Image, ImageFilter

    bild = Image.open(roh).convert("RGBA")
    glut = bild.filter(ImageFilter.GaussianBlur(22))
    bild = Image.alpha_composite(glut, bild)
    for breite in (600, 1000):
        bild.resize((breite, breite), Image.LANCZOS).save(BILDER / f"kern-{breite}.webp", quality=86, method=6)
        print(f"  bilder/kern-{breite}.webp")
    roh.unlink()


if __name__ == "__main__":
    argumente = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    print("Modelle bauen:")
    kern_bauen()
    hex_bauen()
    if "--standbild" in argumente:
        leeren()
        standbild_rendern()
