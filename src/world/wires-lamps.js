// wires-lamps.js
// Overhead wires, big hanging pendant lamps, the tram's trolley wire and span poles,
// bunting and the signs hung over the right bank.

import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Line,
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { DECK_HEIGHT, QUAY_HEIGHT, addCylinder, addMesh, standardMaterial } from '../core/helpers.js';
import { darkGreen, wireMaterial } from '../core/materials.js';
import { addSign } from '../core/textures.js';
import { TRAM_ROUTE, TROLLEY_WIRE_HEIGHT } from './tram.js';

/**
 * A sagging wire from a to b, returned as its points so callers can hang things on it.
 * A sine bump is a good-enough stand-in for the true catenary (cosh) curve.
 */
function addWire(parent, a, b, sag = 0, segments = 24) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = a.clone().lerp(b, t);
    point.y -= Math.sin(t * Math.PI) * sag;
    points.push(point);
  }
  // setFromPoints fills a position attribute from Vector3s, the quickest way to make a polyline.
  parent.add(new Line(new BufferGeometry().setFromPoints(points), wireMaterial));
  return points;
}

/**
 * A hanging lamp: a cord, a lathe-turned shade, a glowing bulb, rings and ribs.
 * Everything is parented to a Group placed at the *top* of the cord. Rotating that group
 * swings the whole lamp like a pendulum about its suspension point.
 */
function addPendant(parent, swingers, x, y, z, scale, topY) {
  const pivot = new Group();
  pivot.position.set(x, topY, z);
  parent.add(pivot);
  const cordLength = topY - y;
  addMesh(pivot, new CylinderGeometry(0.02 * scale, 0.02 * scale, cordLength, 6), standardMaterial(0x1d2a24), 0, -cordLength / 2, 0);

  const shadeProfile = [
    new Vector2(0.12, 0.55),
    new Vector2(0.3, 0.5),
    new Vector2(0.45, 0.3),
    new Vector2(1, 0.08),
    new Vector2(1.05, 0),
    new Vector2(0.98, -0.03),
  ];
  // DoubleSide because a lathe surface is open: from below you see its inner side.
  const shadeMaterial = new MeshStandardMaterial({ color: 0x1f3a30, roughness: 0.5, metalness: 0.4, side: DoubleSide });
  addMesh(pivot, new LatheGeometry(shadeProfile, 40), shadeMaterial, 0, -cordLength, 0, { scale: [scale, scale, scale] });
  addMesh(pivot, new SphereGeometry(0.3 * scale, 20, 14), new MeshStandardMaterial({ color: 0xfff6c8, emissive: 0xffe08a, emissiveIntensity: 1.4 }), 0, -cordLength - 0.02 * scale, 0, {
    castShadow: false,
  });
  for (let i = 0; i < 3; i++) {
    addMesh(pivot, new TorusGeometry((0.95 - i * 0.28) * scale, 0.025 * scale, 6, 36), shadeMaterial, 0, -cordLength - (0.12 + i * 0.2) * scale, 0, { rotateX: Math.PI / 2 });
  }
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 6.283;
    addMesh(pivot, new CylinderGeometry(0.018 * scale, 0.018 * scale, 0.62 * scale, 5), shadeMaterial, Math.cos(angle) * 0.7 * scale, -cordLength - 0.3 * scale, Math.sin(angle) * 0.7 * scale, {
      rotateX: Math.sin(angle) * 0.75,
      rotateZ: -Math.cos(angle) * 0.75,
    });
  }
  // A pendulum's swing slows with length, so bigger lamps swing less (amplitude ∝ 1/√scale).
  swingers.push({ pivot, phase: x + z, amplitude: 0.035 / Math.sqrt(scale) });
}

export function buildWiresAndLamps() {
  const group = new Group();
  const Q = QUAY_HEIGHT;
  const swingers = [];
  const flags = [];

  // Wires strung between the buildings, and the big pendant lamps.
  addWire(group, new Vector3(-11, Q + 40, -14), new Vector3(18, Q + 20.5, -9), 2);
  addWire(group, new Vector3(-22, Q + 34, -13), new Vector3(36, Q + 17, 6), 5);
  addWire(group, new Vector3(-40, Q + 24, 8), new Vector3(33, Q + 17, 10), 4);
  addPendant(group, swingers, -5.5, 16.5, 13, 2.3, 60);
  addPendant(group, swingers, -11.5, 10.6, 7, 1.25, 34);
  addPendant(group, swingers, -19.5, 8.3, 3.5, 0.85, 20);
  addPendant(group, swingers, 9, 13.5, -12, 1.1, 30);

  // --- Trolley wire and span poles -------------------------------------------------------
  // The wire follows the same curve the tram drives along, sampled into 101 points.
  const trolleyPoints = TRAM_ROUTE.getPoints(100).map((p) => new Vector3(p.x, TROLLEY_WIRE_HEIGHT, p.z));
  group.add(new Line(new BufferGeometry().setFromPoints(trolleyPoints), wireMaterial));
  [
    [-24, -15.2, 16.4],
    [-12, -16.6, 12.6],
    [14, -19.6, 17.4],
    [26, -20.2, 18.6],
  ].forEach(([z, leftX, rightX]) => {
    [leftX, rightX].forEach((x, i) => {
      addCylinder(group, x, z, 0.09, 0.13, Q, 7, darkGreen, 10);
      // A half torus (arc = π) makes the curled bracket at the top of each pole.
      addMesh(group, new TorusGeometry(0.35, 0.03, 6, 16, Math.PI), darkGreen, x + (i ? -0.35 : 0.35), Q + 6.7, z);
    });
    addWire(group, new Vector3(leftX, Q + 6.6, z), new Vector3(rightX, Q + 6.6, z), 0.5);
    addCylinder(group, -0.7, z, 0.012, 0.012, TROLLEY_WIRE_HEIGHT, Q + 6.1 - TROLLEY_WIRE_HEIGHT, standardMaterial(0x1d2a24), 4);
  });

  // --- Bunting ---------------------------------------------------------------------------
  const flagColors = [0x2f9c8a, 0xf1c53a, 0xe8734a, 0xf6f1dc, 0x3f6fb0, 0x7fc45a];
  // ShapeGeometry fills a 2D outline (flat, no depth). Every flag is the same triangle,
  // so they all share ONE geometry and one material per colour. Only the Mesh (transform) is
  // per flag.
  const pennant = new Shape();
  pennant.moveTo(-0.38, 0);
  pennant.lineTo(0.38, 0);
  pennant.lineTo(0, -0.8);
  pennant.lineTo(-0.38, 0);
  const pennantGeometry = new ShapeGeometry(pennant);
  const flagMaterials = flagColors.map((color) => new MeshStandardMaterial({ color, side: DoubleSide, roughness: 0.7 }));
  const addBunting = (a, b, sag, count) => {
    const points = addWire(group, a, b, sag, count);
    const heading = Math.atan2(b.z - a.z, b.x - a.x);
    for (let i = 1; i < count; i++) {
      const flag = new Mesh(pennantGeometry, flagMaterials[i % flagColors.length]);
      flag.position.copy(points[i]);
      flag.rotation.y = -heading;
      flag.castShadow = true;
      group.add(flag);
      flags.push(flag);
    }
  };
  const tankTop = new Vector3(24.7, Q + 31.6, -18.2);
  addBunting(tankTop.clone().add(new Vector3(-8.8, 0, 2)), new Vector3(8, Q + 13, -3), 2.5, 14);
  addBunting(tankTop.clone().add(new Vector3(-3, 0, 8.6)), new Vector3(17.2, Q + 9, 3), 3, 15);
  addBunting(tankTop.clone().add(new Vector3(6, 0, 6.5)), new Vector3(37, Q + 16, 6), 2, 13);
  addBunting(new Vector3(-10.4, Q + 26, -13), new Vector3(6.8, DECK_HEIGHT + 6.6, 0), 3, 16);
  addBunting(new Vector3(-24.6, Q + 8.3, 11), new Vector3(-18.5, Q + 7, 0), 1, 9);

  // --- Arrow board and round signs over the right bank -----------------------------------
  addSign(group, '→ 野菜市場前', 5.6, 2.3, 13.5, Q + 12, 6, -0.35, { w: 512, h: 210, bg: '#f8f5e4', border: '#3a4a3c', fg: '#2b3a30', lw: 10 }).rotation.z = 0.08;
  addWire(group, new Vector3(13.5, Q + 13.1, 6), new Vector3(6.8, DECK_HEIGHT + 6.6, 0), 0.3);
  addWire(group, new Vector3(13.5, Q + 13.1, 6), new Vector3(31, DECK_HEIGHT + 5, 4.6), 1);
  addSign(group, '市', 3.6, 3.6, 10, Q + 15.5, -9.6, 0, { round: true, bg: '#fbf8e6', border: '#e7862e', fg: '#e7862e' });
  addCylinder(group, 10, -9.7, 0.1, 0.1, Q, 14, darkGreen, 8);
  addSign(group, '大', 2.6, 2.6, 15, Q + 16.5, -9.4, 0, { round: true, bg: '#fbf8e6', border: '#c8452f', fg: '#c8452f' });

  return {
    object: group,
    update(time) {
      // Two sines at different rates on two axes give a lazy elliptical sway.
      for (const { pivot, phase, amplitude } of swingers) {
        pivot.rotation.z = Math.sin(time * 0.9 + phase) * amplitude;
        pivot.rotation.x = Math.cos(time * 0.7 + phase) * amplitude * 0.7;
      }
      for (let i = 0; i < flags.length; i++) flags[i].rotation.x = Math.sin(time * 3 + i * 0.9) * 0.35;
    },
  };
}
