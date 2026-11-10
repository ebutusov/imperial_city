// renderer.js
// Creates the three things every three.js app needs: a renderer, a scene and a camera.
//
// Mental model:
//   - Scene    = a tree of objects (meshes, lights, groups). Nothing is drawn until you render it.
//   - Camera   = where you look from, plus the lens (field of view, near/far clipping planes).
//   - Renderer = turns (scene, camera) into pixels on a <canvas> using WebGL.
// Every frame you call renderer.render(scene, camera), and that is the whole loop.

import {
  ACESFilmicToneMapping,
  Color,
  FogExp2,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {WebGLRenderer}
 */
export function createRenderer(canvas) {
  // antialias: MSAA on the default framebuffer. Cheap on most GPUs, and it removes the
  // stair-stepping on thin geometry such as wires and railings.
  // powerPreference: a hint to pick the discrete GPU on laptops with two.
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });

  // Retina/HiDPI screens report devicePixelRatio 2–3. The fragment-shader cost grows with
  // the square of this value, so a 3x phone renders 9x the pixels of a 1x screen. Capping it
  // is the single most effective performance setting for full-screen 3D on the web.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  // Colour output. Lighting maths happens in *linear* space, but screens expect *sRGB*.
  // Since r152 three.js does the conversion for you (renderer.outputColorSpace defaults to
  // SRGBColorSpace), so nothing needs setting here. See helpers.js for the input side.

  // Tone mapping squeezes high-dynamic-range lighting (a bright sun can push values well
  // above 1.0) into the 0..1 range of the screen without hard clipping. ACES gives a
  // filmic roll-off: highlights desaturate gently instead of turning into flat white.
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Shadows are opt-in at three levels: the renderer (here), each light (light.castShadow)
  // and each mesh (mesh.castShadow / mesh.receiveShadow). Forget any one and you get none.
  // PCF = "percentage-closer filtering": several shadow-map samples are averaged for soft
  // edges. (r128's PCFSoftShadowMap was removed. Modern PCF uses light.shadow.radius instead.)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  return renderer;
}

/** Fog colour. It is also the CSS --haze colour, so the loading screen blends into the scene. */
export const HAZE_COLOR = 0xd9eab6;

export function createScene() {
  const scene = new Scene();
  // Exponential fog: density grows smoothly with distance (factor = 1 - e^-(density*d)^2).
  // It hides the far edge of the world, adds depth (aerial perspective) and makes distant
  // low-detail buildings read as "far away" instead of "low quality".
  // Note: the fog colour is a material-like colour, so it is given in sRGB and three.js
  // converts it to linear for you (ColorManagement, on by default since r152).
  scene.fog = new FogExp2(new Color(HAZE_COLOR), 0.0048);
  return scene;
}

export function createCamera() {
  // PerspectiveCamera(fov, aspect, near, far)
  //   fov:    vertical field of view in degrees. 60–75 feels natural for first-person.
  //   aspect: set properly in resize().
  //   near/far: the depth buffer has limited precision, spread *non-linearly* (most of it
  //   sits close to `near`). A tiny near value (0.001) causes "z-fighting" flicker far
  //   away. Keep near as large as you can and far as small as you can. Here 0.1 m ... 1.6 km
  //   comfortably holds the 900 m sky dome.
  return new PerspectiveCamera(62, 1, 0.1, 1600);
}

/**
 * Match the drawing buffer to the canvas's CSS size and fix the camera aspect ratio.
 * Call on start-up and whenever the window size changes.
 */
export function resizeRendererToCanvas(renderer, camera) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;

  // The third argument `false` means: don't write inline CSS width/height on the canvas.
  // The stylesheet owns the layout, and the renderer only sizes the drawing buffer.
  renderer.setSize(width, height, false);

  camera.aspect = width / height;
  // Portrait screens get a wider vertical FOV so the horizontal view isn't claustrophobic.
  camera.fov = camera.aspect < 1 ? 74 : 62;
  // Camera properties are baked into a projection matrix. After changing fov, aspect,
  // near or far you must rebuild it, or the change has no effect.
  camera.updateProjectionMatrix();
}
