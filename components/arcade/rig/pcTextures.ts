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
  ctx.fillStyle = "#101f2e";
  ctx.fillRect(0, 0, size, size);

  // subtle solder-mask zoning
  ctx.fillStyle = "rgba(16, 34, 51, 0.5)";
  for (let i = 0; i < 40; i += 1) {
    ctx.fillRect(Math.random() * size, Math.random() * size, 140 + Math.random() * 320, 90 + Math.random() * 220);
  }

  // dense 45°-routed copper traces (visible through the mask)
  ctx.lineWidth = 1.15;
  for (let i = 0; i < 900; i += 1) {
    ctx.strokeStyle = `rgba(72, 168, 196, ${0.16 + Math.random() * 0.3})`;
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let seg = 0; seg < 4; seg += 1) {
      const len = 30 + Math.random() * 170;
      const dirs: [number, number][] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      x += d[0] * len;
      y += d[1] * len;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // fine BGA fan-out pads around chip zones
  ctx.strokeStyle = "rgba(96, 196, 222, 0.35)";
  ctx.lineWidth = 0.9;
  for (let c = 0; c < 26; c += 1) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    for (let i = 0; i < 60; i += 1) {
      const a = (Math.PI * 2 * i) / 60;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, 2.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // vias: gold annulus + dark drill
  for (let i = 0; i < 780; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y, 3.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#08131e";
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // SMD component pads in tidy clusters
  ctx.fillStyle = "rgba(212, 175, 55, 0.85)";
  for (let c = 0; c < 90; c += 1) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const cols = 2 + Math.floor(Math.random() * 6);
    for (let i = 0; i < cols; i += 1) {
      ctx.fillRect(cx + i * 13, cy, 7, 4);
      ctx.fillRect(cx + i * 13, cy + 14, 7, 4);
    }
  }

  // silkscreen: zone outlines + reference labels
  ctx.strokeStyle = "rgba(226, 232, 240, 0.34)";
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 46; i += 1) {
    ctx.strokeRect(Math.random() * size, Math.random() * size, 60 + Math.random() * 200, 40 + Math.random() * 120);
  }
  ctx.fillStyle = "rgba(226, 232, 240, 0.3)";
  ctx.font = "22px sans-serif";
  const labels = ["ATX", "24PIN", "PCIE", "DIMM", "M.2", "CPU_FAN", "VRM", "CHIPSET", "AUDIO", "USB"];
  for (let i = 0; i < labels.length; i += 1) {
    ctx.fillText(labels[i], 60 + (i % 5) * 390, 90 + Math.floor(i / 5) * 700);
  }
  ctx.font = "15px sans-serif";
  for (let i = 0; i < 70; i += 1) {
    ctx.fillText(`R${100 + i}  C${10 + i}`, Math.random() * (size - 90), Math.random() * size);
  }

  const albedo = wrap(new CanvasTexture(node), 1);

  const { node: rn, ctx: rc } = canvas(1024);
  rc.fillStyle = "#6a6a6a";
  rc.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 800; i += 1) {
    rc.fillStyle = `rgb(${80 + Math.random() * 40},${80 + Math.random() * 40},${80 + Math.random() * 40})`;
    rc.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3);
  }
  const roughness = wrap(new CanvasTexture(rn), 1);
  roughness.colorSpace = "srgb-linear" as typeof roughness.colorSpace;

  return { albedo, roughness };
}

export function pcBrushedMetal() {
  const size = 1024;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#b7bcc6";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 420; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.07})`;
    ctx.fillRect(0, i * 2.4, size, 1.1);
  }
  for (let i = 0; i < 80; i += 1) {
    ctx.fillStyle = `rgba(28,32,42,${0.05 + Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * size, 0, 1.4, size);
  }
  return wrap(new CanvasTexture(node), 2);
}

export function pcHexMesh() {
  const size = 1024;
  const { node, ctx } = canvas(size);
  ctx.fillStyle = "#4c515d";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#c8ccd6";
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
