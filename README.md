# Suijō Market Canal

A three.js (r128) fly-through scene. Open `index.html` in a browser; no build step or server is needed.

Controls: drag to look (click to lock the pointer), WASD to fly, Space/Q up and down, Shift to go faster.

## Source files (loaded in this order)

- `js/core.js`: Renderer, scene, fog and camera setup.
- `js/helpers.js`: Shared helpers: map-to-world scale, seeded RNG, canvas textures, material and mesh shortcuts, capsule geometry.
- `js/sky-light.js`: Sky dome with clouds, sun glow, hemisphere and directional lights, shadows.
- `js/textures.js`: Procedural canvas textures: paving, quay wall, wood, bark, railings, stripes, signs and building facades.
- `js/foliage.js`: Instanced leaf sprigs with the wind-sway shader, plus the limb() and tree() builders.
- `js/ground.js`: Left and right canal banks with kerb stones.
- `js/water.js`: Reflective canal water (THREE.Water) with a generated tileable normal map.
- `js/buildings.js`: bld() building generator and all map buildings: tower block, lantern tower, tank, canal tunnel (14) and skyline.
- `js/bridge.js`: Green footbridge with peaked truss (6), yellow stairs (5) and the elevated walkway (11).
- `js/wires-lamps.js`: Overhead wires, hanging pendant lamps, tram route and trolley wire, bunting and hung signs.
- `js/shop.js`: Grocery shop (1): shopfront, awning, arched window, curved roof, emblem, crates and kiosk lamp.
- `js/watermelons.js`: The "chilled" sign and the floating watermelons (3), bollards and grass.
- `js/people.js`: Person builder, walk cycle, walker routes, the seated shopkeeper with newspaper (2) and the people waiting at the dock.
- `js/dock-market.js`: Water bus stop dock (12) and market stalls with vendors (13).
- `js/tram.js`: The floating water tram (7) and its wake.
- `js/trees.js`: Tree planting, leaf mesh build and the sRGB-to-linear colour pass. Must run after everything that adds leaves or materials.
- `js/controls.js`: Fly camera: mouse drag / pointer lock, WASD, touch, reset button, resize.
- `js/main.js`: Animation loop: wind, water, tram, bobbing, walkers, shopkeeper.

The files are classic scripts that share one global scope, so they must stay in this order. `vendor/` holds three.js r128 and its `Water.js` example (MIT licence, see `vendor/LICENSE`).
