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
  ctx.fillStyle = "#090a10";
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
  g.addColorStop(0, "#14151b");
  g.addColorStop(0.5, "#2c2e36");
  g.addColorStop(1, "#121318");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 170; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.03})`;
    ctx.fillRect(0, i * 3, 512, 1);
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
