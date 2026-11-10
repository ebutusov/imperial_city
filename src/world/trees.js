// trees.js
// Every tree on the map, plus a few free-standing leaf clusters (hedges, overhanging ivy).
// The leaves are only queued here. main.js turns them into one mesh with buildLeafMesh().

import { Group } from 'three';
import { DECK_HEIGHT, QUAY_HEIGHT, sharedRandom } from '../core/helpers.js';
import { addLeafCluster, addTree } from '../core/foliage.js';

export function buildTrees() {
  const group = new Group();
  const Q = QUAY_HEIGHT;
  // addTree(parent, x, z, height, crownRadius, palette, seed, baseY?, density?)
  addTree(group, -31.9, 5.2, 17, 9, 'deep', 1, Q, 1.25); // 4: the big foreground tree
  addTree(group, -22.6, 13.4, 11, 4.2, 'deep', 2);
  addTree(group, -36, 30, 13, 6, 'deep', 3);
  addTree(group, -27.5, 36, 10, 5, 'mid', 12);
  addTree(group, 22.5, -5.5, 12, 6.2, 'bright', 4);
  addTree(group, 28.3, 6.5, 10.5, 5.6, 'bright', 5);
  addTree(group, 23, 31, 9, 4.5, 'mid', 6);
  addTree(group, 33.5, -17, 11, 7.5, 'bright', 7, Q + 20); // on the tank building's roof
  addTree(group, 41, -8, 12, 6.5, 'mid', 8);
  addTree(group, 12, -12.5, 9, 4.6, 'bright', 9);
  addTree(group, -25.5, -2, 6, 3.4, 'bright', 10, Q + 13); // roof garden
  addTree(group, -15, -24, 9, 5.5, 'bright', 11, Q + 40); // on top of the tower block
  addTree(group, 13.2, 24, 6.5, 3.2, 'bright', 13);
  addLeafCluster(10, DECK_HEIGHT - 3.2, -5, 5, 2.6, 3.5, 420, 'bright', sharedRandom, 0.9);
  addLeafCluster(21, Q + 7.5, -3.2, 5, 1.4, 1.2, 260, 'bright', sharedRandom, 0.7);
  addTree(group, -23.8, 29.5, 15, 8.5, 'deep', 14, Q, 1.2);
  addLeafCluster(37.5, Q + 18.2, 17, 4, 1.3, 10, 420, 'bright', sharedRandom, 0.9);
  return { object: group };
}
