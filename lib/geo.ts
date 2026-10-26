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
  // Geometri 3 lapisan diorama kertas (papercut)
  geometry: THREE.ExtrudeGeometry;
  layerBaseGeometry: THREE.ExtrudeGeometry;
  layerMiddleGeometry: THREE.ExtrudeGeometry;
  layerTopGeometry: THREE.ExtrudeGeometry;
  baseOutlinePositions: Float32Array;
  middleOutlinePositions: Float32Array;
  topOutlinePositions: Float32Array;
  centroid: [number, number]; // [worldX, worldZ]
  boundsRadius: number;
}

// Pusat geografis Aceh untuk proyeksi equirectangular lokal
const ACEH_CENTER_LON = 96.65;
const ACEH_CENTER_LAT = 4.15;
const MAP_SCALE = 2.65;
const COS_LAT = Math.cos((ACEH_CENTER_LAT * Math.PI) / 180);

// Ketebalan tiap lapisan diorama kertas (papercut)
export const LAYER_BASE_HEIGHT = 0.11;
export const LAYER_MIDDLE_HEIGHT = 0.10;
export const LAYER_TOP_HEIGHT = 0.09;
export const BASE_EXTRUDE_HEIGHT =
  LAYER_BASE_HEIGHT + LAYER_MIDDLE_HEIGHT + LAYER_TOP_HEIGHT; // 0.30
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

function scaleRingAroundCenter(
  ring: Position2D[],
  cx: number,
  cy: number,
  scale: number
): Position2D[] {
  if (Math.abs(scale - 1) < 1e-5) return ring;
  return ring.map(([x, y]) => [cx + (x - cx) * scale, cy + (y - cy) * scale]);
}

/**
 * Mengubah satu fitur GeoJSON (Polygon atau MultiPolygon beserta holes)
 * menjadi 3 lapisan THREE.ExtrudeGeometry bergaya diorama kertas (papercut).
 */
export function buildRegionExtrudeGeometry(
  feature: GeoJSONFeature,
  regionId: string
): ProcessedRegionGeometry {
  const polygons: PolygonCoords[] =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

  const baseShapes: THREE.Shape[] = [];
  const middleShapes: THREE.Shape[] = [];
  const topShapes: THREE.Shape[] = [];

  const baseOutlineSegments: number[] = [];
  const middleOutlineSegments: number[] = [];
  const topOutlineSegments: number[] = [];

  let largestArea = -1;
  let mainCentroidX = 0;
  let mainCentroidY = 0;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const buildShapeFromRings = (
    outerRing: Position2D[],
    holeRings: Position2D[][],
    outlineOut: number[],
    outlineY: number
  ): THREE.Shape => {
    const shape = new THREE.Shape();
    outerRing.forEach(([x, y], idx) => {
      if (idx === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);

      const next = outerRing[(idx + 1) % outerRing.length];
      outlineOut.push(x, outlineY, -y);
      outlineOut.push(next[0], outlineY, -next[1]);
    });
    shape.closePath();

    for (const hRing of holeRings) {
      if (hRing.length < 3) continue;
      const holePath = new THREE.Path();
      hRing.forEach(([hx, hy], idx) => {
        if (idx === 0) holePath.moveTo(hx, hy);
        else holePath.lineTo(hx, hy);
      });
      holePath.closePath();
      shape.holes.push(holePath);
    }
    return shape;
  };

  for (const poly of polygons) {
    if (!poly || poly.length === 0) continue;

    const outerRingRaw = poly[0];
    if (!outerRingRaw || outerRingRaw.length < 3) continue;

    const projectedOuter = sanitizeProjectedRing(
      outerRingRaw.map(([lon, lat]) => projectLonLat(lon, lat))
    );
    if (projectedOuter.length < 3) continue;

    for (const [x, y] of projectedOuter) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const { area, cx, cy } = computeRingSignedAreaAndCentroid(projectedOuter);

    const projectedHoles: Position2D[][] = [];
    for (let h = 1; h < poly.length; h++) {
      const holeRingRaw = poly[h];
      if (!holeRingRaw || holeRingRaw.length < 3) continue;
      const cleanHole = sanitizeProjectedRing(
        holeRingRaw.map(([lon, lat]) => projectLonLat(lon, lat))
      );
      if (cleanHole.length >= 3) {
        projectedHoles.push(cleanHole);
      }
    }

    // Lapisan Dasar (Base Layer - 100%)
    baseShapes.push(
      buildShapeFromRings(
        projectedOuter,
        projectedHoles,
        baseOutlineSegments,
        LAYER_BASE_HEIGHT + 0.015
      )
    );

    // Lapisan Tengah (Middle Layer - 90% inset ke pusat poligon untuk efek potongan kertas)
    const middleOuter = scaleRingAroundCenter(projectedOuter, cx, cy, 0.90);
    const middleHoles = projectedHoles.map((hr) => scaleRingAroundCenter(hr, cx, cy, 0.90));
    middleShapes.push(
      buildShapeFromRings(
        middleOuter,
        middleHoles,
        middleOutlineSegments,
        LAYER_MIDDLE_HEIGHT + 0.015
      )
    );

    // Lapisan Atas (Top Layer - 80% inset ke pusat poligon)
    const topOuter = scaleRingAroundCenter(projectedOuter, cx, cy, 0.80);
    const topHoles = projectedHoles.map((hr) => scaleRingAroundCenter(hr, cx, cy, 0.80));
    topShapes.push(
      buildShapeFromRings(
        topOuter,
        topHoles,
        topOutlineSegments,
        LAYER_TOP_HEIGHT + 0.015
      )
    );

    if (area > largestArea) {
      largestArea = area;
      mainCentroidX = cx;
      mainCentroidY = cy;
    }
  }

  const makePaperExtrude = (
    shapes: THREE.Shape[],
    depth: number
  ): THREE.ExtrudeGeometry => {
    const geom = new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.009,
      bevelOffset: 0,
      bevelSegments: 1,
      curveSegments: 3
    });
    geom.computeVertexNormals();
    return geom;
  };

  const layerBaseGeometry = makePaperExtrude(baseShapes, LAYER_BASE_HEIGHT);
  const layerMiddleGeometry = makePaperExtrude(middleShapes, LAYER_MIDDLE_HEIGHT);
  const layerTopGeometry = makePaperExtrude(topShapes, LAYER_TOP_HEIGHT);

  const spanX = Number.isFinite(maxX - minX) ? maxX - minX : 0.5;
  const spanY = Number.isFinite(maxY - minY) ? maxY - minY : 0.5;
  const boundsRadius = Math.max(0.18, Math.hypot(spanX, spanY) * 0.5);

  return {
    id: regionId,
    geometry: layerBaseGeometry,
    layerBaseGeometry,
    layerMiddleGeometry,
    layerTopGeometry,
    baseOutlinePositions: new Float32Array(baseOutlineSegments),
    middleOutlinePositions: new Float32Array(middleOutlineSegments),
    topOutlinePositions: new Float32Array(topOutlineSegments),
    centroid: [mainCentroidX, -mainCentroidY],
    boundsRadius
  };
}
