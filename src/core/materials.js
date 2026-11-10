// materials.js
// Materials shared across several scene modules.
//
// Why share? Each distinct material can mean another shader program and another set of
// uniforms to upload. Meshes that use the *same* material object let the renderer skip
// state changes between draw calls. Sharing is also simply less code. Create one material
// per "look" and reuse it, rather than calling `new MeshStandardMaterial` for every bolt.
// (This project still creates many small one-off materials through standardMaterial().
// That is fine at this scale, but it is the first thing to consolidate if draw calls grow.)

import { LineBasicMaterial } from 'three';
import { standardMaterial } from './helpers.js';

/** Painted steel: footbridge, poles, sign posts. */
export const bridgeGreen = standardMaterial(0x5f9a3c, { roughness: 0.6 });
export const darkGreen = standardMaterial(0x2f5f2a, { roughness: 0.6 });

/** Tower trims, roofs and the dark-teal ironwork used on several buildings. */
export const cream = standardMaterial(0xece6c2, { roughness: 0.7 });
export const teal = standardMaterial(0x2f8f7f, { roughness: 0.6 });
export const darkTeal = standardMaterial(0x1f4a44, { roughness: 0.6 });
export const roofConcrete = standardMaterial(0xb9b58c, { roughness: 0.95 });

/**
 * Lines (THREE.Line) are always 1 pixel wide in WebGL: `linewidth` is ignored on almost
 * every platform. That suits thin overhead wires. For thick lines use the Line2 addon
 * or real geometry such as TubeGeometry.
 */
export const wireMaterial = new LineBasicMaterial({ color: 0x1d2a24 });
