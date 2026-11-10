// watermelons.js
// The "chilled" sign, the watermelons floating in the canal to keep cool (3), bollards and grass.

import { CylinderGeometry, Group, MeshStandardMaterial, PlaneGeometry, SphereGeometry, DoubleSide } from 'three';
import { QUAY_HEIGHT, addCylinder, addMesh, canvasTexture, createRandom, mapToWorld, sharedRandom, standardMaterial } from '../core/helpers.js';
import { addLeafCluster } from '../core/foliage.js';
import { createSignTexture } from '../core/textures.js';

export function buildWatermelons() {
  const group = new Group();
  const x = -18.5;
  const z = 25.9;

  // A leaning sign post. Its own group, so the lean (rotation.z) and turn (rotation.y)
  // apply to the post and the board together.
  const post = new Group();
  post.position.set(x, 0, z);
  post.rotation.z = -0.12;
  post.rotation.y = 0.25;
  group.add(post);
  addMesh(post, new CylinderGeometry(0.05, 0.05, 3.6, 8), standardMaterial(0x8a7a5a), 0, 1.4, 0);
  const signTexture = createSignTexture('ひえてるよ', {
    w: 160,
    h: 512,
    vertical: true,
    bg: '#fdfdf6',
    fg: '#2a6fc0',
    border: '#2a6fc0',
    lw: 6,
    // Little water droplets along the bottom.
    deco: (ctx, width, height) => {
      ctx.fillStyle = '#7fc0ee';
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(20 + i * 15, height - 22 + (i % 2) * 8, 5, 0, 7);
        ctx.fill();
      }
    },
  });
  addMesh(post, new PlaneGeometry(0.95, 2.9), new MeshStandardMaterial({ map: signTexture, side: DoubleSide, roughness: 0.7 }), 0, 2.6, 0.06);

  // Watermelon rind: wavy dark stripes. A sphere's UVs run around the equator (u) and
  // pole to pole (v), so vertical stripes in the texture become stripes from pole to pole.
  const melonTexture = canvasTexture(256, 128, (ctx, width, height) => {
    ctx.fillStyle = '#2f8a2f';
    ctx.fillRect(0, 0, width, height);
    const random = createRandom(6);
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = '#123f17';
      ctx.lineWidth = 7 + random() * 4;
      ctx.beginPath();
      const x0 = (i * width) / 12 + width / 24;
      ctx.moveTo(x0, 0);
      for (let y = 0; y <= height; y += 8) ctx.lineTo(x0 + Math.sin(y * 0.25 + i) * 4, y);
      ctx.stroke();
    }
  });
  // Fairly low roughness: wet melons are shiny.
  const melonMaterial = new MeshStandardMaterial({ map: melonTexture, roughness: 0.35 });

  // Real-world scale: a watermelon is ~0.35 m long, a person ~1.7 m. Modelling in metres
  // (see helpers.js) means you can sanity-check sizes like this against real objects.
  const floaters = [];
  const MELON_COUNT = 12;
  const MAX_RADIUS = 0.19 * 1.12; // largest radius × the stretch along the long axis
  const DRIFT = 0.08; // how far update() lets a melon wander from its spot
  // Two melons never touch if their centres are further apart than both radii plus both drifts.
  const MIN_SPACING = 2 * (MAX_RADIUS + DRIFT);

  // The quay wall along here runs slightly diagonally. It is the left bank's edge between
  // map points (200, 330) and (190, 480) (see ground.js), so we interpolate along that edge
  // to find the wall's x at any z.
  const [wallX1, wallZ1] = mapToWorld(200, 330);
  const [wallX2, wallZ2] = mapToWorld(190, 480);
  const wallXAt = (pz) => wallX1 + ((wallX2 - wallX1) * (pz - wallZ1)) / (wallZ2 - wallZ1);

  // Scatter with "rejection sampling": propose a random spot, keep it only if it is far
  // enough from every melon placed so far (and from the sign post). It is the simplest way
  // to get a natural-looking scatter without overlaps. Proper Poisson-disc sampling does
  // the same job faster for thousands of points. With a dozen points, simple is fine.
  // It has its own seed, so changing the melons can't disturb anything else in the scene.
  const random = createRandom(12);
  const spots = [];
  for (let attempt = 0; attempt < 2000 && spots.length < MELON_COUNT; attempt++) {
    const pz = 24.2 + random() * 5.2;
    // random() squared bunches values near 0, so most melons huddle against the wall,
    // where they have drifted and collected. Clearance = radius + drift + a hair.
    const px = wallXAt(pz) + MAX_RADIUS + DRIFT + 0.04 + random() * random() * 1.6;
    const radius = 0.16 + random() * 0.03;
    const clearOfPost = Math.hypot(px - x, pz - z) > MAX_RADIUS + DRIFT + 0.1;
    const clearOfMelons = spots.every((s) => Math.hypot(px - s.x, pz - s.z) > MIN_SPACING);
    if (clearOfPost && clearOfMelons) spots.push({ x: px, z: pz, radius });
  }

  spots.forEach(({ x: px, z: pz, radius }, i) => {
    // The scale stretches each melon by 1.12 along its long axis.
    const melon = addMesh(group, new SphereGeometry(radius, 32, 24), melonMaterial, px, 0.03, pz, { scale: [1.12, 1, 1] });
    melon.rotation.set(Math.PI / 2 + i, i * 1.3, 0);
    // Centre slightly above the waterline: a floating melon rides low, a bit over half submerged.
    floaters.push({ mesh: melon, phase: i * 1.7, baseY: 0.03, amplitude: 0.02, x: px, z: pz });
  });

  addLeafCluster(-20.6, QUAY_HEIGHT + 0.25, 26.8, 1.5, 0.35, 2.2, 260, 'bright', sharedRandom, 0.5);
  addLeafCluster(-20.4, QUAY_HEIGHT + 0.2, 22.9, 0.8, 0.3, 1.2, 110, 'bright', sharedRandom, 0.45);
  // Bollards along the quay edge.
  for (let i = 0; i < 5; i++) {
    addCylinder(group, -19.6 + ((i * 37) % 7) * 0.03, 10 + i * 4.1, 0.13, 0.16, QUAY_HEIGHT, 0.55, standardMaterial(0x3a4a3c, { metalness: 0.4, roughness: 0.5 }), 14);
  }

  return {
    object: group,
    update(time, delta) {
      // Floating: bob up and down, drift in a small loop, spin slowly and roll. Each
      // melon gets its own phase so they don't move as one block.
      for (const f of floaters) {
        f.mesh.position.y = f.baseY + Math.sin(time * 1.5 + f.phase) * f.amplitude;
        // Drift: at most √(0.06² + 0.05²) ≈ 0.078 m, within the DRIFT allowance used when
        // placing them, so neighbours never overlap and nothing pokes into the wall.
        f.mesh.position.x = f.x + Math.sin(time * 0.4 + f.phase) * 0.06;
        f.mesh.position.z = f.z + Math.cos(time * 0.33 + f.phase * 1.3) * 0.05;
        // `+=` with delta: a steady spin. The other lines *set* absolute values from time.
        f.mesh.rotation.y += delta * 0.12 * Math.sin(f.phase);
        f.mesh.rotation.z = Math.sin(time * 0.9 + f.phase) * 0.1;
      }
    },
  };
}
