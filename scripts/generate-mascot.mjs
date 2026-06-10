// ============================================================================
// Mascot generator — "Manta" the pixelated manta ray.
//
// The same character is drawn from a single 20×17 bitmap (top-down view) and
// re-posed by overriding the eye cells and adding small decorations. This keeps
// every pose pixel-perfectly aligned to the same grid. Output is crisp,
// theme-agnostic SVG (fixed brand colours that read on both light and dark).
//
//   node scripts/generate-mascot.mjs
//
// Re-run whenever the bitmap or palette changes; commit the generated SVGs.
// ============================================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "mascot");
mkdirSync(OUT, { recursive: true });

const P = 4; // pixel size in viewBox units
const COLS = 20;
const ROWS = 17;

// Brand-aligned palette (primary blue #2563EB). Chosen to read on white *and*
// near-black backgrounds, so a single asset works in both themes.
const COLORS = {
  e: "#1E3A8A", // edge / outline — deep blue
  b: "#2563EB", // body — primary
  l: "#60A5FA", // light accent — wing leading edge
  w: "#FFFFFF", // belly spots + eye sclera
  k: "#0F172A", // pupils
  s: "#FBBF24", // sparkle — warm gold
  z: "#94A3B8", // sleep "z" — muted slate
};

// --- Base bitmap (glide): head up, wings level, tail down ------------------
// 20 columns wide, symmetric about the centre. '.' = transparent.
const BASE = [
  ".......e....e.......", // 0  cephalic-fin tips
  ".......b....b.......", // 1  cephalic fins
  "......ebbbbbbe......", // 2  head crown
  ".....ebwwbbwwbe.....", // 3  face — eye sclera (top)
  "....ebbwkbbkwbbe....", // 4  face — pupils (bottom)
  "...ebbbbbbbbbbbbe...", // 5  shoulders
  "..ebbbwbbbbbbwbbbe..", // 6  wings + spots
  "ebbbbbbbbbbbbbbbbbbe", // 7  widest span
  ".ebbbbbbbbbbbbbbbbe.", // 8
  "...ebbwbbbbbbwbbe...", // 9  trailing edge + spots
  "....ebbbbbbbbbbe....", // 10
  ".....ebbbbbbbbe.....", // 11
  "......ebbbbbbe......", // 12
  ".......ebbbbe.......", // 13
  "........ebbe........", // 14 tail base
  ".........bb.........", // 15 tail
  ".........ee.........", // 16 tail tip
];

// Eye cell coordinates [row, col] so poses can repaint just the face.
const EYE_CELLS = {
  topLeft: [3, 7], topLeftIn: [3, 8],
  topRight: [3, 11], topRightIn: [3, 12],
  botLeft: [4, 7], botLeftIn: [4, 8],
  botRight: [4, 11], botRightIn: [4, 12],
};

function cloneGrid(grid) {
  return grid.map((row) => row.split(""));
}

function setCell(g, r, c, ch) {
  g[r][c] = ch;
}

// Repaint the eyes for a given expression, mutating a char-grid in place.
function applyEyes(g, kind) {
  const E = EYE_CELLS;
  if (kind === "open") return; // base already has open eyes
  if (kind === "closed") {
    // Flat lash line across the lower eye row; skin above.
    for (const [r, c] of [E.topLeft, E.topLeftIn, E.topRight, E.topRightIn]) setCell(g, r, c, "b");
    for (const [r, c] of [E.botLeft, E.botLeftIn, E.botRight, E.botRightIn]) setCell(g, r, c, "e");
  } else if (kind === "happy") {
    // ^_^ — upward diagonals.
    for (const [r, c] of [E.topLeft, E.topLeftIn, E.topRight, E.topRightIn, E.botLeft, E.botLeftIn, E.botRight, E.botRightIn]) setCell(g, r, c, "b");
    setCell(g, ...E.topLeft, "e"); setCell(g, ...E.botLeftIn, "e");
    setCell(g, ...E.topRightIn, "e"); setCell(g, ...E.botRight, "e");
  }
}

function gridToRects(g) {
  // Merge horizontal runs of identical colour into a single <rect> per run.
  const parts = [];
  for (let r = 0; r < g.length; r++) {
    let c = 0;
    while (c < g[r].length) {
      const ch = g[r][c];
      if (ch === "." || !COLORS[ch]) { c++; continue; }
      let run = 1;
      while (c + run < g[r].length && g[r][c + run] === ch) run++;
      parts.push(
        `<rect x="${c * P}" y="${r * P}" width="${run * P}" height="${P}" fill="${COLORS[ch]}"/>`,
      );
      c += run;
    }
  }
  return parts.join("");
}

// Small decorative helpers (coordinates in viewBox units) -------------------
function sparkle(cx, cy, size, fill) {
  const h = size, t = Math.max(2, Math.round(size / 2));
  const o = (size - t) / 2;
  return (
    `<rect x="${cx - t / 2}" y="${cy - h / 2}" width="${t}" height="${h}" fill="${fill}"/>` +
    `<rect x="${cx - h / 2}" y="${cy - t / 2}" width="${h}" height="${t}" fill="${fill}"/>`
  );
}

// Pixel "Z" built from stair-stepped blocks.
function letterZ(x, y, u, fill) {
  const px = (cx, cy, w = 1, h = 1) =>
    `<rect x="${x + cx * u}" y="${y + cy * u}" width="${w * u}" height="${h * u}" fill="${fill}"/>`;
  return [
    px(0, 0, 3, 1), // top bar
    px(2, 1), px(1, 2), px(0, 3), // diagonal
    px(0, 4, 3, 1), // bottom bar
  ].join("");
}

function dash(x, y, w, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${P}" fill="${fill}"/>`;
}

// Assemble one pose into a complete SVG document.
function buildSvg({ eyes = "open", rotate = 0, extras = "", crop = null, title }) {
  const g = cloneGrid(BASE);
  applyEyes(g, eyes);
  const body = gridToRects(g);

  const W = COLS * P; // 80
  const H = ROWS * P; // 68
  // Generous padding so decorations/rotation never clip.
  const pad = 16;
  let vb = `${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}`;
  if (crop) vb = crop;

  const cx = W / 2, cy = H / 2;
  const transform = rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" shape-rendering="crispEdges" role="img" aria-label="${title}">` +
    `<title>${title}</title>` +
    `<g${transform}>${body}</g>` +
    extras +
    `</svg>\n`
  );
}

const W = COLS * P, H = ROWS * P;

const poses = {
  // Default level glide — nav, headers, login.
  "manta-glide": buildSvg({ title: "Manta, the friendly manta ray" }),

  // Greeting — a little tilt + motion lines off the right wing.
  "manta-wave": buildSvg({
    title: "Manta waving hello",
    rotate: -10,
    extras:
      dash(W + 6, 18, 12, COLORS.l) +
      dash(W + 10, 30, 16, COLORS.l) +
      dash(W + 6, 42, 12, COLORS.l),
  }),

  // Celebration — happy eyes + sparkles.
  "manta-cheer": buildSvg({
    title: "Manta celebrating",
    eyes: "happy",
    extras:
      sparkle(2, 4, 10, COLORS.s) +
      sparkle(W - 2, 0, 8, COLORS.s) +
      sparkle(W / 2, -10, 7, COLORS.s),
  }),

  // Resting / nothing-to-do — closed eyes + zzz.
  "manta-sleep": buildSvg({
    title: "Manta resting",
    eyes: "closed",
    extras:
      letterZ(W - 6, -2, 3, COLORS.z) +
      letterZ(W + 10, -16, 2, COLORS.z),
  }),

  // Diving in — rotated, for empty/CTA moments with energy.
  "manta-dive": buildSvg({
    title: "Manta diving in",
    rotate: 32,
    extras:
      `<circle cx="${-6}" cy="${H - 10}" r="3" fill="${COLORS.l}"/>` +
      `<circle cx="${-14}" cy="${H - 2}" r="2" fill="${COLORS.l}"/>`,
  }),

  // Peeking up from a bottom edge — 404 / errors. Crop to head + upper wings.
  "manta-peek": buildSvg({
    title: "Manta peeking",
    // Show rows 0..8 (head + widest span); leave a little air above.
    crop: `-12 -16 ${W + 24} ${9 * P + 16}`,
  }),
};

for (const [name, svg] of Object.entries(poses)) {
  writeFileSync(join(OUT, `${name}.svg`), svg);
  console.log("wrote", `${name}.svg`, `(${svg.length} bytes)`);
}
