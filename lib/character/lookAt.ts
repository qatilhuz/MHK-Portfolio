export function pointerLook(
  pointerX: number,
  pointerY: number,
  characterX: number,
  characterY: number,
) {
  const dx = (pointerX - characterX) / Math.max(120, window.innerWidth * 0.22);
  const dy = (pointerY - characterY) / Math.max(90, window.innerHeight * 0.22);
  return {
    x: Math.max(-1, Math.min(1, dx)),
    y: Math.max(-1, Math.min(1, dy)),
  };
}
