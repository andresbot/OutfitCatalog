#!/usr/bin/env node
'use strict';

/**
 * OutfitCatalog · ATELIER — Generador de PDFs profesionales
 * Diseño: report corporativo limpio, tipografía clara, tablas elegantes.
 * Andrés Botero · Juan Camilo Triana — Dispositivos Móviles 2026
 */

const fs   = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');

// ─── Rutas ────────────────────────────────────────────────────────────────────
const ROOT       = process.cwd();
const INPUT_DIR  = path.join(ROOT, 'docs', 'entrega-final');
const OUTPUT_DIR = path.join(INPUT_DIR, 'pdf');

// ─── Medidas (A4 en puntos) ───────────────────────────────────────────────────
const W  = 595.28;
const H  = 841.89;
const ML = 60;          // margen izquierdo
const MR = 60;          // margen derecho
const MT = 56;          // margen superior (páginas de contenido)
const MB = 48;          // margen inferior
const CW = W - ML - MR; // ancho de contenido

// ─── Paleta ───────────────────────────────────────────────────────────────────
const GOLD   = '#C9A84C';
const INK    = '#111111';
const DARK   = '#1C1C1E';
const GRAY1  = '#3A3A3C';
const GRAY2  = '#6B6B6E';
const GRAY3  = '#AEAEB2';
const WHITE  = '#FFFFFF';
const BG_ALT = '#F9F8F6';
const BORDER = '#E5E2DA';
const TH_BG  = '#1C1C1E';
const TH_TXT = '#F7F1DD';
const TR_ODD = '#FAFAF8';
const TR_EVN = '#FFFFFF';
const CODE_BG= '#F5F5F5';
const CODE_BD= '#DCDCDC';
const CODE_TX= '#1E293B';

// ─── Fuentes ──────────────────────────────────────────────────────────────────
const WIN = {
  reg : 'C:\\Windows\\Fonts\\arial.ttf',
  bold: 'C:\\Windows\\Fonts\\arialbd.ttf',
  ita : 'C:\\Windows\\Fonts\\ariali.ttf',
  mono: 'C:\\Windows\\Fonts\\consola.ttf',
};

function registerFonts(doc) {
  if (fs.existsSync(WIN.reg)) {
    doc.registerFont('R', WIN.reg);
    doc.registerFont('B', WIN.bold);
    doc.registerFont('I', WIN.ita);
    doc.registerFont('M', WIN.mono);
  } else {
    doc.registerFont('R', 'Helvetica');
    doc.registerFont('B', 'Helvetica-Bold');
    doc.registerFont('I', 'Helvetica-Oblique');
    doc.registerFont('M', 'Courier');
  }
}

// ─── Limpieza de texto ────────────────────────────────────────────────────────
const CHARS = [
  [/Ã¡/g,'á'],[/Ã©/g,'é'],[/Ã­/g,'í'],[/Ã³/g,'ó'],[/Ãº/g,'ú'],[/Ã±/g,'ñ'],
  [/Ã/g,'Á'],[/Ã/g,'É'],[/Ã/g,'Í'],[/Ã/g,'Ó'],[/Ã/g,'Ú'],[/Ã/g,'Ñ'],
  [/Â¿/g,'¿'],[/Â¡/g,'¡'],[/Â·/g,'·'],
  [/â€"/g,'—'],[/â€"/g,'–'],[/â€œ/g,'"'],[/â€/g,'"'],
  [/â€˜/g,"'"],[/â€™/g,"'"],[/â†'/g,'→'],[/âœ"/g,'✓'],
];
function fix(s) {
  let o = s;
  for (const [p, r] of CHARS) o = o.replace(p, r);
  return o;
}
function clean(s) {
  return fix(s)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g,  '$1')
    .replace(/`([^`]+)`/g,    '$1')
    .replace(/__([^_]+)__/g,  '$1')
    .replace(/_([^_]+)_/g,    '$1')
    .trim();
}

// ─── Helpers de dibujo ────────────────────────────────────────────────────────
function hline(doc, y, color = BORDER, lw = 0.5) {
  doc.save()
    .moveTo(ML, y).lineTo(W - MR, y)
    .strokeColor(color).lineWidth(lw).stroke()
    .restore();
}

function vline(doc, x, y1, y2, color = GOLD, lw = 1) {
  doc.save()
    .moveTo(x, y1).lineTo(x, y2)
    .strokeColor(color).lineWidth(lw).stroke()
    .restore();
}

function box(doc, x, y, w, h, fill, stroke = null) {
  if (stroke) doc.rect(x, y, w, h).fillAndStroke(fill, stroke);
  else        doc.rect(x, y, w, h).fill(fill);
}

// ─── Tipografía ───────────────────────────────────────────────────────────────
function set(doc, font, size, color) {
  doc.font(font).fontSize(size).fillColor(color);
}

// ─── Salto de página si falta espacio ────────────────────────────────────────
function pageBreakIfNeeded(doc, needed) {
  if (doc.y + needed > H - MB - 20) {
    doc.addPage();
    doc.y = MT + 26; // debajo del header
    return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTADA
// ══════════════════════════════════════════════════════════════════════════════
function renderCover(doc, title, filename) {
  // Franja dorada superior (6px)
  box(doc, 0, 0, W, 6, GOLD);

  // Panel oscuro superior — 44% de la página
  const panelH = H * 0.44;
  box(doc, 0, 6, W, panelH, DARK);

  // ── Contenido del panel oscuro ──
  const px = ML + 4;
  const pw = CW - 8;

  // Etiqueta del proyecto
  doc.save();
  set(doc, 'B', 7.5, GOLD);
  doc.text('OUTFITCATALOG  ·  ATELIER FASHION CATALOG', px, 32, {
    width: pw, characterSpacing: 2.5,
  });
  doc.restore();

  // Línea dorada fina
  box(doc, px, 50, 40, 2, GOLD);

  // Título del documento
  set(doc, 'B', 30, WHITE);
  const titleY = 62;
  doc.text(title, px, titleY, {
    width: pw,
    lineGap: 4,
  });

  // Subtítulo / tipo de documento
  const afterTitle = doc.y + 10;
  set(doc, 'R', 10, GRAY3);
  doc.text('Entrega Final  ·  Dispositivos Móviles  ·  2026', px, afterTitle, {
    width: pw, characterSpacing: 0.5,
  });

  // Número de documento (esquina inferior derecha del panel)
  const tag = filename.replace(/\.md$/i, '').toUpperCase();
  set(doc, 'M', 7.5, GRAY2);
  doc.text(tag, px, panelH - 22, {
    width: pw, align: 'right', characterSpacing: 1,
  });

  // ── Panel blanco inferior ──
  const wp = panelH + 6;

  // Sección de autores
  const authY = wp + 42;
  set(doc, 'B', 9, GRAY2);
  doc.text('AUTORES', px, authY, { characterSpacing: 2 });
  hline(doc, authY + 14, BORDER);

  set(doc, 'B', 14, INK);
  doc.text('Andrés Botero', px, authY + 22, { width: CW / 2 - 16 });
  doc.text('Juan Camilo Triana', px + CW / 2, authY + 22, { width: CW / 2 });

  set(doc, 'R', 9, GRAY2);
  doc.text('Tecnología en Desarrollo de Software', px, authY + 42, { width: CW / 2 - 16 });
  doc.text('Tecnología en Desarrollo de Software', px + CW / 2, authY + 42, { width: CW / 2 });

  // Ficha del proyecto
  const fichaY = authY + 72;
  hline(doc, fichaY, BORDER);

  const fields = [
    ['PROYECTO',   'OutfitCatalog · ATELIER Fashion Catalog'],
    ['ASIGNATURA', 'Dispositivos Móviles'],
    ['FECHA',      'Junio 2026'],
    ['VERSIÓN',    '1.0.0'],
  ];

  const colW = CW / 2;
  let fy = fichaY + 14;
  for (let i = 0; i < fields.length; i += 2) {
    const [lk, lv] = fields[i];
    const [rk, rv] = fields[i + 1] ?? ['', ''];

    set(doc, 'B', 7.5, GOLD);
    doc.text(lk, px, fy, { width: colW - 16, characterSpacing: 1.2 });
    if (rk) doc.text(rk, px + colW, fy, { width: colW - 16, characterSpacing: 1.2 });

    set(doc, 'R', 10.5, INK);
    doc.text(lv, px, fy + 13, { width: colW - 16 });
    if (rv) doc.text(rv, px + colW, fy + 13, { width: colW - 16 });

    fy += 36;
  }

  // Franja dorada inferior
  box(doc, 0, H - 6, W, 6, GOLD);

  // Pie
  set(doc, 'R', 7.5, GRAY3);
  doc.text('Entrega académica final', 0, H - 24, { width: W, align: 'center' });
}

// ══════════════════════════════════════════════════════════════════════════════
// ÍNDICE
// ══════════════════════════════════════════════════════════════════════════════
function renderToc(doc, sections) {
  doc.addPage();

  // Header de la página de índice
  set(doc, 'B', 7.5, GOLD);
  doc.text('OUTFITCATALOG  ·  ATELIER', ML, 24, { characterSpacing: 2, width: CW });
  hline(doc, 36, GOLD, 1);

  // Título "Contenido"
  doc.y = 52;
  set(doc, 'B', 20, INK);
  doc.text('Contenido', ML, doc.y);
  doc.moveDown(0.6);
  hline(doc, doc.y, BORDER);
  doc.y += 14;

  for (const { level, text } of sections) {
    pageBreakIfNeeded(doc, 18);
    const indent = level === 2 ? 20 : 0;
    const font   = level === 1 ? 'B' : 'R';
    const color  = level === 1 ? INK : GRAY1;
    const size   = level === 1 ? 10.5 : 10;

    set(doc, font, size, color);
    doc.text((level === 2 ? '  ' : '') + text, ML + indent, doc.y, {
      width: CW - indent - 4,
    });
    doc.y += level === 1 ? 2 : 1;

    if (level === 1) {
      hline(doc, doc.y, BG_ALT);
      doc.y += 8;
    } else {
      doc.y += 4;
    }
  }

  // Franja dorada inferior
  box(doc, 0, H - 6, W, 6, GOLD);
}

// ══════════════════════════════════════════════════════════════════════════════
// CABECERA DE PÁGINA (cada página de contenido)
// ══════════════════════════════════════════════════════════════════════════════
function drawPageHeader(doc, shortTitle) {
  set(doc, 'B', 7, GOLD);
  doc.text('ATELIER · OUTFITCATALOG', ML, 22, { characterSpacing: 1.8, width: CW / 2 });
  set(doc, 'R', 7, GRAY2);
  doc.text(shortTitle.toUpperCase(), ML, 22, {
    width: CW, align: 'right', characterSpacing: 0.6,
  });
  hline(doc, 34, BORDER, 0.5);
  box(doc, ML, 34, 32, 1.5, GOLD); // acento dorado izquierdo bajo el header
}

// ══════════════════════════════════════════════════════════════════════════════
// PIES DE PÁGINA
// ══════════════════════════════════════════════════════════════════════════════
function addFooters(doc, docTitle) {
  const range = doc.bufferedPageRange();
  const total = range.count;
  // Portada = i+1=1, Índice = i+1=2, Contenido = i+1>=3
  const contentPages = total - 2;

  for (let i = range.start; i < range.start + total; i++) {
    doc.switchToPage(i);
    const localNum = i - range.start + 1;
    if (localNum <= 2) continue; // portada e índice no llevan pie numerado

    const contentNum = localNum - 2;
    const fy = H - 28;

    hline(doc, fy - 4, BORDER, 0.4);
    set(doc, 'R', 7, GRAY3);
    doc.text(docTitle, ML, fy, {
      width: CW * 0.72, lineBreak: false, ellipsis: true,
    });
    doc.text(`${contentNum} / ${contentPages}`, ML, fy, {
      width: CW, align: 'right', lineBreak: false,
    });

    // Franja dorada inferior
    box(doc, 0, H - 6, W, 6, GOLD);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERIZADORES DE CONTENIDO
// ══════════════════════════════════════════════════════════════════════════════

function renderH1(doc, text) {
  pageBreakIfNeeded(doc, 48);
  doc.moveDown(0.5);

  const y = doc.y;
  // Barra lateral dorada
  box(doc, ML, y, 3.5, 28, GOLD);

  set(doc, 'B', 20, INK);
  doc.text(text, ML + 12, y + 4, { width: CW - 12, lineGap: 2 });

  doc.moveDown(0.2);
  hline(doc, doc.y, GOLD, 0.8);
  doc.moveDown(0.55);
}

function renderH2(doc, text) {
  pageBreakIfNeeded(doc, 36);
  doc.moveDown(0.45);
  set(doc, 'B', 13.5, INK);
  doc.text(text, ML, doc.y, { width: CW, lineGap: 1.5 });
  doc.moveDown(0.12);
  hline(doc, doc.y, BORDER, 0.5);
  doc.moveDown(0.4);
}

function renderH3(doc, text) {
  pageBreakIfNeeded(doc, 26);
  doc.moveDown(0.35);
  set(doc, 'B', 11.5, GRAY1);
  doc.text(text, ML, doc.y, { width: CW });
  doc.moveDown(0.3);
}

function renderH4(doc, text) {
  pageBreakIfNeeded(doc, 20);
  doc.moveDown(0.25);
  set(doc, 'B', 10.5, GRAY2);
  doc.text(text, ML, doc.y, { width: CW });
  doc.moveDown(0.2);
}

function renderParagraph(doc, text) {
  const t = clean(text);
  if (!t) return;
  pageBreakIfNeeded(doc, 22);
  set(doc, 'R', 10.5, GRAY1);
  doc.text(t, ML, doc.y, { width: CW, align: 'justify', lineGap: 3 });
  doc.moveDown(0.4);
}

function renderBullet(doc, text, depth) {
  const t = clean(text);
  if (!t) return;
  pageBreakIfNeeded(doc, 16);
  const ind = ML + 14 + depth * 16;
  const w   = CW - 14 - depth * 16;
  set(doc, 'R', 9.5, GOLD);
  doc.text(depth === 0 ? '▸' : '–', ind - 13, doc.y, { width: 13, lineBreak: false });
  set(doc, 'R', 10.5, GRAY1);
  doc.text(t, ind, doc.y - 11.5, { width: w, lineGap: 2 });
  doc.moveDown(0.08);
}

function renderNumbered(doc, num, text, depth) {
  const t = clean(text);
  if (!t) return;
  pageBreakIfNeeded(doc, 16);
  const ind = ML + 22 + depth * 16;
  const w   = CW - 22 - depth * 16;
  set(doc, 'B', 10, GOLD);
  doc.text(`${num}.`, ind - 20, doc.y, { width: 18, align: 'right', lineBreak: false });
  set(doc, 'R', 10.5, GRAY1);
  doc.text(t, ind + 2, doc.y - 11.5, { width: w, lineGap: 2 });
  doc.moveDown(0.08);
}

function renderBlockquote(doc, lines) {
  const t = clean(lines.join(' '));
  if (!t) return;
  pageBreakIfNeeded(doc, 32);
  const bh = doc.heightOfString(t, { width: CW - 24, lineGap: 2.5 }) + 16;
  const y0 = doc.y;
  box(doc, ML,     y0, 3, bh, GOLD);
  box(doc, ML + 3, y0, CW - 3, bh, BG_ALT);
  set(doc, 'I', 10.2, GRAY1);
  doc.text(t, ML + 14, y0 + 8, { width: CW - 24, lineGap: 2.5 });
  doc.y = y0 + bh + 8;
  doc.moveDown(0.2);
}

function renderCode(doc, lang, lines) {
  const raw = fix(lines.join('\n')).replace(/\t/g, '  ');
  if (!raw.trim()) return;
  set(doc, 'M', 8.2, CODE_TX);
  const th  = lang ? 14 : 0;
  const bh  = doc.heightOfString(raw, { width: CW - 20, lineGap: 1.6 }) + th + 14;
  const cap = Math.min(bh, H - MB - (doc.y + 20));
  pageBreakIfNeeded(doc, Math.min(bh, 80));
  const y0 = doc.y;
  box(doc, ML, y0, CW, Math.max(cap, 28), CODE_BG, CODE_BD);

  // Borde izquierdo de color
  box(doc, ML, y0, 3, Math.max(cap, 28), GOLD);

  if (lang) {
    set(doc, 'B', 7, GRAY2);
    doc.text(lang.toUpperCase(), ML + 10, y0 + 5, { characterSpacing: 1 });
  }
  set(doc, 'M', 8.2, CODE_TX);
  doc.text(raw, ML + 10, y0 + th + 7, { width: CW - 20, lineGap: 1.6 });
  doc.moveDown(0.6);
}

// ── Tablas ────────────────────────────────────────────────────────────────────
function parseTableRows(lines) {
  return lines
    .filter(l => !/^\s*\|?\s*:?-{2,}/.test(l))
    .map(l =>
      l.trim().replace(/^\|/,'').replace(/\|$/,'')
        .split('|').map(c => clean(c))
    );
}

function colWidths(headers, rows) {
  const n = headers.length;
  const all = [headers, ...rows];
  const nat = Array.from({ length: n }, (_, ci) => {
    const max = Math.max(...all.map(r => (r[ci] || '').length));
    return Math.min(Math.max(max * 5.6 + 14, 34), CW * 0.52);
  });
  const sum = nat.reduce((a, b) => a + b, 0);
  const scale = sum > CW ? CW / sum : 1;
  return nat.map(w => Math.max(w * scale, 30));
}

function renderTable(doc, headers, rows) {
  if (!headers.length) return;
  const widths = colWidths(headers, rows);
  const PAD = 6;
  const MIN_RH = 20;

  // ── encabezado ──
  set(doc, 'B', 8.5, TH_TXT);
  const headH = Math.max(
    MIN_RH,
    ...headers.map((h, ci) =>
      doc.heightOfString(h, { width: widths[ci] - PAD * 2, lineGap: 1.2 }) + PAD * 2
    )
  );
  pageBreakIfNeeded(doc, headH + MIN_RH * 2);

  let y = doc.y;
  box(doc, ML, y, CW, headH, TH_BG);
  // Línea dorada bajo encabezado
  box(doc, ML, y + headH - 1.5, CW, 1.5, GOLD);

  let cx = ML;
  headers.forEach((h, ci) => {
    set(doc, 'B', 8.5, TH_TXT);
    doc.text(h, cx + PAD, y + PAD, {
      width: widths[ci] - PAD * 2, lineGap: 1.2, lineBreak: true,
    });
    cx += widths[ci];
  });
  y += headH;

  // ── filas ──
  rows.forEach((row, ri) => {
    set(doc, 'R', 9, GRAY1);
    const rh = Math.max(
      MIN_RH,
      ...row.map((c, ci) =>
        doc.heightOfString(c || '', { width: widths[ci] - PAD * 2, lineGap: 1.3 }) + PAD * 2
      )
    );

    if (y + rh > H - MB - 20) {
      doc.addPage();
      doc.y = MT + 26;
      y = doc.y;
      // repetir encabezado
      box(doc, ML, y, CW, headH, TH_BG);
      box(doc, ML, y + headH - 1.5, CW, 1.5, GOLD);
      cx = ML;
      headers.forEach((h, ci) => {
        set(doc, 'B', 8.5, TH_TXT);
        doc.text(h, cx + PAD, y + PAD, { width: widths[ci] - PAD * 2, lineBreak: true });
        cx += widths[ci];
      });
      y += headH;
    }

    const fill = ri % 2 === 0 ? TR_ODD : TR_EVN;
    box(doc, ML, y, CW, rh, fill);
    hline(doc, y, BORDER, 0.3);

    cx = ML;
    row.forEach((cell, ci) => {
      const isMono = /^[`\/\\]/.test(cell) || /\.(ts|js|json|md|txt)$/.test(cell);
      if (isMono) {
        set(doc, 'M', 7.8, CODE_TX);
        doc.text(cell || '—', cx + PAD, y + PAD, { width: widths[ci] - PAD * 2, lineBreak: true });
      } else {
        set(doc, 'R', 9, GRAY1);
        doc.text(cell || '—', cx + PAD, y + PAD, { width: widths[ci] - PAD * 2, lineGap: 1.3, lineBreak: true });
      }
      if (ci > 0) vline(doc, cx, y, y + rh, BORDER, 0.3);
      cx += widths[ci];
    });

    y += rh;
    doc.y = y;
  });

  hline(doc, doc.y, BORDER, 0.4);
  doc.moveDown(0.7);
}

// ══════════════════════════════════════════════════════════════════════════════
// PARSER DE MARKDOWN
// ══════════════════════════════════════════════════════════════════════════════
function extractTitle(md) {
  const line = md.split(/\r?\n/).find(l => /^#\s/.test(l));
  return line ? clean(line.replace(/^#\s+/, '')) : 'Documento';
}

function extractSections(md) {
  const sections = [];
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(/^(#{1,2})\s+(.+)$/);
    if (m) sections.push({ level: m[1].length, text: clean(m[2]) });
  }
  return sections;
}

function renderContent(doc, markdown) {
  const lines = fix(markdown).replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  let skipFirstH1 = true;

  while (i < lines.length) {
    const raw = lines[i];
    const ln  = raw.trim();

    // Vacío
    if (!ln) { doc.moveDown(0.15); i++; continue; }

    // Mermaid / diagrama — omitir limpiamente
    if (/^```\s*(mermaid|flowchart|sequence|gantt)/i.test(ln)) {
      const hint = ln.replace(/^```\s*/,'') || 'diagrama';
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) i++;
      pageBreakIfNeeded(doc, 24);
      set(doc, 'I', 9, GRAY3);
      doc.text(`[ ${hint} — ver documento fuente ]`, ML, doc.y, { width: CW });
      doc.moveDown(0.4);
      i++; continue;
    }

    // Bloque de código
    if (/^```/.test(ln)) {
      const lang = ln.replace(/^```\s*/,'').trim();
      i++;
      const block = [];
      while (i < lines.length && !/^```/.test(lines[i].trim())) { block.push(lines[i]); i++; }
      renderCode(doc, lang, block);
      i++; continue;
    }

    // Encabezados
    const hm = ln.match(/^(#{1,4})\s+(.+)$/);
    if (hm) {
      const lvl  = hm[1].length;
      const text = clean(hm[2]);
      if (lvl === 1 && skipFirstH1) { skipFirstH1 = false; i++; continue; }
      if (lvl === 1)      renderH1(doc, text);
      else if (lvl === 2) renderH2(doc, text);
      else if (lvl === 3) renderH3(doc, text);
      else                renderH4(doc, text);
      i++; continue;
    }

    // Blockquote
    if (/^>/.test(ln)) {
      const bq = [];
      while (i < lines.length && /^>/.test(lines[i].trim())) {
        bq.push(lines[i].trim().replace(/^>\s?/,'')); i++;
      }
      renderBlockquote(doc, bq);
      continue;
    }

    // Tabla
    if (/^\|/.test(ln)) {
      const tbl = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) { tbl.push(lines[i]); i++; }
      const parsed = parseTableRows(tbl);
      if (parsed.length > 1) renderTable(doc, parsed[0], parsed.slice(1));
      continue;
    }

    // Lista viñeta
    const bm = raw.match(/^(\s*)([-*+])\s+(.+)$/);
    if (bm) {
      renderBullet(doc, bm[3], Math.floor(bm[1].length / 2));
      i++; continue;
    }

    // Lista numerada
    const nm = raw.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (nm) {
      renderNumbered(doc, nm[2], nm[3], Math.floor(nm[1].length / 2));
      i++; continue;
    }

    // Regla horizontal
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(ln)) {
      hline(doc, doc.y, BORDER); doc.moveDown(0.5); i++; continue;
    }

    // Párrafo — acumula líneas contiguas
    const para = [ln];
    i++;
    while (
      i < lines.length && lines[i].trim() &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^```/.test(lines[i].trim()) &&
      !/^\|/.test(lines[i].trim()) &&
      !/^\s*[-*+]\s/.test(lines[i]) &&
      !/^\s*\d+\.\s/.test(lines[i]) &&
      !/^>/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,})$/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim()); i++;
    }
    renderParagraph(doc, para.join(' '));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CABECERAS EN PÁGINAS DE CONTENIDO
// ══════════════════════════════════════════════════════════════════════════════
function applyPageHeaders(doc, shortTitle) {
  const range = doc.bufferedPageRange();
  // Página 1 = portada, 2 = índice → header desde página 3
  for (let i = range.start + 2; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawPageHeader(doc, shortTitle);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTAR UN DOCUMENTO
// ══════════════════════════════════════════════════════════════════════════════
async function exportDoc(mdFile) {
  const src  = path.join(INPUT_DIR, mdFile);
  const raw  = fs.readFileSync(src, 'utf8');
  const md   = fix(raw);

  const title = extractTitle(md);
  const short = title.length > 52 ? title.slice(0, 49) + '…' : title;
  const sects = extractSections(md);
  const out   = path.join(OUTPUT_DIR, mdFile.replace(/\.md$/i, '.pdf'));

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
      info: {
        Title:   title,
        Author:  'Andrés Botero · Juan Camilo Triana',
        Subject: 'OutfitCatalog · ATELIER · Entrega Final · Dispositivos Móviles',
        Creator: 'ATELIER PDF Generator',
      },
    });
    registerFonts(doc);

    const stream = fs.createWriteStream(out);
    stream.on('finish', resolve);
    stream.on('error',  reject);
    doc.pipe(stream);

    // 1 ── Portada
    renderCover(doc, title, mdFile);

    // 2 ── Índice
    renderToc(doc, sects);

    // 3 ── Contenido
    doc.addPage();
    doc.y = MT + 26; // debajo del header que se dibuja en applyPageHeaders

    renderContent(doc, md);

    // 4 ── Aplicar cabeceras y pies
    applyPageHeaders(doc, short);
    addFooters(doc, short);

    doc.end();
  });

  return out;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  if (!fs.existsSync(INPUT_DIR)) throw new Error(`No existe: ${INPUT_DIR}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.md')).sort();
  if (!files.length) throw new Error('No hay archivos .md en docs/entrega-final/');

  console.log(`\n  ATELIER · OutfitCatalog — Generando ${files.length} PDFs profesionales\n`);
  for (const f of files) {
    const out = await exportDoc(f);
    const kb  = Math.round(fs.statSync(out).size / 1024);
    console.log(`  ✓  ${f.padEnd(48)} ${kb} KB`);
  }
  console.log(`\n  PDFs listos en: docs/entrega-final/pdf/\n`);
}

main().catch(e => { console.error(`\n  Error: ${e.message}\n`); process.exitCode = 1; });
