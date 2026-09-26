"use client";

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

function canvas(size: number) {
  const node = document.createElement("canvas");
  node.width = size;
  node.height = size;
  const ctx = node.getContext("2d");
  if (!ctx) throw new Error("2d");
  return { node, ctx };
}

function wrap(tex: CanvasTexture, repeat = 2) {
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function woodAlbedo() {
  const size = 1024;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#cbb086";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 160; i += 1) {
    const y = (i / 160) * size;
    ctx.strokeStyle = `rgba(92, 58, 24, ${0.035 + (i % 9) * 0.01})`;
    ctx.lineWidth = 1 + (i % 4) * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.25, y + 6, size * 0.6, y - 7, size, y + 3);
    ctx.stroke();
  }
  for (let i = 0; i < 1200; i += 1) {
    ctx.fillStyle = `rgba(70, 42, 16, ${Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.4, 8);
  }
  return wrap(new CanvasTexture(node), 2.4);
}

export function concreteAlbedo() {
  const size = 1024;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#2d2d30";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6000; i += 1) {
    const n = 38 + Math.random() * 48;
    ctx.fillStyle = `rgb(${n},${n},${n + 5})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  return wrap(new CanvasTexture(node), 3);
}

export function hexPadAlbedo() {
  const { node, ctx } = canvas(512);
  ctx.fillStyle = "#14161d";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(168, 85, 247, 0.62)";
  ctx.lineWidth = 2.2;
  const s = 28;
  for (let y = 0; y < 560; y += s * 1.6) {
    for (let x = 0; x < 560; x += s * 1.8) {
      const ox = (Math.floor(y / (s * 1.6)) % 2) * (s * 0.9);
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i;
        const px = x + ox + Math.cos(a) * s;
        const py = y + Math.sin(a) * s;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  return wrap(new CanvasTexture(node), 1);
}

export function metalAlbedo() {
  const { node, ctx } = canvas(512);
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, "#aeb3c0");
  g.addColorStop(0.5, "#d4d8e2");
  g.addColorStop(1, "#a7acb9");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 170; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.05})`;
    ctx.fillRect(0, i * 3, 512, 1);
    ctx.fillStyle = `rgba(40,44,54,${0.02 + Math.random() * 0.04})`;
    ctx.fillRect(0, i * 3 + 1.4, 512, 0.8);
  }
  return wrap(new CanvasTexture(node), 1.6);
}

export function grilleAlbedo() {
  const { node, ctx } = canvas(256);
  ctx.fillStyle = "#101114";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#2c2d35";
  for (let y = 5; y < 256; y += 9) {
    for (let x = 5; x < 256; x += 9) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return wrap(new CanvasTexture(node), 2);
}

export function pcbAlbedo() {
  const { node, ctx } = canvas(512);
  ctx.fillStyle = "#0d2a18";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.28)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i += 1) {
    ctx.strokeRect(12 + (i % 8) * 60, 18 + Math.floor(i / 8) * 90, 48, 22);
  }
  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 80; i += 1) {
    ctx.fillRect(20 + (i % 16) * 30, 40 + Math.floor(i / 16) * 90, 4, 4);
  }
  return wrap(new CanvasTexture(node), 1);
}

/* ------------------------------------------------------------------ *
 *  UHD helpers — linear-space utility maps (normal / roughness)      *
 * ------------------------------------------------------------------ */

/** Non-color data map (normal, roughness) — stays in linear space. */
function dataTexture(node: HTMLCanvasElement) {
  const tex = new CanvasTexture(node);
  tex.colorSpace = "srgb-linear" as typeof tex.colorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Height field → tangent-space normal map (OpenGL +Y convention). */
function heightToNormal(src: HTMLCanvasElement, strength = 2.4) {
  const w = src.width;
  const h = src.height;
  const data = src.getContext("2d")!.getImageData(0, 0, w, h).data;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d")!;
  const img = octx.createImageData(w, h);
  const at = (x: number, y: number) =>
    data[(((y % h) + h) % h) * w * 4 + (((x % w) + w) % w) * 4] / 255;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * w + x) * 4;
      img.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}

/* ------------------------------------------------------------------ *
 *  PART 1 — premium studio backdrop wall                             *
 * ------------------------------------------------------------------ */

/**
 * Cinematic studio wall: cool slate-indigo gradient, soft key-light pool
 * behind the rig, warm bounce on the lamp side, film grain, vignette.
 * Deliberately mid-dark so graphite hardware silhouettes read against it.
 */
export function wallAlbedo() {
  const size = 1024;
  const { node, ctx } = canvas(size);

  const base = ctx.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, "#6d7489");
  base.addColorStop(0.42, "#5b6177");
  base.addColorStop(1, "#474c63");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // studio key pool — behind/above the monitor
  const pool = ctx.createRadialGradient(
    size * 0.5,
    size * 0.36,
    40,
    size * 0.5,
    size * 0.36,
    size * 0.62,
  );
  pool.addColorStop(0, "rgba(196,207,236,0.5)");
  pool.addColorStop(0.45, "rgba(160,172,212,0.22)");
  pool.addColorStop(1, "rgba(154,166,206,0)");
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, size, size);

  // warm practical bounce on the lamp side
  const warm = ctx.createRadialGradient(
    size * 0.16,
    size * 0.62,
    20,
    size * 0.16,
    size * 0.62,
    size * 0.38,
  );
  warm.addColorStop(0, "rgba(214,186,146,0.16)");
  warm.addColorStop(1, "rgba(214,186,146,0)");
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, size, size);

  // indigo depth low in frame
  const low = ctx.createLinearGradient(0, size * 0.55, 0, size);
  low.addColorStop(0, "rgba(38,40,66,0)");
  low.addColorStop(1, "rgba(34,36,60,0.42)");
  ctx.fillStyle = low;
  ctx.fillRect(0, 0, size, size);

  // film grain
  for (let i = 0; i < 5200; i += 1) {
    const v = Math.random();
    ctx.fillStyle =
      v > 0.5
        ? `rgba(255,255,255,${(v - 0.5) * 0.045})`
        : `rgba(0,0,0,${(0.5 - v) * 0.05})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.6, 1.6);
  }

  // corner vignette
  const vig = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.32,
    size / 2,
    size / 2,
    size * 0.78,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(14,15,26,0.34)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, size, size);

  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ *
 *  PART 2 — flagship headset PBR maps (leather / brushed metal)      *
 * ------------------------------------------------------------------ */

function leatherHeight(size: number) {
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // pebble grain — overlapping soft cells
  for (let i = 0; i < 1500; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 5 + Math.random() * 11;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const lift = 0.16 + Math.random() * 0.2;
    g.addColorStop(0, `rgba(255,255,255,${lift})`);
    g.addColorStop(0.72, `rgba(200,200,200,${lift * 0.4})`);
    g.addColorStop(1, "rgba(120,120,120,0.35)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // crease valleys
  ctx.strokeStyle = "rgba(70,70,70,0.5)";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 220; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + (Math.random() - 0.5) * 46,
      y + (Math.random() - 0.5) * 46,
      x + (Math.random() - 0.5) * 70,
      y + (Math.random() - 0.5) * 70,
    );
    ctx.stroke();
  }

  ctx.filter = "blur(1.1px)";
  ctx.drawImage(node, 0, 0);
  ctx.filter = "none";
  return node;
}

/** Soft leather: grain albedo + derived normal + varied roughness. */
export function leatherMaps() {
  const size = 512;
  const height = leatherHeight(size);

  const { node: alb, ctx: actx } = canvas(size);
  actx.fillStyle = "#2c303b";
  actx.fillRect(0, 0, size, size);
  actx.globalCompositeOperation = "overlay";
  actx.globalAlpha = 0.55;
  actx.drawImage(height, 0, 0);
  actx.globalAlpha = 1;
  actx.globalCompositeOperation = "source-over";
  const sheen = actx.createLinearGradient(0, 0, 0, size);
  sheen.addColorStop(0, "rgba(255,255,255,0.07)");
  sheen.addColorStop(0.4, "rgba(255,255,255,0.02)");
  sheen.addColorStop(1, "rgba(0,0,0,0.14)");
  actx.fillStyle = sheen;
  actx.fillRect(0, 0, size, size);

  const albedo = new CanvasTexture(alb);
  albedo.colorSpace = SRGBColorSpace;
  albedo.wrapS = RepeatWrapping;
  albedo.wrapT = RepeatWrapping;
  albedo.anisotropy = 8;
  albedo.needsUpdate = true;

  const normal = dataTexture(heightToNormal(height, 2.6));

  const { node: rgh, ctx: rctx } = canvas(size);
  rctx.fillStyle = "#a8a8a8";
  rctx.fillRect(0, 0, size, size);
  rctx.globalCompositeOperation = "difference";
  rctx.globalAlpha = 0.4;
  rctx.drawImage(height, 0, 0);
  rctx.globalAlpha = 1;
  rctx.globalCompositeOperation = "source-over";
  const roughness = dataTexture(rgh);

  return { albedo, normal, roughness };
}

/** Engineered brushed metal: streaked albedo + anisotropic roughness. */
export function brushedMetalMaps() {
  const size = 512;
  const { node: alb, ctx: actx } = canvas(size);
  const g = actx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, "#b4bac6");
  g.addColorStop(0.5, "#9ea5b2");
  g.addColorStop(1, "#9198a6");
  actx.fillStyle = g;
  actx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i += 1) {
    const y = Math.random() * size;
    const light = Math.random() > 0.5;
    actx.fillStyle = light
      ? `rgba(255,255,255,${0.012 + Math.random() * 0.05})`
      : `rgba(0,0,0,${0.02 + Math.random() * 0.05})`;
    actx.fillRect(0, y, size, 0.8 + Math.random() * 1.4);
  }
  const albedo = new CanvasTexture(alb);
  albedo.colorSpace = SRGBColorSpace;
  albedo.wrapS = RepeatWrapping;
  albedo.wrapT = RepeatWrapping;
  albedo.anisotropy = 16;
  albedo.needsUpdate = true;

  const { node: rgh, ctx: rctx } = canvas(size);
  rctx.fillStyle = "#6e6e6e";
  rctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 700; i += 1) {
    const y = Math.random() * size;
    const up = Math.random() > 0.5;
    rctx.fillStyle = up ? "rgba(190,190,190,0.12)" : "rgba(80,80,80,0.12)";
    rctx.fillRect(0, y, size, 1 + Math.random() * 2);
  }
  const roughness = dataTexture(rgh);

  return { albedo, roughness };
}

/** Radial driver grille for ear cups — perforated steel look. */
export function driverGrilleAlbedo() {
  const size = 512;
  const { node, ctx } = canvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  g.addColorStop(0, "#2b2f38");
  g.addColorStop(0.6, "#1e2128");
  g.addColorStop(1, "#171a20");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "rgba(90,98,116,0.55)";
  for (let y = 14; y < size - 10; y += 17) {
    for (let x = 14; x < size - 10; x += 17) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      if (dx * dx + dy * dy > (size * 0.46) ** 2) continue;
      ctx.beginPath();
      ctx.arc(x, y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ *
 *  PART 1/2 — gaming-vibe utility maps                               *
 * ------------------------------------------------------------------ */

/** Braided AIO sleeving — crosshatch weave along the tube. */
export function braidAlbedo() {
  const { node, ctx } = canvas(256);
  ctx.fillStyle = "#22262e";
  ctx.fillRect(0, 0, 256, 256);
  ctx.lineWidth = 3.2;
  for (let i = -256; i < 512; i += 10) {
    ctx.strokeStyle = "rgba(130,140,160,0.34)";
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
    ctx.strokeStyle = "rgba(60,66,80,0.5)";
    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 256, 0);
    ctx.stroke();
  }
  for (let i = 0; i < 900; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
  }
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Fine PBT-plastic micro grain for keycaps (normal map). */
export function keycapNormal() {
  const size = 256;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i += 1) {
    const v = 110 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${v},${v},${v},0.75)`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "blur(0.7px)";
  ctx.drawImage(node, 0, 0);
  ctx.filter = "none";
  return dataTexture(heightToNormal(node, 1.1));
}

/** Grippy rubber side-panel pattern (normal map): soft dot lattice. */
export function gripNormal() {
  const size = 256;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const step = 22;
  for (let y = 6; y < size; y += step) {
    for (let x = 6; x < size; x += step) {
      const ox = (Math.floor(y / step) % 2) * (step / 2);
      const g = ctx.createRadialGradient(x + ox, y, 0, x + ox, y, 7.5);
      g.addColorStop(0, "rgba(235,235,235,0.95)");
      g.addColorStop(0.7, "rgba(160,160,160,0.5)");
      g.addColorStop(1, "rgba(90,90,90,0.3)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + ox, y, 7.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.filter = "blur(0.8px)";
  ctx.drawImage(node, 0, 0);
  ctx.filter = "none";
  return dataTexture(heightToNormal(node, 2.0));
}

/** Soft radial glow disc — fake RGB light spill onto desk/pad (additive). */
export function glowAlbedo() {
  const size = 256;
  const { node, ctx } = canvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.38)");
  g.addColorStop(0.7, "rgba(255,255,255,0.1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
