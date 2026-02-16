import type { AppState } from '../model/app-state';
import type { Nodo } from '../model/nodo';
import type { SvgRenderer } from './svg-renderer';
import { createSvgElement } from './svg-renderer';

export function renderNodos(
  state: AppState,
  renderer: SvgRenderer,
  callbacks: {
    onNodoClick: (nodo: Nodo) => void;
    onNodoEnter: (nodo: Nodo) => void;
    onNodoLeave: (nodo: Nodo) => void;
  },
): void {
  renderer.clearLayer(renderer.nodoLayer);
  const canvasSize = renderer.getCanvasSize();
  const radius = state.getRadius(canvasSize);

  for (const row of state.nodos) {
    for (const nodo of row) {
      const center = state.getNodoCenter(nodo, canvasSize);

      const circle = createSvgElement('circle', {
        cx: String(center.x),
        cy: String(center.y),
        r: String(radius),
        class: state.showNodos ? `nodo nodo--${nodo.state}` : 'nodo nodo--hidden',
      });

      circle.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onNodoClick(nodo);
      });
      circle.addEventListener('mouseenter', () => callbacks.onNodoEnter(nodo));
      circle.addEventListener('mouseleave', () => callbacks.onNodoLeave(nodo));

      renderer.nodoLayer.appendChild(circle);
    }
  }
}
