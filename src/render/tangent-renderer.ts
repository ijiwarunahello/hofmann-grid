import type { AppState } from '../model/app-state';
import type { Tangent } from '../model/tangent';
import type { SvgRenderer } from './svg-renderer';
import { createSvgElement } from './svg-renderer';

export function renderTangents(
  state: AppState,
  renderer: SvgRenderer,
  callbacks: {
    onTangentClick: (tangent: Tangent) => void;
  },
): void {
  renderer.clearLayer(renderer.tangentLayer);

  for (const tangent of state.previewTangents) {
    const d = `M ${tangent.pA.x} ${tangent.pA.y} L ${tangent.pB.x} ${tangent.pB.y}`;

    const visibleLine = createSvgElement('path', {
      d,
      class: 'tangent-line',
    });

    const hitArea = createSvgElement('path', {
      d,
      class: 'tangent-hit',
    });

    hitArea.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onTangentClick(tangent);
    });

    hitArea.addEventListener('mouseenter', () => {
      visibleLine.classList.add('tangent-line--hover');
    });
    hitArea.addEventListener('mouseleave', () => {
      visibleLine.classList.remove('tangent-line--hover');
    });

    renderer.tangentLayer.appendChild(visibleLine);
    renderer.tangentLayer.appendChild(hitArea);
  }
}
