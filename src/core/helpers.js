// helpers.js
// Small building blocks used by every scene module: world units, seeded randomness,
// canvas textures, material and mesh shortcuts.

import {
  CanvasTexture,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';

// ---------------------------------------------------------------------------------------
// World units
// ---------------------------------------------------------------------------------------
// three.js has no built-in unit. Pick one and stick to it. Here 1 unit = 1 metre, which
// keeps lights, physics-like motion and camera speeds intuitive (a person is ~1.7 units).
//
// The layout was traced from a 2D reference map. Map pixels are converted with
// mapToWorld(), centred on map pixel (340, 250) at 0.13 m per pixel. Numbers in comments
// like "(7)" or "(14)" are the feature labels on that map.

export const MAP_SCALE = 0.13;
/** Height of the canal-side pavements above the water (y = 0 is the water surface). */
export const QUAY_HEIGHT = 1.0;
/** Height of the footbridge and the elevated walkway. */
export const DECK_HEIGHT = 6.5;

/** Map pixel (px, py) → world [x, z]. The map's y axis points "south", like world +z. */
export function mapToWorld(px, py) {
  return [(px - 340) * MAP_SCALE, (py - 250) * MAP_SCALE];
}

// ---------------------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------------------
// Procedural scenes should use a *seeded* generator instead of Math.random(). The same
// seed always gives the same sequence, so the world looks identical on every load. Bugs
// can be reproduced and screenshots compared.
//
// Gotcha: a generator is a *stream*. Calling it one extra time anywhere shifts every value
// after that call. Inserting or reordering calls moves every tree, leaf and window
// that comes later. Give independent features their own seed so they don't affect each other.

/** Mulberry32: a tiny, fast, good-enough 32-bit PRNG. Returns floats in [0, 1). */
export function createRandom(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One stream shared by several modules (leaf clusters, walker phases). Because it is
 * shared, the order in which main.js builds the scene is part of the "seed".
 */
export const sharedRandom = createRandom(7);

// ---------------------------------------------------------------------------------------
// Canvas textures
// ---------------------------------------------------------------------------------------
// Every texture in this project is drawn with the 2D canvas API at start-up. That means
// no image files to download, any resolution you like, and full control. The cost is
// CPU time while loading (and GPU memory, like any texture).

/** Font stack for Japanese signage, drawn into canvases. */
export const JP_FONT =
  '"Hiragino Maru Gothic ProN","Yu Gothic","Noto Sans CJK JP","Noto Sans JP","MS PGothic",sans-serif';

/**
 * Draw into a fresh canvas and wrap it as a texture.
 * @param {number} width  canvas pixels. Any size works in WebGL2. Powers of two (256, 512…)
 *        were required for mipmaps and repeating in WebGL1, and remain a safe habit.
 * @param {number} height
 * @param {(ctx: CanvasRenderingContext2D, width: number, height: number) => void} draw
 * @param {{ repeat?: [number, number] }} [options]
 */
export function canvasTexture(width, height, draw, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);

  const texture = new CanvasTexture(canvas);

  // Colour textures hold sRGB values (what you see in an image editor). Tagging them
  // tells three.js to convert to linear before lighting. Leave this OFF for data textures
  // (normal maps, roughness, masks), because their numbers are not colours.
  texture.colorSpace = SRGBColorSpace;

  // Anisotropic filtering keeps textures sharp at grazing angles (the paving seen from
  // eye level). three.js clamps it to what the GPU supports, so asking for 8 is safe.
  texture.anisotropy = 8;

  if (options.repeat) {
    // RepeatWrapping tiles the texture when UVs go beyond 0..1. Note that `repeat` is a
    // UV *multiplier*: on geometry with world-sized UVs (ExtrudeGeometry uses the
    // shape's coordinates), repeat 0.22 means "one tile every 1 / 0.22 ≈ 4.5 metres".
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  return texture;
}

/** Sprinkle tiny coloured dots: cheap "grit" that stops flat colours looking like plastic. */
export function drawSpeckles(ctx, width, height, count, alpha, random) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(${random() < 0.5 ? 0 : 255},${random() < 0.5 ? 40 : 255},${random() < 0.5 ? 0 : 200},${alpha * random()})`;
    ctx.fillRect(random() * width, random() * height, 1 + random() * 3, 1 + random() * 3);
  }
}

// ---------------------------------------------------------------------------------------
// Materials and meshes
// ---------------------------------------------------------------------------------------

/**
 * MeshStandardMaterial is three's physically based (PBR) material. Two knobs matter most:
 *   roughness 0 = mirror-sharp highlights, 1 = matte (chalk, paper, plaster)
 *   metalness 0 = dielectric (paint, wood, skin), 1 = bare metal (tints its reflections)
 * Real materials are almost always metalness 0 or 1. Values in between suit dusty or
 * painted metal. Colours are given as sRGB hex and converted to linear automatically.
 */
export function standardMaterial(color, options) {
  return new MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...options });
}

/**
 * Create a mesh, place it and add it to `parent`.
 *
 * A Mesh is just geometry (the shape) + material (the look) + a transform. Geometry and
 * materials can be shared by many meshes, and sharing saves memory and shader compiles.
 *
 * @param {import('three').Object3D} parent  usually a feature's Group (see main.js)
 * @param {import('three').BufferGeometry} geometry
 * @param {import('three').Material | import('three').Material[]} material  an array gives
 *        one material per geometry "group" (for example the six faces of a BoxGeometry)
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {object} [options]
 * @param {number} [options.rotateX]  radians
 * @param {number} [options.rotateY]
 * @param {number} [options.rotateZ]
 * @param {[number, number, number]} [options.scale]
 * @param {boolean} [options.castShadow=true]
 * @param {boolean} [options.receiveShadow=true]
 */
export function addMesh(parent, geometry, material, x, y, z, options = {}) {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  // Euler rotations are applied in the order given by mesh.rotation.order ('XYZ' by default).
  if (options.rotateX) mesh.rotation.x = options.rotateX;
  if (options.rotateY) mesh.rotation.y = options.rotateY;
  if (options.rotateZ) mesh.rotation.z = options.rotateZ;
  if (options.scale) mesh.scale.set(options.scale[0], options.scale[1], options.scale[2]);
  // Every shadow caster is rendered a second time into the shadow map, so tiny glowing
  // bulbs and other objects whose shadows nobody would notice should pass castShadow:false.
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  parent.add(mesh);
  return mesh;
}

/**
 * A vertical cylinder standing on `baseY`. CylinderGeometry is centred on its origin, so
 * we lift it by half its height. Remembering where a geometry's origin sits is half the work
 * of placing things in 3D.
 */
export function addCylinder(parent, x, z, radiusTop, radiusBottom, baseY, height, material, segments = 40) {
  return addMesh(parent, new CylinderGeometry(radiusTop, radiusBottom, height, segments), material, x, baseY + height / 2, z);
}
