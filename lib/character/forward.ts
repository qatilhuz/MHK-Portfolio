/**
 * Character-local forward is +Z: face, chest, visor, and gesture hands
 * are authored on +Z. The camera sits on +Z looking at the origin, so
 * the user sees the face. Locomotion yaw rotates this whole frame.
 * Do not apply an extra Math.PI "fix" unless the imported GLB uses -Z.
 */
export const CHARACTER_LOCAL_FORWARD = { x: 0, y: 0, z: 1 } as const;

/** Idle facing: look at the camera / user. */
export const FACE_USER_YAW = 0;
