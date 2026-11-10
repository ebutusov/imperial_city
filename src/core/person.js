// person.js
// A simple jointed figure built from primitives, plus walk and idle animations.
//
// The key idea is the *scene graph hierarchy*. Every Object3D has a transform relative to
// its parent. Rotate the shoulder group and the upper arm, elbow, forearm and hand all
// follow. Rotate the elbow and only the forearm and hand move. This is exactly how
// skeletal rigs work, just without skinning: here each body part is a rigid mesh parented
// to a "joint" Group placed where the pivot should be.
//
//   root (feet on the ground, faces +z)
//   └─ hips (pelvis height)
//      ├─ torso, pelvis, neck meshes
//      ├─ head ─ face, hair, hat
//      ├─ shoulder L/R ─ upper arm ─ elbow ─ forearm, hand
//      └─ hip L/R ─ thigh ─ knee ─ shin, shoe
//
// Tip: put a joint's Group at the pivot point and offset its meshes, so that rotating the
// group rotates the limb about the joint rather than the limb's middle.

import { BoxGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry, DoubleSide, Group, MeshStandardMaterial, SphereGeometry } from 'three';
import { addMesh, standardMaterial } from './helpers.js';

export const SKIN_TONES = [0xf2cfa8, 0xe8b98e, 0xf6d9b8, 0xd9a77c];

const HIP_HEIGHT = 0.92;

/**
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {number} [options.skin]  colour hex
 * @param {number} [options.top]  shirt colour
 * @param {number} [options.bottom]  trousers colour
 * @param {number} [options.hair]
 * @param {boolean} [options.bob]  bob haircut
 * @param {boolean} [options.hat]  straw cone hat
 * @param {number} [options.cap]  cap colour
 * @param {number} [options.skirt]  skirt colour (bare legs)
 * @param {boolean} [options.shorts]  bare lower legs
 * @param {boolean} [options.sleeve=true]  false = short sleeves
 * @param {number} [options.bag]  shoulder bag colour
 * @param {number} [options.pack]  backpack colour
 * @returns {{ root: Group, hips: Group, head: Group,
 *   leftArm: {shoulder: Group, elbow: Group}, rightArm: {shoulder: Group, elbow: Group},
 *   leftLeg: {hip: Group, knee: Group}, rightLeg: {hip: Group, knee: Group} }}
 *   Add `root` to the scene yourself.
 */
export function createPerson(options = {}) {
  const root = new Group();
  root.scale.setScalar(options.scale || 1);

  const skin = standardMaterial(options.skin || SKIN_TONES[0], { roughness: 0.7 });
  const top = standardMaterial(options.top || 0xf4f0e0);
  const bottom = standardMaterial(options.bottom || 0x54616e);
  const hair = standardMaterial(options.hair || 0x2b2118, { roughness: 0.6 });
  const shoe = standardMaterial(0x3a2e24);

  const hips = new Group();
  hips.position.y = HIP_HEIGHT;
  root.add(hips);

  // Torso and pelvis: spheres and capsules squashed with non-uniform scale. Scaling a
  // sphere is the cheapest way to get an ellipsoid.
  addMesh(hips, new CapsuleGeometry(0.165, 0.3, 8, 20), top, 0, 0.3, 0, { scale: [1.15, 1, 0.8] });
  addMesh(hips, new SphereGeometry(0.185, 20, 14), bottom, 0, 0, 0, { scale: [1.1, 0.85, 0.85] });
  addMesh(hips, new CylinderGeometry(0.05, 0.06, 0.14, 12), skin, 0, 0.62, 0);

  const head = new Group();
  head.position.y = 0.78;
  hips.add(head);
  addMesh(head, new SphereGeometry(0.125, 24, 18), skin, 0, 0, 0, { scale: [0.95, 1.1, 1] });
  // Hair is a partial sphere. phiLength/thetaLength (the last SphereGeometry arguments)
  // cut a cap out of a sphere, which is handy for helmets, domes and hair.
  addMesh(head, new SphereGeometry(0.134, 24, 16, 0, 6.3, 0, 1.75), hair, 0, 0.014, -0.016, { rotateX: -0.3, scale: [1, 1.06, 1.04] });
  [-1, 1].forEach((side) =>
    addMesh(head, new SphereGeometry(0.017, 8, 6), standardMaterial(0x2a2018, { roughness: 0.3 }), side * 0.045, 0.012, 0.112, { castShadow: false }),
  );
  if (options.bob) addMesh(head, new SphereGeometry(0.142, 20, 14, 0, 6.3, 0.5, 1.7), hair, 0, -0.045, -0.022, { scale: [1.02, 1.12, 1] });
  if (options.hat) addMesh(head, new ConeGeometry(0.36, 0.2, 36), standardMaterial(0xe6cf8a, { roughness: 0.9 }), 0, 0.19, 0);
  if (options.cap) addMesh(head, new CylinderGeometry(0.13, 0.135, 0.08, 20), standardMaterial(options.cap), 0, 0.115, 0);

  const makeArm = (side) => {
    const shoulder = new Group();
    shoulder.position.set(side * 0.225, 0.5, 0);
    hips.add(shoulder);
    addMesh(shoulder, new SphereGeometry(0.075, 14, 10), top, 0, 0, 0);
    addMesh(shoulder, new CapsuleGeometry(0.058, 0.2, 8, 12), top, 0, -0.14, 0);
    const elbow = new Group();
    elbow.position.y = -0.28;
    shoulder.add(elbow);
    addMesh(elbow, new SphereGeometry(0.052, 12, 10), options.sleeve === false ? skin : top, 0, 0, 0);
    addMesh(elbow, new CapsuleGeometry(0.046, 0.19, 8, 12), skin, 0, -0.12, 0);
    addMesh(elbow, new SphereGeometry(0.052, 12, 10), skin, 0, -0.27, 0);
    return { shoulder, elbow };
  };
  const leftArm = makeArm(1);
  const rightArm = makeArm(-1);

  const thighMaterial = options.skirt ? skin : bottom;
  const shinMaterial = options.skirt || options.shorts ? skin : bottom;
  const makeLeg = (side) => {
    const hip = new Group();
    hip.position.set(side * 0.095, -0.02, 0);
    hips.add(hip);
    addMesh(hip, new CapsuleGeometry(0.088, 0.28, 8, 14), thighMaterial, 0, -0.2, 0);
    const knee = new Group();
    knee.position.y = -0.43;
    hip.add(knee);
    addMesh(knee, new SphereGeometry(0.072, 12, 10), shinMaterial, 0, 0, 0);
    addMesh(knee, new CapsuleGeometry(0.064, 0.28, 8, 12), shinMaterial, 0, -0.2, 0);
    addMesh(knee, new SphereGeometry(0.08, 14, 10), shoe, 0, -0.44, 0.05, { scale: [0.9, 0.6, 1.65] });
    return { hip, knee };
  };
  const leftLeg = makeLeg(1);
  const rightLeg = makeLeg(-1);

  if (options.skirt) {
    // openEnded cylinder + DoubleSide: a tube you can see into from below.
    addMesh(hips, new CylinderGeometry(0.19, 0.33, 0.5, 24, 1, true), new MeshStandardMaterial({ color: options.skirt, side: DoubleSide, roughness: 0.8 }), 0, -0.2, 0);
  }
  if (options.bag) {
    addMesh(hips, new BoxGeometry(0.1, 0.3, 0.34), standardMaterial(options.bag, { roughness: 0.6 }), -0.26, -0.02, 0.02);
    addMesh(hips, new CylinderGeometry(0.012, 0.012, 0.62, 6), standardMaterial(options.bag), -0.1, 0.33, 0.02, { rotateZ: 0.5 });
  }
  if (options.pack) addMesh(hips, new BoxGeometry(0.3, 0.38, 0.16), standardMaterial(options.pack), 0, 0.32, -0.2);

  return { root, hips, head, leftArm, rightArm, leftLeg, rightLeg };
}

/**
 * Procedural walk cycle: every joint angle is a sine of one shared `phase`.
 * Opposite limbs use opposite signs, and arms swing against the legs on the same side.
 * Knees only bend one way, so Math.max(0, …) keeps the bend positive. The hips bob twice
 * per stride (|cos|). `amount` (0..1) blends from standing to full stride, for starts and stops.
 */
export function poseWalkCycle(person, phase, amount) {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  person.leftLeg.hip.rotation.x = -s * 0.55 * amount;
  person.rightLeg.hip.rotation.x = s * 0.55 * amount;
  person.leftLeg.knee.rotation.x = (0.12 + 0.6 * Math.max(0, -c)) * amount;
  person.rightLeg.knee.rotation.x = (0.12 + 0.6 * Math.max(0, c)) * amount;
  person.leftArm.shoulder.rotation.x = s * 0.42 * amount;
  person.rightArm.shoulder.rotation.x = -s * 0.42 * amount;
  person.leftArm.elbow.rotation.x = -0.25 - 0.2 * Math.max(0, -s) * amount;
  person.rightArm.elbow.rotation.x = -0.25 - 0.2 * Math.max(0, s) * amount;
  person.hips.position.y = HIP_HEIGHT + Math.abs(c) * 0.025 * amount;
  person.hips.rotation.y = s * 0.06 * amount;
}

/**
 * Standing idle: a slow weight shift, looking around, a little turning on the spot.
 * Using different, unrelated frequencies (0.6, 0.35, 0.2) keeps the motion from looking
 * looped. `phase` offsets each person so a crowd doesn't move in sync.
 */
export function animateIdle(person, time, phase, baseYaw) {
  person.hips.rotation.z = Math.sin(time * 0.6 + phase) * 0.03;
  person.head.rotation.y = Math.sin(time * 0.35 + phase) * 0.5;
  person.root.rotation.y = baseYaw + Math.sin(time * 0.2 + phase) * 0.15;
}
