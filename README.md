# Suijō Market Canal

A three.js fly-through of a sunny, overgrown canal market. Everything (buildings, signs, people, trees, water ripples, sky) is generated in code at start-up. The project loads no image or model files.

The source is written to be read: every module opens with what it teaches, and the comments explain the three.js and 3D-graphics tricks where they are used.

## Running

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev       # dev server with hot reload, http://localhost:5173
npm run build     # production bundle in dist/
npm run preview   # serve dist/ locally to check the build
```

Controls: drag to look (click to lock the pointer, Esc to release), WASD or arrows to fly, Space/E up, Q/C down, Shift to go faster. On touch screens, drag the left side to move and the right side to look.

In dev mode, `window.__debug` exposes `scene`, `camera`, `renderer` and `setView(x, y, z, yaw, pitch)` for poking around from the browser console.

## Structure

```
index.html            page shell and UI panel. Loads src/main.js
src/main.js           creates renderer/scene/camera, builds every feature, runs the loop
src/controls.js       first-person fly camera (mouse, pointer lock, keys, touch)
src/styles.css
src/core/             shared building blocks
  renderer.js         renderer, scene + fog, camera, resize
  helpers.js          world units, seeded random, canvas textures, addMesh/addCylinder
  materials.js        materials shared across modules
  textures.js         procedural textures, signs, railings, building facades
  foliage.js          instanced leaves + wind shader, branches and trees
  person.js           jointed figure, walk cycle, idle animation
src/world/            one module per scene feature, each exporting build…()
  sky.js              sky dome, sun glow, lights and shadows
  ground.js           canal banks
  water.js            reflective water
  buildings.js        building generator, towers, tank, canal tunnel (14), skyline
  bridge.js           footbridge (6), stairs (5), elevated walkway (11)
  wires-lamps.js      overhead wires, pendant lamps, trolley wire, bunting, signs
  shop.js             grocery shop (1) and kiosk lamp
  watermelons.js      floating watermelons (3) and the "chilled" sign
  people.js           walkers and the shopkeeper (2)
  dock-market.js      water-bus dock (12) and market stalls (13)
  tram.js             water tram (7), its route and wake
  trees.js            tree planting
```

Numbers in brackets refer to the feature labels on the 2D reference map the layout was traced from (`mapToWorld()` in `helpers.js` converts its pixel coordinates).

Every `build…()` returns `{ object, update? }`. `main.js` adds `object` to the scene and calls `update(time, delta)` every frame. **Build order matters:** several builders share one seeded random stream, and the leaves queued by all builders become one instanced mesh at the very end (`buildLeafMesh()`).

## What to read for what

| Topic | Where |
|---|---|
| Renderer setup, pixel ratio, tone mapping, fog, camera near/far | `core/renderer.js` |
| Colour spaces (sRGB vs linear), texture settings, PBR material basics | `core/helpers.js` |
| Lights, π-scaled intensities, shadow camera, bias and normalBias | `world/sky.js` |
| Painting detail into textures instead of modelling it, alpha-tested cut-outs | `core/textures.js` |
| InstancedMesh, `onBeforeCompile` shader patching, wind, foliage normals | `core/foliage.js` |
| Scene-graph hierarchies, rigs, procedural walk cycles | `core/person.js`, `world/people.js` |
| Planar reflections, generating a tiling normal map | `world/water.js` |
| Curves, arc-length motion, Euler order, frame-rate independence | `world/tram.js`, `controls.js` |
| Extrusion, lathes, editing vertices | `world/ground.js`, `world/buildings.js`, `world/shop.js` |

## Performance notes and next steps

The scene runs at about 1 900 draw calls and 135 000 instanced leaves. If you need more headroom, these are the usual next steps, roughly in order of payoff:

- **Merge static geometry.** Most of the ~1 500 meshes never move. `BufferGeometryUtils.mergeGeometries` (in `three/addons`) can combine meshes that share a material into one draw call.
- **Share materials.** `standardMaterial()` creates a new material per call. Caching by colour would cut material count and state changes.
- **Smaller shadow map.** The 4096² sun shadow map is costly. 2048² with a tighter shadow camera often looks the same.
- **Cheaper reflection.** Lower the water's `textureWidth/Height`, or swap the planar reflection for an environment map.
- **Static matrices.** `object.matrixAutoUpdate = false` on things that never move skips per-frame matrix updates.

Use `renderer.info` (draw calls, triangles, textures) and the browser's performance profiler to measure before and after.

## Notes on the three.js upgrade

The scene was originally written for three.js r128 and now runs on r187. Its look was kept by compensating for r128's quirks, and the code comments explain each one:

- Light intensities are multiplied by π (legacy lighting mode was removed in r155), and light colours are set as linear values, as r128 used them.
- The tunnel PointLight uses `decay: 1` to match r128's old falloff.
- `PCFSoftShadowMap` was removed. The scene uses `PCFShadowMap`.
- The Water shader is patched back to r128's behaviour (see `world/water.js`): Fresnel base reflectance 0.3 instead of the physically based 0.02, the old reflection mix, and no output colour-space conversion. Together these give the darker, glassier canal.
- Material and texture colour management is automatic since r152, so the old manual sRGB-to-linear pass is gone.
