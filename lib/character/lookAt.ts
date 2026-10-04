function normalizedPointerAxis(
  pointer: number,
  character: number,
  viewportSize: number,
  minimumResponseDistance: number,
) {
  const clampedCharacter = Math.max(0, Math.min(viewportSize, character));
  const delta = pointer - clampedCharacter;
  const availableDistance = delta < 0 ? clampedCharacter : viewportSize - clampedCharacter;
  const standardResponseDistance = Math.max(minimumResponseDistance, viewportSize * 0.22);
  const directionalResponseDistance = Math.max(1, Math.min(standardResponseDistance, availableDistance));
  return Math.max(-1, Math.min(1, delta / directionalResponseDistance));
}

/** Screen-space look. y > 0 = pointer below the character (DOM Y grows downward). */
export function pointerLook(
  pointerX: number,
  pointerY: number,
  characterX: number,
  characterY: number,
) {
  return {
    x: normalizedPointerAxis(pointerX, characterX, window.innerWidth, 120),
    y: normalizedPointerAxis(pointerY, characterY, window.innerHeight, 90),
  };
}
