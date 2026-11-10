// textures.js
// Procedural canvas textures (paving, quay wall, wood, bark, railings, stripes, signs,
// building facades) and the sign/railing builders that use them.
//
// The big trick here is to *paint detail instead of modelling it*. A building facade with
// a few hundred windows would be thousands of triangles. As a texture on a box it is
// 12 triangles. From a few metres away nobody can tell, and the GPU barely notices.

import { DoubleSide, MeshStandardMaterial, PlaneGeometry, RepeatWrapping } from 'three';
import { JP_FONT, addMesh, canvasTexture, createRandom, drawSpeckles } from './helpers.js';

// ---------------------------------------------------------------------------------------
// Shared surface textures
// ---------------------------------------------------------------------------------------

/** Pale stone paving with mossy patches, tiled across the quays. */
export const pavingTexture = canvasTexture(
  512,
  512,
  (ctx, width, height) => {
    const random = createRandom(3);
    ctx.fillStyle = '#d9cfa2';
    ctx.fillRect(0, 0, width, height);
    const tiles = 8;
    const tileSize = width / tiles;
    for (let i = 0; i < tiles; i++) {
      for (let j = 0; j < tiles; j++) {
        const v = (200 + random() * 30) | 0;
        ctx.fillStyle = `rgb(${v + 16},${v + 8},${v - 38})`;
        ctx.fillRect(i * tileSize + 2, j * tileSize + 2, tileSize - 4, tileSize - 4);
      }
    }
    drawSpeckles(ctx, width, height, 5000, 0.12, random);
    ctx.strokeStyle = 'rgba(110,130,60,.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, height);
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(width, i * tileSize);
      ctx.stroke();
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(90,140,50,${0.1 + random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(random() * width, random() * height, 6 + random() * 22, 0, 7);
      ctx.fill();
    }
  },
  { repeat: [0.22, 0.22] },
);

/** Staggered stone blocks with a green damp gradient towards the waterline. */
export const quayWallTexture = canvasTexture(
  256,
  256,
  (ctx, width, height) => {
    const random = createRandom(5);
    ctx.fillStyle = '#8f9272';
    ctx.fillRect(0, 0, width, height);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 5; col++) {
        const v = (130 + random() * 40) | 0;
        ctx.fillStyle = `rgb(${v},${v + 4},${v - 30})`;
        ctx.fillRect(col * 52 + (row % 2 ? 26 : 0) - 26, row * 32 + 1, 50, 30);
      }
    }
    const damp = ctx.createLinearGradient(0, 0, 0, height);
    damp.addColorStop(0, 'rgba(80,120,40,0)');
    damp.addColorStop(1, 'rgba(40,90,40,.75)');
    ctx.fillStyle = damp;
    ctx.fillRect(0, 0, width, height);
    drawSpeckles(ctx, width, height, 2500, 0.15, random);
  },
  { repeat: [0.3, 0.3] },
);

/** Planks with grain streaks. */
export const woodTexture = canvasTexture(
  256,
  256,
  (ctx, width, height) => {
    const random = createRandom(9);
    ctx.fillStyle = '#b98f58';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 8; i++) {
      const v = (150 + random() * 50) | 0;
      ctx.fillStyle = `rgb(${v + 25},${v - 10},${v - 70})`;
      ctx.fillRect(i * 32 + 1, 0, 30, height);
    }
    for (let i = 0; i < 300; i++) {
      ctx.strokeStyle = `rgba(70,40,10,${random() * 0.25})`;
      ctx.beginPath();
      const x = random() * width;
      const y = random() * height;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (random() - 0.5) * 4, y + 20 + random() * 50);
      ctx.stroke();
    }
  },
  { repeat: [1, 1] },
);

/** Vertical bark furrows and lichen spots for tree trunks and branches. */
export const barkTexture = canvasTexture(
  256,
  512,
  (ctx, width, height) => {
    const random = createRandom(21);
    ctx.fillStyle = '#6d5a3a';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 900; i++) {
      const v = (60 + random() * 80) | 0;
      ctx.strokeStyle = `rgba(${v + 20},${v},${v - 30},.55)`;
      ctx.lineWidth = 1 + random() * 3;
      ctx.beginPath();
      const x = random() * width;
      const y = random() * height;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + (random() - 0.5) * 10, y + 20, x + (random() - 0.5) * 10, y + 40, x + (random() - 0.5) * 8, y + 60 + random() * 40);
      ctx.stroke();
    }
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(110,150,60,${0.15 + random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(random() * width, random() * height, 5 + random() * 18, 0, 7);
      ctx.fill();
    }
  },
  { repeat: [2, 3] },
);

/** Accent colours used across signs, facades and shop displays. */
export const DECO_COLORS = ['#c8452f', '#2f8f7f', '#e7a93a', '#3f6fb0', '#d86a8f', '#f4f0d8'];

// ---------------------------------------------------------------------------------------
// Railings: a cut-out texture on a single flat plane
// ---------------------------------------------------------------------------------------

// White bars on a transparent background. The colour comes from the material, so one
// texture serves every railing colour (white texel × material colour = material colour).
const railingTexture = canvasTexture(128, 128, (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, 10);
  ctx.fillRect(0, height - 8, width, 8);
  ctx.fillRect(0, 34, width, 4);
  for (let i = 0; i < 4; i++) ctx.fillRect(i * 32 + 13, 0, 6, height);
});
railingTexture.wrapS = RepeatWrapping;

/**
 * A railing from (x1, z1) to (x2, z2), standing on `baseY`.
 *
 * Instead of dozens of little posts, this is ONE quad with a cut-out texture:
 *   - alphaTest discards pixels whose alpha is below 0.5. The holes become truly empty, with
 *     no sorting problems (unlike `transparent: true`, which needs back-to-front sorting).
 *   - DoubleSide so it is visible from both sides.
 *   - Shadows come out cut-out too, for free: when a material has a `map` and an
 *     `alphaTest`, the shadow pass copies both onto its depth material. You only need a
 *     customDepthMaterial when the *vertex shader* changes shape (see the leaves in foliage.js).
 */
export function addRailing(parent, x1, z1, x2, z2, baseY, height, color) {
  const length = Math.hypot(x2 - x1, z2 - z1);

  // Each railing needs its own `repeat` (one bar section per ~0.9 m), so it gets its own
  // Texture object. clone() shares the underlying image (texture.source), so the GPU
  // still uploads the canvas only once.
  const texture = railingTexture.clone();
  texture.needsUpdate = true;
  texture.repeat.set(Math.max(1, Math.round(length / 0.9)), 1);

  const material = new MeshStandardMaterial({
    map: texture,
    color: color || 0xf1ecd0,
    alphaTest: 0.5,
    side: DoubleSide,
    roughness: 0.7,
  });
  return addMesh(parent, new PlaneGeometry(length, height), material, (x1 + x2) / 2, baseY + height / 2, (z1 + z2) / 2, {
    // PlaneGeometry lies along +x. atan2 gives the angle of the segment in the x/z plane.
    // It is negated because a positive rotation about +y turns +x towards -z.
    rotateY: -Math.atan2(z2 - z1, x2 - x1),
  });
}

// ---------------------------------------------------------------------------------------
// Stripes, signs and banners
// ---------------------------------------------------------------------------------------

/** Awning stripes with a soft top-to-bottom shading gradient baked in. */
export function createStripeTexture(colors, count, vertical) {
  return canvasTexture(256, 256, (ctx, width, height) => {
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = colors[i % colors.length];
      // +1 pixel overlap hides hairline seams caused by fractional stripe widths.
      if (vertical) ctx.fillRect((i * width) / count, 0, width / count + 1, height);
      else ctx.fillRect(0, (i * height) / count, width, height / count + 1);
    }
    const shade = ctx.createLinearGradient(0, 0, 0, height);
    shade.addColorStop(0, 'rgba(0,0,0,.12)');
    shade.addColorStop(1, 'rgba(255,255,255,.08)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);
  });
}

/**
 * Text on a rectangular or round board.
 * @param {string} text
 * @param {object} [options]
 * @param {number} [options.w=256]  canvas width in pixels (text sharpness, not world size)
 * @param {number} [options.h=256]
 * @param {boolean} [options.round]  circular board with a transparent outside
 * @param {boolean} [options.vertical]  one character per row (Japanese vertical signs)
 * @param {string} [options.bg]  board colour
 * @param {string} [options.fg]  text colour
 * @param {string} [options.border]
 * @param {number} [options.lw]  border width in canvas pixels
 * @param {number} [options.fs]  font size override
 * @param {(ctx, w, h) => void} [options.deco]  extra drawing before the text
 */
export function createSignTexture(text, options = {}) {
  const width = options.w || 256;
  const height = options.h || 256;
  return canvasTexture(width, height, (ctx) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = options.bg || '#fff';
    ctx.strokeStyle = options.border || '#c8452f';
    ctx.lineWidth = options.lw || 14;
    if (options.round) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - ctx.lineWidth / 2 - 2, 0, 7);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(0, 0, width, height);
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);
    }
    if (options.deco) options.deco(ctx, width, height);

    ctx.fillStyle = options.fg || '#c8452f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Array.from splits by code point, so characters such as ① or emoji are not cut in half.
    const chars = Array.from(text);
    if (options.vertical) {
      const fontSize = options.fs || Math.min(width * 0.7, ((height - 30) / chars.length) * 0.92);
      ctx.font = `700 ${fontSize}px ${JP_FONT}`;
      chars.forEach((char, i) => ctx.fillText(char, width / 2, ((i + 0.5) * (height - 30)) / chars.length + 15));
    } else {
      let fontSize = options.fs || height * 0.6;
      ctx.font = `700 ${fontSize}px ${JP_FONT}`;
      // Shrink long strings to fit: measure once, then scale the font size proportionally.
      const textWidth = ctx.measureText(text).width;
      if (textWidth > width * 0.84) {
        fontSize *= (width * 0.84) / textWidth;
        ctx.font = `700 ${fontSize}px ${JP_FONT}`;
      }
      ctx.fillText(text, width / 2, height / 2 + fontSize * 0.04);
    }
  });
}

/**
 * A flat sign of `signWidth` × `signHeight` metres at (x, y, z), turned by `rotationY`.
 * Takes the same options as createSignTexture.
 */
export function addSign(parent, text, signWidth, signHeight, x, y, z, rotationY, options = {}) {
  const texture = createSignTexture(text, options);
  const material = new MeshStandardMaterial({
    map: texture,
    alphaTest: options.round ? 0.5 : 0,
    side: DoubleSide,
    roughness: 0.6,
  });
  // Round signs cast round shadows automatically, because alphaTest carries over to the shadow pass.
  return addMesh(parent, new PlaneGeometry(signWidth, signHeight), material, x, y, z, { rotateY: rotationY || 0 });
}

/** Tall vertical shop banner (nobori style). */
export function addBanner(parent, text, bannerWidth, bannerHeight, x, y, z, rotationY, options) {
  return addSign(parent, text, bannerWidth, bannerHeight, x, y, z, rotationY, {
    w: 128,
    h: 512,
    vertical: true,
    bg: '#c63d6a',
    fg: '#fff8e0',
    border: '#f6e9b0',
    lw: 8,
    ...options,
  });
}

// ---------------------------------------------------------------------------------------
// Building facades
// ---------------------------------------------------------------------------------------

/**
 * A full facade (windows, frames, curtains, window boxes, decorative bands, rain streaks
 * and moss) painted onto one 512×1024 canvas. The texture is stretched over each side
 * of a box, so `rows`/`cols` are chosen by the caller to keep windows roughly 3.3 m apart.
 *
 * @param {object} options
 * @param {string} options.base  wall colour
 * @param {number} options.rows
 * @param {number} options.cols
 * @param {number} [options.seed]
 * @param {number} [options.moss=50]  number of moss blotches
 * @param {string} [options.frame]  window frame colour
 */
export function createFacadeTexture(options) {
  const { rows, cols } = options;
  const random = createRandom(options.seed || 1);
  return canvasTexture(512, 1024, (ctx, width, height) => {
    ctx.fillStyle = options.base;
    ctx.fillRect(0, 0, width, height);
    // Sky-lit top, grimy bottom: a cheap stand-in for ambient occlusion.
    const grime = ctx.createLinearGradient(0, 0, 0, height);
    grime.addColorStop(0, 'rgba(255,255,210,.25)');
    grime.addColorStop(1, 'rgba(60,90,40,.28)');
    ctx.fillStyle = grime;
    ctx.fillRect(0, 0, width, height);
    drawSpeckles(ctx, width, height, 7000, 0.07, random);

    const cellHeight = height / rows;
    const cellWidth = width / cols;
    for (let row = 0; row < rows; row++) {
      // About one floor in eight becomes a decorative band instead of windows.
      const band = random();
      const isBand = band < 0.12 && row > 0;
      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth + cellWidth * 0.2;
        const y = row * cellHeight + cellHeight * 0.2;
        const windowWidth = cellWidth * 0.6;
        const windowHeight = cellHeight * 0.52;
        if (isBand) continue;

        ctx.fillStyle = options.frame || 'rgba(250,246,220,.9)';
        ctx.fillRect(x - 3, y - 3, windowWidth + 6, windowHeight + 6);
        // A few windows are "lit" (warm), the rest are dark glass.
        const lit = random() < 0.12;
        const dark = (30 + random() * 30) | 0;
        ctx.fillStyle = lit ? '#f7e9a8' : `rgb(${dark},${dark + 22},${dark + 18})`;
        ctx.fillRect(x, y, windowWidth, windowHeight);
        // Diagonal sheen: fakes a sky reflection without any reflection rendering.
        const sheen = ctx.createLinearGradient(x, y, x + windowWidth, y + windowHeight);
        sheen.addColorStop(0, 'rgba(190,230,235,.45)');
        sheen.addColorStop(0.5, 'rgba(190,230,235,0)');
        ctx.fillStyle = sheen;
        ctx.fillRect(x, y, windowWidth, windowHeight);
        // Mullion.
        ctx.fillStyle = 'rgba(240,236,205,.9)';
        ctx.fillRect(x + windowWidth / 2 - 1.5, y, 3, windowHeight);
        // Curtain.
        if (random() < 0.3) {
          ctx.fillStyle = DECO_COLORS[(random() * DECO_COLORS.length) | 0];
          ctx.globalAlpha = 0.75;
          ctx.fillRect(x, y, windowWidth * (0.3 + random() * 0.3), windowHeight);
          ctx.globalAlpha = 1;
        }
        // Window box with plants.
        if (random() < 0.25) {
          ctx.fillStyle = 'rgba(70,130,45,.85)';
          for (let k = 0; k < 7; k++) {
            ctx.beginPath();
            ctx.arc(x + random() * windowWidth, y + windowHeight + 2 + random() * 6, 3 + random() * 6, 0, 7);
            ctx.fill();
          }
        }
      }
      // Floor-slab line: a dark stripe under a light one reads as a ledge catching light.
      ctx.fillStyle = 'rgba(60,70,40,.35)';
      ctx.fillRect(0, row * cellHeight + cellHeight * 0.86, width, cellHeight * 0.05);
      ctx.fillStyle = 'rgba(255,255,230,.35)';
      ctx.fillRect(0, row * cellHeight + cellHeight * 0.82, width, cellHeight * 0.04);

      if (isBand) {
        ctx.fillStyle = DECO_COLORS[(random() * 4) | 0];
        ctx.globalAlpha = 0.8;
        ctx.fillRect(0, row * cellHeight + cellHeight * 0.12, width, cellHeight * 0.62);
        ctx.globalAlpha = 1;
        for (let i = 0; i < cols * 2; i++) {
          const cx = ((i + 0.5) * cellWidth) / 2;
          const cy = row * cellHeight + cellHeight * 0.43;
          ctx.fillStyle = DECO_COLORS[5];
          ctx.beginPath();
          ctx.arc(cx, cy, cellHeight * 0.2, 0, 7);
          ctx.fill();
          ctx.fillStyle = DECO_COLORS[(i + row) % 4];
          ctx.beginPath();
          ctx.arc(cx, cy, cellHeight * 0.11, 0, 7);
          ctx.fill();
        }
      }
    }
    // Rain streaks.
    for (let i = 0; i < 50; i++) {
      const x = random() * width;
      const y = random() * height * 0.9;
      const streak = ctx.createLinearGradient(0, y, 0, y + 90 + random() * 160);
      streak.addColorStop(0, 'rgba(70,80,40,.22)');
      streak.addColorStop(1, 'rgba(70,80,40,0)');
      ctx.fillStyle = streak;
      ctx.fillRect(x, y, 2 + random() * 5, 250);
    }
    // Moss.
    for (let i = 0; i < (options.moss || 50); i++) {
      ctx.fillStyle = `rgba(${(70 + random() * 50) | 0},${(140 + random() * 50) | 0},${(40 + random() * 30) | 0},${0.18 + random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(random() * width, random() * height, 8 + random() * 34, 0, 7);
      ctx.fill();
    }
  });
}
