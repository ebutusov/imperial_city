// ground.js
// The left and right canal banks, extruded from map outlines, with kerb stones.

import { BoxGeometry, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape } from 'three';
import { QUAY_HEIGHT, addMesh, mapToWorld, standardMaterial } from '../core/helpers.js';
import { pavingTexture, quayWallTexture } from '../core/textures.js';

/**
 * Extrude a 2D outline into a solid slab.
 *
 * Shape + ExtrudeGeometry is the quickest way to turn a floor plan into 3D. The shape is
 * drawn in the x/y plane and extruded along +z. Rotating it by -90° about x lays it flat:
 * shape y becomes world -z, and the extrusion points up. (That is why y is negated below.)
 *
 * ExtrudeGeometry creates two material groups: 0 = the caps (top and bottom),
 * 1 = the sides. Passing two materials gives paving on top and stone on the walls.
 */
function addBank(parent, outline, depth) {
  const shape = new Shape();
  outline.forEach(([px, py], i) => {
    const [x, z] = mapToWorld(px, py);
    if (i) shape.lineTo(x, -z);
    else shape.moveTo(x, -z);
  });
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  const bank = new Mesh(geometry, [
    new MeshStandardMaterial({ map: pavingTexture, roughness: 0.9 }),
    new MeshStandardMaterial({ map: quayWallTexture, roughness: 0.95 }),
  ]);
  bank.rotation.x = -Math.PI / 2;
  bank.position.y = QUAY_HEIGHT - depth;
  bank.receiveShadow = true;
  bank.castShadow = true;
  parent.add(bank);

  // Kerb stones along every edge that is near the canal (edges far off the map are skipped).
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    if (Math.abs(a[0]) > 700 || Math.abs(b[0]) > 800 || a[1] < -100 || b[1] < -100 || a[1] > 700 || b[1] > 700) continue;
    const [ax, az] = mapToWorld(a[0], a[1]);
    const [bx, bz] = mapToWorld(b[0], b[1]);
    const length = Math.hypot(bx - ax, bz - az);
    addMesh(parent, new BoxGeometry(length + 0.4, 0.22, 0.55), standardMaterial(0xe9e2c0, { roughness: 0.8 }), (ax + bx) / 2, QUAY_HEIGHT + 0.1, (az + bz) / 2, {
      rotateY: -Math.atan2(bz - az, bx - ax),
    });
  }
}

export function buildGround() {
  const group = new Group();
  // Outlines in map pixels (see mapToWorld in helpers.js).
  addBank(group, [[-300, -150], [270, -150], [270, 20], [260, 220], [200, 330], [190, 480], [190, 720], [-300, 720]], 4);
  addBank(group, [[400, -150], [980, -150], [980, 720], [480, 720], [480, 480], [470, 300], [410, 200], [400, 20]], 4);
  // A block closing off the near end of the canal, behind the start position.
  addMesh(group, new BoxGeometry(60, 4, 30), standardMaterial(0xcfc79b), 0, QUAY_HEIGHT - 2, 76);
  return { object: group };
}
