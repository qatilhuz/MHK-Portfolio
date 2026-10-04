# Contact planet assets

The contact-section Earth canvas looks for these files at runtime:

- `scene.gltf`
- `scene.bin`
- `Planet_baseColor.png`
- `Clouds_baseColor.png`

Until the complete GLTF pair is available, the canvas renders a procedural Earth fallback. The two base-color textures are also optional and are applied to that fallback automatically when present.
