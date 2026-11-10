# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

A three.js r128 fly-through scene ("Suijō Market Canal"). There is no build step, package manager, linter or test suite. Open `index.html` in a browser directly (file:// works); all textures are generated on canvases at runtime, so nothing needs a server. The only external request is the Google Fonts stylesheet for the UI panel.

`window.__ready` is set to `true` once the scene is built and the render loop has started, so it can be used to wait for load when driving the page in a headless browser.

## Architecture

**One shared global scope.** Every file in `js/` is a classic `<script>` (not a module) with `'use strict'`, and they share top-level `const`/`let`/`function` names. Load order lives in `index.html` and is load-bearing: a file can only use names declared by files before it at the moment it runs. `README.md` lists the order and what each file does. When you add a file, add its `<script>` tag in the right spot and update the README list too. Each file starts with a three-line header comment (filename, purpose, the classic-script note); keep that pattern.

Cross-file globals worth knowing:
- `core.js`: `T` (= `THREE`), `V3`, `renderer`, `scene`, `camera`, `msg` (the loading/error overlay).
- `helpers.js`: `S`, `QUAY`, `DECK` (world scale and standard heights), `P(px,py)`, `rng(seed)` / `R0`, `ctex()` (canvas texture), `M()` (MeshStandardMaterial shortcut), `add()` (create, place and parent a mesh with shadows on by default), `capsule()`.
- `people.js` defines `Q = QUAY`, which `trees.js` and later files also use.
- Animated objects are exposed as globals that `main.js` reads every frame: `water`, `wnTex`, `windU`, `route`, `tram`, `wake`, `dock`, `bobbers`, `swing`, `flags`, `walkers`/`stepWalker`, `waiters`, `keeper`, `sky`, and `fly()` from `controls.js`. Anything new that animates follows the same pattern: build it in its feature file, put the handle in a global, update it in `tick()`.

**Map coordinates.** The layout was traced from a 2D reference map. `P(px,py)` turns map pixel coordinates (centred on 340,250) into world `[x,z]` at scale `S=0.13`. Numbers in parentheses in comments and the README, such as "tunnel (14)" or "tram (7)", are the feature labels on that map.

**Determinism.** Use the seeded `rng(seed)` (or `R0`), never `Math.random()`, so the scene comes out the same on every load. `bld()` derives its seed from position when none is given.

**Colour pipeline.** Hex colours in materials are written as sRGB. `trees.js` ends with a pass over the whole scene that converts every non-shader, non-sprite material's `color`/`emissive` (and the fog colour) from sRGB to linear, once per material. So:
- Materials created after `trees.js` runs will not be converted.
- Do not call `convertSRGBToLinear()` on material colours yourself, or they get converted twice. The exceptions are values the pass doesn't touch: instance colours (`foliage.js`) and shader uniforms such as the Water `waterColor`.
- Canvas textures from `ctex()` are already tagged `sRGBEncoding`.

**Foliage.** `blob()` / `limb()` / `tree()` in `foliage.js` only queue leaf sprigs. `buildLeaves()` in `trees.js` turns the queue into instanced meshes with the wind-sway shader (driven by the `windU` uniform). Any foliage added after `buildLeaves()` runs will not appear.

**Code style.** The code is deliberately dense: long one-line functions, short names, chained statements. Match the surrounding style when editing rather than reformatting.

`vendor/` holds three.js r128 (`three.min.js`) and its `Water.js` example (MIT). Stick to the r128 API (`outputEncoding`, `sRGBEncoding`, `Geometry`-free BufferGeometry and so on), not newer three.js versions.
