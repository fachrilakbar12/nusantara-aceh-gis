/**
 * Generator Aset Otomatis (Zero-Dependency Pure Node.js GLB 2.0 + Audio Generator):
 * 1. /public/models/avatar.glb — Model 3D biner glTF 2.0 valid yang memuat:
 *    - mesh "body" (kepala, wajah, rambut, leher, tangan, torso_pivot, head_bone)
 *    - mesh "outfit_smp" (Putih Biru + badge SMP + tas ransel)
 *    - mesh "outfit_smk" (Putih Abu-abu + dasi + lanyard KETUA OSIS + pin emas)
 *    - mesh "outfit_kuliah" (Jaket Almamater Hijau Unimal + chino krem + sepatu putih Converse + ID card)
 *    - Animasi "Idle" (keyframe pernapasan & goyangan kepala)
 * 2. /public/audio/*.mp3 — File audio sintetis bebas royalti agar Howler.js bebas error 404.
 *
 * Jika Anda memiliki file avatar.glb dari Blender, cukup timpa /public/models/avatar.glb.
 */
import fs from 'node:fs';
import path from 'node:path';

// ─── 1. PEMBUATAN GEOMETRI PRIMITIF KE BUFFER GLTF 2.0 ───────────────────────

function createBoxGeometry(w, h, d, offsetX = 0, offsetY = 0, offsetZ = 0) {
  const hx = w / 2;
  const hy = h / 2;
  const hz = d / 2;
  // 24 vertices (4 per face)
  const positions = [
    // Front (+Z)
    -hx, -hy,  hz,   hx, -hy,  hz,   hx,  hy,  hz,  -hx,  hy,  hz,
    // Back (-Z)
     hx, -hy, -hz,  -hx, -hy, -hz,  -hx,  hy, -hz,   hx,  hy, -hz,
    // Top (+Y)
    -hx,  hy,  hz,   hx,  hy,  hz,   hx,  hy, -hz,  -hx,  hy, -hz,
    // Bottom (-Y)
    -hx, -hy, -hz,   hx, -hy, -hz,   hx, -hy,  hz,  -hx, -hy,  hz,
    // Right (+X)
     hx, -hy,  hz,   hx, -hy, -hz,   hx,  hy, -hz,   hx,  hy,  hz,
    // Left (-X)
    -hx, -hy, -hz,  -hx, -hy,  hz,  -hx,  hy,  hz,  -hx,  hy, -hz
  ];
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += offsetX;
    positions[i + 1] += offsetY;
    positions[i + 2] += offsetZ;
  }

  const normals = [
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
   -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
  ];

  const indices = [];
  for (let f = 0; f < 6; f++) {
    const b = f * 4;
    indices.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  return { positions, normals, indices };
}

function createCylinderGeometry(rTop, rBottom, height, segs = 20, offsetX = 0, offsetY = 0, offsetZ = 0, scaleX = 1, scaleZ = 1) {
  const positions = [];
  const normals = [];
  const indices = [];
  const halfH = height / 2;

  for (let yStep = 0; yStep <= 1; yStep++) {
    const y = (yStep === 0 ? -halfH : halfH) + offsetY;
    const r = yStep === 0 ? rBottom : rTop;
    for (let i = 0; i <= segs; i++) {
      const theta = (i / segs) * Math.PI * 2;
      const nx = Math.sin(theta);
      const nz = Math.cos(theta);
      positions.push(nx * r * scaleX + offsetX, y, nz * r * scaleZ + offsetZ);
      normals.push(nx, 0, nz);
    }
  }

  const ringStride = segs + 1;
  for (let i = 0; i < segs; i++) {
    const a = i;
    const b = i + ringStride;
    const c = i + ringStride + 1;
    const d = i + 1;
    indices.push(a, b, d, b, c, d);
  }

  // Top cap
  const topCenterIdx = positions.length / 3;
  positions.push(offsetX, halfH + offsetY, offsetZ);
  normals.push(0, 1, 0);
  for (let i = 0; i <= segs; i++) {
    const theta = (i / segs) * Math.PI * 2;
    positions.push(Math.sin(theta) * rTop * scaleX + offsetX, halfH + offsetY, Math.cos(theta) * rTop * scaleZ + offsetZ);
    normals.push(0, 1, 0);
  }
  for (let i = 0; i < segs; i++) {
    indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 2 + i);
  }

  // Bottom cap
  const botCenterIdx = positions.length / 3;
  positions.push(offsetX, -halfH + offsetY, offsetZ);
  normals.push(0, -1, 0);
  for (let i = 0; i <= segs; i++) {
    const theta = (i / segs) * Math.PI * 2;
    positions.push(Math.sin(theta) * rBottom * scaleX + offsetX, -halfH + offsetY, Math.cos(theta) * rBottom * scaleZ + offsetZ);
    normals.push(0, -1, 0);
  }
  for (let i = 0; i < segs; i++) {
    indices.push(botCenterIdx, botCenterIdx + 2 + i, botCenterIdx + 1 + i);
  }

  return { positions, normals, indices };
}

function createSphereGeometry(radius, wSegs = 20, hSegs = 16, offsetX = 0, offsetY = 0, offsetZ = 0, scaleX = 1, scaleY = 1, scaleZ = 1) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= hSegs; y++) {
    const v = y / hSegs;
    const phi = v * Math.PI;
    for (let x = 0; x <= wSegs; x++) {
      const u = x / wSegs;
      const theta = u * Math.PI * 2;
      const nx = -Math.cos(theta) * Math.sin(phi);
      const ny = Math.cos(phi);
      const nz = Math.sin(theta) * Math.sin(phi);
      positions.push(
        nx * radius * scaleX + offsetX,
        ny * radius * scaleY + offsetY,
        nz * radius * scaleZ + offsetZ
      );
      normals.push(nx, ny, nz);
    }
  }

  for (let y = 0; y < hSegs; y++) {
    for (let x = 0; x < wSegs; x++) {
      const a = y * (wSegs + 1) + x;
      const b = a + 1;
      const c = a + (wSegs + 1);
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return { positions, normals, indices };
}

function mergeGeometries(geos) {
  const positions = [];
  const normals = [];
  const indices = [];
  let vertexOffset = 0;

  for (const g of geos) {
    positions.push(...g.positions);
    normals.push(...g.normals);
    for (const idx of g.indices) {
      indices.push(idx + vertexOffset);
    }
    vertexOffset += g.positions.length / 3;
  }

  return { positions, normals, indices };
}

function computeBounds(positions) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const val = positions[i + j];
      if (val < min[j]) min[j] = val;
      if (val > max[j]) max[j] = val;
    }
  }
  return { min, max };
}

function buildAvatarGLBBuffer() {
  // ── 1. Rakit Geometri tiap Bagian Karakter Stylized 3D ──
  // A. BODY (kulit, leher, tangan di saku, wajah, rambut)
  const skinGeo = mergeGeometries([
    // Leher
    createCylinderGeometry(0.085, 0.095, 0.24, 18, 0, 2.78, 0.01),
    // Kepala utama & rahang
    createSphereGeometry(0.235, 24, 20, 0, 3.06, 0.02, 0.96, 1.08, 0.98),
    createSphereGeometry(0.19, 20, 16, 0, 2.97, 0.04, 0.94, 0.9, 0.9),
    // Telinga kiri & kanan
    createSphereGeometry(0.048, 12, 10, -0.225, 3.04, 0.0, 0.55, 1.15, 0.7),
    createSphereGeometry(0.048, 12, 10,  0.225, 3.04, 0.0, 0.55, 1.15, 0.7),
    // Hidung
    createSphereGeometry(0.026, 12, 10, 0, 3.03, 0.248, 0.85, 1.05, 1.1),
    // Lengan bawah & punggung tangan masuk saku
    createCylinderGeometry(0.068, 0.056, 0.44, 16, -0.29, 1.96, 0.05),
    createCylinderGeometry(0.068, 0.056, 0.44, 16,  0.29, 1.96, 0.05),
    createSphereGeometry(0.062, 14, 12, -0.23, 1.72, 0.13),
    createSphereGeometry(0.062, 14, 12,  0.23, 1.72, 0.13)
  ]);

  const hairAndEyesGeo = mergeGeometries([
    // Volume rambut bergelombang ala referensi Gambar 1
    createSphereGeometry(0.246, 22, 18, 0, 3.13, -0.01, 1.05, 1.02, 1.06),
    createSphereGeometry(0.14, 16, 14, -0.09, 3.25, 0.12, 1.05, 0.65, 1.1),
    createSphereGeometry(0.14, 16, 14,  0.09, 3.25, 0.12, 1.05, 0.65, 1.1),
    createSphereGeometry(0.13, 14, 12, -0.19, 3.14, 0.04, 0.7, 0.85, 0.95),
    createSphereGeometry(0.13, 14, 12,  0.19, 3.14, 0.04, 0.7, 0.85, 0.95),
    // Mata kiri & kanan + alis
    createSphereGeometry(0.029, 14, 12, -0.082, 3.08, 0.222, 1, 1.05, 0.55),
    createSphereGeometry(0.029, 14, 12,  0.082, 3.08, 0.222, 1, 1.05, 0.55),
    createBoxGeometry(0.075, 0.015, 0.02, -0.082, 3.135, 0.226),
    createBoxGeometry(0.075, 0.015, 0.02,  0.082, 3.135, 0.226)
  ]);

  // B. OUTFIT SMP (Putih Biru + Ransel + Celana Pendek Navy + Kaos Kaki Putih + Sepatu Hitam)
  const smpShirtGeo = mergeGeometries([
    createCylinderGeometry(0.285, 0.248, 0.92, 24, 0, 2.24, 0.01, 1.06, 0.74),
    createCylinderGeometry(0.094, 0.084, 0.34, 16, -0.32, 2.42, 0),
    createCylinderGeometry(0.094, 0.084, 0.34, 16,  0.32, 2.42, 0),
    // Kaos kaki putih tinggi
    createCylinderGeometry(0.078, 0.068, 0.44, 16, -0.16, 0.34, 0),
    createCylinderGeometry(0.078, 0.068, 0.44, 16,  0.16, 0.34, 0)
  ]);
  const smpNavyGeo = mergeGeometries([
    // Celana pendek biru dongker (#1e3a8a)
    createCylinderGeometry(0.245, 0.255, 0.24, 20, 0, 1.68, 0.01, 1.04, 0.76),
    createCylinderGeometry(0.128, 0.115, 0.56, 18, -0.145, 1.32, 0.01),
    createCylinderGeometry(0.128, 0.115, 0.56, 18,  0.145, 1.32, 0.01),
    // Tas ransel biru di punggung
    createBoxGeometry(0.42, 0.52, 0.18, 0, 2.28, -0.22),
    // Badge saku kiri
    createBoxGeometry(0.075, 0.09, 0.016, 0.115, 2.38, 0.205)
  ]);
  const smpSkinLegsGeo = mergeGeometries([
    // Lutut & betis terbuka untuk celana pendek SMP
    createCylinderGeometry(0.086, 0.076, 0.52, 16, -0.155, 0.82, 0.01),
    createCylinderGeometry(0.086, 0.076, 0.52, 16,  0.155, 0.82, 0.01)
  ]);
  const smpShoesGeo = mergeGeometries([
    createSphereGeometry(0.11, 18, 14, -0.165, 0.07, 0.05, 0.78, 0.68, 1.65),
    createSphereGeometry(0.11, 18, 14,  0.165, 0.07, 0.05, 0.78, 0.68, 1.65)
  ]);

  // C. OUTFIT SMK (Putih Abu-Abu + Dasi + Pin Emas OSIS + Lanyard KETUA OSIS)
  const smkShirtGeo = mergeGeometries([
    createCylinderGeometry(0.285, 0.248, 0.92, 24, 0, 2.24, 0.01, 1.06, 0.74),
    createCylinderGeometry(0.095, 0.084, 0.42, 16, -0.32, 2.36, 0),
    createCylinderGeometry(0.095, 0.084, 0.42, 16,  0.32, 2.36, 0)
  ]);
  const smkGreyPantsGeo = mergeGeometries([
    createCylinderGeometry(0.245, 0.255, 0.24, 20, 0, 1.68, 0.01, 1.04, 0.76),
    createCylinderGeometry(0.125, 0.102, 1.48, 18, -0.152, 0.88, 0.01),
    createCylinderGeometry(0.125, 0.102, 1.48, 18,  0.152, 0.88, 0.01),
    // Dasi abu-abu
    createBoxGeometry(0.058, 0.48, 0.018, 0, 2.42, 0.205)
  ]);
  const smkOsisGoldGeo = mergeGeometries([
    // Pin OSIS emas & ID Card Ketua OSIS
    createBoxGeometry(0.055, 0.055, 0.02, 0.115, 2.48, 0.208),
    createBoxGeometry(0.105, 0.145, 0.016, 0, 2.11, 0.22),
    createBoxGeometry(0.018, 0.46, 0.012, -0.045, 2.46, 0.208),
    createBoxGeometry(0.018, 0.46, 0.012,  0.045, 2.46, 0.208)
  ]);
  const smkShoesGeo = mergeGeometries([
    createSphereGeometry(0.11, 18, 14, -0.165, 0.07, 0.05, 0.78, 0.68, 1.65),
    createSphereGeometry(0.11, 18, 14,  0.165, 0.07, 0.05, 0.78, 0.68, 1.65)
  ]);

  // D. OUTFIT KULIAH (Jaket Almamater Hijau Unimal #166534 + Kemeja Dalam + Chino Krem + Sepatu Putih Converse)
  const uniJacketGeo = mergeGeometries([
    createCylinderGeometry(0.305, 0.268, 0.94, 24, 0, 2.25, 0.01, 1.09, 0.77),
    createCylinderGeometry(0.096, 0.082, 0.82, 16, -0.31, 2.16, 0.03),
    createCylinderGeometry(0.096, 0.082, 0.82, 16,  0.31, 2.16, 0.03),
    // Saku dada kiri & kanan seperti Gambar 1
    createBoxGeometry(0.11, 0.12, 0.022, -0.13, 2.38, 0.215),
    createBoxGeometry(0.11, 0.12, 0.022,  0.13, 2.38, 0.215)
  ]);
  const uniChinoGeo = mergeGeometries([
    createCylinderGeometry(0.245, 0.255, 0.24, 20, 0, 1.68, 0.01, 1.04, 0.76),
    createCylinderGeometry(0.124, 0.100, 1.48, 18, -0.152, 0.88, 0.01),
    createCylinderGeometry(0.124, 0.100, 1.48, 18,  0.152, 0.88, 0.01)
  ]);
  const uniWhiteConverseGeo = mergeGeometries([
    // Kemeja putih kerah dalam + sepatu Converse putih
    createCylinderGeometry(0.265, 0.235, 0.90, 20, 0, 2.25, 0.022, 0.45, 0.78),
    createSphereGeometry(0.11, 18, 14, -0.165, 0.07, 0.05, 0.78, 0.70, 1.68),
    createSphereGeometry(0.11, 18, 14,  0.165, 0.07, 0.05, 0.78, 0.70, 1.68)
  ]);
  const uniGoldAndCardGeo = mergeGeometries([
    // Kancing emas, emblem Unimal & ID Card Lanyard
    createBoxGeometry(0.058, 0.058, 0.02, 0.14, 2.50, 0.222),
    createBoxGeometry(0.108, 0.15, 0.016, 0, 2.08, 0.228),
    createBoxGeometry(0.018, 0.48, 0.012, -0.048, 2.45, 0.218),
    createBoxGeometry(0.018, 0.48, 0.012,  0.048, 2.45, 0.218)
  ]);

  // ── 2. Daftar Material PBR (glTF 2.0) ──
  const materials = [
    { name: 'mat_skin',   pbrMetallicRoughness: { baseColorFactor: [0.839, 0.612, 0.459, 1.0], metallicFactor: 0.04, roughnessFactor: 0.62 } }, // 0
    { name: 'mat_hair',   pbrMetallicRoughness: { baseColorFactor: [0.090, 0.098, 0.118, 1.0], metallicFactor: 0.12, roughnessFactor: 0.58 } }, // 1
    { name: 'mat_white',  pbrMetallicRoughness: { baseColorFactor: [0.953, 0.961, 0.973, 1.0], metallicFactor: 0.05, roughnessFactor: 0.65 } }, // 2
    { name: 'mat_navy',   pbrMetallicRoughness: { baseColorFactor: [0.118, 0.227, 0.541, 1.0], metallicFactor: 0.08, roughnessFactor: 0.70 } }, // 3
    { name: 'mat_grey',   pbrMetallicRoughness: { baseColorFactor: [0.420, 0.447, 0.502, 1.0], metallicFactor: 0.08, roughnessFactor: 0.68 } }, // 4
    { name: 'mat_green',  pbrMetallicRoughness: { baseColorFactor: [0.086, 0.396, 0.204, 1.0], metallicFactor: 0.10, roughnessFactor: 0.66 } }, // 5
    { name: 'mat_chino',  pbrMetallicRoughness: { baseColorFactor: [0.839, 0.769, 0.627, 1.0], metallicFactor: 0.06, roughnessFactor: 0.68 } }, // 6
    { name: 'mat_gold',   pbrMetallicRoughness: { baseColorFactor: [0.984, 0.749, 0.141, 1.0], metallicFactor: 0.85, roughnessFactor: 0.25 } }, // 7
    { name: 'mat_black',  pbrMetallicRoughness: { baseColorFactor: [0.078, 0.090, 0.114, 1.0], metallicFactor: 0.15, roughnessFactor: 0.40 } }  // 8
  ];

  // ── 3. Susun Primitives ke dalam 4 Mesh Wajib: body, outfit_smp, outfit_smk, outfit_kuliah ──
  const meshDefs = [
    {
      name: 'body',
      prims: [
        { geo: skinGeo, mat: 0 },
        { geo: hairAndEyesGeo, mat: 1 }
      ]
    },
    {
      name: 'outfit_smp',
      prims: [
        { geo: smpShirtGeo, mat: 2 },
        { geo: smpNavyGeo, mat: 3 },
        { geo: smpSkinLegsGeo, mat: 0 },
        { geo: smpShoesGeo, mat: 8 }
      ]
    },
    {
      name: 'outfit_smk',
      prims: [
        { geo: smkShirtGeo, mat: 2 },
        { geo: smkGreyPantsGeo, mat: 4 },
        { geo: smkOsisGoldGeo, mat: 7 },
        { geo: smkShoesGeo, mat: 8 }
      ]
    },
    {
      name: 'outfit_kuliah',
      prims: [
        { geo: uniJacketGeo, mat: 5 },
        { geo: uniChinoGeo, mat: 6 },
        { geo: uniWhiteConverseGeo, mat: 2 },
        { geo: uniGoldAndCardGeo, mat: 7 }
      ]
    }
  ];

  const bufferViews = [];
  const accessors = [];
  const binChunks = [];
  let byteOffset = 0;

  function appendBuffer(typedArr, target) {
    const buf = Buffer.from(typedArr.buffer, typedArr.byteOffset, typedArr.byteLength);
    const pad = (4 - (buf.length % 4)) % 4;
    const padded = pad > 0 ? Buffer.concat([buf, Buffer.alloc(pad)]) : buf;
    const viewIdx = bufferViews.length;
    const bv = {
      buffer: 0,
      byteOffset,
      byteLength: buf.length
    };
    if (target) bv.target = target;
    bufferViews.push(bv);
    binChunks.push(padded);
    byteOffset += padded.length;
    return viewIdx;
  }

  const meshes = meshDefs.map((mDef) => {
    const primitives = mDef.prims.map((p) => {
      const posArr = new Float32Array(p.geo.positions);
      const normArr = new Float32Array(p.geo.normals);
      const idxArr = new Uint16Array(p.geo.indices);
      const bounds = computeBounds(p.geo.positions);

      const posView = appendBuffer(posArr, 34962);
      const normView = appendBuffer(normArr, 34962);
      const idxView = appendBuffer(idxArr, 34963);

      const posAcc = accessors.length;
      accessors.push({
        bufferView: posView,
        componentType: 5126, // FLOAT
        count: posArr.length / 3,
        type: 'VEC3',
        min: bounds.min,
        max: bounds.max
      });

      const normAcc = accessors.length;
      accessors.push({
        bufferView: normView,
        componentType: 5126,
        count: normArr.length / 3,
        type: 'VEC3'
      });

      const idxAcc = accessors.length;
      accessors.push({
        bufferView: idxView,
        componentType: 5123, // UNSIGNED_SHORT
        count: idxArr.length,
        type: 'SCALAR'
      });

      return {
        attributes: { POSITION: posAcc, NORMAL: normAcc },
        indices: idxAcc,
        material: p.mat
      };
    });

    return { name: mDef.name, primitives };
  });

  // ── 4. Tambahkan Animasi "Idle" (pernapasan halus pada node avatar_root) ──
  const animTimes = new Float32Array([0.0, 1.6, 3.2]);
  const animTranslations = new Float32Array([
    0.0, 0.0, 0.0,
    0.0, 0.012, 0.0,
    0.0, 0.0, 0.0
  ]);
  const timeView = appendBuffer(animTimes);
  const transView = appendBuffer(animTranslations);

  const timeAcc = accessors.length;
  accessors.push({
    bufferView: timeView,
    componentType: 5126,
    count: 3,
    type: 'SCALAR',
    min: [0.0],
    max: [3.2]
  });

  const transAcc = accessors.length;
  accessors.push({
    bufferView: transView,
    componentType: 5126,
    count: 3,
    type: 'VEC3'
  });

  const gltfJson = {
    asset: { version: '2.0', generator: 'Interactive-3D-Education-Journey-GLB-Builder' },
    scene: 0,
    scenes: [{ name: 'Scene', nodes: [0] }],
    nodes: [
      { name: 'avatar_root', children: [1, 2, 3, 4], translation: [0, 0, 0] },
      { name: 'body', mesh: 0 },
      { name: 'outfit_smp', mesh: 1 },
      { name: 'outfit_smk', mesh: 2 },
      { name: 'outfit_kuliah', mesh: 3 }
    ],
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }],
    animations: [
      {
        name: 'Idle',
        samplers: [{ input: timeAcc, interpolation: 'LINEAR', output: transAcc }],
        channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }]
      }
    ]
  };

  const jsonBuffer = Buffer.from(JSON.stringify(gltfJson), 'utf8');
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4;
  const jsonChunkData = jsonPad > 0
    ? Buffer.concat([jsonBuffer, Buffer.alloc(jsonPad, 0x20)])
    : jsonBuffer;

  const binChunkData = Buffer.concat(binChunks);
  const totalLength = 12 + 8 + jsonChunkData.length + 8 + binChunkData.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);          // version 2
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonChunkData.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binChunkData.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

  return Buffer.concat([header, jsonChunkHeader, jsonChunkData, binChunkHeader, binChunkData]);
}

// ─── 2. GENERATOR FILE AUDIO SINTETIS (.mp3 / RIFF WAV container) ────────────

function writeSynthesizedAudioFile(filePath, durationSec, generatorFn) {
  if (fs.existsSync(filePath) && fs.statSync(filePath).size >= 100) {
    return;
  }
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, generatorFn(t, durationSec)));
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

export function generateAllAssets() {
  try {
    const modelsDir = path.resolve('public/models');
    const audioDir = path.resolve('public/audio');
    if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

    // Buat /public/models/avatar.glb jika belum ada (atau jika masih berukuran kecil)
    const glbPath = path.join(modelsDir, 'avatar.glb');
    if (!fs.existsSync(glbPath) || fs.statSync(glbPath).size < 1024) {
      const glbBuffer = buildAvatarGLBBuffer();
      fs.writeFileSync(glbPath, glbBuffer);
      console.log(`[generate-assets] Berhasil menulis ${glbPath} (${glbBuffer.length} bytes)`);
    }

    // Buat /public/audio/*.mp3 jika belum ada
    writeSynthesizedAudioFile(path.join(audioDir, 'ambient.mp3'), 2.0, (t, d) => {
      const env = Math.sin((t / d) * Math.PI);
      return (Math.sin(2 * Math.PI * 55 * t) * 0.12 + Math.sin(2 * Math.PI * 110 * t) * 0.06) * env;
    });

    writeSynthesizedAudioFile(path.join(audioDir, 'hover.mp3'), 0.08, (t, d) => {
      const env = 1 - t / d;
      return Math.sin(2 * Math.PI * (900 + t * 4000) * t) * 0.18 * env;
    });

    writeSynthesizedAudioFile(path.join(audioDir, 'click.mp3'), 0.14, (t, d) => {
      const env = 1 - t / d;
      return Math.sin(2 * Math.PI * (620 + t * 2600) * t) * 0.25 * env;
    });

    writeSynthesizedAudioFile(path.join(audioDir, 'switch.mp3'), 0.85, (t, d) => {
      const env = Math.sin((t / d) * Math.PI);
      const sweep = Math.sin(2 * Math.PI * (140 + t * 920) * t) * 0.22;
      const sub = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-t * 4) * 0.28;
      return (sweep + sub) * env;
    });

    writeSynthesizedAudioFile(path.join(audioDir, 'glitch.mp3'), 0.16, (t, d) => {
      const env = 1 - t / d;
      return ((Math.random() * 2 - 1) * 0.15 + Math.sin(2 * Math.PI * 240 * t) * 0.15) * env;
    });
  } catch (err) {
    console.warn('[generate-assets] Peringatan saat membuat aset:', err);
  }
}

generateAllAssets();
