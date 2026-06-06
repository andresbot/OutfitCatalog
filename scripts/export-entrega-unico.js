#!/usr/bin/env node
'use strict';

/**
 * OutfitCatalog · ATELIER — Entrega Final Unificada (un solo PDF)
 * Andrés Botero · Juan Camilo Triana — Dispositivos Móviles 2026
 */

const fs   = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');

const ROOT      = process.cwd();
const INPUT_DIR = path.join(ROOT, 'docs', 'entrega-final');
const OUTPUT    = path.join(INPUT_DIR, 'pdf', 'ATELIER-Entrega-Final-Completa.pdf');

// ─── Medidas A4 ───────────────────────────────────────────────────────────────
const W  = 595.28, H  = 841.89;
const ML = 60, MR = 60, MT = 56, MB = 48;
const CW = W - ML - MR;

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
function fix(s) { return s; }
function clean(s) {
  return s
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
  doc.save().moveTo(ML, y).lineTo(W - MR, y)
    .strokeColor(color).lineWidth(lw).stroke().restore();
}
function vline(doc, x, y1, y2, color = GOLD, lw = 1) {
  doc.save().moveTo(x, y1).lineTo(x, y2)
    .strokeColor(color).lineWidth(lw).stroke().restore();
}
function box(doc, x, y, w, h, fill, stroke = null) {
  if (stroke) doc.rect(x, y, w, h).fillAndStroke(fill, stroke);
  else        doc.rect(x, y, w, h).fill(fill);
}
function set(doc, font, size, color) {
  doc.font(font).fontSize(size).fillColor(color);
}
function pageBreakIfNeeded(doc, needed) {
  if (doc.y + needed > H - MB - 20) {
    doc.addPage(); doc.y = MT + 26; return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════════════════════
// PORTADA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
function renderMainCover(doc) {
  box(doc, 0, 0, W, 6, GOLD);
  const panelH = H * 0.52;
  box(doc, 0, 6, W, panelH, DARK);

  const px = ML + 4;
  const pw = CW - 8;

  set(doc, 'B', 7.5, GOLD);
  doc.text('OUTFITCATALOG  ·  ATELIER FASHION CATALOG', px, 32, {
    width: pw, characterSpacing: 2.5,
  });
  box(doc, px, 50, 40, 2, GOLD);

  set(doc, 'B', 36, WHITE);
  doc.text('Entrega Final', px, 66, { width: pw, lineGap: 4 });

  set(doc, 'B', 18, GOLD);
  doc.text('ATELIER — OutfitCatalog', px, doc.y + 8, { width: pw });

  set(doc, 'R', 10, GRAY3);
  doc.text('Asignatura Dispositivos Móviles  ·  Universidad del Valle  ·  2026',
    px, doc.y + 12, { width: pw, characterSpacing: 0.4 });

  // Índice de secciones dentro del panel oscuro
  const sectionList = [
    'I.   Evaluación Técnica y de Calidad (QA)',
    'II.  Evaluación de Usabilidad y Experiencia de Usuario (UX/UI)',
    'III. Evaluación de Negocio y Métricas (KPIs)',
    'IV.  Documentación Técnica y Arquitectura',
    'V.   Evidencias de Pruebas',
    'VI.  Analíticas Integradas — Firebase KPIs',
    'VII. Entregables de Diseño y UI Kit',
    'VIII.Plan de Despliegue y Mantenimiento',
  ];

  let sy = doc.y + 28;
  hline(doc, sy, '#3A3A3C', 0.5);
  sy += 10;
  set(doc, 'B', 7.5, GOLD);
  doc.text('CONTENIDO DEL DOCUMENTO', px, sy, { characterSpacing: 2 });
  sy += 16;

  for (const item of sectionList) {
    set(doc, 'R', 9, GRAY3);
    doc.text(item, px + 12, sy, { width: pw - 12 });
    sy += 14;
  }

  // Panel blanco inferior
  const wp = panelH + 6;
  const authY = wp + 38;

  set(doc, 'B', 9, GRAY2);
  doc.text('AUTORES', px, authY, { characterSpacing: 2 });
  hline(doc, authY + 14, BORDER);

  set(doc, 'B', 14, INK);
  doc.text('Andrés Botero', px, authY + 22, { width: CW / 2 - 16 });
  doc.text('Juan Camilo Triana', px + CW / 2, authY + 22, { width: CW / 2 });

  set(doc, 'R', 9, GRAY2);
  doc.text('Tecnología en Desarrollo de Software', px, authY + 42, { width: CW / 2 - 16 });
  doc.text('Tecnología en Desarrollo de Software', px + CW / 2, authY + 42, { width: CW / 2 });

  const fichaY = authY + 72;
  hline(doc, fichaY, BORDER);

  const fields = [
    ['PROYECTO',    'OutfitCatalog · ATELIER Fashion Catalog'],
    ['ASIGNATURA',  'Dispositivos Móviles'],
    ['DOCENTE',     'Daniel Quintero'],
    ['UNIVERSIDAD', 'Universidad del Valle'],
    ['FECHA',       'Junio 2026'],
    ['VERSIÓN',     '1.0.0'],
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

  box(doc, 0, H - 6, W, 6, GOLD);
  set(doc, 'R', 7.5, GRAY3);
  doc.text('Entrega académica final', 0, H - 24, { width: W, align: 'center' });
}

// ══════════════════════════════════════════════════════════════════════════════
// DIVISOR DE CAPÍTULO (página entera oscura entre secciones)
// ══════════════════════════════════════════════════════════════════════════════
function renderChapterDivider(doc, numeral, title) {
  doc.addPage();
  box(doc, 0, 0, W, H, DARK);
  box(doc, 0, 0, W, 6, GOLD);
  box(doc, 0, H - 6, W, 6, GOLD);

  // Número romano grande
  set(doc, 'B', 80, '#2A2820');
  doc.text(numeral, 0, H * 0.25, { width: W, align: 'center' });

  // Título del capítulo
  set(doc, 'B', 26, WHITE);
  doc.text(title, ML, H * 0.48, { width: CW, align: 'center', lineGap: 4 });

  // Línea dorada
  const lx = W / 2 - 30;
  box(doc, lx, H * 0.48 - 14, 60, 2.5, GOLD);
  box(doc, lx, doc.y + 12, 60, 2.5, GOLD);

  // Label
  set(doc, 'R', 9, GRAY2);
  doc.text('ATELIER · OutfitCatalog · Entrega Final · Dispositivos Móviles',
    0, H * 0.72, { width: W, align: 'center', characterSpacing: 0.6 });
}

// ══════════════════════════════════════════════════════════════════════════════
// TABLA DE CONTENIDOS GLOBAL
// ══════════════════════════════════════════════════════════════════════════════
function renderToc(doc, chapters) {
  doc.addPage();
  set(doc, 'B', 7.5, GOLD);
  doc.text('ATELIER  ·  OUTFITCATALOG', ML, 22, { characterSpacing: 2, width: CW });
  hline(doc, 36, GOLD, 1);

  doc.y = 52;
  set(doc, 'B', 22, INK);
  doc.text('Tabla de Contenidos', ML, doc.y);
  doc.moveDown(0.5);
  hline(doc, doc.y, BORDER);
  doc.y += 16;

  for (const { numeral, title, sections } of chapters) {
    pageBreakIfNeeded(doc, 28);

    // Título del capítulo
    set(doc, 'B', 11, INK);
    doc.text(`${numeral}  ${title}`, ML, doc.y, { width: CW });
    doc.y += 2;
    hline(doc, doc.y, BG_ALT);
    doc.y += 10;

    // Sub-secciones
    for (const s of sections) {
      pageBreakIfNeeded(doc, 16);
      set(doc, 'R', 9.5, GRAY1);
      doc.text(`    ${s}`, ML, doc.y, { width: CW - 4 });
      doc.y += 14;
    }
    doc.y += 6;
  }

  box(doc, 0, H - 6, W, 6, GOLD);
}

// ══════════════════════════════════════════════════════════════════════════════
// CABECERA Y PIE DE PÁGINA (se aplica retroactivamente)
// ══════════════════════════════════════════════════════════════════════════════
function drawPageHeader(doc, chapterTitle) {
  set(doc, 'B', 7, GOLD);
  doc.text('ATELIER · OUTFITCATALOG', ML, 22, { characterSpacing: 1.8, width: CW / 2 });
  set(doc, 'R', 7, GRAY2);
  doc.text(chapterTitle.toUpperCase(), ML, 22, {
    width: CW, align: 'right', characterSpacing: 0.6,
  });
  hline(doc, 34, BORDER, 0.5);
  box(doc, ML, 34, 32, 1.5, GOLD);
}

function addFootersAndHeaders(doc, pageHeaderMap) {
  const range = doc.bufferedPageRange();
  const total = range.count;

  let contentPageNum = 0;
  const contentTotal = Object.values(pageHeaderMap).filter(v => v != null).length;

  for (let i = range.start; i < range.start + total; i++) {
    doc.switchToPage(i);
    const localIdx = i - range.start;
    const header = pageHeaderMap[localIdx];

    if (header == null) continue; // portada, toc, divisor o sin mapear

    drawPageHeader(doc, header.title);

    contentPageNum++;
    hline(doc, H - 32, BORDER, 0.4);
    set(doc, 'R', 7, GRAY3);
    doc.text(header.title, ML, H - 26, {
      width: CW * 0.72, lineBreak: false, ellipsis: true,
    });
    doc.text(`${contentPageNum} / ${contentTotal}`, ML, H - 26, {
      width: CW, align: 'right', lineBreak: false,
    });
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
  doc.text(depth === 0 ? '>' : '-', ind - 13, doc.y, { width: 13, lineBreak: false });
  set(doc, 'R', 10.5, GRAY1);
  doc.text(t, ind, doc.y - 11.5, { width: w, lineGap: 2 });
  doc.moveDown(0.08);
}
function renderNumbered(doc, num, text) {
  const t = clean(text);
  if (!t) return;
  pageBreakIfNeeded(doc, 16);
  set(doc, 'B', 10, GOLD);
  doc.text(`${num}.`, ML, doc.y, { width: 18, align: 'right', lineBreak: false });
  set(doc, 'R', 10.5, GRAY1);
  doc.text(t, ML + 22, doc.y - 11.5, { width: CW - 22, lineGap: 2 });
  doc.moveDown(0.08);
}
function renderBlockquote(doc, lines) {
  const t = clean(lines.join(' '));
  if (!t) return;
  pageBreakIfNeeded(doc, 32);
  const bh = doc.heightOfString(t, { width: CW - 24, lineGap: 2.5 }) + 16;
  const y0 = doc.y;
  box(doc, ML, y0, 3, bh, GOLD);
  box(doc, ML + 3, y0, CW - 3, bh, BG_ALT);
  set(doc, 'I', 10.2, GRAY1);
  doc.text(t, ML + 14, y0 + 8, { width: CW - 24, lineGap: 2.5 });
  doc.y = y0 + bh + 8;
  doc.moveDown(0.2);
}
function renderCode(doc, lang, lines) {
  const raw = lines.join('\n').replace(/\t/g, '  ');
  if (!raw.trim()) return;
  set(doc, 'M', 8.2, CODE_TX);
  const th  = lang ? 14 : 0;
  const bh  = doc.heightOfString(raw, { width: CW - 20, lineGap: 1.6 }) + th + 14;
  pageBreakIfNeeded(doc, Math.min(bh, 80));
  const y0 = doc.y;
  box(doc, ML, y0, CW, Math.max(Math.min(bh, H - MB - y0 - 20), 28), CODE_BG, CODE_BD);
  box(doc, ML, y0, 3, Math.max(Math.min(bh, H - MB - y0 - 20), 28), GOLD);
  if (lang) { set(doc, 'B', 7, GRAY2); doc.text(lang.toUpperCase(), ML + 10, y0 + 5, { characterSpacing: 1 }); }
  set(doc, 'M', 8.2, CODE_TX);
  doc.text(raw, ML + 10, y0 + th + 7, { width: CW - 20, lineGap: 1.6 });
  doc.moveDown(0.6);
}

// ─── Imagen(s) embebida(s) ────────────────────────────────────────────────────
function renderImages(doc, images) {
  const PHONE_AR = 1080 / 2400;
  const n = images.length;
  let imgH, gap;
  if (n === 1)      { imgH = 285; gap = 0; }
  else if (n === 2) { imgH = 245; gap = 14; }
  else              { imgH = 205; gap = 10; }
  const imgW = Math.round(imgH * PHONE_AR);
  const totalW = imgW * n + gap * (n - 1);
  const x0 = ML + (CW - totalW) / 2;

  pageBreakIfNeeded(doc, imgH + 44);
  const y0 = doc.y;

  for (let j = 0; j < n; j++) {
    const x = x0 + j * (imgW + gap);
    doc.save().rect(x - 2, y0 - 2, imgW + 4, imgH + 4)
      .fillColor(BORDER).fill().restore();
    const imgPath = images[j].p;
    if (imgPath && fs.existsSync(imgPath)) {
      try { doc.image(imgPath, x, y0, { width: imgW, height: imgH }); }
      catch (_) { box(doc, x, y0, imgW, imgH, BG_ALT); }
    } else {
      box(doc, x, y0, imgW, imgH, BG_ALT);
    }
  }

  const captY = y0 + imgH + 8;
  for (let j = 0; j < n; j++) {
    const c = images[j].c;
    if (!c) continue;
    const x = x0 + j * (imgW + gap);
    set(doc, 'I', 8.5, GRAY2);
    doc.text(c, x, captY, { width: imgW, align: 'center' });
  }
  doc.y = captY + 18;
  doc.moveDown(0.4);
}

function parseTableRows(lines) {
  return lines
    .filter(l => !/^\s*\|?\s*:?-{2,}/.test(l))
    .map(l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => clean(c)));
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
  const PAD = 6, MIN_RH = 20;
  set(doc, 'B', 8.5, TH_TXT);
  const headH = Math.max(MIN_RH,
    ...headers.map((h, ci) =>
      doc.heightOfString(h, { width: widths[ci] - PAD * 2, lineGap: 1.2 }) + PAD * 2));
  pageBreakIfNeeded(doc, headH + MIN_RH * 2);

  let y = doc.y;
  box(doc, ML, y, CW, headH, TH_BG);
  box(doc, ML, y + headH - 1.5, CW, 1.5, GOLD);
  let cx = ML;
  headers.forEach((h, ci) => {
    set(doc, 'B', 8.5, TH_TXT);
    doc.text(h, cx + PAD, y + PAD, { width: widths[ci] - PAD * 2, lineGap: 1.2, lineBreak: true });
    cx += widths[ci];
  });
  y += headH;

  rows.forEach((row, ri) => {
    set(doc, 'R', 9, GRAY1);
    const rh = Math.max(MIN_RH,
      ...row.map((c, ci) =>
        doc.heightOfString(c || '', { width: widths[ci] - PAD * 2, lineGap: 1.3 }) + PAD * 2));
    if (y + rh > H - MB - 20) {
      doc.addPage(); doc.y = MT + 26; y = doc.y;
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
      const isMono = /^[`\/\\]/.test(cell) || /\.(ts|js|json)$/.test(cell);
      if (isMono) { set(doc, 'M', 7.8, CODE_TX); }
      else        { set(doc, 'R', 9, GRAY1); }
      doc.text(cell || '-', cx + PAD, y + PAD, { width: widths[ci] - PAD * 2, lineGap: 1.3, lineBreak: true });
      if (ci > 0) vline(doc, cx, y, y + rh, BORDER, 0.3);
      cx += widths[ci];
    });
    y += rh;
    doc.y = y;
  });
  hline(doc, doc.y, BORDER, 0.4);
  doc.moveDown(0.7);
}

// ── Renderizar el contenido de un markdown (sin el primer H1) ─────────────────
function renderContent(doc, markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  let skipFirstH1 = true;

  while (i < lines.length) {
    const raw = lines[i];
    const ln  = raw.trim();

    if (!ln) { doc.moveDown(0.15); i++; continue; }

    // Omitir frontmatter-like (líneas de metadatos al inicio)
    if (/^\*\*(Proyecto|Asignatura|Docente|Autores|Universidad|Versión probada|Versión):/.test(ln)) {
      i++; continue;
    }
    if (/^---$/.test(ln) && i < 20) { i++; continue; }

    // Mermaid
    if (/^```\s*(mermaid|flowchart|sequence)/i.test(ln)) {
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) i++;
      set(doc, 'I', 9, GRAY3);
      doc.text('[ diagrama — ver documento fuente ]', ML, doc.y, { width: CW });
      doc.moveDown(0.4);
      i++; continue;
    }

    // Bloque de código
    if (/^```/.test(ln)) {
      const lang = ln.replace(/^```\s*/, '').trim();
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
        bq.push(lines[i].trim().replace(/^>\s?/, '')); i++;
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
    if (bm) { renderBullet(doc, bm[3], Math.floor(bm[1].length / 2)); i++; continue; }

    // Lista numerada
    const nm = raw.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (nm) { renderNumbered(doc, nm[2], nm[3]); i++; continue; }

    // Regla horizontal
    if (/^(-{3,}|\*{3,})$/.test(ln)) { hline(doc, doc.y, BORDER); doc.moveDown(0.5); i++; continue; }

    // Imagen standalone
    const imgM = ln.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgM) {
      const imgs = [{ c: imgM[1], p: path.resolve(INPUT_DIR, imgM[2]) }];
      i++;
      while (i < lines.length) {
        const nm2 = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (!nm2) break;
        imgs.push({ c: nm2[1], p: path.resolve(INPUT_DIR, nm2[2]) });
        i++;
      }
      const groupSize = imgs.length <= 3 ? imgs.length : 2;
      for (let g = 0; g < imgs.length; g += groupSize) {
        renderImages(doc, imgs.slice(g, g + groupSize));
      }
      continue;
    }

    // Párrafo
    const para = [ln]; i++;
    while (i < lines.length && lines[i].trim() &&
      !/^#{1,4}\s/.test(lines[i]) && !/^```/.test(lines[i].trim()) &&
      !/^\|/.test(lines[i].trim()) && !/^\s*[-*+]\s/.test(lines[i]) &&
      !/^\s*\d+\.\s/.test(lines[i]) && !/^>/.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,})$/.test(lines[i].trim())
    ) { para.push(lines[i].trim()); i++; }
    renderParagraph(doc, para.join(' '));
  }
}

// ── Extraer secciones H2/H3 de un markdown ────────────────────────────────────
function extractSections(md) {
  const result = [];
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(/^(##)\s+(.+)$/);
    if (m) result.push(clean(m[2]));
  }
  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  if (!fs.existsSync(INPUT_DIR)) throw new Error(`No existe: ${INPUT_DIR}`);
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const chapters = [
    { file: '01-evaluacion-tecnica-qa.md',          numeral: 'I',    title: 'Evaluación Técnica y de Calidad (QA)' },
    { file: '02-evaluacion-ux-ui.md',               numeral: 'II',   title: 'Evaluación de Usabilidad y Experiencia de Usuario' },
    { file: '03-evaluacion-negocio-kpis.md',        numeral: 'III',  title: 'Evaluación de Negocio y Métricas (KPIs)' },
    { file: '04-documentacion-tecnica.md',          numeral: 'IV',   title: 'Documentación Técnica y Arquitectura' },
    { file: '05-evidencias-pruebas.md',             numeral: 'V',    title: 'Evidencias de Pruebas (Testing)' },
    { file: '06-analitica-integrada.md',            numeral: 'VI',   title: 'Analíticas Integradas — Firebase KPIs' },
    { file: '07-entregables-diseno.md',             numeral: 'VII',  title: 'Entregables de Diseño y UI Kit' },
    { file: '08-plan-despliegue-mantenimiento.md',  numeral: 'VIII', title: 'Plan de Despliegue y Mantenimiento' },
  ];

  // Cargar contenido
  for (const ch of chapters) {
    const src = path.join(INPUT_DIR, ch.file);
    if (!fs.existsSync(src)) throw new Error(`Archivo no encontrado: ${src}`);
    ch.md = fs.readFileSync(src, 'utf8');
    ch.sections = extractSections(ch.md);
  }

  const tocChapters = chapters.map(ch => ({
    numeral: ch.numeral,
    title: ch.title,
    sections: ch.sections,
  }));

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4', margin: 0, bufferPages: true,
      info: {
        Title:   'Entrega Final · ATELIER OutfitCatalog · Dispositivos Móviles',
        Author:  'Andrés Botero · Juan Camilo Triana',
        Subject: 'Evaluación técnica, UX/UI, KPIs, arquitectura, pruebas, analítica, diseño y despliegue',
        Creator: 'ATELIER PDF Generator',
      },
    });
    registerFonts(doc);

    const stream = fs.createWriteStream(OUTPUT);
    stream.on('finish', resolve);
    stream.on('error',  reject);
    doc.pipe(stream);

    // pageHeaderMap[índice] = null  → portada, toc, divisor (sin header/footer)
    // pageHeaderMap[índice] = {title} → página de contenido con header/footer
    const pageHeaderMap = {};

    // Página 0: portada
    pageHeaderMap[0] = null;
    renderMainCover(doc);

    // Página 1: tabla de contenidos
    // renderToc llama doc.addPage() internamente, así que la próxima página es count
    pageHeaderMap[doc.bufferedPageRange().count] = null;
    renderToc(doc, tocChapters);

    // Capítulos
    for (const ch of chapters) {
      // Divisor de capítulo — renderChapterDivider llama doc.addPage() internamente
      pageHeaderMap[doc.bufferedPageRange().count] = null;
      renderChapterDivider(doc, ch.numeral, ch.title);

      // Primera página de contenido
      doc.addPage();
      doc.y = MT + 26;
      const startPage = doc.bufferedPageRange().count - 1;

      renderContent(doc, ch.md);

      const endPage = doc.bufferedPageRange().count - 1;

      for (let p = startPage; p <= endPage; p++) {
        pageHeaderMap[p] = { title: `${ch.numeral}. ${ch.title}` };
      }
    }

    // Aplicar headers y footers retroactivamente
    addFootersAndHeaders(doc, pageHeaderMap);

    doc.end();
  });

  const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
  console.log(`\n  ATELIER · Entrega Final Completa generada\n`);
  console.log(`  Archivo: ATELIER-Entrega-Final-Completa.pdf`);
  console.log(`  Tamaño:  ${kb} KB`);
  console.log(`  Ruta:    docs/entrega-final/pdf/\n`);
}

main().catch(e => { console.error(`\n  Error: ${e.message}\n`); process.exitCode = 1; });
