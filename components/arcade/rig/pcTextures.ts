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

function wrap(tex: CanvasTexture, repeat = 1) {
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

/** Dark ATX PCB with traces, pads, silkscreen — 2048. */
export function pcPcbMaps() {
  const size = 2048;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#0a1620";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(20, 90, 70, 0.55)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 90; i += 1) {
    const x = 40 + (i % 12) * 160;
    const y = 50 + Math.floor(i / 12) * 240;
    ctx.strokeRect(x, y, 120, 28);
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 40);
    ctx.lineTo(x + 4, y + 140);
    ctx.lineTo(x + 80, y + 140);
    ctx.stroke();
  }

  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 420; i += 1) {
    ctx.fillRect(24 + (i % 28) * 72, 36 + Math.floor(i / 28) * 130, 5, 5);
  }

  ctx.fillStyle = "rgba(226, 232, 240, 0.12)";
  ctx.font = "28px sans-serif";
  ctx.fillText("ATX  24PIN  PCIE  DIMM  M.2", 80, 80);

  const albedo = wrap(new CanvasTexture(node), 1);

  const { node: rn, ctx: rc } = canvas(1024);
  rc.fillStyle = "#6a6a6a";
  rc.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 800; i += 1) {
    rc.fillStyle = `rgb(${80 + Math.random() * 40},${80 + Math.random() * 40},${80 + Math.random() * 40})`;
    rc.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3);
  }
  const roughness = wrap(new CanvasTexture(rn), 1);
  roughness.colorSpace = SRGBColorSpace;

  return { albedo, roughness };
}

export function pcBrushedMetal() {
  const size = 1024;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#1c1e24";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 420; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.04})`;
    ctx.fillRect(0, i * 2.4, size, 1.1);
  }
  for (let i = 0; i < 80; i += 1) {
    ctx.fillStyle = `rgba(0,0,0,${0.04})`;
    ctx.fillRect(Math.random() * size, 0, 1, size);
  }
  return wrap(new CanvasTexture(node), 2);
}

export function pcHexMesh() {
  const size = 1024;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#0b0c10";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#3a3d48";
  ctx.lineWidth = 1.6;
  const s = 14;
  for (let y = 0; y < size + 20; y += s * 1.55) {
    for (let x = 0; x < size + 20; x += s * 1.75) {
      const ox = (Math.floor(y / (s * 1.55)) % 2) * (s * 0.88);
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i;
        const px = x + ox + Math.cos(a) * s * 0.42;
        const py = y + Math.sin(a) * s * 0.42;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  return wrap(new CanvasTexture(node), 1);
}
