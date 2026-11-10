// people.js
// The walkers on the quays, the bridge and the walkway, and the seated shopkeeper reading
// her newspaper (2).

import { BoxGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, Vector3 } from 'three';
import { DECK_HEIGHT, JP_FONT, QUAY_HEIGHT, addMesh, canvasTexture, createRandom, sharedRandom } from '../core/helpers.js';
import { SKIN_TONES, createPerson, poseWalkCycle } from '../core/person.js';
import { woodTexture } from '../core/textures.js';

/**
 * A person walking back and forth along a polyline, pausing at each end.
 * The path is stored as segment lengths, so "distance travelled" can be turned into a
 * point on the path. This is the simplest kind of path following.
 */
function createWalker(parent, path, options) {
  const points = path.map(([x, y, z]) => new Vector3(x, y, z));
  const segmentLengths = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const length = points[i].distanceTo(points[i + 1]);
    segmentLengths.push(length);
    totalLength += length;
  }
  const person = createPerson(options);
  parent.add(person.root);
  return {
    person,
    points,
    segmentLengths,
    totalLength,
    distance: (options.start || 0) * totalLength,
    direction: options.dir || 1,
    speed: options.speed || 1.15, // m/s, a relaxed walking pace
    stridePhase: sharedRandom() * 6,
    yaw: 0,
    pause: 0,
  };
}

function updateWalker(walker, delta) {
  if (walker.pause > 0) {
    walker.pause -= delta;
    // Hold still, then blend into the stride during the last 0.4 s of the pause.
    poseWalkCycle(walker.person, walker.stridePhase, Math.max(0, walker.pause > 0.4 ? 0 : 1 - walker.pause / 0.4));
  } else {
    walker.distance += walker.direction * walker.speed * delta;
    // Stride phase advances with distance walked, not time, so feet don't "skate".
    walker.stridePhase += walker.speed * delta * 4.3;
    if (walker.distance >= walker.totalLength) {
      walker.distance = walker.totalLength;
      walker.direction = -1;
      walker.pause = 1 + sharedRandom() * 3;
    } else if (walker.distance <= 0) {
      walker.distance = 0;
      walker.direction = 1;
      walker.pause = 1 + sharedRandom() * 3;
    }
    poseWalkCycle(walker.person, walker.stridePhase, 1);
  }

  // Find the current segment, then interpolate within it.
  let remaining = walker.distance;
  let i = 0;
  while (i < walker.segmentLengths.length - 1 && remaining > walker.segmentLengths[i]) {
    remaining -= walker.segmentLengths[i];
    i++;
  }
  const a = walker.points[i];
  const b = walker.points[i + 1];
  const t = Math.min(1, remaining / walker.segmentLengths[i]);
  walker.person.root.position.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);

  // Turn smoothly towards the walking direction.
  const targetYaw = Math.atan2((b.x - a.x) * walker.direction, (b.z - a.z) * walker.direction);
  // Shortest way round: wrap the difference into -π..π, or a turn from 179° to -179° would
  // spin the long way (358°) instead of 2°.
  let turn = targetYaw - walker.yaw;
  while (turn > Math.PI) turn -= 6.283;
  while (turn < -Math.PI) turn += 6.283;
  // Move a fraction of the remaining angle each frame: exponential easing. (See
  // controls.js for why `delta * 5` is only roughly frame-rate independent.)
  walker.yaw += turn * Math.min(1, delta * 5);
  walker.person.root.rotation.y = walker.yaw;
}

export function buildPeople() {
  const group = new Group();
  const Q = QUAY_HEIGHT;
  const D = DECK_HEIGHT;
  const walkers = [];
  const walk = (path, options) => walkers.push(createWalker(group, path, options));

  // Left quay: the girl with the white bob and shoulder bag, plus passers-by.
  walk([[-20.6, Q, 31], [-20.8, Q, 22], [-21.2, Q, 12.5], [-22.6, Q, 7]], { skin: SKIN_TONES[2], hair: 0xf1efe6, bob: true, top: 0xf3e6d0, skirt: 0xe9d9c4, bag: 0xb8452f, start: 0.32, dir: -1, speed: 1.0, scale: 0.96 });
  walk([[-22.4, Q, 36], [-22.2, Q, 24], [-23, Q, 12], [-23.4, Q, 4]], { top: 0x6fa8c8, bottom: 0x3f4a58, hair: 0x3a2a1c, start: 0.8, speed: 1.25 });

  // Up the stairs and over the footbridge to the walkway. Three people share the path,
  // offset sideways so they don't walk through each other.
  const bridgePath = [[-19.6, Q, 13.5], [-19.6, Q, 9.4], [-19.6, D, 1.3], [-19.4, D, 0.2], [-10, D, 0.3], [5, D, 0.2], [16.5, D, 0.3], [24, D, 1.6], [35, D, 1.8]];
  const shifted = (dz) => bridgePath.map(([x, y, z]) => [x, y, z + dz]);
  walk(bridgePath, { top: 0xe8734a, bottom: 0x4a5a44, hair: 0x1f1a16, cap: 0xf1c53a, start: 0.45, speed: 1.2 });
  walk(shifted(-0.55), { top: 0xf6f1dc, skirt: 0x3f8f7f, hair: 0x5a3a22, skin: SKIN_TONES[1], start: 0.7, dir: -1, speed: 1.05, scale: 0.95 });
  walk(shifted(0.45), { top: 0xf1c53a, bottom: 0x6a5a48, hat: true, skin: SKIN_TONES[3], start: 0.12, speed: 0.95, pack: 0x7a5a34 });

  // Walkway terrace.
  walk([[18.5, D, -1.9], [28, D, -2.2], [37, D, -1.6]], { top: 0x9ad05a, bottom: 0x4f5560, hair: 0x2b2118, start: 0.5, speed: 1.1 });
  walk([[36.5, D, 0.4], [26, D, 0.2], [19, D, 0.6]], { top: 0xd86a8f, skirt: 0xf6efd2, hair: 0x1f1a16, bob: true, start: 0.2, speed: 1.0, scale: 0.94 });

  // Right quay, market side.
  walk([[21.5, Q, 8], [22, Q, 14], [21.8, Q, 22], [22.5, Q, 30], [24, Q, 40]], { top: 0xf6efd2, bottom: 0x8a6a4a, hat: true, skin: SKIN_TONES[1], start: 0.3, speed: 1.0 });
  walk([[31, Q, 7.5], [30.6, Q, 16], [31, Q, 26], [30, Q, 36]], { top: 0x3f6fb0, bottom: 0x2f3640, hair: 0x3a2a1c, start: 0.6, dir: -1, speed: 1.3, bag: 0x6a4a2c });
  walk([[20.5, Q, -2.2], [13.5, Q, -6], [11.6, Q, -14], [11.2, Q, -24]], { top: 0xe7a93a, skirt: 0xc8452f, hair: 0x1f1a16, skin: SKIN_TONES[2], start: 0.4, speed: 1.05, scale: 0.95 });
  walk([[-11.6, Q, -26], [-10.2, Q, -12.5], [-13.4, Q, -3], [-16.6, Q, 3.4]], { top: 0xb9d7e8, bottom: 0x4a4438, hair: 0x2b2118, start: 0.6, speed: 1.15 });
  walk([[26, Q, 9], [27.2, Q, 19.5], [26.4, Q, 27]], { top: 0xf4f0e0, shorts: true, bottom: 0x3f8f7f, hair: 0x6a4a2c, start: 0.1, speed: 0.85, scale: 0.8 });

  const keeper = buildShopkeeper(group);

  return {
    object: group,
    update(time, delta) {
      for (const walker of walkers) updateWalker(walker, delta);
      keeper.update(time);
    },
  };
}

/** 2: the shopkeeper on a stool, reading, nodding and now and then turning a page. */
function buildShopkeeper(parent) {
  const Q = QUAY_HEIGHT;
  const keeper = createPerson({ skin: SKIN_TONES[0], hair: 0x5a3a22, top: 0x2f5f4a, bottom: 0x3a3a40, shorts: true, cap: 0x4a5a50, scale: 1 });
  parent.add(keeper.root);
  keeper.root.position.set(-23.2, Q - 0.36, 22.3);
  keeper.root.rotation.y = 1.0;
  addMesh(parent, new BoxGeometry(0.6, 0.5, 0.6), new MeshStandardMaterial({ map: woodTexture }), -23.2 - 0.12, Q + 0.25, 22.3 - 0.08, { rotateY: 1.0 });

  // Posing a rig = setting joint rotations. Seated: thighs forward (-x), knees bent back.
  keeper.leftLeg.hip.rotation.x = -1.5;
  keeper.leftLeg.knee.rotation.x = 1.45;
  keeper.rightLeg.hip.rotation.set(-1.62, 0, 0.32); // legs crossed
  keeper.rightLeg.knee.rotation.x = 1.1;
  keeper.leftArm.shoulder.rotation.set(-0.85, 0, 0.35);
  keeper.leftArm.elbow.rotation.set(-1.25, 0, -0.3);
  keeper.rightArm.shoulder.rotation.set(-0.85, 0, -0.35);
  keeper.rightArm.elbow.rotation.set(-1.25, 0, 0.3);
  keeper.hips.rotation.x = 0.08;
  keeper.head.rotation.x = 0.3;

  const newsprint = canvasTexture(512, 512, (ctx, width, height) => {
    const random = createRandom(8);
    ctx.fillStyle = '#f1ecd8';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#2a2a26';
    ctx.font = `700 56px ${JP_FONT}`;
    ctx.fillText('水上新聞', 20, 66);
    ctx.fillRect(20, 82, width - 40, 4);
    ctx.fillStyle = '#9aa39a';
    ctx.fillRect(28, 104, 200, 130); // photo
    ctx.fillStyle = '#3a3a34';
    for (let column = 0; column < 4; column++) {
      for (let line = 0; line < 46; line++) {
        if (column < 2 && line < 17) continue; // leave room for the photo
        ctx.fillRect(28 + column * 118, 104 + line * 8.4, 60 + random() * 48, 3);
      }
    }
  });
  // Mirror the texture horizontally (repeat -1, offset 1) so the headline reads correctly
  // on the side of the page that faces the viewer.
  newsprint.wrapS = RepeatWrapping;
  newsprint.repeat.x = -1;
  newsprint.offset.x = 1;
  const paperMaterial = new MeshStandardMaterial({ map: newsprint, side: DoubleSide, roughness: 0.9 });

  // The paper is a child of the hips, so it moves with the body.
  const paper = new Group();
  paper.position.set(0, 0.5, 0.47);
  paper.rotation.x = -0.5;
  keeper.hips.add(paper);

  /**
   * One page: a plane with 6 segments across, bent into a gentle curl by moving vertices
   * in z, then shifted so its left edge (the spine) sits on the group's origin. The group
   * can then rotate the page about the spine like a hinge.
   */
  const addPage = (side) => {
    const hinge = new Group();
    paper.add(hinge);
    const geometry = new PlaneGeometry(0.3, 0.44, 6, 1);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      positions.setZ(i, -Math.pow(Math.abs(x + 0.15) / 0.3, 2) * 0.04);
    }
    geometry.translate(0.15, 0, 0);
    // The vertices moved, so the normals must be recomputed for correct lighting.
    geometry.computeVertexNormals();
    const page = new Mesh(geometry, paperMaterial);
    page.castShadow = true;
    hinge.add(page);
    hinge.rotation.y = side > 0 ? -0.22 : Math.PI + 0.22;
    return hinge;
  };
  const leftPage = addPage(1);
  const rightPage = addPage(-1);

  return {
    update(time) {
      keeper.head.rotation.x = 0.3 + Math.sin(time * 0.5) * 0.05;
      keeper.head.rotation.y = Math.sin(time * 0.37) * 0.22;
      paper.rotation.x = -0.5 + Math.sin(time * 1.1) * 0.02;
      // Every 11 s: a 1.2 s page turn. sin over half a period gives 0 → 1 → 0, with
      // smooth start and end.
      const cycle = time % 11;
      const turn = cycle < 1.2 ? Math.sin((cycle / 1.2) * Math.PI) : 0;
      leftPage.rotation.y = -0.22 - turn * 1.9;
      keeper.leftArm.shoulder.rotation.z = 0.35 - turn * 0.25;
      rightPage.rotation.y = Math.PI + 0.22 + Math.sin(time * 1.3) * 0.03;
      // A jiggling foot.
      keeper.rightLeg.knee.rotation.x = 1.1 + Math.sin(time * 1.8) * 0.08;
    },
  };
}
