// Renders the suite icon to every raster the app needs.
// Run: node scripts/generate-icons.mjs   (sharp ships with Next, no install)
//
// The icon IS the CardCrate icon (SPEC "Icon & PWA"): the isometric crate the
// Journal and Todos icons were styled after. It is never redrawn — the 1024px
// source PNG (cream background baked in) is copied into scripts/icon-source.png
// and scaled/masked here. ICON_SRC overrides the input, ICON_OUT the output dir.
//
//   public/icons/icon-192.png           manifest "any"      rounded, transparent corners
//   public/icons/icon-512.png           manifest "any"
//   public/icons/icon-512-maskable.png  manifest "maskable" full-bleed, art inside 80% safe zone
//   src/app/apple-icon.png              iOS Home Screen     full-bleed, iOS applies its own mask
//   src/app/icon.png                    favicon             rounded
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = process.env.ICON_SRC ?? "scripts/icon-source.png";
const OUT = process.env.ICON_OUT ?? ".";
const out = (p) => path.join(OUT, p);
await mkdir(out("public/icons"), { recursive: true });
await mkdir(out("src/app"), { recursive: true });

const BG = "#F8F3E5"; // CardCrate background — must match the source PNG's corners
const S = 512;

// The source's cream must equal BG or the composite seam shows.
const { data } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const corner = `#${[data[0], data[1], data[2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
if (corner.toUpperCase() !== BG) throw new Error(`source corner ${corner} != BG ${BG}`);

/**
 * @param {{ rounded: boolean, scale: number }} o  scale = fraction of the canvas the source fills
 * @param {number} size  output edge in px
 */
async function render({ rounded, scale }, size) {
  const artSize = Math.round(S * scale);
  const art = await sharp(SRC).resize(artSize, artSize).png().toBuffer();
  const radius = rounded ? Math.round(S * 0.22) : 0;
  const shape = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="${S}" height="${S}" rx="${radius}" fill="${BG}"/></svg>`,
  );
  const offset = Math.round((S - artSize) / 2);
  // sharp runs resize BEFORE composite whatever the call order, so compose at
  // full size first and scale in a second pass.
  const composed = await sharp(shape)
    .composite([
      { input: art, left: offset, top: offset },
      // Cut the rounded corners back out (the art may overlap them).
      ...(rounded
        ? [{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="${S}" height="${S}" rx="${radius}" fill="#fff"/></svg>`), blend: "dest-in" }]
        : []),
    ])
    .png()
    .toBuffer();
  return sharp(composed).resize(size, size).png().toBuffer();
}

const rounded = { rounded: true, scale: 1 };
const bleed = { rounded: false, scale: 1 };

await writeFile(out("public/icons/icon-192.png"), await render(rounded, 192));
await writeFile(out("public/icons/icon-512.png"), await render(rounded, 512));
// Maskable: the crate sits ~20–85% across the source; 0.8 keeps it inside the safe zone.
await writeFile(out("public/icons/icon-512-maskable.png"), await render({ rounded: false, scale: 0.8 }, 512));
await writeFile(out("src/app/apple-icon.png"), await render(bleed, 180));
await writeFile(out("src/app/icon.png"), await render(rounded, 64));
console.log("icons written");
