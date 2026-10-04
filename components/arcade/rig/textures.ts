"use client";

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

const textureCache = new Map<string, unknown>();

function getCached<T>(key: string) {
  return textureCache.get(key) as T | undefined;
}

function setCached<T>(key: string, value: T) {
  textureCache.set(key, value);
  return value;
}

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
  const cached = getCached<CanvasTexture>("woodAlbedo");
  if (cached) return cached;
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
  return setCached("woodAlbedo", wrap(new CanvasTexture(node), 2.4));
}

export function concreteAlbedo() {
  const cached = getCached<CanvasTexture>("concreteAlbedo");
  if (cached) return cached;
  const size = 1024;
  const { node, ctx } = canvas(size);
  const base = ctx.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, "#4b5563");
  base.addColorStop(0.5, "#3f4756");
  base.addColorStop(1, "#343b49");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6000; i += 1) {
    const n = 58 + Math.random() * 42;
    ctx.fillStyle = `rgba(${n},${n + 5},${n + 14},${0.16 + Math.random() * 0.18})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  ctx.strokeStyle = "rgba(203,213,225,0.045)";
  for (let y = 0; y < size; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + Math.sin(y * 0.04) * 8);
    ctx.stroke();
  }
  return setCached("concreteAlbedo", wrap(new CanvasTexture(node), 3));
}

export function hexPadAlbedo() {
  const cached = getCached<CanvasTexture>("hexPadAlbedo");
  if (cached) return cached;
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
  return setCached("hexPadAlbedo", wrap(new CanvasTexture(node), 1));
}

export function metalAlbedo() {
  const cached = getCached<CanvasTexture>("metalAlbedo");
  if (cached) return cached;
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
  return setCached("metalAlbedo", wrap(new CanvasTexture(node), 1.6));
}

export function grilleAlbedo() {
  const cached = getCached<CanvasTexture>("grilleAlbedo");
  if (cached) return cached;
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
  return setCached("grilleAlbedo", wrap(new CanvasTexture(node), 2));
}

function createBrushedMetalMaps() {
  const albedo = metalAlbedo();
  const { node, ctx } = canvas(512);
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, "#5f6672");
  grad.addColorStop(0.5, "#b9c0ca");
  grad.addColorStop(1, "#6f7783");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y) * 0.5);
    ctx.lineTo(512, y + Math.cos(y) * 0.5);
    ctx.stroke();
  }
  return { albedo, roughness: wrap(new CanvasTexture(node), 1.8) };
}

function createLeatherMaps() {
  const { node: albedoNode, ctx: albedoCtx } = canvas(512);
  albedoCtx.fillStyle = "#dfe5ee";
  albedoCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2400; i += 1) {
    const a = 0.045 + Math.random() * 0.055;
    albedoCtx.fillStyle = `rgba(95,105,120,${a})`;
    albedoCtx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }

  const { node: roughNode, ctx: roughCtx } = canvas(512);
  roughCtx.fillStyle = "#c8c8c8";
  roughCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 7) {
    roughCtx.strokeStyle = `rgba(80,80,80,${0.04 + (y % 5) * 0.012})`;
    roughCtx.beginPath();
    roughCtx.moveTo(0, y);
    roughCtx.lineTo(512, y + Math.sin(y * 0.12) * 4);
    roughCtx.stroke();
  }

  const { node: normalNode, ctx: normalCtx } = canvas(512);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, 512, 512);
  normalCtx.strokeStyle = "rgba(128,128,255,0.55)";
  for (let y = 2; y < 512; y += 9) {
    normalCtx.beginPath();
    normalCtx.moveTo(0, y);
    normalCtx.bezierCurveTo(130, y + 4, 310, y - 5, 512, y + 2);
    normalCtx.stroke();
  }

  return {
    albedo: wrap(new CanvasTexture(albedoNode), 2.2),
    roughness: wrap(new CanvasTexture(roughNode), 2.2),
    normal: wrap(new CanvasTexture(normalNode), 2.2),
  };
}

export function brushedMetalMaps() {
  const cached = getCached<ReturnType<typeof createBrushedMetalMaps>>("brushedMetalMaps");
  if (cached) return cached;
  return setCached("brushedMetalMaps", createBrushedMetalMaps());
}

export function leatherMaps() {
  const cached = getCached<ReturnType<typeof createLeatherMaps>>("leatherMaps");
  if (cached) return cached;
  return setCached("leatherMaps", createLeatherMaps());
}

export function driverGrilleAlbedo() {
  const cached = getCached<CanvasTexture>("driverGrilleAlbedo");
  if (cached) return cached;
  return setCached("driverGrilleAlbedo", grilleAlbedo());
}

export function pcbAlbedo() {
  const cached = getCached<CanvasTexture>("pcbAlbedo");
  if (cached) return cached;
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
  return setCached("pcbAlbedo", wrap(new CanvasTexture(node), 1));
}
