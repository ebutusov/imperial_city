// main.js
// Entry point: create the renderer, build the world, start the animation loop.
//
// Architecture in one paragraph: every scene feature lives in its own module under
// src/world/ and exports a build function. It returns `{ object, update? }`: `object` is a
// Group (or Mesh) to add to the scene, and `update(time, delta)` is called every frame if
// the feature moves. main.js is the only place that knows the build order and owns the
// loop, so each feature can be read, changed or switched off in isolation.

import { Timer } from 'three';
import { createCamera, createRenderer, createScene, resizeRendererToCanvas } from './core/renderer.js';
import { buildLeafMesh, windUniform } from './core/foliage.js';
import { createFlyControls } from './controls.js';
import { SUN_DIRECTION, buildSky } from './world/sky.js';
import { buildGround } from './world/ground.js';
import { buildWater } from './world/water.js';
import { buildBuildings } from './world/buildings.js';
import { buildBridge } from './world/bridge.js';
import { buildWiresAndLamps } from './world/wires-lamps.js';
import { buildShop } from './world/shop.js';
import { buildWatermelons } from './world/watermelons.js';
import { buildPeople } from './world/people.js';
import { buildDockAndMarket } from './world/dock-market.js';
import { buildTram } from './world/tram.js';
import { buildTrees } from './world/trees.js';

const message = document.getElementById('msg');
const canvas = document.getElementById('c');

let renderer;
try {
  renderer = createRenderer(canvas);
} catch (error) {
  // WebGL can be unavailable (old GPU, blocklisted driver, disabled hardware acceleration).
  // Always give the user a readable message instead of a blank page.
  message.textContent = 'This browser could not start WebGL, so the scene cannot be shown.';
  throw error;
}
const scene = createScene();
const camera = createCamera();

// Building the scene blocks the main thread for a moment (canvas textures, ~135k leaves).
// Yield first, so the browser paints the loading overlay before the work starts:
// requestAnimationFrame runs just before the next paint, and the setTimeout inside it
// runs just after that paint.
await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

// --- Build the world ---------------------------------------------------------------------
// ORDER MATTERS here for two reasons:
//   1. Several builders draw from the same seeded random stream (sharedRandom). Reordering
//      them reshuffles every leaf cluster and walker after the change.
//   2. Leaves are queued by many builders and turned into one mesh at the end, so
//      buildLeafMesh() must run after every builder that adds leaves.
const features = [
  buildSky({ camera }),
  buildGround(),
  buildWater({ sunDirection: SUN_DIRECTION }),
  buildBuildings(),
  buildBridge(),
  buildWiresAndLamps(),
  buildShop(),
  buildWatermelons(),
  buildPeople(),
  buildDockAndMarket(),
  buildTram(),
  buildTrees(),
];
for (const feature of features) scene.add(feature.object);
scene.add(buildLeafMesh());

// A scene this size has no static/dynamic split, but this is where you would optimise:
// objects that never move can skip the per-frame matrix update with
//   object.matrixAutoUpdate = false; object.updateMatrix();
// See the README for more ideas.

// --- Controls and UI ---------------------------------------------------------------------
const resetButton = document.getElementById('reset');
const helpButton = document.getElementById('hide');
const controls = createFlyControls({ camera, canvas, buttons: [resetButton, helpButton] });
resetButton.addEventListener('click', () => {
  controls.reset();
  canvas.focus();
});
helpButton.addEventListener('click', (event) => {
  const keyList = document.getElementById('keys');
  keyList.hidden = !keyList.hidden;
  event.currentTarget.textContent = keyList.hidden ? 'Show help' : 'Hide help';
});

const onResize = () => resizeRendererToCanvas(renderer, camera);
window.addEventListener('resize', onResize);
onResize();

// --- Animation loop ----------------------------------------------------------------------
// Respect the OS "reduce motion" setting: the world keeps living, just much more slowly.
// Camera movement stays at full speed, since the user is in control of it.
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const timer = new Timer();
timer.connect(document); // pauses the clock while the tab is hidden, so time doesn't jump
let worldTime = 0;

// setAnimationLoop is three's wrapper around requestAnimationFrame. It is also required for
// WebXR, where the headset (not the browser) drives the frame rate.
renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  // Clamp delta: after a stall (tab switch, GC pause, debugger) a huge delta would make
  // everything jump. 50 ms means at worst a brief slow-down, never a teleport.
  const delta = Math.min(0.05, timer.getDelta());
  const worldDelta = reducedMotion ? delta * 0.35 : delta;
  worldTime += worldDelta;

  controls.update(delta);
  windUniform.value = worldTime;
  for (const feature of features) feature.update?.(worldTime, worldDelta);

  renderer.render(scene, camera);
});

message.classList.add('done');
window.__ready = true;

// Dev-only hook for debugging and screenshots, e.g. __debug.setView(0, 70, 55, 0, -0.8).
// `import.meta.env.DEV` is replaced by `false` in production builds, and the bundler then
// removes this whole block.
if (import.meta.env.DEV) {
  window.__debug = {
    scene,
    camera,
    renderer,
    setView: (x, y, z, yaw, pitch) => controls.setView(camera.position.clone().set(x, y, z), yaw, pitch),
  };
}
