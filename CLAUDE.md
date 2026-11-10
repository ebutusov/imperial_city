# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm install
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # bundle to dist/
npm run preview   # serve dist/
```

There is no test suite or linter. Verify changes by running the dev server, checking the browser console (three.js logs shader compile errors there instead of throwing, so a broken `onBeforeCompile` patch shows up only as missing objects), and comparing screenshots. In dev mode `window.__debug.setView(x, y, z, yaw, pitch)` puts the camera at a fixed viewpoint, and `window.__ready` is `true` once the scene is built. Useful views: `(-10.5,2.6,42.5,.07,.22)` start, `(0,70,55,0,-.8)` overhead, `(0,4,-18,0,.05)` tunnel, `(28,5,32,.785,-.2)` dock and shadows.

## Purpose and style

This is a teaching project: code comments explain three.js and 3D-graphics techniques. Keep that up when editing. New or changed code should get a comment explaining *why* where a technique is non-obvious, written for someone learning three.js. Use descriptive names and readable formatting (no dense one-liners).

## Architecture

- `src/main.js` owns everything global: renderer, scene, camera, the build order and the `renderer.setAnimationLoop` loop.
- Each scene feature in `src/world/` exports `build…(deps)` returning `{ object, update?(time, delta) }`. Dependencies are passed explicitly (e.g. `buildSky({ camera })`, `buildWater({ sunDirection })`). Features build into their own `Group` in world coordinates. `addMesh(parent, geometry, material, x, y, z, options)` always takes the parent first.
- `src/core/` holds shared pieces: `helpers.js` (units `QUAY_HEIGHT`/`DECK_HEIGHT`, `mapToWorld`, `createRandom`, `sharedRandom`, `canvasTexture`, `standardMaterial`, `addMesh`, `addCylinder`), `textures.js` (shared textures, `addSign`, `addRailing`, `addBanner`, `createFacadeTexture`), `materials.js`, `foliage.js`, `person.js`.

### Invariants that break silently

- **Build order = random seed.** `sharedRandom` is one stream consumed by buildings, shop, watermelons, people (walker phases, plus pauses at runtime) and trees, in the order `main.js` calls them. Every local `createRandom(seed)` stream is also consumed strictly in call order. Reordering builders, adding a `random()` call, or reordering expressions that call `random()` moves every later leaf, window and walker. Give new features their own `createRandom(seed)`.
- **Leaves are built last.** `addLeafCluster()`/`addTree()` only queue leaves. `buildLeafMesh()` in `main.js` makes one `InstancedMesh` and throws if more leaves are queued afterwards.
- **Colour management.** three.js converts sRGB hex/CSS colours in materials and fog automatically. Never call `convertSRGBToLinear()` on them. Light colours (and Water's `sunColor`) are deliberately set with `setHex(hex, LinearSRGBColorSpace)`, and light intensities are multiplied by π, both to reproduce the scene's original r128 look. Canvas colour textures get `colorSpace = SRGBColorSpace` in `canvasTexture()`. The water normal map must stay untagged.
- **Shader patches** (`core/foliage.js` leaves, `world/water.js`) replace specific `#include <chunk>` names from three r187. After upgrading three, re-check those chunks in `node_modules/three/src/renderers/shaders/ShaderChunk/`.

three.js is pinned to `^0.187.0`. Import addons from `three/addons/...`. The README has the map-label convention ("(14)" etc.) and performance notes.
