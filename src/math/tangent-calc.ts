import type { Point2D, TangentEndpoints, TangentKind, Flow } from '../model/types';
import { midpoint, distance, angle, rotatePoint, add } from './geometry';

export interface TangentResult {
  pA: Point2D;
  pB: Point2D;
  kind: TangentKind;
  flowA: Flow;
  flowB: Flow;
}

function computeNormalizedTangents(d: number, r: number): TangentEndpoints[] {
  const results: TangentEndpoints[] = [];

  // External tangents (straight / parallel)
  // OO: upper parallel — both tangent points on "outside" (negative y)
  results.push({
    pA: { x: -d, y: -r },
    pB: { x: d, y: -r },
    kind: 'OO',
  });
  // AA: lower parallel — both tangent points on "anti" side (positive y)
  results.push({
    pA: { x: -d, y: r },
    pB: { x: d, y: r },
    kind: 'AA',
  });

  // Internal tangents (diagonal / crossing)
  // Only exist when circles don't overlap: d > r
  if (d > r + 1e-9) {
    const m = Math.sqrt((r * r) / (d * d - r * r));
    const xVal = d / (1 + m * m);
    const yVal = m * xVal;

    // OA: tangent from outside of A-circle to anti-side of B-circle
    results.push({
      pA: { x: -xVal, y: -yVal },
      pB: { x: xVal, y: yVal },
      kind: 'OA',
    });
    // AO: tangent from anti-side of A-circle to outside of B-circle
    results.push({
      pA: { x: -xVal, y: yVal },
      pB: { x: xVal, y: -yVal },
      kind: 'AO',
    });
  }

  return results;
}

function flowFromKind(kind: TangentKind): { flowA: Flow; flowB: Flow } {
  switch (kind) {
    case 'OO': return { flowA: 'O', flowB: 'O' };
    case 'AA': return { flowA: 'A', flowB: 'A' };
    case 'OA': return { flowA: 'O', flowB: 'A' };
    case 'AO': return { flowA: 'A', flowB: 'O' };
  }
}

export function computeTangents(
  centerA: Point2D,
  centerB: Point2D,
  radius: number,
): TangentResult[] {
  const mid = midpoint(centerA, centerB);
  const d = distance(centerA, centerB) / 2;
  const theta = angle(centerA, centerB);

  if (d < 1e-9) return [];

  const normalized = computeNormalizedTangents(d, radius);

  return normalized.map((t) => {
    const pA = add(rotatePoint(t.pA, theta), mid);
    const pB = add(rotatePoint(t.pB, theta), mid);
    const { flowA, flowB } = flowFromKind(t.kind);
    return { pA, pB, kind: t.kind, flowA, flowB };
  });
}

export function computeTangentByKind(
  centerA: Point2D,
  centerB: Point2D,
  radius: number,
  kind: TangentKind,
): { pA: Point2D; pB: Point2D } | null {
  const mid = midpoint(centerA, centerB);
  const d = distance(centerA, centerB) / 2;
  const theta = angle(centerA, centerB);

  if (d < 1e-9) return null;

  const normalized = computeNormalizedTangents(d, radius);
  const match = normalized.find((t) => t.kind === kind);
  if (!match) return null;

  return {
    pA: add(rotatePoint(match.pA, theta), mid),
    pB: add(rotatePoint(match.pB, theta), mid),
  };
}

export function filterTangentsByFlow(
  tangents: TangentResult[],
  requiredFlowA: Flow | null,
): TangentResult[] {
  if (requiredFlowA === null) return tangents;
  return tangents.filter((t) => t.flowA === requiredFlowA);
}
