import * as THREE from 'three';
import { REGIONS_ACEH } from './regions';

export type Position2D = [number, number];
export type LinearRing = Position2D[];
export type PolygonCoords = LinearRing[];
export type MultiPolygonCoords = PolygonCoords[];

export type GeoJSONGeometry =
  | {
      type: 'Polygon';
      coordinates: PolygonCoords;
    }
  | {
      type: 'MultiPolygon';
      coordinates: MultiPolygonCoords;
    };

export interface GeoJSONFeature {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface ProcessedRegionGeometry {
  id: string;
  geometry: THREE.ExtrudeGeometry;
  topOutlinePositions: Float32Array;
  centroid: [number, number]; // [worldX, worldZ]
  boundsRadius: number;
}

// Pusat geografis Aceh untuk proyeksi equirectangular lokal
const ACEH_CENTER_LON = 96.65;
const ACEH_CENTER_LAT = 4.15;
const MAP_SCALE = 2.65;
const COS_LAT = Math.cos((ACEH_CENTER_LAT * Math.PI) / 180);

export const BASE_EXTRUDE_HEIGHT = 0.25;
export const HOVER_EXTRUDE_OFFSET = 0.35;

const CENTROID_REGISTRY: Record<string, [number, number]> = {};

export function registerRegionCentroid(id: string, centroid: [number, number]): void {
  CENTROID_REGISTRY[id] = centroid;
}

export function getRegionCentroid(id: string): [number, number] | null {
  return CENTROID_REGISTRY[id] || null;
}

/**
 * Mengubah koordinat (lon, lat) menjadi koordinat 2D THREE.Shape (shapeX, shapeY).
 * Saat mesh diputar [-Math.PI / 2, 0, 0], shapeX -> worldX, shapeY -> -worldZ, extrudeZ -> worldY.
 */
export function projectLonLat(lon: number, lat: number): [number, number] {
  const x = (lon - ACEH_CENTER_LON) * COS_LAT * MAP_SCALE;
  const y = (lat - ACEH_CENTER_LAT) * MAP_SCALE;
  return [x, y];
}

/**
 * Normalisasi nama kabupaten/kota dari berbagai sumber GeoJSON (BIG, GADM, geoBoundaries, BPS)
 * ke ID kanonik 23 wilayah di lib/regions.ts.
 */
export function normalizeRegionId(props: Record<string, unknown>): string | null {
  const rawId = typeof props.id === 'string' ? props.id.trim().toLowerCase() : '';
  if (rawId && REGIONS_ACEH.some((r) => r.id === rawId)) {
    return rawId;
  }

  const candidateFields = [
    props.nama,
    props.name,
    props.NAME_2,
    props.WADMKK,
    props.KABKOT,
    props.kabkot,
    props.shapeName,
    props.alt_name
  ];

  const rawName = candidateFields.find((v) => typeof v === 'string' && v.trim().length > 0) as
    | string
    | undefined;
  if (!rawName) return null;

  const cleaned = rawName
    .toLowerCase()
    .replace(/^(kabupaten|kab\.?|kota)\s+/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const aliasMap: Record<string, string> = {
    'banda-aceh': 'banda-aceh',
    'kota-banda-aceh': 'banda-aceh',
    sabang: 'sabang',
    'kota-sabang': 'sabang',
    'aceh-besar': 'aceh-besar',
    pidie: 'pidie',
    'pidie-jaya': 'pidie-jaya',
    bireuen: 'bireuen',
    'aceh-utara': 'aceh-utara',
    lhokseumawe: 'lhokseumawe',
    'kota-lhokseumawe': 'lhokseumawe',
    'aceh-timur': 'aceh-timur',
    langsa: 'langsa',
    'kota-langsa': 'langsa',
    'aceh-tamiang': 'aceh-tamiang',
    'aceh-tengah': 'aceh-tengah',
    'bener-meriah': 'bener-meriah',
    'gayo-lues': 'gayo-lues',
    'aceh-tenggara': 'aceh-tenggara',
    'aceh-singkil': 'aceh-singkil',
    subulussalam: 'subulussalam',
    'kota-subulussalam': 'subulussalam',
    'aceh-selatan': 'aceh-selatan',
    'aceh-barat-daya': 'aceh-barat-daya',
    'nagan-raya': 'nagan-raya',
    'aceh-barat': 'aceh-barat',
    'aceh-jaya': 'aceh-jaya',
    simeulue: 'simeulue'
  };

  return aliasMap[cleaned] || null;
}

function computeRingSignedAreaAndCentroid(ring: Position2D[]): {
  area: number;
  cx: number;
  cy: number;
} {
  let area2 = 0;
  let cx = 0;
  let cy = 0;
  const n = ring.length;
  if (n < 3) {
    const first = ring[0] || [0, 0];
    return { area: 0, cx: first[0], cy: first[1] };
  }

  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[(i + 1) % n];
    const cross = x0 * y1 - x1 * y0;
    area2 += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }

  if (Math.abs(area2) < 1e-7) {
    let sx = 0;
    let sy = 0;
    for (const [x, y] of ring) {
      sx += x;
      sy += y;
    }
    return { area: 0, cx: sx / n, cy: sy / n };
  }

  const area = area2 * 0.5;
  return {
    area: Math.abs(area),
    cx: cx / (3 * area2),
    cy: cy / (3 * area2)
  };
}

function sanitizeProjectedRing(ring: Position2D[]): Position2D[] {
  const cleaned: Position2D[] = [];
  for (const pt of ring) {
    if (cleaned.length === 0) {
      cleaned.push(pt);
    } else {
      const prev = cleaned[cleaned.length - 1];
      if (Math.hypot(pt[0] - prev[0], pt[1] - prev[1]) > 1e-6) {
        cleaned.push(pt);
      }
    }
  }
  if (cleaned.length > 2) {
    const first = cleaned[0];
    const last = cleaned[cleaned.length - 1];
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) <= 1e-6) {
      cleaned.pop();
    }
  }
  return cleaned;
}

/**
 * Mengubah satu fitur GeoJSON (Polygon atau MultiPolygon beserta holes)
 * menjadi THREE.ExtrudeGeometry dengan tinggi dasar 0.25 dan bevel halus.
 */
export function buildRegionExtrudeGeometry(
  feature: GeoJSONFeature,
  regionId: string
): ProcessedRegionGeometry {
  const polygons: PolygonCoords[] =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

  const shapes: THREE.Shape[] = [];
  const outlineSegments: number[] = [];

  let largestArea = -1;
  let mainCentroidX = 0;
  let mainCentroidY = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const poly of polygons) {
    if (!poly || poly.length === 0) continue;

    const outerRingRaw = poly[0];
    if (!outerRingRaw || outerRingRaw.length < 3) continue;

    const projectedOuter = sanitizeProjectedRing(
      outerRingRaw.map(([lon, lat]) => projectLonLat(lon, lat))
    );
    if (projectedOuter.length < 3) continue;

    const { area, cx, cy } = computeRingSignedAreaAndCentroid(projectedOuter);
    if (area > largestArea) {
      largestArea = area;
      mainCentroidX = cx;
      mainCentroidY = cy;
    }

    const shape = new THREE.Shape();
    projectedOuter.forEach(([x, y], idx) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (idx === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }

      const next = projectedOuter[(idx + 1) % projectedOuter.length];
      // Garis tepi permukaan atas pada bidang XZ dunia
      outlineSegments.push(x, BASE_EXTRUDE_HEIGHT + 0.03, -y);
      outlineSegments.push(next[0], BASE_EXTRUDE_HEIGHT + 0.03, -next[1]);
    });
    shape.closePath();

    // Tangani lubang (holes) jika ada pada Polygon
    for (let h = 1; h < poly.length; h++) {
      const holeRingRaw = poly[h];
      if (!holeRingRaw || holeRingRaw.length < 3) continue;
      const projectedHole = sanitizeProjectedRing(
        holeRingRaw.map(([lon, lat]) => projectLonLat(lon, lat))
      );
      if (projectedHole.length < 3) continue;
      const holePath = new THREE.Path();
      projectedHole.forEach(([hx, hy], idx) => {
        if (idx === 0) {
          holePath.moveTo(hx, hy);
        } else {
          holePath.lineTo(hx, hy);
        }
      });
      holePath.closePath();
      shape.holes.push(holePath);
    }

    shapes.push(shape);
  }

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: BASE_EXTRUDE_HEIGHT,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.016,
    bevelOffset: 0,
    bevelSegments: 2,
    curveSegments: 4
  };

  const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
  geometry.computeVertexNormals();

  const spanX = Number.isFinite(maxX - minX) ? maxX - minX : 0.5;
  const spanY = Number.isFinite(maxY - minY) ? maxY - minY : 0.5;
  const boundsRadius = Math.max(0.25, Math.hypot(spanX, spanY) * 0.5);

  return {
    id: regionId,
    geometry,
    topOutlinePositions: new Float32Array(outlineSegments),
    centroid: [mainCentroidX, -mainCentroidY],
    boundsRadius
  };
}
