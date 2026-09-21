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
  const { node, ctx } = canvas(512);
  ctx.fillStyle = "#c9ae82";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i += 1) {
    const y = (i / 90) * 512;
    ctx.strokeStyle = `rgba(90, 60, 28, ${0.04 + (i % 7) * 0.012})`;
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(120, y + 4, 280, y - 5, 512, y + 2);
    ctx.stroke();
  }
  for (let i = 0; i < 400; i += 1) {
    ctx.fillStyle = `rgba(70, 45, 20, ${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.2, 6);
  }
  return wrap(new CanvasTexture(node), 3);
}

export function concreteAlbedo() {
  const { node, ctx } = canvas(512);
  ctx.fillStyle = "#2c2c2e";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1800; i += 1) {
    const n = 40 + Math.random() * 40;
    ctx.fillStyle = `rgb(${n},${n},${n + 4})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  return wrap(new CanvasTexture(node), 4);
}

export function hexPadAlbedo() {
  const { node, ctx } = canvas(256);
  ctx.fillStyle = "#0b0c12";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(168, 85, 247, 0.55)";
  ctx.lineWidth = 2;
  const s = 22;
  for (let y = 0; y < 280; y += s * 1.6) {
    for (let x = 0; x < 280; x += s * 1.8) {
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
  const { node, ctx } = canvas(256);
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#1a1b22");
  g.addColorStop(0.5, "#2a2c34");
  g.addColorStop(1, "#17181e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`;
    ctx.fillRect(0, i * 3.2, 256, 1);
  }
  return wrap(new CanvasTexture(node), 2);
}

export function grilleAlbedo() {
  const { node, ctx } = canvas(128);
  ctx.fillStyle = "#111216";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#2a2b32";
  for (let y = 4; y < 128; y += 8) {
    for (let x = 4; x < 128; x += 8) {
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return wrap(new CanvasTexture(node), 2);
}
