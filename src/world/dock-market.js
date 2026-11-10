// dock-market.js
// The floating water-bus stop (12) with its waiting passengers, and the market stalls with
// their vendors (13).

import { BoxGeometry, CylinderGeometry, DoubleSide, Group, MeshStandardMaterial, PlaneGeometry, SphereGeometry, TorusGeometry } from 'three';
import { QUAY_HEIGHT, addCylinder, addMesh, createRandom, standardMaterial } from '../core/helpers.js';
import { SKIN_TONES, animateIdle, createPerson } from '../core/person.js';
import { addSign, createStripeTexture, woodTexture } from '../core/textures.js';

export function buildDockAndMarket() {
  const group = new Group();
  const Q = QUAY_HEIGHT;
  const idlers = [];

  // --- 12: the floating dock -------------------------------------------------------------
  // Everything that floats is a child of `dock`, so one bobbing transform moves the deck,
  // the shelter AND the passengers standing on it. Children are positioned in the dock's
  // local space, which here is just world space shifted 3.1 m along x.
  const dock = new Group();
  dock.position.x = -3.1;
  group.add(dock);
  addMesh(dock, new BoxGeometry(4.6, 0.35, 11.6), new MeshStandardMaterial({ map: woodTexture, roughness: 0.9 }), 18.2, 0.42, 18.8);
  addMesh(dock, new BoxGeometry(4.7, 0.5, 0.3), standardMaterial(0xb8452f), 18.2, 0.3, 13.0);
  addMesh(dock, new BoxGeometry(0.3, 0.5, 11.7), standardMaterial(0xb8452f), 15.9, 0.3, 18.8);
  // Tyre fenders along the side.
  for (let i = 0; i < 5; i++) {
    addMesh(dock, new TorusGeometry(0.33, 0.13, 12, 24), standardMaterial(0x23262a, { roughness: 0.9 }), 15.72, 0.3, 14.4 + i * 2.2, { rotateY: Math.PI / 2 });
  }
  // Mooring piles are fixed to the canal bed, so they go on the outer group (world space)
  // and don't bob with the dock.
  [
    [13.1, 13.4],
    [13.1, 24.2],
    [17.2, 13.4],
    [17.2, 24.2],
  ].forEach(([x, z]) => addCylinder(group, x, z, 0.14, 0.16, -1, 4.2, standardMaterial(0x6b5a3a), 12));

  // Shelter with the yellow sign.
  [
    [16.6, 14.2],
    [16.6, 23.4],
    [20.2, 14.2],
    [20.2, 23.4],
  ].forEach(([x, z]) => addMesh(dock, new CylinderGeometry(0.06, 0.06, 2.9, 8), standardMaterial(0x2f5f2a), x, 2.05, z));
  addMesh(dock, new BoxGeometry(4.4, 0.1, 10), new MeshStandardMaterial({ map: createStripeTexture(['#f1c53a', '#f6efd2'], 10, false), roughness: 0.8 }), 18.4, 3.55, 18.8, { rotateZ: 0.06 });
  addSign(dock, '水上バス', 5.4, 0.95, 16.25, 3.0, 18.8, -Math.PI / 2, { w: 512, h: 96, bg: '#f1d84a', fg: '#2f6b3a', border: '#2f6b3a', lw: 6 });

  // Gangway to the quay. It is fixed to the quay, so it doesn't bob either.
  addMesh(group, new BoxGeometry(2.4, 0.12, 1.6), new MeshStandardMaterial({ map: woodTexture }), 17.6, 0.75, 18.8, { rotateZ: 0.2 });

  // Passengers waiting on the dock. Their coordinates are world positions converted to the
  // dock's local space (x + 3.1).
  [
    [14.3, 15.5, -1.3, { top: 0xf6efd2, bottom: 0x8a6a4a, hat: true, skin: SKIN_TONES[1] }],
    [15.2, 17.2, -1.6, { top: 0xe7c23a, skirt: 0xf1e2a2, hair: 0x1f1a16, bob: true, scale: 0.95 }],
    [14.1, 19.4, -1.5, { top: 0x6fa8c8, bottom: 0x4a4438, hair: 0x3a2a1c, pack: 0xc8452f }],
    [15.5, 21.3, -1.9, { top: 0xf4f0e0, bottom: 0x54616e, hat: true, scale: 0.78 }],
    [16.3, 14, -1.2, { top: 0xd86a8f, bottom: 0x3f4a58, hair: 0x2b2118 }],
  ].forEach(([x, z, yaw, options], i) => {
    const person = createPerson(options);
    person.root.position.set(x - dock.position.x, 0.62, z);
    person.root.rotation.y = yaw;
    person.leftArm.elbow.rotation.x = -0.3;
    person.rightArm.elbow.rotation.x = -0.3;
    dock.add(person.root);
    idlers.push({ person, phase: i * 1.9, yaw });
  });

  // --- 13: market stalls -----------------------------------------------------------------
  const random = createRandom(71);
  [
    [26.4, 12.4],
    [26.4, 16.9],
    [26.4, 21.5],
    [33, 10.5],
    [33, 22.5],
  ].forEach(([x, z], i) => {
    addMesh(group, new BoxGeometry(2.6, 0.9, 2), new MeshStandardMaterial({ map: woodTexture, roughness: 0.9 }), x, Q + 0.45, z);
    [
      [-1.2, -0.9],
      [1.2, -0.9],
      [-1.2, 0.9],
      [1.2, 0.9],
    ].forEach(([dx, dz]) => addMesh(group, new CylinderGeometry(0.04, 0.04, 2.5, 6), standardMaterial(0x6b5a3a), x + dx, Q + 1.25, z + dz));
    const awningTexture = createStripeTexture(i % 2 ? ['#f1c53a', '#f8f0c8'] : ['#f1b53a', '#fff6d0'], 8, true);
    addMesh(group, new PlaneGeometry(3.2, 2.6), new MeshStandardMaterial({ map: awningTexture, side: DoubleSide, roughness: 0.8 }), x, Q + 2.6, z).rotation.set(-Math.PI / 2, 0.14, 0);
    for (let k = 0; k < 16; k++) {
      addMesh(group, new SphereGeometry(0.13, 10, 8), standardMaterial([0xe2574a, 0xf1a53a, 0x7fc45a, 0xf1d84a, 0xa85ab0][k % 5], { roughness: 0.5 }), x + (random() - 0.5) * 2.2, Q + 1.0, z + (random() - 0.5) * 1.6);
    }
    const vendor = createPerson({ top: [0xf6efd2, 0x6fa8c8, 0xe8734a][i % 3], bottom: 0x4a4438, hat: i % 2 === 0, hair: 0x2b2118, skin: SKIN_TONES[i % 4] });
    vendor.root.position.set(x + 1.9, Q, z + (random() - 0.5));
    vendor.root.rotation.y = -Math.PI / 2;
    vendor.leftArm.elbow.rotation.x = -1.1;
    group.add(vendor.root);
    idlers.push({ person: vendor, phase: i * 2.3, yaw: -Math.PI / 2 });
  });
  const longAwningTexture = createStripeTexture(['#f1c53a', '#fbf3cf'], 10, true);
  addMesh(group, new PlaneGeometry(2.8, 16), new MeshStandardMaterial({ map: longAwningTexture, side: DoubleSide, roughness: 0.8 }), 32.2, Q + 3.4, 17).rotation.set(-Math.PI / 2, -0.35, 0);

  return {
    object: group,
    update(time) {
      // Bob and roll gently. The passengers ride along because they are children of the dock.
      dock.position.y = Math.sin(time * 0.9 + 2) * 0.035;
      dock.rotation.z = Math.sin(time * 0.7) * 0.004;
      for (const { person, phase, yaw } of idlers) animateIdle(person, time, phase, yaw);
    },
  };
}
