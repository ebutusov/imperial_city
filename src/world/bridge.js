// bridge.js
// The green footbridge with its peaked truss (6), the yellow stairs (5) and the elevated
// walkway on the right bank (11).

import { BoxGeometry, CylinderGeometry, Group, MeshStandardMaterial, PlaneGeometry, SphereGeometry, Vector3, DoubleSide } from 'three';
import { DECK_HEIGHT, QUAY_HEIGHT, addCylinder, addMesh, canvasTexture, createRandom, standardMaterial } from '../core/helpers.js';
import { bridgeGreen, darkGreen } from '../core/materials.js';
import { DECO_COLORS, addRailing, addSign, createSignTexture, woodTexture } from '../core/textures.js';

/**
 * Place a box so that it spans from point a to point b in the x/y plane, the standard
 * "beam between two points" trick: put it at the midpoint, make it as long as the
 * distance, and rotate it by the angle of the segment.
 */
function addBeam(parent, a, b, thickness, depth, z, material) {
  const length = a.distanceTo(b);
  addMesh(parent, new BoxGeometry(length, thickness, depth), material, (a.x + b.x) / 2, (a.y + b.y) / 2, z, {
    rotateZ: Math.atan2(b.y - a.y, b.x - a.x),
  });
}

export function buildBridge() {
  const group = new Group();
  const Q = QUAY_HEIGHT;
  const D = DECK_HEIGHT;
  // `color` multiplies the texture: a pale tint lightens and warms the wood without a new texture.
  const plank = new MeshStandardMaterial({ map: woodTexture, color: 0xf1e6c0, roughness: 0.9 });

  // --- Footbridge deck -----------------------------------------------------------------
  addMesh(group, new BoxGeometry(37.6, 0.22, 2.6), plank, -1.8, D - 0.11, 0);
  [-1.3, 1.3].forEach((z) => {
    addMesh(group, new BoxGeometry(37.6, 0.55, 0.22), bridgeGreen, -1.8, D - 0.3, z);
    addRailing(group, -20.6, z, 17, z, D, 1.1, 0x6fae45);
  });
  [-17.4, 16.2].forEach((x) => {
    [-1, 1].forEach((side) => addCylinder(group, x, side * 1.1, 0.22, 0.26, Q, D - Q - 0.5, bridgeGreen, 12));
    addMesh(group, new BoxGeometry(0.3, 0.3, 2.6), bridgeGreen, x, D - 0.75, 0);
  });

  // --- Peaked truss over the canal -------------------------------------------------------
  const apex = new Vector3(6.8, D + 6.4, 0);
  const leftFoot = new Vector3(-5.2, D, 0);
  const rightFoot = new Vector3(17, D + 0.4, 0);
  [-1.3, 1.3].forEach((z) => {
    addBeam(group, leftFoot, apex, 0.42, 0.32, z, bridgeGreen);
    addBeam(group, apex, rightFoot, 0.42, 0.32, z, bridgeGreen);
    // Hangers: thin rods from the top chord down to the railing. The top chord's height at
    // x is found by linear interpolation along whichever side of the apex x is on.
    for (let x = -3; x < 16.5; x += 2.2) {
      const chordY = x < 6.8 ? D + ((x + 5.2) / 12) * 6.4 : D + 0.4 + ((17 - x) / 10.2) * 6;
      addMesh(group, new CylinderGeometry(0.035, 0.035, chordY - D - 0.9, 6), darkGreen, x, (chordY + D + 0.9) / 2, z);
    }
  });
  addMesh(group, new BoxGeometry(0.4, 0.4, 3), bridgeGreen, apex.x, apex.y, 0);

  // Signals on the truss: each shows one lit lamp (strong emissive) and two dim ones.
  [
    [2.2, D + 3.2],
    [4.2, D + 4.4],
    [9.6, D + 4.2],
  ].forEach(([x, y], i) => {
    addMesh(group, new BoxGeometry(0.5, 1.25, 0.4), standardMaterial(0x1c2a22), x, y, 1.55);
    ['#ff5a3c', '#ffd23c', '#49e07a'].forEach((color, k) =>
      addMesh(
        group,
        new SphereGeometry(0.13, 12, 10),
        new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k === i % 3 ? 1.6 : 0.15 }),
        x,
        y + 0.38 - k * 0.38,
        1.78,
        { castShadow: false },
      ),
    );
  });

  // Round sign hanging under the deck.
  addCylinder(group, 4.4, 1.45, 0.03, 0.03, D - 2.0, 1.6, darkGreen, 6);
  addSign(group, '菜', 2.3, 2.3, 4.4, D - 3.0, 1.45, 0, { round: true, bg: '#f6f1dc', border: '#c8452f', fg: '#c8452f' });

  // --- 5: yellow stairs up to the deck ---------------------------------------------------
  {
    const yellow = standardMaterial(0xf0c93d, { roughness: 0.6 });
    const steps = 20;
    const zBottom = 9.4;
    const zTop = 1.3;
    const x = -19.6;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      addMesh(group, new BoxGeometry(1.7, 0.12, (zBottom - zTop) / steps + 0.05), plank, x, Q + (D - Q) * ((i + 1) / steps), zBottom + (zTop - zBottom) * t);
    }
    // Stringers and handrails: one box each, tilted to the stair's slope.
    const slopeLength = Math.hypot(zBottom - zTop, D - Q);
    const slopeAngle = Math.atan2(D - Q, zBottom - zTop);
    [-0.9, 0.9].forEach((dx) => {
      addMesh(group, new BoxGeometry(0.12, 0.5, slopeLength + 0.3), yellow, x + dx, (Q + D) / 2, (zBottom + zTop) / 2, { rotateX: slopeAngle });
      addMesh(group, new BoxGeometry(0.07, 0.07, slopeLength + 0.3), yellow, x + dx, (Q + D) / 2 + 1.05, (zBottom + zTop) / 2, { rotateX: slopeAngle });
      for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        addMesh(group, new CylinderGeometry(0.03, 0.03, 1.05, 6), yellow, x + dx, Q + (D - Q) * t + 0.52, zBottom + (zTop - zBottom) * t);
      }
    });
    addCylinder(group, x, 5.4, 0.14, 0.14, Q, 2.6, yellow, 8);
  }

  // --- 11: elevated walkway on the right bank ------------------------------------------
  addMesh(group, new BoxGeometry(21.4, 0.4, 6.6), standardMaterial(0xe9dfb0), 27.5, D - 0.2, -0.3);
  addRailing(group, 17, 3, 38, 3, D, 1.15, 0xf4efd2);
  addRailing(group, 17, 1.3, 17, 3, D, 1.15, 0xf4efd2);
  addRailing(group, 17, -1.3, 17, -3.3, D, 1.15, 0xf4efd2);
  for (let x = 18.5; x < 38; x += 4.6) addCylinder(group, x, 2.6, 0.38, 0.42, Q, D - Q - 0.4, standardMaterial(0xe6dcae), 18);
  addCylinder(group, 31, 4.6, 1.05, 1.15, Q, D + 5 - Q, standardMaterial(0xf0e7bd, { roughness: 0.6 }), 32);
  const fasciaTexture = createSignTexture('朝市　水上バス　乗り場　朝市', { w: 1024, h: 96, bg: '#f3e9bd', fg: '#c8452f', border: '#e7a93a', lw: 6 });
  addMesh(group, new PlaneGeometry(13, 1), new MeshStandardMaterial({ map: fasciaTexture, side: DoubleSide }), 25, D + 0.6, 3.06);
  // Globe lamps: a low emissiveIntensity makes them look like frosted glass by day.
  [0, 1, 2].forEach((i) =>
    addMesh(group, new SphereGeometry(0.42, 20, 14), new MeshStandardMaterial({ color: 0xfdfbe8, emissive: 0xfff3c0, emissiveIntensity: 0.35, roughness: 0.4 }), 17.4, D + 2.2 - i * 0.9, 3.2),
  );
  addCylinder(group, 17.4, 3.2, 0.05, 0.05, Q, D + 2.6 - Q, darkGreen, 8);

  // Arcade shop fronts under the walkway: eight shops painted on one plane.
  const shopfrontTexture = canvasTexture(1024, 256, (ctx, width, height) => {
    const random = createRandom(66);
    ctx.fillStyle = '#3a4a3c';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = ['#f1e2a2', '#e8734a', '#2f9c8a', '#f6f1dc'][i % 4];
      ctx.fillRect(i * 128 + 6, 6, 116, 44); // sign board
      ctx.fillStyle = '#25312a';
      ctx.fillRect(i * 128 + 10, 58, 108, 190); // dark interior
      for (let k = 0; k < 26; k++) {
        ctx.fillStyle = DECO_COLORS[(random() * DECO_COLORS.length) | 0];
        ctx.fillRect(i * 128 + 14 + random() * 96, 70 + random() * 160, 8 + random() * 14, 8 + random() * 12); // goods
      }
      ctx.fillStyle = '#fff8d0';
      ctx.globalAlpha = 0.25;
      ctx.fillRect(i * 128 + 10, 58, 108, 40);
      ctx.globalAlpha = 1;
    }
  });
  addMesh(group, new PlaneGeometry(19, 4.6), new MeshStandardMaterial({ map: shopfrontTexture, roughness: 0.8 }), 27.5, Q + 2.6, -2.95);

  return { object: group };
}
