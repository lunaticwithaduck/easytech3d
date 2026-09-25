// STL parsing + volume/dimension analysis — ported from the easytech3d-quote reference (pure,
// client-side, no geometry libs). Binary + ASCII STL → triangles → signed-tetrahedron volume + bbox.

export type Vec3 = [number, number, number];
export type Tri = [Vec3, Vec3, Vec3];

export function parseSTL(buffer: ArrayBuffer): Tri[] {
  const view = new DataView(buffer);
  const hdr = new Uint8Array(buffer, 0, 5);
  const isAscii = String.fromCharCode(...hdr) === 'solid';
  if (isAscii && buffer.byteLength > 84) {
    const n = view.getUint32(80, true);
    if (Math.abs(84 + n * 50 - buffer.byteLength) <= 1) return parseBinary(view);
  }
  return isAscii ? parseAscii(buffer) : parseBinary(view);
}

function parseBinary(v: DataView): Tri[] {
  const n = v.getUint32(80, true);
  const tris: Tri[] = [];
  let o = 84;
  for (let i = 0; i < n; i++) {
    o += 12; // skip normal
    const a: Vec3 = [v.getFloat32(o, true), v.getFloat32(o + 4, true), v.getFloat32(o + 8, true)];
    o += 12;
    const b: Vec3 = [v.getFloat32(o, true), v.getFloat32(o + 4, true), v.getFloat32(o + 8, true)];
    o += 12;
    const c: Vec3 = [v.getFloat32(o, true), v.getFloat32(o + 4, true), v.getFloat32(o + 8, true)];
    o += 12;
    o += 2; // attribute byte count
    tris.push([a, b, c]);
  }
  return tris;
}

function parseAscii(buf: ArrayBuffer): Tri[] {
  const txt = new TextDecoder().decode(buf);
  const tris: Tri[] = [];
  const fr = /facet\s+normal\s+[\s\S]*?outer\s+loop\s+([\s\S]*?)endloop/gi;
  const vr = /vertex\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
  let m: RegExpExecArray | null = fr.exec(txt);
  while (m !== null) {
    const vs: Vec3[] = [];
    vr.lastIndex = 0;
    let vm: RegExpExecArray | null = vr.exec(m[1]);
    while (vm !== null) {
      vs.push([+vm[1], +vm[2], +vm[3]]);
      vm = vr.exec(m[1]);
    }
    if (vs.length === 3) tris.push([vs[0], vs[1], vs[2]]);
    m = fr.exec(txt);
  }
  return tris;
}

function signedVol(a: Vec3, b: Vec3, c: Vec3): number {
  return (
    (a[0] * (b[1] * c[2] - b[2] * c[1]) -
      a[1] * (b[0] * c[2] - b[2] * c[0]) +
      a[2] * (b[0] * c[1] - b[1] * c[0])) /
    6
  );
}

export interface StlAnalysis {
  volMm3: number;
  dims: { x: number; y: number; z: number };
  triangleCount: number;
}

export function analyze(tris: Tri[]): StlAnalysis {
  let vol = 0;
  let x0 = Infinity;
  let y0 = Infinity;
  let z0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  let z1 = -Infinity;
  for (const [a, b, c] of tris) {
    vol += signedVol(a, b, c);
    for (const v of [a, b, c]) {
      x0 = Math.min(x0, v[0]);
      x1 = Math.max(x1, v[0]);
      y0 = Math.min(y0, v[1]);
      y1 = Math.max(y1, v[1]);
      z0 = Math.min(z0, v[2]);
      z1 = Math.max(z1, v[2]);
    }
  }
  return {
    volMm3: Math.abs(vol),
    dims: { x: x1 - x0, y: y1 - y0, z: z1 - z0 },
    triangleCount: tris.length,
  };
}

/** Flat vertex array for three.js BufferGeometry (x,y,z per vertex, 9 per triangle). */
export function verticesFromTris(tris: Tri[]): Float32Array {
  const out = new Float32Array(tris.length * 9);
  let i = 0;
  for (const [a, b, c] of tris) {
    out[i++] = a[0];
    out[i++] = a[1];
    out[i++] = a[2];
    out[i++] = b[0];
    out[i++] = b[1];
    out[i++] = b[2];
    out[i++] = c[0];
    out[i++] = c[1];
    out[i++] = c[2];
  }
  return out;
}

/** Estimated print weight (grams): shell 30% + infill fraction of the rest, × density. */
export function calcWeight(volCm3: number, density: number, infill: number): number {
  const shell = 0.3;
  return volCm3 * density * (shell + (1 - shell) * (infill / 100));
}
