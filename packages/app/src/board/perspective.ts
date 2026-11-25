// The board in perspective, as Valkyrie's Unity camera shows it: every piece is a quad lying on the board's plane, and
// the shader projects it with the camera's matrix (camera.ts boardToScreenMatrix), so the GPU draws its picture with
// true perspective and clips what falls behind the camera. Not ported from Valkyrie.
import { GlProgram, Mesh, MeshGeometry, Shader, UniformGroup, type Texture } from 'pixi.js';

// Pixi's own projection turns screen pixels into the render target's space (the canvas, or a texture when it extracts)
const vertex = `
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
uniform mat3 uProjectionMatrix;
uniform mat4 uBoardToScreen;
void main(void) {
  vec4 p = uBoardToScreen * vec4(aPosition, 0.0, 1.0);
  vec3 target = uProjectionMatrix * vec3(p.xy, p.w);
  gl_Position = vec4(target.xy, p.z, p.w);
  vUV = aUV;
}
`;

// uColor is the mesh's tint and alpha, premultiplied, as Pixi gives it to every mesh
const fragment = `
in vec2 vUV;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform vec4 uColor;
void main(void) {
  finalColor = texture(uTexture, vUV) * uColor;
}
`;

const program = GlProgram.from({ vertex, fragment, name: 'board-perspective' });

/** The camera's perspective, shared by every piece and set once a frame. */
export const boardUniforms = new UniformGroup({
  uBoardToScreen: { value: new Float32Array(16), type: 'mat4x4<f32>' },
});

/** A piece of the board: a picture on a quad of the board's plane. */
export type Quad = Mesh<MeshGeometry, Shader>;

export function createQuad(texture: Texture): Quad {
  const geometry = new MeshGeometry({
    positions: new Float32Array(8),
    uvs: new Float32Array(8),
    indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
  });
  const shader = new Shader({ glProgram: program, resources: { boardUniforms, uTexture: texture.source } });
  const quad: Quad = new Mesh({ geometry, shader, texture });
  setQuadTexture(quad, texture);
  return quad;
}

/** Shows another picture on the quad (or another part of an atlas). */
export function setQuadTexture(quad: Quad, texture: Texture): void {
  quad.texture = texture;
  quad.shader!.resources.uTexture = texture.source;
  const t = texture.uvs;
  quad.geometry.uvs.set([t.x0, t.y0, t.x1, t.y1, t.x2, t.y2, t.x3, t.y3]);
  quad.geometry.getBuffer('aUV').update();
}

/** Puts the quad on the board: centred on (x, y), turned by rotation degrees (counter-clockwise, y up), this big. */
export function placeQuad(quad: Quad, x: number, y: number, rotation: number, width: number, height: number): void {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const positions = quad.geometry.positions;
  // Top left, top right, bottom right, bottom left: the picture's top is the board's up
  const local = [-width / 2, height / 2, width / 2, height / 2, width / 2, -height / 2, -width / 2, -height / 2];
  for (let i = 0; i < 8; i += 2) {
    const lx = local[i]!;
    const ly = local[i + 1]!;
    positions[i] = x + lx * cos - ly * sin;
    positions[i + 1] = y + lx * sin + ly * cos;
  }
  quad.geometry.getBuffer('aPosition').update();
}

/** Destroys the quad with its own shader and buffers, which Pixi keeps; the textures stay, so destroy them after. */
export function destroyQuad(quad: Quad): void {
  const { shader, geometry } = quad;
  quad.destroy();
  shader?.destroy();
  geometry.destroy(true);
}

/** Sets the perspective of every quad for this frame. */
export function setPerspective(matrix: Float32Array): void {
  (boardUniforms.uniforms.uBoardToScreen as Float32Array).set(matrix);
  boardUniforms.update();
}
