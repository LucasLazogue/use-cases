// Genera diagramas de casos de uso UML en SVG: actores como monigotes, casos de uso
// como elipses, frontera del sistema como rectangulo, asociaciones y «include»/«extend».
// Sin dependencias. Uso: node tools/uml-usecase.js

const fs = require('fs');
const path = require('path');

const INK = '#1e293b';
const MUTED = '#64748b';
const LINE = '#475569';
const ACCENT = '#1d4ed8';
const UC_FILL = '#f1f5f9';
const UC_STROKE = '#94a3b8';
const CRIT_FILL = '#dbeafe';
const BOUND = '#cbd5e1';

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- primitivas ----------

function wrap(text, maxChars) {
  if (text.includes('\n')) return text.split('\n');   // corte explicito
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > maxChars) { lines.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Monigote UML. (cx, cy) es el centro del cuerpo; la etiqueta va debajo.
function actor(a) {
  const { x, y, label } = a;
  const lines = wrap(label, 18);
  let s = `  <g class="actor">
    <circle cx="${x}" cy="${y - 20}" r="8"/>
    <line x1="${x}" y1="${y - 12}" x2="${x}" y2="${y + 8}"/>
    <line x1="${x - 13}" y1="${y - 4}" x2="${x + 13}" y2="${y - 4}"/>
    <line x1="${x}" y1="${y + 8}" x2="${x - 11}" y2="${y + 26}"/>
    <line x1="${x}" y1="${y + 8}" x2="${x + 11}" y2="${y + 26}"/>
  </g>\n`;
  lines.forEach((l, i) => {
    s += `  <text class="lbl-actor" x="${x}" y="${y + 44 + i * 13}">${esc(l)}</text>\n`;
  });
  return s;
}

function useCase(uc) {
  const { x, y, rx, ry, label, critico } = uc;
  const lines = wrap(label, Math.floor((rx * 1.62) / 6.3));
  const lh = 13.5;
  const y0 = y - ((lines.length - 1) * lh) / 2 + 4;
  let s = `  <ellipse class="${critico ? 'uc-crit' : 'uc'}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>\n`;
  lines.forEach((l, i) => {
    s += `  <text class="lbl-uc${critico ? ' lbl-uc-crit' : ''}" x="${x}" y="${y0 + i * lh}">${esc(l)}</text>\n`;
  });
  return s;
}

// Punto del borde de la elipse en direccion a (px, py).
function edge(uc, px, py) {
  const dx = px - uc.x, dy = py - uc.y;
  const t = 1 / Math.sqrt((dx / uc.rx) ** 2 + (dy / uc.ry) ** 2);
  return [uc.x + dx * t, uc.y + dy * t];
}

function assoc(from, to) {
  return `  <line class="assoc" x1="${from[0].toFixed(1)}" y1="${from[1].toFixed(1)}" x2="${to[0].toFixed(1)}" y2="${to[1].toFixed(1)}"/>\n`;
}

// Flecha punteada con punta abierta (notacion UML de dependencia).
function dependency(p1, p2, label, labelAt = 0.5, dy = -5, labelPx = null) {
  const [x1, y1] = p1, [x2, y2] = p2;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = 11, spread = 0.38;
  const a1 = [x2 - h * Math.cos(ang - spread), y2 - h * Math.sin(ang - spread)];
  const a2 = [x2 - h * Math.cos(ang + spread), y2 - h * Math.sin(ang + spread)];
  // labelPx: distancia fija en px desde el origen (evita que la etiqueta pise
  // elipses vecinas cuando muchas dependencias convergen en un mismo caso de uso)
  let lx, ly;
  if (labelPx !== null) {
    lx = x1 + Math.cos(ang) * labelPx;
    ly = y1 + Math.sin(ang) * labelPx;
  } else {
    lx = x1 + (x2 - x1) * labelAt;
    ly = y1 + (y2 - y1) * labelAt;
  }
  return `  <line class="dep" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>
  <polyline class="head" points="${a1[0].toFixed(1)},${a1[1].toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${a2[0].toFixed(1)},${a2[1].toFixed(1)}"/>
  <text class="lbl-dep" x="${lx.toFixed(1)}" y="${(ly + dy).toFixed(1)}">${esc(label)}</text>\n`;
}

const STYLE = `  <style>
    .bg { fill: #ffffff; }
    .actor circle, .actor line { fill: none; stroke: ${INK}; stroke-width: 1.8; stroke-linecap: round; }
    .uc { fill: ${UC_FILL}; stroke: ${UC_STROKE}; stroke-width: 1.4; }
    .uc-crit { fill: ${CRIT_FILL}; stroke: ${ACCENT}; stroke-width: 2.6; }
    .boundary { fill: none; stroke: ${BOUND}; stroke-width: 1.6; }
    .assoc { stroke: ${LINE}; stroke-width: 1.4; }
    .dep { stroke: ${MUTED}; stroke-width: 1.3; stroke-dasharray: 6 4; }
    .head { fill: none; stroke: ${MUTED}; stroke-width: 1.3; stroke-linejoin: round; }
    text { font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-anchor: middle; }
    .lbl-uc { font-size: 12.5px; fill: ${INK}; }
    .lbl-uc-crit { font-weight: 600; }
    .lbl-actor { font-size: 12.5px; fill: ${INK}; font-weight: 600; }
    .lbl-dep { font-size: 11px; fill: ${MUTED}; font-style: italic; }
    .lbl-bound { font-size: 14px; fill: ${MUTED}; font-weight: 600; text-anchor: start; }
    .caption { font-size: 12px; fill: ${MUTED}; text-anchor: start; }
  </style>\n`;

function render(spec) {
  const { w, h, boundary, actors, useCases, assocs, deps, caption } = spec;
  const byId = Object.fromEntries(useCases.map(u => [u.id, u]));
  const aById = Object.fromEntries(actors.map(a => [a.id, a]));

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">\n`;
  s += STYLE;
  s += `  <rect class="bg" x="0" y="0" width="${w}" height="${h}"/>\n`;

  // frontera del sistema
  s += `  <rect class="boundary" x="${boundary.x}" y="${boundary.y}" width="${boundary.w}" height="${boundary.h}" rx="4"/>\n`;
  s += `  <text class="lbl-bound" x="${boundary.x + 16}" y="${boundary.y + 24}">${esc(boundary.label)}</text>\n`;

  // asociaciones primero (quedan por debajo)
  for (const [aid, uid] of assocs) {
    const a = aById[aid], u = byId[uid];
    const anchor = [a.x + (a.side === 'right' ? -16 : 16), a.y - 2];
    s += assoc(anchor, edge(u, anchor[0], anchor[1]));
  }
  for (const d of deps) {
    const from = byId[d.from], to = byId[d.to];
    const p1 = edge(from, to.x, to.y);
    const p2 = edge(to, from.x, from.y);
    s += dependency(p1, p2, d.label, d.at === undefined ? 0.5 : d.at, d.dy, d.px === undefined ? null : d.px);
  }

  for (const u of useCases) s += useCase(u);
  for (const a of actors) s += actor(a);

  if (caption) s += `  <text class="caption" x="16" y="${h - 14}">${esc(caption)}</text>\n`;
  s += `</svg>\n`;
  return s;
}

// ---------- figura: foco CU-01 ----------

const RX = 108, RY = 34;

const foco = {
  w: 1000, h: 490,
  boundary: { x: 250, y: 40, w: 500, h: 360, label: 'carga.uy' },
  actors: [
    { id: 'RESP', x: 96, y: 120, label: 'Responsable\nde empresa' },
    { id: 'CHOF', x: 96, y: 245, label: 'Chofer' },
    { id: 'FUNC', x: 96, y: 360, label: 'Funcionario de\nFiscalización MTOP' },
    { id: 'GUB', x: 900, y: 150, side: 'right', label: 'Usuario gub.uy\n(ID Uruguay)' },
    { id: 'PDI', x: 900, y: 320, side: 'right', label: 'PDI / AGESIC\n(DNIC)' },
  ],
  useCases: [
    { id: 'CU01', x: 500, y: 150, rx: RX, ry: RY, critico: true, label: 'CU-01 · Autenticarse mediante Usuario gub.uy' },
    { id: 'CU02', x: 500, y: 320, rx: RX, ry: RY, label: 'CU-02 · Completar perfil del ciudadano en el primer ingreso' },
  ],
  assocs: [['RESP', 'CU01'], ['CHOF', 'CU01'], ['FUNC', 'CU01'], ['GUB', 'CU01'], ['PDI', 'CU02']],
  deps: [{ from: 'CU02', to: 'CU01', label: '«extend»', at: 0.5, dy: 0 }],
  caption: 'Los CU no públicos del frontoffice y del móvil incluyen a CU-01 («include»); se representan en el diagrama global.',
};

// ---------- figura: CU-01 con los «include» ----------

const INCLUYEN = [
  ['CU04', 'CU-04 · Gestionar empresa de transporte y sus usuarios'],
  ['CU05', 'CU-05 · Consultar y actualizar el perfil de la empresa'],
  ['CU06', 'CU-06 · Gestionar vehículos y habilitaciones (ABM)'],
  ['CU07', 'CU-07 · Registrar Guía y asignar el viaje'],
  ['CU08', 'CU-08 · Ejecutar el viaje desde el componente móvil'],
  ['CU09', 'CU-09 · Sincronizar los eventos del componente móvil'],
  ['CU12', 'CU-12 · Presentar descargo sobre un caso'],
  ['CU13', 'CU-13 · Resolver el caso de fiscalización'],
  ['CU14', 'CU-14 · Fiscalizar permisos y estado de los vehículos'],
  ['CU15', 'CU-15 · Monitorear viajes en curso y pesajes'],
];

// dos columnas intercaladas: las flechas de la columna externa pasan por los huecos
const colA = INCLUYEN.filter((_, i) => i % 2 === 0);
const colB = INCLUYEN.filter((_, i) => i % 2 === 1);
const STEP = 148, TOP = 105;
const incUCs = [
  ...colA.map(([id, label], i) => ({ id, label, x: 790, y: TOP + i * STEP, rx: 100, ry: 32 })),
  ...colB.map(([id, label], i) => ({ id, label, x: 1075, y: TOP + STEP / 2 + i * STEP, rx: 100, ry: 32 })),
];
const CY = TOP + (colA.length - 1) * STEP / 2;

const completo = {
  w: 1260, h: TOP + (colA.length - 1) * STEP + 130,
  boundary: { x: 250, y: 40, w: 960, h: TOP + (colA.length - 1) * STEP + 40, label: 'carga.uy' },
  // los cinco actores van en la columna izquierda, fuera de la frontera
  actors: [
    { id: 'GUB', x: 96, y: CY - 300, label: 'Usuario gub.uy\n(ID Uruguay)' },
    { id: 'RESP', x: 96, y: CY - 150, label: 'Responsable\nde empresa' },
    { id: 'CHOF', x: 96, y: CY, label: 'Chofer' },
    { id: 'FUNC', x: 96, y: CY + 150, label: 'Funcionario de\nFiscalización MTOP' },
    { id: 'PDI', x: 96, y: CY + 300, label: 'PDI / AGESIC\n(DNIC)' },
  ],
  useCases: [
    { id: 'CU01', x: 460, y: CY, rx: RX, ry: RY, critico: true, label: 'CU-01 · Autenticarse mediante Usuario gub.uy' },
    { id: 'CU02', x: 460, y: CY + 175, rx: RX, ry: RY, label: 'CU-02 · Completar perfil del ciudadano en el primer ingreso' },
    ...incUCs,
  ],
  assocs: [['RESP', 'CU01'], ['CHOF', 'CU01'], ['FUNC', 'CU01'], ['GUB', 'CU01'], ['PDI', 'CU02']],
  deps: [
    { from: 'CU02', to: 'CU01', label: '«extend»', dy: 0, px: 62 },
    // etiqueta a distancia fija del origen: columna interna y externa no se pisan
    ...colA.map(([id]) => ({ from: id, to: 'CU01', label: '«include»', dy: -7, px: 42 })),
    ...colB.map(([id]) => ({ from: id, to: 'CU01', label: '«include»', dy: -7, px: 34 })),
  ],
  caption: 'CU-01 con las relaciones «include» de todos los casos de uso no públicos.',
};

const out = path.join(__dirname, '..', 'CU01');
fs.writeFileSync(path.join(out, 'cu01.svg'), render(foco));
fs.writeFileSync(path.join(out, 'cu01-include.svg'), render(completo));
console.log('OK -> CU01/cu01.svg y CU01/cu01-include.svg');
