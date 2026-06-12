// generate-icons.mjs
// Generates PNG icons for PWA from SVG source using sharp
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");
mkdirSync(iconsDir, { recursive: true });

// The icon SVG as a buffer — emerald bg, white ledger, amber coin
const svgSource = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="#059669"/>
  <!-- Ledger book body -->
  <rect x="120" y="88" width="272" height="336" rx="24" fill="white" opacity="0.97"/>
  <!-- Lines on ledger -->
  <line x1="160" y1="180" x2="352" y2="180" stroke="#d1fae5" stroke-width="22" stroke-linecap="round"/>
  <line x1="160" y1="234" x2="352" y2="234" stroke="#d1fae5" stroke-width="22" stroke-linecap="round"/>
  <line x1="160" y1="288" x2="280" y2="288" stroke="#d1fae5" stroke-width="22" stroke-linecap="round"/>
  <!-- Check marks / amounts on right -->
  <line x1="306" y1="180" x2="352" y2="180" stroke="#059669" stroke-width="22" stroke-linecap="round"/>
  <line x1="306" y1="234" x2="352" y2="234" stroke="#059669" stroke-width="22" stroke-linecap="round"/>
  <!-- Rupee circle badge -->
  <circle cx="352" cy="352" r="80" fill="#f59e0b"/>
  <circle cx="352" cy="352" r="64" fill="#d97706"/>
  <!-- Rs symbol -->
  <text x="352" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="900" fill="white">₨</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function run() {
  for (const size of sizes) {
    await sharp(Buffer.from(svgSource))
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180) — must have solid bg (no transparency)
  await sharp(Buffer.from(svgSource))
    .resize(180, 180)
    .png()
    .toFile(join(iconsDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  // Maskable icon (with padding for Android adaptive icons)
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#059669"/>
    <rect x="140" y="108" width="232" height="296" rx="20" fill="white" opacity="0.97"/>
    <line x1="176" y1="192" x2="336" y2="192" stroke="#d1fae5" stroke-width="18" stroke-linecap="round"/>
    <line x1="176" y1="240" x2="336" y2="240" stroke="#d1fae5" stroke-width="18" stroke-linecap="round"/>
    <line x1="176" y1="288" x2="260" y2="288" stroke="#d1fae5" stroke-width="18" stroke-linecap="round"/>
    <line x1="276" y1="192" x2="336" y2="192" stroke="#059669" stroke-width="18" stroke-linecap="round"/>
    <circle cx="336" cy="336" r="68" fill="#f59e0b"/>
    <circle cx="336" cy="336" r="54" fill="#d97706"/>
    <text x="336" y="352" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="white">₨</text>
  </svg>`;

  for (const size of [192, 512]) {
    await sharp(Buffer.from(maskableSvg))
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `maskable-${size}x${size}.png`));
    console.log(`Generated maskable-${size}x${size}.png`);
  }

  console.log("All icons generated!");
}

run().catch(console.error);
