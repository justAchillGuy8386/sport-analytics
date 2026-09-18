import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// High-tech Sports Analytics Favicon SVG
// Combines a modern soccer ball geometry with brand emerald/cyan glow and analytics data accents
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090E17"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Border Accent Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#06B6D4" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.2"/>
    </linearGradient>

    <!-- Emerald-Cyan Ball Accent Gradient -->
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>

    <!-- Center Pentagon Glow -->
    <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EE7B7"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <!-- Glow Filter for High Visibility at 16x16 and 32x32 -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Squircle Base Frame -->
  <rect x="8" y="8" width="496" height="496" rx="130" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="12"/>

  <!-- Subtle Radial Analytics Radar Halo -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="#10B981" stroke-width="3" stroke-dasharray="12 16" opacity="0.3"/>
  <circle cx="256" cy="256" r="165" fill="#10B981" fill-opacity="0.04"/>

  <!-- Outer Soccer Ball Circle -->
  <circle cx="256" cy="256" r="145" fill="#0B132B" stroke="url(#accentGrad)" stroke-width="14" filter="url(#glow)"/>

  <!-- Classic Pentagon Facet at Center (Rotated so flat edge or apex matches standard ball) -->
  <!-- Center at (256, 256), radius = 62, top apex at (256, 194) -->
  <polygon points="
    256,194 
    315,237 
    292,306 
    220,306 
    197,237" 
    fill="url(#centerGrad)" 
    stroke="#A7F3D0" 
    stroke-width="5"
  />

  <!-- Seam Lines radiating from Pentagon Vertices to Perimeter -->
  <!-- Vertex 1 (top): (256, 194) -> (256, 111) -->
  <line x1="256" y1="194" x2="256" y2="111" stroke="#38BDF8" stroke-width="10" stroke-linecap="round"/>

  <!-- Vertex 2 (top-right): (315, 237) -> (394, 211) -->
  <line x1="315" y1="237" x2="394" y2="211" stroke="#38BDF8" stroke-width="10" stroke-linecap="round"/>

  <!-- Vertex 3 (bottom-right): (292, 306) -> (341, 373) -->
  <line x1="292" y1="306" x2="341" y2="373" stroke="#38BDF8" stroke-width="10" stroke-linecap="round"/>

  <!-- Vertex 4 (bottom-left): (220, 306) -> (171, 373) -->
  <line x1="220" y1="306" x2="171" y2="373" stroke="#38BDF8" stroke-width="10" stroke-linecap="round"/>

  <!-- Vertex 5 (top-left): (197, 237) -> (118, 211) -->
  <line x1="197" y1="237" x2="118" y2="211" stroke="#38BDF8" stroke-width="10" stroke-linecap="round"/>

  <!-- Outer Inter-Panel Seams along the perimeter -->
  <line x1="256" y1="111" x2="394" y2="211" stroke="#38BDF8" stroke-width="6" opacity="0.6" stroke-linecap="round"/>
  <line x1="394" y1="211" x2="341" y2="373" stroke="#38BDF8" stroke-width="6" opacity="0.6" stroke-linecap="round"/>
  <line x1="341" y1="373" x2="171" y2="373" stroke="#38BDF8" stroke-width="6" opacity="0.6" stroke-linecap="round"/>
  <line x1="171" y1="373" x2="118" y2="211" stroke="#38BDF8" stroke-width="6" opacity="0.6" stroke-linecap="round"/>
  <line x1="118" y1="211" x2="256" y2="111" stroke="#38BDF8" stroke-width="6" opacity="0.6" stroke-linecap="round"/>

  <!-- Modern Analytics Pulse Accent (Ascending telemetry pulse badge at bottom-right) -->
  <g transform="translate(320, 320)">
    <!-- Glow Backdrop -->
    <rect x="-10" y="-10" width="130" height="130" rx="35" fill="#0B1329" stroke="#10B981" stroke-width="6"/>
    <!-- Analytics Pulse Line -->
    <path d="M 12,55 L 35,55 L 48,22 L 68,85 L 82,45 L 102,45" fill="none" stroke="url(#accentGrad)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Pulse Peak Dot -->
    <circle cx="48" cy="22" r="6" fill="#6EE7B7"/>
  </g>
</svg>`;

async function main() {
  const outDir = path.resolve('public');
  fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('Wrote public/icon.svg');

  // Generate PNGs at multiple resolutions
  const buf512 = Buffer.from(svgContent);
  await sharp(buf512).resize(32, 32).png().toFile(path.join(outDir, 'favicon-32x32.png'));
  await sharp(buf512).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(buf512).resize(192, 192).png().toFile(path.join(outDir, 'icon-192x192.png'));
  await sharp(buf512).resize(512, 512).png().toFile(path.join(outDir, 'icon-512x512.png'));

  // Helper to pack PNG buffers into standard .ico format
  function createIco(pngBuffers) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // ICO format
    header.writeUInt16LE(pngBuffers.length, 4); // Count

    let offset = 6 + 16 * pngBuffers.length;
    const dirEntries = [];

    for (const item of pngBuffers) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(item.size === 256 ? 0 : item.size, 0); // Width
      entry.writeUInt8(item.size === 256 ? 0 : item.size, 1); // Height
      entry.writeUInt8(0, 2); // Colors (0 = no palette)
      entry.writeUInt8(0, 3); // Reserved
      entry.writeUInt16LE(1, 4); // Color planes
      entry.writeUInt16LE(32, 6); // Bits per pixel
      entry.writeUInt32LE(item.buf.length, 8); // Size
      entry.writeUInt32LE(offset, 12); // Offset
      dirEntries.push(entry);
      offset += item.buf.length;
    }

    return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buf)]);
  }

  const png16 = await sharp(buf512).resize(16, 16).png().toBuffer();
  const png32 = await sharp(buf512).resize(32, 32).png().toBuffer();
  const png48 = await sharp(buf512).resize(48, 48).png().toBuffer();

  const icoBuf = createIco([
    { size: 16, buf: png16 },
    { size: 32, buf: png32 },
    { size: 48, buf: png48 }
  ]);

  fs.writeFileSync(path.join(outDir, 'favicon.ico'), icoBuf);
  fs.writeFileSync(path.resolve('src/app/favicon.ico'), icoBuf);
  fs.writeFileSync(path.resolve('src/app/icon.svg'), svgContent, 'utf-8');
  console.log('Wrote public/favicon.ico, src/app/favicon.ico and src/app/icon.svg!');
}

main().catch(console.error);
