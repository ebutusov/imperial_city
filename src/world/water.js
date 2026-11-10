// water.js
// Reflective canal water using the three.js Water addon, with a normal map generated in code.

import { CanvasTexture, Color, LinearSRGBColorSpace, PlaneGeometry, RepeatWrapping } from 'three';
// "Addons" (formerly "examples/jsm") ship with the three package but are not part of the
// core build. Import them from 'three/addons/…' and the bundler includes only what you use.
import { Water } from 'three/addons/objects/Water.js';
import { createRandom } from '../core/helpers.js';

/**
 * A seamlessly tiling normal map made from a sum of sine waves.
 *
 * A normal map stores a surface direction per texel: x, y, z in -1..1 packed into
 * RGB 0..255 (value * 0.5 + 0.5). That is why normal maps look lilac: "straight up" is
 * (0, 0, 1), which packs to (128, 128, 255).
 *
 * Tiling trick: every wave has a whole number of cycles across the texture
 * (frequencies are integers), so the left edge matches the right and the top matches the bottom.
 */
function createWaterNormalTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  const random = createRandom(31);

  const waves = [];
  for (let i = 0; i < 14; i++) {
    const frequencyX = Math.round((random() - 0.5) * 14);
    const frequencyY = Math.round((random() - 0.5) * 14) || 1;
    waves.push({ frequencyX, frequencyY, phase: random() * 6.28, amplitude: 0.5 + random() });
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Height field h = Σ sin(...). The slope (derivative) of each wave is cos(...) × frequency.
      let slopeX = 0;
      let slopeY = 0;
      for (const wave of waves) {
        const angle = (6.2832 * (wave.frequencyX * x + wave.frequencyY * y)) / size + wave.phase;
        // Higher-frequency waves get smaller amplitudes, as on real water.
        const strength = (Math.cos(angle) * wave.amplitude) / (1 + Math.hypot(wave.frequencyX, wave.frequencyY) * 0.25);
        slopeX += strength * wave.frequencyX;
        slopeY += strength * wave.frequencyY;
      }
      // Normal of a height field = normalize(-dh/dx, -dh/dy, 1).
      const nx = -slopeX * 0.09;
      const ny = -slopeY * 0.09;
      const length = Math.hypot(nx, ny, 1);
      const k = (y * size + x) * 4;
      image.data[k] = ((nx / length) * 0.5 + 0.5) * 255;
      image.data[k + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      image.data[k + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  // NOT tagged as sRGB: these numbers are directions, not colours, and must reach
  // the shader unchanged.
  texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

/** Apply [search, replacement] pairs to shader source, failing loudly if a search string is missing. */
function patchShader(source, replacements) {
  for (const [search, replacement] of replacements) {
    if (!source.includes(search)) throw new Error(`Water shader patch failed, three.js changed this line: ${search}`);
    source = source.replace(search, replacement);
  }
  return source;
}

/**
 * @param {{ sunDirection: import('three').Vector3 }} deps
 */
export function buildWater({ sunDirection }) {
  // How the Water addon works (a planar reflection):
  //   1. Before the water is drawn (in its onBeforeRender), it mirrors the camera below
  //      the water plane and renders the WHOLE scene again into a texture.
  //   2. The water shader samples that texture, offset by the animated normal map, so
  //      the reflection ripples, and mixes it with the water colour using a Fresnel term
  //      (more reflective at grazing angles, as real water is).
  // That second render roughly doubles the cost of the scene. textureWidth/Height set the
  // reflection's resolution and are the main quality/performance knob.
  const water = new Water(new PlaneGeometry(420, 420), {
    textureWidth: 1024,
    textureHeight: 1024,
    waterNormals: createWaterNormalTexture(),
    sunDirection: sunDirection.clone(),
    // r128's Water didn't colour-manage its sun colour, so keep the hex as linear values.
    sunColor: new Color().setHex(0xfff3c8, LinearSRGBColorSpace),
    waterColor: new Color(0x4fb6a6),
    distortionScale: 0.22,
    fog: true,
  });
  // `size` scales the normal-map tiling: bigger = finer ripples.
  water.material.uniforms.size.value = 14;

  // The look of this scene was tuned on three.js r128's Water shader, which differs from
  // today's in three ways. We patch the current shader source back to the old behaviour.
  // (Patching shader strings is a common, if fragile, trick. See foliage.js. patchShader()
  // throws if a line has changed, so a three.js upgrade can't silently break the look.)
  water.material.fragmentShader = patchShader(water.material.fragmentShader, [
    // 1. Fresnel base reflectance (F0): how mirror-like the surface is when you look
    //    straight down. 0.02 is physically right for water, but then looking down you
    //    mostly see the flat water colour (a milky, foggy look). 0.3 gives the stylised,
    //    glassy canal that reflects the city even right in front of the camera.
    ['float rf0 = 0.02;', 'float rf0 = 0.3;'],
    // 2. r128's reflection term: a slightly lifted, slightly dimmed reflection, with the sun
    //    glints tinted by what is being reflected.
    [
      'reflectionSample + specularLight, reflectance );',
      'vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight, reflectance );',
    ],
    // 3. r128 wrote the linear result straight to the screen with no linear→sRGB step.
    //    "Wrong", but it gives the deeper, darker water the scene was designed around.
    //    Drop this entry to see the "correct", much paler water.
    ['#include <colorspace_fragment>', ''],
  ]);

  // PlaneGeometry lies in x/y facing +z. Rotate it -90° about x to lie flat, facing up.
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0, 10);

  return {
    object: water,
    update(time) {
      water.material.uniforms.time.value = time * 0.55;
    },
  };
}
