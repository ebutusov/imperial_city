// sky.js
// Sky dome with painted clouds, a glowing sun sprite, and the scene's lights and shadows.

import {
  AdditiveBlending,
  BackSide,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { canvasTexture, createRandom } from '../core/helpers.js';

/** Direction *towards* the sun (normalised). The water shader needs it too. */
export const SUN_DIRECTION = new Vector3(0.18, 0.78, -0.6).normalize();

/**
 * @param {{ camera: import('three').Camera }} deps
 * @returns {{ object: Group, update: () => void }}
 */
export function buildSky({ camera }) {
  const group = new Group();

  // --- Sky dome ---------------------------------------------------------------------
  // An equirectangular painting: x = compass direction (0..360°), y = height (zenith to nadir).
  // A sphere's default UVs map it exactly like that, so no maths is needed.
  const skyTexture = canvasTexture(2048, 1024, (ctx, width, height) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2f86d8');
    gradient.addColorStop(0.36, '#6db6ea');
    gradient.addColorStop(0.46, '#bfe2ee');
    gradient.addColorStop(0.495, '#eaf4d8'); // horizon (the middle of the texture)
    gradient.addColorStop(0.52, '#eef4cf');
    gradient.addColorStop(1, '#cfe2a8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const random = createRandom(11);
    const drawPuff = (x, y, radius) => {
      const puff = ctx.createRadialGradient(x, y, 0, x, y, radius);
      puff.addColorStop(0, 'rgba(255,255,255,.3)');
      puff.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = puff;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 7);
      ctx.fill();
    };
    // Each cloud is ~34 soft radial gradients layered together.
    for (let cloud = 0; cloud < 11; cloud++) {
      const cx = random() * width;
      const cy = height * (0.1 + random() * 0.3);
      const size = 50 + random() * 110;
      for (let i = 0; i < 34; i++) {
        const x = cx + (random() - 0.5) * size * 3.2;
        const y = cy + (random() - 0.5) * size * 0.7 - Math.abs(x - cx) * 0.08;
        const radius = size * (0.25 + random() * 0.5);
        drawPuff(x, y, radius);
        // Seamless wrap: the texture's left and right edges meet behind you, so a puff
        // crossing the left edge is drawn again shifted by the full width.
        if (x < radius) drawPuff(x + width, y, radius);
      }
    }
  });

  // A huge sphere seen from the INSIDE (BackSide). The material settings matter:
  //   MeshBasicMaterial - unlit, so the sky shows its painted colours exactly
  //   fog: false        - it is 900 m away and would otherwise vanish into the fog colour
  //   depthWrite: false - the sky never hides anything, whatever its distance
  //   toneMapped: false - the colours are final and skip the filmic curve
  // update() moves the dome with the camera, so you can never fly "out" of the sky and its
  // horizon stays at infinity (no parallax). This is the same idea as a skybox.
  const sky = new Mesh(
    new SphereGeometry(900, 48, 24),
    new MeshBasicMaterial({ map: skyTexture, side: BackSide, fog: false, depthWrite: false, toneMapped: false }),
  );
  sky.rotation.y = 1.2;
  group.add(sky);

  // --- Sun glow -----------------------------------------------------------------------
  // A Sprite is a quad that always faces the camera, which suits glows and particles.
  // AdditiveBlending *adds* its colour to what is behind it, so it can only brighten,
  // the way light does. No sorting artefacts, and black areas are invisible.
  const glowTexture = canvasTexture(256, 256, (ctx, size) => {
    const glow = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    glow.addColorStop(0, 'rgba(255,255,235,1)');
    glow.addColorStop(0.2, 'rgba(255,250,200,.55)');
    glow.addColorStop(0.55, 'rgba(255,245,170,.14)');
    glow.addColorStop(1, 'rgba(255,240,160,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  });
  const sunGlow = new Sprite(
    new SpriteMaterial({ map: glowTexture, blending: AdditiveBlending, fog: false, depthWrite: false, transparent: true, opacity: 0.7 }),
  );
  // Placed 700 m out along the sun direction. The camera stays within ±150 m of the origin,
  // so the parallax is small enough not to notice.
  sunGlow.position.copy(SUN_DIRECTION).multiplyScalar(700);
  sunGlow.scale.set(560, 560, 1);
  group.add(sunGlow);

  // --- Lights -------------------------------------------------------------------------
  // Light intensities and colours were tuned for three.js r128, which had two quirks:
  //   1. "Legacy" lighting mode quietly multiplied the light from these lights by π.
  //      Since r155 lights are physically based and that hidden factor is gone, so the
  //      old intensities are multiplied by π here to give the same brightness.
  //   2. r128 did not colour-manage light colours, so the hex values were used as linear
  //      numbers. setHex(hex, LinearSRGBColorSpace) keeps those exact values. A plain
  //      `new DirectionalLight(0xffeab0)` would now be read as sRGB, which is darker and
  //      more saturated.

  // HemisphereLight: a cheap stand-in for light bouncing off the sky and the ground.
  // Up-facing surfaces get the sky colour, down-facing ones the ground colour, with a
  // blend between. It has no direction and casts no shadow. Use it to lift the shadows
  // instead of a flat AmbientLight.
  const hemisphere = new HemisphereLight(0xffffff, 0xffffff, 0.62 * Math.PI);
  hemisphere.color.setHex(0xf3f6dc, LinearSRGBColorSpace);
  hemisphere.groundColor.setHex(0x93a85c, LinearSRGBColorSpace); // green bounce from foliage
  group.add(hemisphere);

  // The sun: a DirectionalLight has parallel rays (infinitely far away). Its `position`
  // only sets the direction (position → target). For shadows the position is also where
  // the shadow camera sits, so put it far enough out to see every shadow caster.
  const sun = new DirectionalLight(0xffffff, 1.5 * Math.PI);
  sun.color.setHex(0xffeab0, LinearSRGBColorSpace);
  sun.position.copy(SUN_DIRECTION).multiplyScalar(160);
  sun.castShadow = true;

  // Shadow map: the scene is rendered from the sun into a depth texture.
  //   mapSize: 4096² = 16 M texels. Sharp, but 64 MB of GPU memory and a slower shadow
  //            pass. 2048 is the usual default. Halve it first if performance drops.
  //   camera:  an orthographic box around the area that needs shadows. Make it as TIGHT
  //            as possible, because the shadow map's resolution is spread over this box.
  //            Debug it with `scene.add(new CameraHelper(sun.shadow.camera))`.
  sun.shadow.mapSize.set(4096, 4096);
  const shadowCamera = sun.shadow.camera;
  shadowCamera.left = -75;
  shadowCamera.right = 75;
  shadowCamera.top = 80;
  shadowCamera.bottom = -70;
  shadowCamera.near = 20;
  shadowCamera.far = 330;
  // Shadow acne (stripy self-shadowing) comes from depth precision. Fix it with:
  //   bias       - shifts the depth comparison. Too much detaches shadows ("peter-panning").
  //   normalBias - pushes the lookup along the surface normal. It suits large flat areas
  //                lit at an angle, like the quays here.
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.06;
  group.add(sun);
  // The light shines at sun.target (default: the origin). The target must be in the scene
  // for its world matrix to be updated, which matters as soon as you move it.
  group.add(sun.target);

  // A weak bluish "fill" from the opposite side, as photographers use. It stops the
  // shadowed sides of buildings from going flat, without adding shadows.
  const fill = new DirectionalLight(0xffffff, 0.16 * Math.PI);
  fill.color.setHex(0xcfe8ff, LinearSRGBColorSpace);
  fill.position.set(-40, 50, 90);
  group.add(fill);

  return {
    object: group,
    update() {
      sky.position.copy(camera.position);
    },
  };
}
