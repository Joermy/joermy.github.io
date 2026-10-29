#!/usr/bin/env python3
"""Rendert das Standbild des Chrombands mit Cycles: bilder/band-600.webp und bilder/band-1000.webp.

Das Standbild steht ohne WebGL an der Stelle der 3D-Szene und dient auf dem Telefon als Anker.
Die Leuchtflächen sind dieselben wie in assets/js/hintergrund.js, damit Bild und Szene gleich spiegeln.

Läuft mit Blender als Python-Modul (pip install bpy, Python 3.11) oder in Blender selbst:
    python scripts/standbild-rendern.py
    blender --background --python scripts/standbild-rendern.py
"""

import math
import pathlib

import bpy
import bmesh
from mathutils import Matrix, Vector

WURZEL = pathlib.Path(__file__).resolve().parent.parent
MODELL = WURZEL / "assets" / "modelle" / "band.glb"
BILDER = WURZEL / "bilder"
BREITE, HOEHE = 1000, 978

# Wie die Lichtwand in hintergrund.js: Farbe, Stärke, Lage (three.js: Y oben), Größe
LICHTWAND = (
    (0x06D6A0, 3.2, (-4.5, 0.6, 1.5), (1.4, 7)),
    (0x4CB6E3, 2.8, (4.5, -0.2, 1.2), (1.4, 7)),
    (0xFFFFFF, 4.0, (0, 4.6, 1.5), (7, 1.1)),
    (0xF0B45A, 1.6, (0, -4.2, -2.5), (6, 1.6)),
    (0x06D6A0, 2.0, (0, 0.5, -5), (4, 4)),
)


def linear(hexwert):
    def kanal(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return tuple(kanal((hexwert >> s) & 255) for s in (16, 8, 0))


def nach_blender(v):
    """three.js (X, Y oben, Z zur Kamera) nach Blender (X, Y in die Tiefe, Z oben)."""
    x, y, z = v
    return Vector((x, -z, y))


def chrom():
    m = bpy.data.materials.new("Chrom")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*linear(0xE6E6EE), 1)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.13
    bsdf.inputs["Coat Weight"].default_value = 0.5
    bsdf.inputs["Coat Roughness"].default_value = 0.08
    if "Thin Film Thickness" in bsdf.inputs:
        bsdf.inputs["Thin Film Thickness"].default_value = 420
        bsdf.inputs["Thin Film IOR"].default_value = 1.45
    return m


def leuchtflaeche(name, farbe, staerke, lage, groesse):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    flaeche = bpy.data.objects.new(name, mesh)
    flaeche.scale = (groesse[0], groesse[1], 1)
    flaeche.location = nach_blender(lage)
    flaeche.rotation_euler = (Vector((0, 0, 0)) - flaeche.location).to_track_quat("Z", "Y").to_euler()
    flaeche.visible_camera = False
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    knoten = mat.node_tree.nodes
    knoten.clear()
    ausgabe = knoten.new("ShaderNodeOutputMaterial")
    glut = knoten.new("ShaderNodeEmission")
    glut.inputs["Color"].default_value = (*linear(farbe), 1)
    glut.inputs["Strength"].default_value = staerke
    mat.node_tree.links.new(glut.outputs["Emission"], ausgabe.inputs["Surface"])
    mesh.materials.append(mat)
    bpy.context.scene.collection.objects.link(flaeche)


def rendern():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(MODELL))
    szene = bpy.context.scene

    band = next(o for o in szene.objects if o.type == "MESH")
    band.data.materials.clear()
    band.data.materials.append(chrom())
    if band.data.shape_keys:
        for schluessel in band.data.shape_keys.key_blocks[1:]:
            schluessel.value = 0.0

    # Mittig, Kugelradius 1, gekippt wie die Szene am Anfang
    welt_lage = band.matrix_world.copy()
    band.parent = None
    band.matrix_world = welt_lage
    bpy.context.view_layer.update()
    ecken = [band.matrix_world @ Vector(e) for e in band.bound_box]
    mitte = sum(ecken, Vector()) / 8
    radius = max((e - mitte).length for e in ecken)
    halter = bpy.data.objects.new("Halter", None)
    szene.collection.objects.link(halter)
    band.parent = halter
    band.location -= mitte
    halter.scale = (1 / radius,) * 3
    halter.rotation_mode = "XYZ"
    halter.rotation_euler = (math.radians(58), math.radians(-14), math.radians(24))

    kamera_daten = bpy.data.cameras.new("Kamera")
    kamera_daten.sensor_fit = "VERTICAL"
    kamera_daten.angle = math.radians(32)
    kamera = bpy.data.objects.new("Kamera", kamera_daten)
    szene.collection.objects.link(kamera)
    kamera.location = (0, -2.8, 0)
    kamera.rotation_euler = (math.radians(90), 0, 0)
    szene.camera = kamera

    for i, (farbe, staerke, lage, groesse) in enumerate(LICHTWAND):
        leuchtflaeche(f"Licht{i}", farbe, staerke, lage, groesse)

    welt = bpy.data.worlds.new("Welt")
    welt.use_nodes = True
    welt.node_tree.nodes["Background"].inputs["Color"].default_value = (*linear(0x010102), 1)
    szene.world = welt

    szene.render.engine = "CYCLES"
    szene.cycles.device = "CPU"
    szene.cycles.samples = 160
    szene.cycles.use_denoising = True
    szene.render.film_transparent = True
    szene.render.resolution_x = BREITE
    szene.render.resolution_y = HOEHE
    szene.view_settings.view_transform = "AgX"
    szene.view_settings.exposure = 0.75

    roh = BILDER / "_band-roh.png"
    szene.render.filepath = str(roh)
    bpy.ops.render.render(write_still=True)

    from PIL import Image, ImageFilter

    bild = Image.open(roh).convert("RGBA")
    glut = bild.filter(ImageFilter.GaussianBlur(18))
    glut.putalpha(glut.getchannel("A").point(lambda a: int(a * 0.55)))
    bild = Image.alpha_composite(glut, bild)
    for breite in (600, 1000):
        hoehe = round(HOEHE * breite / BREITE)
        bild.resize((breite, hoehe), Image.LANCZOS).save(BILDER / f"band-{breite}.webp", quality=86, method=6)
        print(f"  bilder/band-{breite}.webp")
    roh.unlink()


if __name__ == "__main__":
    print("Standbild rendern:")
    rendern()
