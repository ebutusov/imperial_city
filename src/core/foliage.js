// foliage.js
// Instanced leaves with a wind-sway shader, plus the branch and tree builders.
//
// The scene holds about 135 000 leaf sprigs. As separate meshes that would be 100 000 draw
// calls, far beyond what a browser can do at 60 fps (a few thousand is a sensible budget).
// An InstancedMesh draws one geometry many times in a SINGLE draw call. Each copy gets its
// own transform matrix (and optionally colour) from a GPU buffer. That is the most
// important performance tool in three.js for "many copies of the same thing".
//
// How this module is used:
//   1. Scene modules call addLeafCluster() / addTree() while they build. Leaves are only
//      *queued* in a plain array, which is cheap.
//   2. main.js calls buildLeafMesh() once at the end. It turns the queue into one
//      InstancedMesh. Adding leaves after that point throws, so the ordering can't break silently.

import {
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from 'three';
import { QUAY_HEIGHT, addMesh, canvasTexture, createRandom } from './helpers.js';
import { barkTexture } from './textures.js';

// A sprig of nine leaves: pale grey on transparent. The real colour comes per instance,
// so one texture covers every shade of green.
const leafTexture = canvasTexture(128, 128, (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);
  const random = createRandom(4);
  for (let i = 0; i < 9; i++) {
    const angle = random() * 6.28;
    const distance = 10 + random() * 30;
    const x = width / 2 + Math.cos(angle) * distance;
    const y = height / 2 + Math.sin(angle) * distance;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + random() - 0.5);
    const v = (205 + random() * 50) | 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.quadraticCurveTo(0, -14, 22, 0);
    ctx.quadraticCurveTo(0, 14, -22, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,120,120,.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.restore();
  }
});

/** Leaf colour ramps as [shadow colour, sunlit colour] in sRGB 0..1. */
const PALETTES = {
  deep: [
    [0.1, 0.3, 0.1],
    [0.42, 0.72, 0.2],
  ],
  mid: [
    [0.2, 0.46, 0.12],
    [0.66, 0.86, 0.28],
  ],
  bright: [
    [0.36, 0.6, 0.12],
    [0.9, 0.95, 0.4],
  ],
};

// Queue of leaves, 10 floats each (a flat typed-array-friendly layout):
//   [x, y, z, size, normalX, normalY, normalZ, red, green, blue]
const FLOATS_PER_LEAF = 10;
const queuedLeaves = [];
let leavesBuilt = false;

/**
 * Queue `count` leaves scattered through an ellipsoid centred on (cx, cy, cz).
 *
 * Two classic foliage tricks happen here:
 *   - Each leaf remembers the direction from the cluster centre ("spherical normal").
 *     Lighting the leaves with that instead of their own flat normal makes the
 *     whole clump shade like one soft ball, which is how real tree crowns read from afar.
 *   - Leaves near the top and outside get the lighter colour of the palette. That fakes
 *     ambient occlusion (inner leaves receive less sky light) for free.
 *
 * @param {number} radiusX  ellipsoid radii in metres
 * @param {number} radiusY
 * @param {number} radiusZ
 * @param {number} count
 * @param {'deep'|'mid'|'bright'} palette
 * @param {() => number} random  seeded generator (see helpers.js)
 * @param {number} [size=1]  sprig size multiplier
 */
export function addLeafCluster(cx, cy, cz, radiusX, radiusY, radiusZ, count, palette, random, size = 1) {
  if (leavesBuilt) throw new Error('addLeafCluster() called after buildLeafMesh(). Build leaves last.');
  const [dark, light] = PALETTES[palette] || PALETTES.mid;
  for (let i = 0; i < count; i++) {
    // Uniform random direction on a sphere: pick the height u in [-1, 1] uniformly and
    // an angle around the axis. (Picking two random angles bunches points at the poles.)
    const u = random() * 2 - 1;
    const angle = random() * 6.283;
    const ring = Math.sqrt(1 - u * u);
    const dirX = ring * Math.cos(angle);
    const dirY = u;
    const dirZ = ring * Math.sin(angle);
    // sqrt pushes more leaves towards the surface, where they are visible.
    const radius = 0.5 + 0.5 * Math.sqrt(random());
    const shade = Math.min(1, Math.max(0, (dirY * 0.5 + 0.5) * 0.75 + radius * 0.25 - 0.12 + (random() - 0.5) * 0.35));
    queuedLeaves.push(
      cx + dirX * radius * radiusX,
      cy + dirY * radius * radiusY,
      cz + dirZ * radius * radiusZ,
      size * (0.7 + random() * 0.7),
      // The normal is tilted upwards, so the undersides of crowns aren't pitch black.
      dirX,
      dirY * 0.8 + 0.45,
      dirZ,
      dark[0] + (light[0] - dark[0]) * shade,
      dark[1] + (light[1] - dark[1]) * shade,
      dark[2] + (light[2] - dark[2]) * shade,
    );
  }
}

/**
 * Shared time uniform. Uniforms are passed by reference, so every material that holds this
 * object sees the new value when main.js sets windUniform.value each frame. No
 * per-material update is needed.
 */
export const windUniform = { value: 0 };

/**
 * Patch a built-in material's vertex shader to add wind sway.
 *
 * onBeforeCompile lets you edit three.js's own shader source (a string assembled from
 * "#include <chunk>" pieces) just before it compiles. You keep all the built-in lighting,
 * fog and shadows and change only what you need. The usual move is
 * `shader.vertexShader.replace('#include <some_chunk>', yourCode)`.
 * The chunks live in three/src/renderers/shaders/ShaderChunk/. Read them to know which
 * variables exist. Chunks change between three.js versions, so re-check them after upgrading.
 */
function applyWindSway(shader) {
  shader.uniforms.uTime = windUniform;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uTime;')
    // Small, fast flutter in the leaf's own space. The phase comes from the instance's
    // position (column 3 of its matrix), so neighbouring sprigs don't move in lockstep.
    .replace(
      '#include <begin_vertex>',
      /* glsl */ `
      vec3 transformed = vec3(position);
      float leafPhase = dot(instanceMatrix[3].xyz, vec3(1.37, 2.11, 1.79));
      transformed.z += sin(uTime * 2.3 + leafPhase + position.x * 3.0) * 0.09;
      transformed.y += sin(uTime * 1.7 + leafPhase * 1.3) * 0.04;`,
    )
    // Slow, large sway applied after the instance transform, so it is in world space.
    // The phase depends on world position, so a gust appears to travel across the crown.
    .replace(
      '#include <project_vertex>',
      /* glsl */ `
      vec4 mvPosition = vec4(transformed, 1.0);
      mvPosition = instanceMatrix * mvPosition;
      mvPosition.x += sin(uTime * 0.9 + mvPosition.z * 0.21 + mvPosition.y * 0.13) * 0.07;
      mvPosition.z += cos(uTime * 0.7 + mvPosition.x * 0.17) * 0.05;
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;`,
    );
}

/** Turn every queued leaf into a single InstancedMesh. Call exactly once, after all builders. */
export function buildLeafMesh() {
  leavesBuilt = true;
  const leafCount = queuedLeaves.length / FLOATS_PER_LEAF;
  const geometry = new PlaneGeometry(1, 1);

  const material = new MeshStandardMaterial({
    map: leafTexture,
    // Cut-out rather than blended transparency. alphaTest discards pixels in the shader, so
    // the depth buffer stays correct and 100k overlapping cards need no sorting.
    // (transparent: true would need back-to-front sorting, which is impossible *within*
    // one instanced draw call.)
    alphaTest: 0.42,
    side: DoubleSide,
    roughness: 0.75,
  });
  material.onBeforeCompile = (shader) => {
    applyWindSway(shader);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aLeafNormal;')
      // Use the spherical "cluster" normal instead of the flat card normal. It is in world
      // space, so the view matrix's rotation part takes it to view space, where
      // three.js does its lighting.
      .replace('#include <defaultnormal_vertex>', 'vec3 transformedNormal = normalize(mat3(viewMatrix) * aLeafNormal);');
    // DoubleSide materials normally flip the normal for back faces. Our normal already
    // points "outwards from the crown" whichever face we see, so turn the flip off.
    // (nonPerturbedNormal is read by later chunks. Check normal_fragment_begin when upgrading.)
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      'float faceDirection = 1.0;\nvec3 normal = normalize(vNormal);\nvec3 nonPerturbedNormal = normal;',
    );
  };

  const mesh = new InstancedMesh(geometry, material, leafCount);
  const leafNormals = new Float32Array(leafCount * 3);
  // Object3D as a "matrix calculator": set position/rotation/scale, then read .matrix.
  const dummy = new Object3D();
  const color = new Color();
  const random = createRandom(99);
  for (let i = 0; i < leafCount; i++) {
    const k = i * FLOATS_PER_LEAF;
    dummy.position.set(queuedLeaves[k], queuedLeaves[k + 1], queuedLeaves[k + 2]);
    dummy.rotation.set(random() * 6.28, random() * 6.28, random() * 6.28);
    dummy.scale.setScalar(queuedLeaves[k + 3]);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    const length = Math.hypot(queuedLeaves[k + 4], queuedLeaves[k + 5], queuedLeaves[k + 6]) || 1;
    leafNormals[i * 3] = queuedLeaves[k + 4] / length;
    leafNormals[i * 3 + 1] = queuedLeaves[k + 5] / length;
    leafNormals[i * 3 + 2] = queuedLeaves[k + 6] / length;

    // The palette values are sRGB, so say so and three.js stores them as linear.
    color.setRGB(queuedLeaves[k + 7], queuedLeaves[k + 8], queuedLeaves[k + 9], SRGBColorSpace);
    mesh.setColorAt(i, color);
  }
  // An InstancedBufferAttribute advances once per *instance* rather than once per vertex.
  geometry.setAttribute('aLeafNormal', new InstancedBufferAttribute(leafNormals, 3));

  // Shadows: the shadow pass renders depth with a separate material. three.js copies `map`
  // and `alphaTest` onto it automatically, so cut-out shadows come for free, but NOT our
  // onBeforeCompile patch. Without this custom depth material the leaves would sway while
  // their shadows stood still. (map/alphaTest are set here only for clarity.)
  const depthMaterial = new MeshDepthMaterial({ map: leafTexture, alphaTest: 0.42 });
  depthMaterial.onBeforeCompile = applyWindSway;
  mesh.customDepthMaterial = depthMaterial;

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  // One mesh spans the whole city, so it is on screen almost always. Skipping the culling test
  // also avoids leaves popping at the screen edge, since the shader moves vertices
  // outside the CPU-side bounding sphere.
  mesh.frustumCulled = false;

  queuedLeaves.length = 0;
  return mesh;
}

// ---------------------------------------------------------------------------------------
// Branches and trees
// ---------------------------------------------------------------------------------------

const barkMaterial = new MeshStandardMaterial({ map: barkTexture, roughness: 0.95 });

/**
 * A tapering branch through `points`.
 *
 * TubeGeometry only makes constant-radius tubes. Trick: build it with radius 1, then walk
 * its vertex rings and scale each ring towards the curve centre. Editing
 * geometry.attributes.position directly like this works for any procedural deformation.
 */
export function addBranch(parent, points, radiusStart, radiusEnd, material = barkMaterial) {
  const curve = new CatmullRomCurve3(points);
  const tubularSegments = 20;
  const radialSegments = 10;
  const geometry = new TubeGeometry(curve, tubularSegments, 1, radialSegments, false);
  const positions = geometry.attributes.position;
  const vertex = new Vector3();
  for (let i = 0; i <= tubularSegments; i++) {
    // getPointAt() takes a 0..1 fraction of *arc length* (evenly spaced along the curve).
    // getPoint() would use the curve parameter, which bunches up where points are close.
    const centre = curve.getPointAt(i / tubularSegments);
    const radius = radiusStart + (radiusEnd - radiusStart) * (i / tubularSegments);
    for (let j = 0; j <= radialSegments; j++) {
      const index = i * (radialSegments + 1) + j;
      vertex.fromBufferAttribute(positions, index).sub(centre).multiplyScalar(radius).add(centre);
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  // Normals stay valid: scaling a ring uniformly about its centre doesn't change directions.
  return addMesh(parent, geometry, material, 0, 0, 0);
}

/**
 * A whole tree: a curved trunk, several branches, a leaf cluster at each branch tip and a
 * big one on top.
 *
 * @param {number} x  trunk base
 * @param {number} z
 * @param {number} height  trunk height
 * @param {number} crownRadius  roughly how far the branches reach
 * @param {'deep'|'mid'|'bright'} palette
 * @param {number} seed  each tree has its own seed, so it keeps its shape if others change
 * @param {number} [baseY=QUAY_HEIGHT]
 * @param {number} [density=1]  leaf count multiplier
 */
export function addTree(parent, x, z, height, crownRadius, palette, seed, baseY = QUAY_HEIGHT, density = 1) {
  const random = createRandom(seed);
  const top = new Vector3(x + (random() - 0.5) * height * 0.18, baseY + height, z + (random() - 0.5) * height * 0.18);
  const middle = new Vector3(x + (random() - 0.5) * height * 0.12, baseY + height * 0.5, z + (random() - 0.5) * height * 0.12);
  const trunkPoints = [
    new Vector3(x, baseY - 0.3, z),
    new Vector3(x + (random() - 0.5) * 0.3, baseY + height * 0.2, z + (random() - 0.5) * 0.3),
    middle,
    top,
  ];
  const trunkRadius = 0.14 + height * 0.022;
  addBranch(parent, trunkPoints, trunkRadius * 1.5, trunkRadius * 0.45);
  // Root flare: a short cone hides where the trunk meets the paving.
  addMesh(parent, new CylinderGeometry(trunkRadius * 1.5, trunkRadius * 2.3, 0.7, 14), barkMaterial, x, baseY + 0.2, z);

  const trunkCurve = new CatmullRomCurve3(trunkPoints);
  const branchCount = 6 + (crownRadius > 5 ? 3 : 0);
  for (let i = 0; i < branchCount; i++) {
    const along = 0.55 + random() * 0.42;
    const start = trunkCurve.getPointAt(along);
    // Evenly spread around the trunk, plus jitter: looks random but never clumps.
    const angle = (i / branchCount) * 6.283 + random() * 0.6;
    const reach = crownRadius * (0.55 + random() * 0.5);
    const end = new Vector3(start.x + Math.cos(angle) * reach, start.y + crownRadius * (0.1 + random() * 0.45), start.z + Math.sin(angle) * reach);
    const bend = start.clone().lerp(end, 0.5);
    bend.y += crownRadius * 0.12;
    addBranch(parent, [start, bend, end], trunkRadius * 0.5, 0.05);

    addLeafCluster(
      end.x,
      end.y + crownRadius * 0.1,
      end.z,
      crownRadius * 0.52,
      crownRadius * 0.36,
      crownRadius * 0.52,
      Math.round((440 * density * crownRadius) / 4),
      palette,
      random,
      0.68 + crownRadius * 0.035,
    );
  }
  addLeafCluster(
    top.x,
    top.y + crownRadius * 0.15,
    top.z,
    crownRadius * 0.75,
    crownRadius * 0.5,
    crownRadius * 0.75,
    Math.round((760 * density * crownRadius) / 4),
    palette,
    random,
    0.7 + crownRadius * 0.035,
  );
}
