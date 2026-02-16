import type { AppState } from '../model/app-state';
import type { Contour } from '../model/contour';
import type { Point2D, Flow } from '../model/types';
import type { Tangent } from '../model/tangent';
import type { SvgRenderer } from './svg-renderer';
import { createSvgElement } from './svg-renderer';
import { angle, angleDiff } from '../math/geometry';
import { computeTangentByKind } from '../math/tangent-calc';

function recomputeEndpoints(
  seg: Tangent,
  state: AppState,
  canvasSize: number,
): { pA: Point2D; pB: Point2D } {
  const centerA = state.getNodoCenter(seg.nodoA, canvasSize);
  const centerB = state.getNodoCenter(seg.nodoB, canvasSize);
  const radius = state.getRadius(canvasSize);
  const result = computeTangentByKind(centerA, centerB, radius, seg.kind);
  if (result) return result;
  return { pA: seg.pA, pB: seg.pB };
}

function buildContourPath(contour: Contour, state: AppState, canvasSize: number): string {
  const segments = contour.segments;
  if (segments.length === 0) return '';

  const radius = state.getRadius(canvasSize);
  const parts: string[] = [];

  const endpoints = segments.map((seg) => recomputeEndpoints(seg, state, canvasSize));

  parts.push(`M ${endpoints[0].pA.x} ${endpoints[0].pA.y}`);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const ep = endpoints[i];

    parts.push(`L ${ep.pB.x} ${ep.pB.y}`);

    const nextIdx = (i + 1) % segments.length;
    const hasNext = contour.closed ? true : nextIdx > i;

    if (hasNext && (contour.closed || nextIdx < segments.length)) {
      if (!contour.closed && nextIdx === 0) break;

      const nextEp = endpoints[nextIdx];
      const sharedCenter = state.getNodoCenter(seg.nodoB, canvasSize);
      const endPoint = nextEp.pA;

      const flowAtNode: Flow = seg.flowB;
      const sweepFlag = flowAtNode === 'O' ? 1 : 0;

      const angleStart = angle(sharedCenter, ep.pB);
      const angleEnd = angle(sharedCenter, endPoint);

      const positiveArc = angleDiff(angleStart, angleEnd);

      let arcAngle: number;
      if (sweepFlag === 1) {
        arcAngle = positiveArc < 1e-9 ? 2 * Math.PI : positiveArc;
      } else {
        const negativeArc = 2 * Math.PI - positiveArc;
        arcAngle = negativeArc < 1e-9 ? 2 * Math.PI : negativeArc;
      }
      const largeArcFlag = arcAngle > Math.PI ? 1 : 0;

      parts.push(
        `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`,
      );
    }
  }

  if (contour.closed) {
    parts.push('Z');
  }

  return parts.join(' ');
}

export function renderContours(state: AppState, renderer: SvgRenderer): void {
  renderer.clearLayer(renderer.contourLayer);
  const canvasSize = renderer.getCanvasSize();

  // Render completed contours
  for (const contour of state.contours) {
    const d = buildContourPath(contour, state, canvasSize);
    if (!d) continue;

    const path = createSvgElement('path', {
      d,
      class: contour.closed ? 'contour-path contour-path--closed' : 'contour-path',
    });
    renderer.contourLayer.appendChild(path);
  }

  // Render current (in-progress) contour
  if (state.currentContour && !state.currentContour.isEmpty) {
    const d = buildContourPath(state.currentContour, state, canvasSize);
    if (d) {
      const path = createSvgElement('path', {
        d,
        class: 'contour-path',
      });
      renderer.contourLayer.appendChild(path);
    }
  }
}
