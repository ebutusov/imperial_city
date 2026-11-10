// tram.js
// The floating water tram (7): its route, its body, its wake, and the drive-and-bob animation.

import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { addMesh, canvasTexture, mapToWorld, standardMaterial } from '../core/helpers.js';
import { SKIN_TONES } from '../core/person.js';
import { addSign } from '../core/textures.js';

/**
 * The tram's path down the canal, traced on the map. CatmullRomCurve3 makes a smooth curve
 * that passes *through* every control point (unlike Bézier curves, which only approach their
 * handles), which makes it ideal for paths, camera rails and cables.
 */
export const TRAM_ROUTE = new CatmullRomCurve3(
  [
    [335, 560],
    [333, 470],
    [331, 380],
    [338, 250],
    [336, 150],
    [335, 70],
    [335, -20],
    [335, -130],
    [335, -260],
  ].map(([px, py]) => {
    const [x, z] = mapToWorld(px, py);
    return new Vector3(x, 0, z);
  }),
);

/** Height of the overhead trolley wire (drawn in wires-lamps.js). */
export const TROLLEY_WIRE_HEIGHT = 5.55;

/** A rounded rectangle outline, centred on the origin. */
function roundedRectangle(width, length, radius) {
  const shape = new Shape();
  const x = width / 2;
  const y = length / 2;
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return shape;
}

export function buildTram() {
  const group = new Group();
  // The tram has its own Group, so the whole vehicle moves by setting one transform.
  // Every part below is positioned in the tram's LOCAL space (origin = waterline centre,
  // +z = forward), so the vehicle can be built once and then driven anywhere.
  const tram = new Group();
  group.add(tram);

  const length = 7.2;
  const width = 2.5;

  /**
   * The body is a stack of extruded rounded-rectangle slabs, like a layer cake. `bevel`
   * rounds the slab edges so they catch highlights, which instantly reads as "manufactured object".
   * Extrusion goes along +z, so each slab is rotated to lie flat (its height becomes +y).
   */
  const addSlab = (slabWidth, slabLength, radius, height, y, material, bevel) => {
    const geometry = new ExtrudeGeometry(roundedRectangle(slabWidth, slabLength, radius), {
      depth: height,
      bevelEnabled: !!bevel,
      bevelSize: bevel || 0,
      bevelThickness: bevel || 0,
      bevelSegments: 4,
      curveSegments: 16,
    });
    const slab = new Mesh(geometry, material);
    slab.rotation.x = -Math.PI / 2;
    slab.position.y = y;
    slab.castShadow = true;
    slab.receiveShadow = true;
    tram.add(slab);
    return slab;
  };

  const red = standardMaterial(0xb5382e, { roughness: 0.45 });
  const creamPaint = standardMaterial(0xf2e8c4, { roughness: 0.5 });
  const dark = standardMaterial(0x3a2a22, { roughness: 0.7 });
  const brass = standardMaterial(0xd9a441, { metalness: 0.6, roughness: 0.35 });

  addSlab(3.1, length + 1, 1.4, 0.75, -0.35, dark, 0.08); // hull
  addSlab(3.25, length + 1.15, 1.45, 0.14, 0.38, standardMaterial(0x8a6a3a, { roughness: 0.8 }), 0.03); // rub rail
  addSlab(width, length, 1.05, 1.0, 0.5, red, 0.03); // lower body
  addSlab(width + 0.06, length + 0.06, 1.08, 0.1, 1.5, brass); // belt line
  addSlab(width - 0.04, length - 0.04, 1.03, 1.15, 1.6, creamPaint); // window band
  addSlab(width + 0.2, length + 0.2, 1.15, 0.14, 2.75, red, 0.04); // eave
  addSlab(width - 0.3, length - 0.5, 0.95, 0.26, 2.9, standardMaterial(0xcfc9a8, { roughness: 0.7 }), 0.1); // roof
  addSlab(1.3, length - 2.2, 0.5, 0.3, 3.2, creamPaint, 0.05); // clerestory

  // Glass: low roughness + some metalness gives crisp sky highlights. `transparent` with
  // opacity lets the passengers show through. Transparent objects are drawn after opaque
  // ones and sorted by distance, so keep them few and simple.
  const glass = new MeshStandardMaterial({ color: 0x1f3a3a, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.82 });
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i++) {
      addMesh(tram, new PlaneGeometry(0.78, 0.82), glass, side * (width / 2 - 0.01), 2.15, -2.08 + i * 1.04, { rotateY: (side * Math.PI) / 2, castShadow: false });
    }
    // Three panes curving around each rounded end.
    for (let k = -1; k <= 1; k++) {
      const angle = k * 0.62;
      addMesh(tram, new PlaneGeometry(0.72, 0.82), glass, Math.sin(angle) * 1.02, 2.15, side * (length / 2 - 1.05 + Math.cos(angle) * 1.045), {
        rotateY: side > 0 ? angle : Math.PI - angle,
        castShadow: false,
      });
    }
    // Headlamp and route number plate.
    addMesh(tram, new SphereGeometry(0.17, 16, 12), new MeshStandardMaterial({ color: 0xfff6cf, emissive: 0xffe9a0, emissiveIntensity: 1.3 }), 0, 1.05, side * (length / 2 + 0.02), { castShadow: false });
    const plate = addSign(tram, '6', 0.5, 0.5, 0, 1.32, side * (length / 2 + 0.045), side > 0 ? 0 : Math.PI, { w: 128, h: 128, bg: '#f6f1dc', fg: '#1d2a24', border: '#1d2a24', lw: 8 });
    plate.position.y = 0.82;
    // Life rings and the door.
    for (let i = 0; i < 2; i++) {
      addMesh(tram, new TorusGeometry(0.24, 0.07, 10, 24), standardMaterial(0xf6f1dc, { roughness: 0.6 }), side * (width / 2 + 0.09), 1.0, -1.6 + i * 3.2, { rotateY: Math.PI / 2 });
    }
    addMesh(tram, new BoxGeometry(0.05, 0.9, 0.7), standardMaterial(0x2b2118), side * (width / 2), 1.0, 0);
  }

  // Passengers: just a head and a body each. At this distance, two spheres read as a person.
  for (let i = 0; i < 4; i++) {
    const x = i % 2 ? 0.55 : -0.55;
    addMesh(tram, new SphereGeometry(0.13, 14, 10), standardMaterial(SKIN_TONES[i % 4]), x, 2.12, -1.6 + i * 1.05);
    addMesh(tram, new SphereGeometry(0.2, 14, 10), standardMaterial([0xe8734a, 0x6fa8c8, 0xf1c53a, 0x9ad05a][i]), x, 1.82, -1.6 + i * 1.05, { scale: [1, 1.2, 0.8] });
  }

  // Trolley pole, raked back at 0.72 rad towards the overhead wire.
  const pole = new Group();
  pole.position.set(0, 3.5, 0);
  tram.add(pole);
  const poleLength = 3.0;
  const rake = 0.72;
  addMesh(pole, new CylinderGeometry(0.03, 0.04, poleLength, 8), dark, 0, (poleLength / 2) * Math.sin(rake), (-poleLength / 2) * Math.cos(rake), { rotateX: -(Math.PI / 2 - rake) });
  addMesh(pole, new CylinderGeometry(0.16, 0.2, 0.2, 12), dark, 0, 0, 0);
  addMesh(pole, new SphereGeometry(0.07, 10, 8), brass, 0, poleLength * Math.sin(rake), -poleLength * Math.cos(rake));

  // Wake: a soft ring texture on a flat quad that follows the tram on the water.
  //   MeshBasicMaterial - unlit foam, no shading wanted
  //   transparent       - blend with the water behind it
  //   depthWrite: false - a transparent overlay shouldn't hide things drawn after it
  const wakeTexture = canvasTexture(256, 256, (ctx, size) => {
    const ring = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size / 2);
    ring.addColorStop(0, 'rgba(255,255,255,0)');
    ring.addColorStop(0.75, 'rgba(255,255,255,.35)');
    ring.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = ring;
    ctx.fillRect(0, 0, size, size);
  });
  const wake = addMesh(group, new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: wakeTexture, transparent: true, depthWrite: false, opacity: 0.5 }), 0, 0.04, 0, {
    rotateX: -Math.PI / 2,
    castShadow: false,
    receiveShadow: false,
  });
  wake.scale.set(5.5, 10.5, 1);

  // --- Driving ---------------------------------------------------------------------------
  // routeProgress is a 0..1 fraction of the route's arc length. The tram eases in and out
  // near each end, waits 4 s, then reverses.
  const END_MARGIN = 0.06;
  let routeProgress = 0.3;
  let direction = 1;
  let waitTime = 0;
  const position = new Vector3();
  const tangent = new Vector3();

  return {
    object: group,
    /** @param {number} time  seconds @param {number} delta  seconds since last frame */
    update(time, delta) {
      if (waitTime > 0) {
        waitTime -= delta;
      } else {
        // Speed ramps up with distance from the nearest end: smooth acceleration and
        // braking without any physics.
        const distanceToEnd = Math.min(routeProgress - END_MARGIN, 1 - END_MARGIN - routeProgress);
        const speed = 0.008 + 0.02 * Math.min(1, Math.max(0, distanceToEnd) * 9);
        // Multiply by delta: movement per SECOND, not per frame, so the tram moves at the
        // same speed on a 30 Hz laptop and a 144 Hz monitor.
        routeProgress += direction * speed * delta;
        if (routeProgress >= 1 - END_MARGIN || routeProgress <= END_MARGIN) {
          routeProgress = Math.max(END_MARGIN, Math.min(1 - END_MARGIN, routeProgress));
          direction *= -1;
          waitTime = 4;
        }
      }
      // getPointAt/getTangentAt use arc length, so equal steps cover equal distances.
      TRAM_ROUTE.getPointAt(routeProgress, position);
      TRAM_ROUTE.getTangentAt(routeProgress, tangent);

      tram.position.set(position.x, 0.12 + Math.sin(time * 1.3) * 0.06, position.z);
      // Heading from the tangent: atan2(x, z) is the yaw that turns +z (forward) onto it.
      // Euler order 'YXZ' applies yaw first, then pitch and roll in the tram's own frame,
      // so the bobbing tilts stay relative to the direction of travel.
      tram.rotation.set(Math.sin(time * 1.05 + 1) * 0.018, Math.atan2(tangent.x, tangent.z), Math.sin(time * 0.85) * 0.03, 'YXZ');

      wake.position.set(position.x, 0.05, position.z);
      // The wake quad was laid flat with rotateX, so its local z axis now points along world y.
      wake.rotation.z = -tram.rotation.y;
      wake.material.opacity = 0.28 + 0.2 * Math.sin(time * 2);
    },
  };
}
