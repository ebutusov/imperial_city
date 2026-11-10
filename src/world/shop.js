// shop.js
// The grocery shop (1): shopfront, awning, arched lattice window, curved roof, rooftop
// emblem, crates of produce, plus the ornate kiosk lamp on the quay edge.

import {
  BoxGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector2,
} from 'three';
import { JP_FONT, QUAY_HEIGHT, addMesh, canvasTexture, createRandom, drawSpeckles, sharedRandom, standardMaterial } from '../core/helpers.js';
import { addLeafCluster } from '../core/foliage.js';
import { addBanner, addSign, createStripeTexture, woodTexture } from '../core/textures.js';

export function buildShop() {
  const group = new Group();

  // The shop is modelled in its OWN local space: the front faces +z, centred on x = 0, the
  // floor at y = 0. A parent Group then places and turns the whole thing. It is far easier
  // to think "awning 1.2 m in front of the facade" than to work out world
  // coordinates for a building rotated 90°.
  const shop = new Group();
  shop.position.set(-31.2, QUAY_HEIGHT, 17.55);
  shop.rotation.y = Math.PI / 2;
  group.add(shop);

  const W = 14.3; // width
  const D = 13; // depth
  const front = D / 2;

  // Teal clapboard walls.
  const boardTexture = canvasTexture(
    256,
    256,
    (ctx, width, height) => {
      const random = createRandom(13);
      ctx.fillStyle = '#27504b';
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 10; i++) {
        const v = (random() * 18) | 0;
        ctx.fillStyle = `rgb(${30 + v},${72 + v},${68 + v})`;
        ctx.fillRect(i * 26, 0, 24, height);
      }
      drawSpeckles(ctx, width, height, 1500, 0.1, random);
    },
    { repeat: [3, 2] },
  );
  addMesh(shop, new BoxGeometry(W, 8.1, D), new MeshStandardMaterial({ map: boardTexture, roughness: 0.8 }), 0, 4.05, 0);

  // --- Ground floor shopfront: shelves of produce, all painted ----------------------------
  const shopfrontTexture = canvasTexture(1024, 300, (ctx, width, height) => {
    const random = createRandom(17);
    ctx.fillStyle = '#1b2f2c';
    ctx.fillRect(0, 0, width, height);
    for (let shelf = 0; shelf < 4; shelf++) {
      const y = 30 + shelf * 56;
      ctx.fillStyle = '#b9905a';
      ctx.fillRect(250, y + 44, 760, 7);
      for (let i = 0; i < 34; i++) {
        ctx.fillStyle = ['#e8734a', '#f1c53a', '#7fc45a', '#f6f1dc', '#d86a8f', '#3f9c8a'][(random() * 6) | 0];
        const boxWidth = 12 + random() * 14;
        ctx.fillRect(256 + i * 22, y + 44 - (18 + random() * 22), boxWidth, 18 + random() * 22);
      }
    }
    // Checkerboard tiles.
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        ctx.fillStyle = (i + j) % 2 ? '#3f6fb0' : '#f4f1e2';
        ctx.fillRect(20 + i * 42, height - 5 * 26 + j * 26, 42, 26);
      }
    }
    ctx.fillStyle = '#f6f1dc';
    ctx.fillRect(30, 20, 80, 110);
    ctx.fillStyle = '#c8452f';
    ctx.font = `700 44px ${JP_FONT}`;
    ctx.fillText('菜', 48, 70);
    ctx.fillText('果', 48, 116);
    ctx.fillStyle = '#e7a93a';
    ctx.fillRect(130, 20, 90, 60);
    ctx.fillStyle = '#2b3a30';
    ctx.font = `700 30px ${JP_FONT}`;
    ctx.fillText('特売', 146, 60);
    // Dark at the top: the awning's shadow baked into the texture. Baked lighting is free
    // at runtime and often looks softer than real-time shadows.
    const awningShade = ctx.createLinearGradient(0, 0, 0, height);
    awningShade.addColorStop(0, 'rgba(0,0,0,.45)');
    awningShade.addColorStop(0.5, 'rgba(0,0,0,0)');
    ctx.fillStyle = awningShade;
    ctx.fillRect(0, 0, width, height);
  });
  // +0.02 m in front of the wall. Two coplanar surfaces would "z-fight" (flicker as
  // the depth test can't decide which is in front), so overlays always get a small offset.
  addMesh(shop, new PlaneGeometry(W - 0.6, 3.5), new MeshStandardMaterial({ map: shopfrontTexture, roughness: 0.8 }), 0, 1.8, front + 0.02);
  [-W / 2 + 0.25, W / 2 - 0.25, -2.2].forEach((x) => addMesh(shop, new BoxGeometry(0.4, 3.6, 0.4), standardMaterial(0xc8452f, { roughness: 0.6 }), x, 1.8, front + 0.15));

  // --- Striped awning with a scalloped edge -----------------------------------------------
  const awningTexture = createStripeTexture(['#e8734a', '#f6efd2'], 14, true);
  addMesh(shop, new PlaneGeometry(W + 0.8, 2.6), new MeshStandardMaterial({ map: awningTexture, side: DoubleSide, roughness: 0.8 }), 0, 3.35, front + 1.2, { rotateX: -Math.PI / 2 + 0.28 });
  const scallopTexture = canvasTexture(512, 64, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? '#f6efd2' : '#e8734a';
      ctx.beginPath();
      ctx.arc((i * width) / 14 + width / 28, 0, width / 28, 0, Math.PI);
      ctx.fill();
    }
  });
  addMesh(shop, new PlaneGeometry(W + 0.8, 0.5), new MeshStandardMaterial({ map: scallopTexture, alphaTest: 0.5, side: DoubleSide }), 0, 2.76, front + 2.45);
  [-W / 2, W / 2].forEach((x) => addMesh(shop, new CylinderGeometry(0.05, 0.05, 3, 8), standardMaterial(0x2f5f2a), x, 1.5, front + 2.4));

  // --- Green wavy fascia: a cut-out wave drawn on canvas -----------------------------------
  const fasciaTexture = canvasTexture(1024, 128, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 8) ctx.lineTo(x, 38 + Math.sin((x / width) * 6.283 * 3.5) * 22);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = '#3fae3a';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#f1d84a';
    ctx.stroke();
    ctx.fillStyle = '#bff08a';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(20 + i * 34, 96, 5, 0, 7);
      ctx.fill();
    }
  });
  addMesh(shop, new PlaneGeometry(W, 1.5), new MeshStandardMaterial({ map: fasciaTexture, alphaTest: 0.5, side: DoubleSide, roughness: 0.5 }), 0, 4.35, front + 0.3);

  // --- Upper arched lattice window -------------------------------------------------------
  const archTexture = canvasTexture(1024, 512, (ctx, width, height) => {
    const traceArch = () => {
      ctx.beginPath();
      ctx.moveTo(90, height - 20);
      ctx.lineTo(90, 300);
      ctx.quadraticCurveTo(width / 2, -120, width - 90, 300);
      ctx.lineTo(width - 90, height - 20);
    };
    ctx.fillStyle = '#234a45';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    traceArch();
    ctx.closePath();
    ctx.fillStyle = '#0f1f1e';
    ctx.fill();
    // clip() limits all following drawing to the arch, an easy way to keep the
    // lattice inside the window.
    ctx.clip();
    const glassTint = ctx.createLinearGradient(0, 0, width, height);
    glassTint.addColorStop(0, 'rgba(140,200,190,.35)');
    glassTint.addColorStop(1, 'rgba(240,220,140,.12)');
    ctx.fillStyle = glassTint;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#3a726a';
    ctx.lineWidth = 7;
    for (let x = 90; x < width - 80; x += 58) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 60; y < height; y += 58) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#3d7d74';
    traceArch();
    ctx.stroke();
    // Two flowers.
    [
      [250, 250, '#f4f0e0'],
      [390, 170, '#e2574a'],
    ].forEach(([fx, fy, petal]) => {
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * 6.283;
        ctx.fillStyle = petal;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(angle) * 30, fy + Math.sin(angle) * 30, 22, 9, angle, 0, 7);
        ctx.fill();
      }
      ctx.fillStyle = '#f1c53a';
      ctx.beginPath();
      ctx.arc(fx, fy, 13, 0, 7);
      ctx.fill();
    });
  });
  addMesh(shop, new PlaneGeometry(W - 0.4, 4), new MeshStandardMaterial({ map: archTexture, roughness: 0.55 }), 0, 6.1, front + 0.03);

  // --- Curved roof and gable -------------------------------------------------------------
  // Half a cylinder (thetaStart π/2, thetaLength π) laid on its side, then squashed
  // vertically (scale z = 0.36 *before* the rotation, which becomes the height) into a
  // shallow barrel roof.
  const roofMaterial = new MeshStandardMaterial({ color: 0x1f4540, roughness: 0.55, metalness: 0.2, side: DoubleSide });
  const roof = new Mesh(new CylinderGeometry(W / 2 + 0.5, W / 2 + 0.5, D + 1.2, 48, 1, false, Math.PI / 2, Math.PI), roofMaterial);
  roof.rotation.x = Math.PI / 2;
  roof.scale.set(1, 1, 0.36);
  roof.position.set(0, 8.1, 0);
  roof.castShadow = true;
  shop.add(roof);
  addMesh(shop, new CircleGeometry(W / 2 + 0.5, 48, 0, Math.PI), new MeshStandardMaterial({ color: 0x2b5a54, roughness: 0.6, side: DoubleSide }), 0, 8.1, front + 0.6, { scale: [1, 0.36, 1] });
  addMesh(shop, new BoxGeometry(W + 1.2, 0.3, D + 1.4), standardMaterial(0x3d7d74), 0, 8.05, 0);

  // --- Rooftop emblem with string lights -------------------------------------------------
  const emblemTexture = canvasTexture(512, 320, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height * 0.56);
    // A 20-point star: alternate between an outer and an inner radius.
    ctx.fillStyle = '#e9c24c';
    ctx.strokeStyle = '#fff3b8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 6.283 - 1.57;
      const radius = i % 2 ? 92 : 150;
      ctx.lineTo(Math.cos(angle) * radius * 1.45, Math.sin(angle) * radius * 0.9);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8e7a0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 96, 66, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = '#c9952e';
    ctx.lineWidth = 7;
    for (let k = -1; k <= 1; k += 2) {
      ctx.beginPath();
      ctx.arc(k * 40, 6, 26, 0, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(k * 150, 60, 34, 3.6, 8);
      ctx.stroke();
    }
    ctx.fillStyle = '#c8452f';
    ctx.font = `700 54px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('菜', 0, -34);
  });
  addMesh(shop, new PlaneGeometry(8.4, 5.2), new MeshStandardMaterial({ map: emblemTexture, alphaTest: 0.5, side: DoubleSide, roughness: 0.4, metalness: 0.3 }), -1, 11.9, front - 1.2);
  for (let i = 0; i < 26; i++) {
    const angle = (i / 25) * Math.PI;
    addMesh(shop, new SphereGeometry(0.09, 8, 6), new MeshStandardMaterial({ color: 0xfff2a8, emissive: 0xffcf5a, emissiveIntensity: 1.5 }), -1 + Math.cos(angle) * 5.4, 10.2 + Math.sin(angle) * 4.2, front - 1.15, {
      castShadow: false,
    });
  }

  // --- Lantern sign and hanging shop banner ----------------------------------------------
  addSign(shop, 'あ', 1.5, 1.5, -5.6, 4.4, front + 2.2, 0, { round: true, bg: '#fbf3cf', border: '#e7862e', fg: '#e7862e' });
  addMesh(shop, new CylinderGeometry(0.03, 0.03, 1.2, 6), standardMaterial(0x1d2a24), -5.6, 5.6, front + 2.2);
  addBanner(shop, 'やさいくだもの', 1.5, 4.6, W / 2 + 1.3, 5.2, front + 1.5, 0, { bg: '#23408e', fg: '#f6f1dc', border: '#f1c53a' });
  addMesh(shop, new BoxGeometry(2.4, 0.1, 0.1), standardMaterial(0x1d2a24), W / 2 + 0.5, 7.6, front + 1.5);

  // --- Crates of produce -----------------------------------------------------------------
  const random = createRandom(55);
  const crateMaterial = new MeshStandardMaterial({ map: woodTexture, roughness: 0.9 });
  [
    [-4.4, 7.6, 0xe2574a],
    [-3.1, 7.9, 0xf1a53a],
    [1.2, 8.1, 0x7fc45a],
    [2.6, 7.8, 0xf1d84a],
    [4.4, 7.7, 0xe8734a],
    [5.7, 8.0, 0x9ad05a],
  ].forEach(([x, z, fruitColor]) => {
    addMesh(shop, new BoxGeometry(1.1, 0.55, 0.8), crateMaterial, x, 0.28, z, { rotateY: (random() - 0.5) * 0.4 });
    for (let i = 0; i < 9; i++) {
      addMesh(shop, new SphereGeometry(0.14, 12, 10), standardMaterial(fruitColor, { roughness: 0.5 }), x + (random() - 0.5) * 0.8, 0.62 + random() * 0.06, z + (random() - 0.5) * 0.5);
    }
  });
  addMesh(shop, new BoxGeometry(1.0, 0.5, 0.7), standardMaterial(0xe6cf6a, { roughness: 1 }), -6.3, 0.25, 9.6);

  // A-frame blackboard and a potted plant.
  [-0.22, 0.22].forEach((_, i) =>
    addMesh(shop, new BoxGeometry(0.9, 1.2, 0.05), standardMaterial(i ? 0x2b3a30 : 0x1f2a24), 3.4, 0.6, 9.6 + (i ? 0.2 : -0.2), { rotateX: i ? -0.25 : 0.25 }),
  );
  addMesh(shop, new CylinderGeometry(0.3, 0.22, 0.5, 16), standardMaterial(0xe8c23a), 6.6, 0.25, 7.4);

  // Teal parasol stall at the south end.
  addMesh(shop, new CylinderGeometry(0.04, 0.04, 2.6, 8), standardMaterial(0x6b5a3a), -6.6, 1.3, 8.2);
  addMesh(shop, new ConeGeometry(1.6, 0.6, 32, 1, true), new MeshStandardMaterial({ color: 0x2fb0a0, side: DoubleSide, roughness: 0.7 }), -6.6, 2.7, 8.2);

  // Greenery around the shop (world coordinates, on the outer group).
  addLeafCluster(-33.2, QUAY_HEIGHT + 4.6, 23.4, 1.2, 1.0, 3.5, 220, 'bright', sharedRandom, 0.6);
  addLeafCluster(-24.3, QUAY_HEIGHT + 9, 11, 1.6, 2.2, 1.6, 200, 'mid', sharedRandom, 0.7);

  // --- Ornate kiosk lamp on the quay edge: a single LatheGeometry profile ----------------
  {
    const x = -19.3;
    const z = 17;
    const profile = [
      [0.55, 0],
      [0.6, 0.15],
      [0.5, 0.3],
      [0.52, 1.7],
      [0.62, 1.85],
      [0.45, 2.0],
      [0.5, 2.5],
      [0.62, 2.6],
      [0.3, 2.85],
      [0.1, 3.2],
      [0, 3.25],
    ].map(([radius, y]) => new Vector2(radius, y));
    addMesh(group, new LatheGeometry(profile, 32), standardMaterial(0x2f6b4a, { roughness: 0.5, metalness: 0.3 }), x, QUAY_HEIGHT, z);
    addMesh(group, new CylinderGeometry(0.46, 0.46, 0.44, 24), new MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xffe9a0, emissiveIntensity: 0.6 }), x, QUAY_HEIGHT + 2.26, z, { castShadow: false });
  }

  return { object: group };
}
