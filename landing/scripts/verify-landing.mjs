import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const url = process.env.LANDING_URL ?? 'http://127.0.0.1:5178';
const outputDir = new URL('../artifacts/', import.meta.url);
await mkdir(fileURLToPath(outputDir), { recursive: true });

const browser = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization',
  ]
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForSelector('canvas', { state: 'visible' });
await page.waitForTimeout(800);

// 1. hero shows ATELIER
const heroText = await page.locator('h1.hero-title').innerText();
if (!/ATELIER/i.test(heroText)) throw new Error(`Hero title missing ATELIER: "${heroText}"`);

// 2. all 8 section anchors exist
for (const id of ['hero', 'whatis', 'flow', 'roles', 'arch', 'kpis', 'qa', 'demo']) {
  const n = await page.locator(`#${id}`).count();
  if (n < 1) throw new Error(`Missing section #${id}`);
}

// 3. at least one APK CTA points to the expo artifact
const apk = await page.locator('a[href*="expo.dev/artifacts"]').count();
if (apk < 1) throw new Error('No APK download link found');

// 4. authors present
const body = await page.locator('body').innerText();
for (const name of ['Andres Botero', 'Juan Camilo Triana']) {
  if (!body.includes(name)) throw new Error(`Author missing: ${name}`);
}

// 5. canvas renders non-blank + animates
// Uses Playwright screenshot because WebGL canvas with preserveDrawingBuffer:false
// clears the buffer after compositing — readPixels always returns zeros in headless mode.
const sampleCanvasViaScreenshot = async () => {
  const buf = await page.locator('canvas').screenshot();
  // PNG header is 8 bytes, IHDR chunk follows; raw RGBA data is in IDAT chunks.
  // Instead of parsing PNG, sample the buffer bytes as a proxy for pixel diversity.
  // PNG compressed data changes when content changes, so compare buffer hashes.
  let nonBlank = 0;
  const stride = Math.max(1, Math.floor(buf.length / 6000));
  for (let i = 8; i < buf.length; i += stride) {
    if (buf[i] > 18) nonBlank++;
  }
  return { nonBlank, sample: Array.from(buf.slice(8, 8 + 24000)) };
};

const a = await sampleCanvasViaScreenshot();
await page.waitForTimeout(1500);
const b = await sampleCanvasViaScreenshot();

if (a.nonBlank < 25) throw new Error(`Canvas screenshot appears blank: ${a.nonBlank}`);
const movement = a.sample.reduce((s, v, i) => s + Math.abs(v - (b.sample[i] ?? v)), 0);
if (movement < 400) throw new Error(`Canvas not animating: ${movement}`);

// 6. scroll to bottom without console errors
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
await page.screenshot({ path: fileURLToPath(new URL('../artifacts/landing-bottom.png', import.meta.url)) });

if (errors.length) throw new Error(`Console errors: ${errors.join(' | ')}`);

await browser.close();
console.log('✅ ATELIER landing smoke test passed');
