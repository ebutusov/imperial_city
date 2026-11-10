// buildings.js
// A reusable building generator and every building on the map: the overgrown tower block,
// the round towers, the dark lantern tower, the tank building, the canal tunnel (14) and the
// distant skyline.

import {
  BoxGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  LinearSRGBColorSpace,
} from 'three';
import { QUAY_HEIGHT, addCylinder, addMesh, canvasTexture, createRandom, sharedRandom, standardMaterial } from '../core/helpers.js';
import { cream, darkTeal, roofConcrete, teal } from '../core/materials.js';
import { addLeafCluster } from '../core/foliage.js';
import { addBanner, addRailing, addSign, createFacadeTexture, createStripeTexture, quayWallTexture } from '../core/textures.js';

const FLOOR_HEIGHT = 3.3;

/**
 * A box building with a painted facade, a roof trim, and optional balconies and greenery.
 *
 * BoxGeometry has six material groups in the order +x, -x, +y, -y, +z, -z. An array of six
 * materials therefore lets the top and bottom (indices 2 and 3) use a roof material while
 * the sides share the facade.
 *
 * @param {number} cx  centre of the footprint
 * @param {number} cz
 * @param {number} width  along x
 * @param {number} depth  along z
 * @param {number} height
 * @param {object} [options]
 * @param {number} [options.baseY=QUAY_HEIGHT]
 * @param {string} [options.base]  wall colour
 * @param {number} [options.trim]  roof trim colour
 * @param {string} [options.frame]  window frame colour
 * @param {number} [options.moss]
 * @param {number} [options.seed]
 * @param {boolean} [options.far]  skyline building: no balconies or greenery
 * @param {string} [options.balconies]  which faces get balconies, e.g. 'se' ('n','s','e','w')
 * @param {number} [options.balconyFrom=2]  first balcony floor
 * @param {number} [options.balconyStep=2]  floors between balconies
 * @param {number} [options.railColor]
 * @param {number} [options.greenery=0]  number of rooftop and wall plant clusters
 * @param {'deep'|'mid'|'bright'} [options.palette='mid']
 */
export function addBuilding(parent, cx, cz, width, depth, height, options = {}) {
  const baseY = options.baseY === undefined ? QUAY_HEIGHT : options.baseY;
  const random = createRandom(options.seed || Math.round(cx * 13 + cz * 7 + height));
  const facade = createFacadeTexture({
    base: options.base || '#dccf8c',
    rows: Math.max(2, Math.round(height / FLOOR_HEIGHT)),
    cols: Math.max(2, Math.round(Math.max(width, depth) / 2.7)),
    seed: options.seed || Math.round(cx * 3 + cz),
    moss: options.moss,
    frame: options.frame,
  });
  const side = new MeshStandardMaterial({ map: facade, roughness: 0.9 });
  addMesh(parent, new BoxGeometry(width, height, depth), [side, side, roofConcrete, roofConcrete, side, side], cx, baseY + height / 2, cz);
  addMesh(parent, new BoxGeometry(width + 0.5, 0.35, depth + 0.5), standardMaterial(options.trim || 0xeee8c6), cx, baseY + height + 0.17, cz);
  if (options.far) return;

  // Each face: [normal x, normal z, face length, position of the face plane].
  const faces = {
    s: [0, 1, width, cz + depth / 2],
    n: [0, -1, width, cz - depth / 2],
    e: [1, 0, depth, cx + width / 2],
    w: [-1, 0, depth, cx - width / 2],
  };
  const palette = options.palette || 'mid';

  for (const faceName of (options.balconies || '').split('')) {
    const face = faces[faceName];
    if (!face) continue;
    const [normalX, normalZ, faceLength, facePlane] = face;
    for (let y = baseY + FLOOR_HEIGHT * (options.balconyFrom || 2); y < baseY + height - 2; y += FLOOR_HEIGHT * (options.balconyStep || 2)) {
      const length = faceLength * (0.55 + random() * 0.4);
      const offset = (random() - 0.5) * (faceLength - length);
      if (normalX === 0) {
        const z = facePlane + normalZ * 0.55;
        addMesh(parent, new BoxGeometry(length, 0.16, 1.1), standardMaterial(0xe8e2be), cx + offset, y, z);
        addRailing(parent, cx + offset - length / 2, z + normalZ * 0.52, cx + offset + length / 2, z + normalZ * 0.52, y, 1, options.railColor);
      } else {
        const x = facePlane + normalX * 0.55;
        addMesh(parent, new BoxGeometry(1.1, 0.16, length), standardMaterial(0xe8e2be), x, y, cz + offset);
        addRailing(parent, x + normalX * 0.52, cz + offset - length / 2, x + normalX * 0.52, cz + offset + length / 2, y, 1, options.railColor);
      }
      // Potted plants on most balconies.
      if (random() < 0.7) {
        const plantX = normalX === 0 ? cx + offset + (random() - 0.5) * length : facePlane + normalX * 0.9;
        const plantZ = normalX === 0 ? facePlane + normalZ * 0.9 : cz + offset + (random() - 0.5) * length;
        addLeafCluster(plantX, y + 0.2, plantZ, 1.3, 1.6, 1.3, 70, palette, random, 0.55);
      }
    }
  }

  // Greenery: rooftop gardens, or creepers hanging down a wall.
  for (let i = 0; i < (options.greenery || 0); i++) {
    const [normalX, normalZ, faceLength, facePlane] = faces[['s', 'n', 'e', 'w'][(random() * 4) | 0]];
    const along = (random() - 0.5) * faceLength;
    const px = normalX === 0 ? cx + along : facePlane + normalX * 0.3;
    const pz = normalX === 0 ? facePlane + normalZ * 0.3 : cz + along;
    if (random() < 0.5) {
      addLeafCluster(px, baseY + height + 0.6, pz, 2.2 + random() * 1.5, 1.2 + random(), 2.2 + random() * 1.5, 170, palette, random, 0.8);
    } else {
      // A flattened ellipsoid hugging the wall: thin along the wall's normal.
      const y = baseY + height * (0.35 + random() * 0.6);
      addLeafCluster(px, y, pz, normalX === 0 ? 2 + random() * 2 : 0.7, 2.5 + random() * 3, normalX === 0 ? 0.7 : 2 + random() * 2, 190, palette, random, 0.7);
    }
  }
}

/** Glowing bulb material. Emissive light is added after lighting, so it glows even in shadow. */
function bulbMaterial(color, emissive, emissiveIntensity) {
  return new MeshStandardMaterial({ color, emissive, emissiveIntensity });
}

export function buildBuildings() {
  const group = new Group();
  const Q = QUAY_HEIGHT;

  // --- 8: overgrown tower block with round upper works ----------------------------------
  addBuilding(group, -17.5, -20.2, 14.3, 14.3, 40, { base: '#e2d489', balconies: 'se', greenery: 26, palette: 'bright', seed: 41, moss: 120 });
  addBuilding(group, -17.5, -21.5, 10.5, 10.5, 14, { baseY: Q + 40, base: '#e3dba6', greenery: 14, palette: 'bright', seed: 42 });
  addCylinder(group, -17.5, -21.5, 5.6, 5.6, Q + 54, 11, new MeshStandardMaterial({ map: createFacadeTexture({ base: '#d9d2a0', rows: 3, cols: 12, seed: 5 }), roughness: 0.85 }));
  [55.5, 60, 65].forEach((y, i) => {
    addCylinder(group, -17.5, -21.5, 7.4 - i * 0.5, 6.2 - i * 0.4, Q + y, 0.5, cream);
    // TorusGeometry is built in the x/y plane. Rotate 90° about x to make a horizontal ring.
    addMesh(group, new TorusGeometry(7.3 - i * 0.5, 0.09, 8, 60), darkTeal, -17.5, Q + y + 1.3, -21.5, { rotateX: Math.PI / 2 });
  });
  addCylinder(group, -17.5, -21.5, 3.2, 5.6, Q + 65.5, 3, teal);
  addLeafCluster(-17.5, Q + 70, -21.5, 5, 3, 5, 500, 'bright', sharedRandom, 1.1);
  addCylinder(group, -9.6, -25, 1.5, 1.7, Q + 40, 34, cream);
  addCylinder(group, -9.6, -25, 2.6, 1.6, Q + 74, 1.2, cream);
  addCylinder(group, -9.6, -25, 2.9, 2.9, Q + 75.2, 2.2, standardMaterial(0xd8d2b0));
  addCylinder(group, -9.6, -25, 2.7, 1.5, Q + 57, 1, cream);
  addBanner(group, '青果本舗①⑪', 2.2, 11, -12.6, Q + 22, -13.0, 0, { bg: '#c63d6a' });
  addBanner(group, '水の市', 1.8, 7, -19.5, Q + 30, -13.0, 0, { bg: '#2c4f9e' });
  addSign(group, '◎', 3, 3, -22, Q + 35.5, -13.0, 0, { round: true, bg: '#f4f0d8', border: '#2f8f7f', fg: '#c8452f' });

  // --- 9: slender cylindrical tower and its low block -----------------------------------
  addCylinder(group, -28.6, -15.6, 2.7, 2.9, Q, 30, new MeshStandardMaterial({ map: createFacadeTexture({ base: '#e6dfb0', rows: 9, cols: 6, seed: 8 }), roughness: 0.85 }));
  addCylinder(group, -28.6, -15.6, 3.3, 2.8, Q + 30, 0.8, cream);
  // A hemisphere dome: thetaLength = π/2 (1.57) keeps only the top half of the sphere.
  addMesh(group, new SphereGeometry(2.7, 32, 16, 0, 6.3, 0, 1.57), standardMaterial(0xcfd9b6), -28.6, Q + 30.8, -15.6, { scale: [1, 0.55, 1] });
  addCylinder(group, -28.6, -15.6, 3.4, 3.4, Q + 19, 0.3, cream);
  addBuilding(group, -36, -22, 12, 14, 24, { base: '#cfd0a0', greenery: 10, balconies: 's', seed: 12 });

  // --- 5: the building beside the yellow stairs ----------------------------------------
  addBuilding(group, -24.05, -5.85, 11.7, 9.1, 13, { base: '#dccb86', balconies: 's', balconyFrom: 3, greenery: 8, palette: 'bright', seed: 15 });
  addBuilding(group, -44, -2, 10, 18, 22, { base: '#c9cf9f', greenery: 8, seed: 16 });

  // --- 9b: dark lantern tower ----------------------------------------------------------
  {
    const x = -13;
    const z = -7.4;
    const darkFacade = new MeshStandardMaterial({
      map: createFacadeTexture({ base: '#1f3f3b', rows: 8, cols: 3, seed: 23, frame: 'rgba(20,40,38,.9)', moss: 10 }),
      roughness: 0.7,
    });
    addBuilding(group, x, z, 6, 5.5, 9, { base: '#cfc890', greenery: 5, seed: 24 });
    // 8 radial segments: an octagonal tower, just by lowering the segment count.
    addCylinder(group, x, z, 1.9, 2.1, Q + 9, 15, darkFacade, 8);
    // LatheGeometry spins a 2D profile (x = radius, y = height) around the y axis. It is
    // the go-to for anything round: vases, lamp shades, roofs, chess pieces.
    [
      [24, 3.9, 0.7],
      [25.6, 3.1, 0.6],
      [27, 2.2, 0.5],
    ].forEach(([y, radius, rise]) => {
      const profile = [
        new Vector2(0, rise + 0.5),
        new Vector2(radius * 0.35, rise + 0.25),
        new Vector2(radius * 0.75, 0.15),
        new Vector2(radius, 0.2),
        new Vector2(radius, 0),
        new Vector2(0, 0),
      ];
      addMesh(group, new LatheGeometry(profile, 48), darkTeal, x, Q + y, z);
    });
    addCylinder(group, x, z, 1.5, 1.7, Q + 24.6, 1.2, standardMaterial(0x18302d), 24);
    addCylinder(group, x, z, 0.12, 0.12, Q + 28, 2.4, darkTeal, 8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 6.283;
      addMesh(group, new SphereGeometry(0.16, 10, 8), bulbMaterial(0xfff2b0, 0xffd060, 1.2), x + Math.cos(angle) * 3.7, Q + 23.9, z + Math.sin(angle) * 3.7, { castShadow: false });
    }
  }

  // --- 10: tank building and its water tank --------------------------------------------
  addBuilding(group, 26.65, -17.55, 19.5, 17, 20, { base: '#d3cc93', balconies: 'sw', greenery: 22, palette: 'bright', seed: 31 });
  {
    const x = 24.7;
    const z = -18.2;
    const y = Q + 20;
    // The texture wraps once around the cylinder: u = angle, v = height.
    const tankTexture = canvasTexture(1024, 256, (ctx, width, height) => {
      ctx.fillStyle = '#2f9c8a';
      ctx.fillRect(0, 0, width, height);
      const shade = ctx.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, 'rgba(0,40,40,.35)');
      shade.addColorStop(0.5, 'rgba(255,255,255,.05)');
      shade.addColorStop(1, 'rgba(0,50,40,.4)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#e8b44a';
      ctx.fillRect(0, 18, width, 22);
      ctx.fillStyle = '#b8532e';
      for (let i = 0; i < 32; i++) ctx.fillRect(i * 32 + 4, 22, 20, 14);
      // Four copies of the 水 (water) symbol around the tank.
      ctx.strokeStyle = '#f4f6e6';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        const cx = k * 256 + 128;
        ctx.beginPath();
        ctx.moveTo(cx, 80);
        ctx.lineTo(cx, 200);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 70, 80, 60, 0.2, 1.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 70, 80, 60, 1.74, 2.94);
        ctx.stroke();
      }
      const random = createRandom(2);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(20,70,60,${random() * 0.25})`;
        ctx.fillRect(random() * width, random() * height, 3 + random() * 5, 40 + random() * 120);
      }
    });
    tankTexture.wrapS = RepeatWrapping;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 6.283;
      addCylinder(group, x + Math.cos(angle) * 5.6, z + Math.sin(angle) * 5.6, 0.3, 0.3, y, 2.2, darkTeal, 10);
    }
    addCylinder(group, x, z, 6.9, 6.5, y + 2.2, 8, new MeshStandardMaterial({ map: tankTexture, roughness: 0.5, metalness: 0.15 }), 64);
    addMesh(group, new TorusGeometry(6.95, 0.18, 10, 72), standardMaterial(0xe8b44a), x, y + 9.6, z, { rotateX: Math.PI / 2 });
    addMesh(group, new TorusGeometry(6.6, 0.16, 10, 72), standardMaterial(0x1f6f62), x, y + 2.4, z, { rotateX: Math.PI / 2 });

    // Parasol roof: an open-ended cone (no base disc) with radial stripes.
    const parasolTexture = createStripeTexture(['#2f9c8a', '#f1e2a2', '#2f9c8a', '#d8743a'], 24, true);
    parasolTexture.wrapS = RepeatWrapping;
    const cone = new Mesh(new ConeGeometry(9.2, 3.2, 64, 1, true), new MeshStandardMaterial({ map: parasolTexture, side: DoubleSide, roughness: 0.7 }));
    cone.position.set(x, y + 11.8, z);
    cone.castShadow = true;
    group.add(cone);
    addCylinder(group, x, z, 0.25, 0.25, y + 13.4, 2.5, darkTeal, 8);
    addMesh(group, new SphereGeometry(0.5, 16, 12), standardMaterial(0xe8b44a, { metalness: 0.5, roughness: 0.35 }), x, y + 16, z);
    addCylinder(group, x - 9, z + 2, 0.12, 0.12, y, 14, darkTeal, 8);
    addSign(group, '✿', 4.2, 4.2, x - 9, y + 15.5, z + 2, 0.25, { round: true, bg: '#e6893a', border: '#f4e3a0', fg: '#fbeeb8' });
    addSign(group, 'よ', 3, 3, x + 11, y + 13, z + 8.4, -0.2, { round: true, bg: '#3d9a35', border: '#f4e36a', fg: '#fff36a' });
    addCylinder(group, x + 11, z + 8.3, 0.1, 0.1, y, 11.6, darkTeal, 8);
  }

  // --- Far-right apartment slab, right foreground block, back fill -------------------------
  addBuilding(group, 47, -30, 16, 30, 62, { base: '#b9c4a4', balconies: 'w', balconyStep: 1, balconyFrom: 2, greenery: 26, palette: 'mid', seed: 51, railColor: 0xd9dcc8 });
  addBuilding(group, 37.5, 17, 9, 24, 17, { base: '#d8cf9a', balconies: 'w', greenery: 10, palette: 'bright', seed: 52 });
  addBuilding(group, 27.5, -6, 19, 6, 5.3, { base: '#c9c08a', seed: 53 });
  addBuilding(group, 50, 8, 12, 30, 34, { base: '#c4c99d', greenery: 8, seed: 54 });
  addBuilding(group, -44, 18, 12, 24, 26, { base: '#c2c896', greenery: 8, seed: 55 });

  buildCanalTunnel(group);
  buildSkyline(group);
  return { object: group };
}

/** 14: the far end of the canal runs through an arched tunnel under two buildings. */
function buildCanalTunnel(group) {
  const cx = -0.65;
  const z0 = -57;
  const length = 26;
  const halfSpan = 7.6;
  const springY = 3.4; // where the arch starts curving

  // The tunnel portal is ONE shape: a rectangle with an arch-shaped notch, extruded
  // along the canal. Drawing holes as part of the outline (going around the arch the
  // other way) avoids any boolean geometry operations.
  const outline = new Shape();
  outline.moveTo(-12.65, -1.5);
  outline.lineTo(cx - halfSpan, -1.5);
  outline.lineTo(cx - halfSpan, springY);
  // absellipse(x, y, radiusX, radiusY, startAngle, endAngle, clockwise)
  outline.absellipse(cx, springY, halfSpan, 3.8, Math.PI, 0, true);
  outline.lineTo(cx + halfSpan, -1.5);
  outline.lineTo(11.35, -1.5);
  outline.lineTo(11.35, 8);
  outline.lineTo(-12.65, 8);
  outline.lineTo(-12.65, -1.5);
  const tunnel = new Mesh(new ExtrudeGeometry(outline, { depth: length, bevelEnabled: false, curveSegments: 40 }), [
    new MeshStandardMaterial({ map: quayWallTexture, color: 0xf3ecd2, roughness: 0.9 }), // portal faces
    new MeshStandardMaterial({ map: quayWallTexture, color: 0x6d7a66, roughness: 0.95 }), // inside (darker)
  ]);
  tunnel.position.z = z0;
  tunnel.castShadow = true;
  tunnel.receiveShadow = true;
  group.add(tunnel);

  // Arch trim: a tube following the arch curve at both portals.
  const archPoints = [];
  for (let i = 0; i <= 40; i++) {
    const angle = Math.PI * (1 - i / 40);
    archPoints.push(new Vector3(cx + Math.cos(angle) * halfSpan, springY + Math.sin(angle) * 3.8, 0));
  }
  archPoints.unshift(new Vector3(cx - halfSpan, 0.2, 0));
  archPoints.push(new Vector3(cx + halfSpan, 0.2, 0));
  [z0 + length + 0.05, z0 - 0.05].forEach((z) =>
    addMesh(group, new TubeGeometry(new CatmullRomCurve3(archPoints, false, 'catmullrom', 0.1), 80, 0.32, 10, false), standardMaterial(0xe9e2c0, { roughness: 0.7 }), 0, 0, z),
  );
  addMesh(group, new BoxGeometry(1.5, 1.3, 0.5), standardMaterial(0xc8452f, { roughness: 0.6 }), cx, 7.35, z0 + length + 0.2);

  // Lamps along both tunnel walls.
  for (let z = -34; z > -56; z -= 5.5) {
    [-1, 1].forEach((side) => {
      addMesh(group, new SphereGeometry(0.2, 12, 10), bulbMaterial(0xfff2c0, 0xffd070, 1.6), cx + side * 7.25, 3.7, z, { castShadow: false });
      addMesh(group, new BoxGeometry(0.3, 0.12, 0.3), standardMaterial(0x1f3a30), cx + side * 7.45, 3.95, z);
    });
  }
  // Emissive bulbs glow, but they don't light anything. One real PointLight in the middle
  // fakes the light of all of them. Lights are expensive (every lit pixel loops over every
  // light), so a few well-placed lights plus emissive "fake" lights is the usual approach.
  //
  // PointLight(color, intensity, distance, decay). Since r155 the falloff is physical:
  // intensity / distance^decay, smoothly cut off at `distance`. decay 2 is physically
  // correct. decay 1 is used here to match how the scene looked under r128's old falloff.
  const tunnelLight = new PointLight(0xffffff, 14, 34, 1);
  tunnelLight.color.setHex(0xffd9a0, LinearSRGBColorSpace);
  tunnelLight.position.set(cx, 4.6, -44);
  group.add(tunnelLight);

  addRailing(group, -12.65, z0 + length - 0.15, 11.35, z0 + length - 0.15, 8, 1.1, 0x3d7d74);
  addSign(group, '水上トンネル', 8, 1.5, cx, 10.4, z0 + length - 0.4, 0, { w: 768, h: 144, bg: '#f6f1dc', fg: '#1f6f62', border: '#1f6f62', lw: 10 });
  [-3.4, 3.4].forEach((dx) => addCylinder(group, cx + dx, z0 + length - 0.4, 0.08, 0.08, 8, 1.7, darkTeal, 8));

  // Ivy over the portal.
  addLeafCluster(-9.5, 8.3, -31.6, 2.6, 1.6, 1.2, 260, 'bright', sharedRandom, 0.7);
  addLeafCluster(8.6, 8.2, -31.8, 2.4, 1.5, 1.2, 240, 'bright', sharedRandom, 0.7);
  addLeafCluster(cx + 7.4, 5.2, -30.7, 1.2, 2.6, 0.6, 180, 'mid', sharedRandom, 0.6);
  addLeafCluster(cx - 7.7, 4.2, -30.7, 1.0, 2.2, 0.6, 140, 'mid', sharedRandom, 0.6);

  // The two buildings sitting on top of the tunnel.
  addBuilding(group, -0.65, -41, 24, 14, 23, { baseY: 8, base: '#eeeedd', greenery: 14, palette: 'bright', seed: 61, moss: 20 });
  addBuilding(group, -3, -52, 14, 10, 51, { baseY: 8, base: '#dfe6c8', greenery: 10, palette: 'bright', seed: 62 });
}

/**
 * The distant skyline: a ring of plain boxes ("far" buildings, no balconies) with a tuft of
 * greenery on each roof. Fog and distance hide how simple they are. This is the
 * level-of-detail (LOD) idea done by hand: detail only where the viewer can see it.
 */
function buildSkyline(group) {
  const random = createRandom(88);
  const colors = ['#cdd6ae', '#dcd9aa', '#c2cfb0', '#e4e2c0'];
  for (let i = 0; i < 34; i++) {
    const angle = (i / 34) * 6.283 + random() * 0.1;
    const distance = 85 + random() * 70;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance * 1.05 + 6;
    // Keep the view down the canal (and the tunnel) clear.
    if (Math.abs(x) < 24 && z < 0) continue;
    const height = 30 + random() * 75;
    addBuilding(group, x, z, 12 + random() * 14, 12 + random() * 14, height, { base: colors[(random() * 4) | 0], far: true, seed: 100 + i, moss: 70 });
    addLeafCluster(x, QUAY_HEIGHT + height + 1, z, 6, 2.5, 6, 160, 'bright', random, 1.6);
    if (random() < 0.5) addLeafCluster(x + (random() - 0.5) * 8, QUAY_HEIGHT + height * 0.6, z + (random() - 0.5) * 8, 4, 7, 4, 140, 'mid', random, 1.6);
  }
  // A row of low buildings closing the view behind the start position.
  for (let i = 0; i < 7; i++) {
    const x = -34 + i * 11.5;
    addBuilding(group, x, 66 + random() * 3, 10, 10, 14 + random() * 16, { base: '#d6d19e', far: true, seed: 300 + i });
    addLeafCluster(x, QUAY_HEIGHT + 10, 60.5, 3.5, 5, 1, 150, 'mid', random, 1);
  }
}
