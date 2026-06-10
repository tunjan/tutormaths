// ============================================================================
// Mascot generator — "Bubbles" the pixelated cauldron.
//
// Three adorable pixel-art cauldron characters in a dark purple/plum palette:
//   1. Witch-hat cauldron  — wears a big floppy witch hat, cream bubbles
//   2. Bubbly cauldron     — round body, zigzag mouth, bubbles on top
//   3. Magic-wand cauldron — swinging a wand, overflowing with potion
//
// Brand palette: deep plum/purple body with cream/white bubble accents
// on a transparent background (theme-agnostic).
//
//   node scripts/generate-mascot.mjs
//
// The in-app UI uses the SVGs. Transactional emails use PNG renders of the
// same files (Gmail/Outlook don't render SVG <img>). Regenerate the PNGs on
// macOS after changing the art:
//
//   qlmanage -t -s 512 public/mascot/manta-*.svg -o /tmp/mp
//   for f in /tmp/mp/manta-*.svg.png; do cp "$f" "public/mascot/$(basename "$f" .svg.png).png"; done
//
// Re-run whenever the bitmap or palette changes; commit the generated assets.
// ============================================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "mascot");
mkdirSync(OUT, { recursive: true });

const P = 4; // pixel size in viewBox units

// Palette — dark plum/purple body, cream/white bubbles, warm accents
const C = {
  // Body
  e: "#2D1B3D", // edge / darkest outline
  b: "#3D2352", // body — dark plum
  d: "#4A2D64", // body mid — purple
  l: "#5C3A7A", // body light — lighter purple
  a: "#6B4590", // body accent — lightest purple
  // Face features
  w: "#FFFBE6", // eye sclera / belly spot — cream white
  k: "#1A0E26", // pupil — near black
  h: "#F5E6D0", // highlight — warm cream
  // Bubbles / steam
  c: "#FFF8E1", // cream bubble — light
  f: "#F5E6D0", // cream bubble — mid
  g: "#EDD9BE", // cream bubble — shadow
  // Hat / wand
  t: "#2D1B3D", // hat — same as edge
  u: "#3D2352", // hat mid
  // Mouth
  m: "#D4A843", // zigzag mouth — gold/amber
  // Sparkle
  s: "#FFFBE6", // sparkle — cream
  // Legs
  p: "#2D1B3D", // legs — dark
  // Wand
  v: "#2D1B3D", // wand handle
  // Cheek blush
  r: "#8B5A8A", // rosy cheeks
};

// ============================================================================
// POSE 1: WITCH HAT CAULDRON — "glide" / "wave" / "sleep"
// 32 cols × 32 rows
// ============================================================================
const HAT_COLS = 32;
const HAT_ROWS = 32;

// Legend:
// e=edge  b=body  d=mid-body  l=light  a=accent
// w=eye-white  k=pupil  h=highlight
// c=cream-bubble  f=cream-mid  g=cream-shadow
// t=hat-dark  u=hat-mid
// s=sparkle  p=leg  r=blush  .=transparent
const HAT_BASE = [
  //       0         1         2         3
  //       01234567890123456789012345678901
  /* 0 */ "..........tttttttt..............",
  /* 1 */ ".........tttttttttt.............",
  /* 2 */ "........tttttttttttt............",
  /* 3 */ ".......tttttttttttttt...........",
  /* 4 */ "......ttttttttttttttttt.........",
  /* 5 */ ".....ttttttttttttttttttt........",
  /* 6 */ "....ttttttttttttttttttttt.......",
  /* 7 */ "...tttttttttttttttttttttttt.....",
  /* 8 */ "..tttttttttttttttttttttttttt....",
  /* 9 */ ".ttttttttttttttttttttttttttttt..",
  /*10 */ "tttttttttttttttttttttttttttttttt",
  /*11 */ "..ttuuttttttttttttttttttttuu....",
  /*12 */ "....uufffffffffffffffffff.......",
  /*13 */ "....eeeeeecccccccceeeeee........",
  /*14 */ "...eebbbbccccccccccbbbbee.......",
  /*15 */ "..eebbbbbcccccccccccbbbbee......",
  /*16 */ "..ebbbbbbbbccccccbbbbbbbbe......",
  /*17 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbe.....",
  /*18 */ ".ebbwwbbbbbbbbbbbbbbbwwbbbe.....",
  /*19 */ ".ebwhkbbbbbbbbbbbbbbhkwbbe......",
  /*20 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbe.....",
  /*21 */ ".ebbbrbbbbbbbbbbbbbbbrbbbbe..s..",
  /*22 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbbe....",
  /*23 */ "..ebbbbbbbbbbbbbbbbbbbbbbee.....",
  /*24 */ "..eebbbbbbbbbbbbbbbbbbbbbee.....",
  /*25 */ "...eebbbbbbbbbbbbbbbbbbee.......",
  /*26 */ "....eeeeeeeeeeeeeeeeee..........",
  /*27 */ "......pp..........pp............",
  /*28 */ "......pp..........pp............",
  /*29 */ "................................",
  /*30 */ ".s.............................s",
  /*31 */ "................................",
];

// ============================================================================
// POSE 2: BUBBLY CAULDRON — "cheer" / "peek"
// 32 cols × 32 rows
// ============================================================================
const BUBBLY_BASE = [
  //       0         1         2         3
  //       01234567890123456789012345678901
  /* 0 */ "................................",
  /* 1 */ "..........cccc.................s",
  /* 2 */ ".........cccccc..ccc............",
  /* 3 */ "........cccccccccccc............",
  /* 4 */ ".......cccccccccccccc...........",
  /* 5 */ "......ccccccccccccccccc.........",
  /* 6 */ ".......ccccccccccccccc..........",
  /* 7 */ "....eeeeeecccccccceeeeeee.......",
  /* 8 */ "...eebbbbbccccccccbbbbbbee......",
  /* 9 */ "..eebbbbbbbbccccbbbbbbbbbee.....",
  /*10 */ "..ebbbbbbbbbbbbbbbbbbbbbbbbe....",
  /*11 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbbbe...",
  /*12 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbbbe...",
  /*13 */ ".ebbbwwbbbbbbbbbbbbbbbwwbbbbe...",
  /*14 */ ".ebbwhkbbbbbbbbbbbbbbbhkwbbbe...",
  /*15 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbbbe...",
  /*16 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbbe....",
  /*17 */ ".ebbbbbbbbmmmmmmmmbbbbbbbbe.....",
  /*18 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbe.....",
  /*19 */ ".ebbbbrbbbbbbbbbbbbbbrbbbe......",
  /*20 */ "..ebbbbbbbbbbbbbbbbbbbbbbe......",
  /*21 */ "..eebbbbbbbbbbbbbbbbbbbee.......",
  /*22 */ "...eebbbbbbbbbbbbbbbbbee........",
  /*23 */ "....eeeeeeeeeeeeeeeee...........",
  /*24 */ "......pp..........pp............",
  /*25 */ "......pp..........pp............",
  /*26 */ "................................",
  /*27 */ "s...............................",
  /*28 */ "................................",
  /*29 */ "................................",
  /*30 */ "................................",
  /*31 */ "................................",
];

// ============================================================================
// POSE 3: MAGIC WAND CAULDRON — "dive"
// 32 cols × 32 rows
// ============================================================================
const WAND_BASE = [
  //       0         1         2         3
  //       01234567890123456789012345678901
  /* 0 */ "..........................s.....",
  /* 1 */ ".........................ss.....",
  /* 2 */ "........................vvs.....",
  /* 3 */ ".......................vv.......",
  /* 4 */ "......................vv........",
  /* 5 */ "...........cccc......vv.........",
  /* 6 */ "..........cccccc...vv...........",
  /* 7 */ ".........cccccccccvv............",
  /* 8 */ "........cccccccccccc............",
  /* 9 */ ".......ccccccccccccccc..........",
  /*10 */ "........cccccccccccccc..........",
  /*11 */ "....eeeeeecccccccceeeeee........",
  /*12 */ "...eebbbbbbccccccbbbbbbee.......",
  /*13 */ "..eebbbbbbbbbccbbbbbbbbee.......",
  /*14 */ "..ebbbbbbbbbbbbbbbbbbbbbbe......",
  /*15 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbe.....",
  /*16 */ ".ebbbbwwbbbbbbbbbbbbwwbbbbe.....",
  /*17 */ ".ebbbwhkbbbbbbbbbbbbhkwbbbe.....",
  /*18 */ ".ebbbbbbbbbbbbbbbbbbbbbbbbe.....",
  /*19 */ ".ebbbbrbbbbbbbbbbbbbbrbbbbe.....",
  /*20 */ ".ebbbbbbbbbbbmbbbbbbbbbbbe......",
  /*21 */ "..ebbbbbbbbbbbbbbbbbbbbbbe......",
  /*22 */ "..eebbbbbbbbbbbbbbbbbbbee.......",
  /*23 */ "...eebbbbbbbbbbbbbbbbee.........",
  /*24 */ "....eeeeeeeeeeeeeeeee...........",
  /*25 */ "......pp..........pp............",
  /*26 */ "......pp..........pp............",
  /*27 */ "................................",
  /*28 */ ".s..............................",
  /*29 */ "................................",
  /*30 */ "................................",
  /*31 */ "................................",
];

// ============================================================================
// Rendering helpers
// ============================================================================

function validateGrid(grid, name, cols) {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].length !== cols) {
      console.error(`[${name}] Row ${i} has ${grid[i].length} cols (expected ${cols}): "${grid[i]}"`);
      process.exit(1);
    }
  }
}

validateGrid(HAT_BASE, "HAT", HAT_COLS);
validateGrid(BUBBLY_BASE, "BUBBLY", HAT_COLS);
validateGrid(WAND_BASE, "WAND", HAT_COLS);

function cloneGrid(grid) {
  return grid.map((row) => row.split(""));
}

function setCell(g, r, c, ch) {
  if (r >= 0 && r < g.length && c >= 0 && c < g[r].length) {
    g[r][c] = ch;
  }
}

function gridToRects(g) {
  const parts = [];
  for (let r = 0; r < g.length; r++) {
    let col = 0;
    while (col < g[r].length) {
      const ch = g[r][col];
      if (ch === "." || !C[ch]) { col++; continue; }
      let run = 1;
      while (col + run < g[r].length && g[r][col + run] === ch) run++;
      parts.push(
        `<rect x="${col * P}" y="${r * P}" width="${run * P}" height="${P}" fill="${C[ch]}"/>`,
      );
      col += run;
    }
  }
  return parts.join("");
}

// Sparkle decoration
function sparkle(cx, cy, size, fill) {
  const h = size, t = Math.max(2, Math.round(size / 2));
  return (
    `<rect x="${cx - t / 2}" y="${cy - h / 2}" width="${t}" height="${h}" fill="${fill}" rx="1"/>` +
    `<rect x="${cx - h / 2}" y="${cy - t / 2}" width="${h}" height="${t}" fill="${fill}" rx="1"/>`
  );
}

// Pixel "Z" for sleep
function letterZ(x, y, u, fill) {
  const px = (cx, cy, w = 1, h = 1) =>
    `<rect x="${x + cx * u}" y="${y + cy * u}" width="${w * u}" height="${h * u}" fill="${fill}"/>`;
  return [
    px(0, 0, 3, 1),
    px(2, 1), px(1, 2), px(0, 3),
    px(0, 4, 3, 1),
  ].join("");
}

// Motion dash
function dash(x, y, w, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${P}" fill="${fill}" rx="1"/>`;
}

// Build SVG
function buildSvg({ grid, cols, rows, rotate = 0, extras = "", crop = null, title }) {
  const g = cloneGrid(grid);
  const body = gridToRects(g);

  const W = cols * P;
  const H = rows * P;
  const pad = 20;
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

// Eye cell coordinates for the HAT cauldron (for blink/sleep)
function applyHatEyes(grid, kind) {
  const g = cloneGrid(grid);
  if (kind === "closed") {
    // Close eyes — flat line
    setCell(g, 18, 7, "d"); setCell(g, 18, 8, "d");
    setCell(g, 19, 7, "e"); setCell(g, 19, 8, "e"); setCell(g, 19, 9, "e");
    setCell(g, 18, 21, "d"); setCell(g, 18, 22, "d");
    setCell(g, 19, 21, "e"); setCell(g, 19, 22, "e"); setCell(g, 19, 23, "e");
  } else if (kind === "happy") {
    // Happy ^_^ eyes
    setCell(g, 18, 7, "d"); setCell(g, 18, 8, "e"); setCell(g, 18, 9, "d");
    setCell(g, 19, 7, "e"); setCell(g, 19, 8, "d"); setCell(g, 19, 9, "e");
    setCell(g, 18, 21, "d"); setCell(g, 18, 22, "e"); setCell(g, 18, 23, "d");
    setCell(g, 19, 21, "e"); setCell(g, 19, 22, "d"); setCell(g, 19, 23, "e");
  }
  return g.map(row => row.join(""));
}

const W_HAT = HAT_COLS * P;
const H_HAT = HAT_ROWS * P;

// ============================================================================
// Generate all 6 poses — map to the three cauldron designs
// ============================================================================
const poses = {
  // GLIDE — witch hat cauldron, neutral, default
  "manta-glide": buildSvg({
    grid: HAT_BASE,
    cols: HAT_COLS,
    rows: HAT_ROWS,
    title: "Bubbles the cauldron, wearing a witch hat",
  }),

  // WAVE — witch hat, slight tilt + motion dashes
  "manta-wave": buildSvg({
    grid: HAT_BASE,
    cols: HAT_COLS,
    rows: HAT_ROWS,
    title: "Bubbles waving hello",
    rotate: -8,
    extras:
      dash(W_HAT + 8, 36, 14, C.a) +
      dash(W_HAT + 14, 48, 18, C.l) +
      dash(W_HAT + 8, 60, 14, C.a) +
      dash(W_HAT + 18, 54, 10, C.d),
  }),

  // CHEER — bubbly cauldron, sparkles around
  "manta-cheer": buildSvg({
    grid: BUBBLY_BASE,
    cols: HAT_COLS,
    rows: HAT_ROWS,
    title: "Bubbles celebrating",
    extras:
      sparkle(4, 6, 10, C.s) +
      sparkle(W_HAT - 4, 4, 8, C.s) +
      sparkle(W_HAT / 2, -8, 7, C.s) +
      sparkle(W_HAT + 8, 24, 6, C.s),
  }),

  // SLEEP — witch hat with closed eyes + zzz
  "manta-sleep": buildSvg({
    grid: applyHatEyes(HAT_BASE, "closed"),
    cols: HAT_COLS,
    rows: HAT_ROWS,
    title: "Bubbles resting",
    extras:
      letterZ(W_HAT - 8, -4, 3, C.a) +
      letterZ(W_HAT + 8, -18, 2.5, C.a) +
      letterZ(W_HAT + 22, -28, 2, C.l),
  }),

  // DIVE — wand cauldron, rotated with energy
  "manta-dive": buildSvg({
    grid: WAND_BASE,
    cols: HAT_COLS,
    rows: HAT_ROWS,
    title: "Bubbles casting a spell",
    rotate: 12,
    extras:
      sparkle(-4, H_HAT - 16, 6, C.s) +
      sparkle(-12, H_HAT - 6, 4, C.s) +
      sparkle(W_HAT + 12, 8, 5, C.s),
  }),

  // PEEK — bubbly cauldron, cropped to upper body
  "manta-peek": buildSvg({
    grid: BUBBLY_BASE,
    cols: HAT_COLS,
    rows: HAT_ROWS,
    title: "Bubbles peeking",
    crop: `-16 -20 ${W_HAT + 32} ${20 * P + 20}`,
  }),
};

for (const [name, svg] of Object.entries(poses)) {
  writeFileSync(join(OUT, `${name}.svg`), svg);
  console.log("wrote", `${name}.svg`, `(${svg.length} bytes)`);
}
