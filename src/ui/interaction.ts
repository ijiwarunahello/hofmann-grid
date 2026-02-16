import type { AppState } from '../model/app-state';
import type { Nodo } from '../model/nodo';
import type { Tangent } from '../model/tangent';

export class InteractionHandler {
  state: AppState;
  getCanvasSize: () => number;

  constructor(state: AppState, getCanvasSize: () => number) {
    this.state = state;
    this.getCanvasSize = getCanvasSize;
  }

  onNodoClick(nodo: Nodo): void {
    switch (this.state.phase) {
      case 'idle':
        this.state.setActive(nodo);
        break;

      case 'active_set':
        if (nodo === this.state.activeNodo) {
          this.state.clearInteraction();
        } else {
          this.state.setTarget(nodo, this.getCanvasSize());
        }
        break;

      case 'target_set':
        if (nodo === this.state.targetNodo) {
          if (this.state.targetNodo) {
            this.state.targetNodo.state = 'idle';
          }
          this.state.targetNodo = null;
          this.state.previewTangents = [];
          this.state.phase = 'active_set';
          this.state.setActive(this.state.activeNodo!);
        } else if (nodo === this.state.activeNodo) {
          this.state.clearInteraction();
        } else {
          if (this.state.targetNodo) {
            this.state.targetNodo.state = 'idle';
          }
          this.state.setTarget(nodo, this.getCanvasSize());
        }
        break;
    }
  }

  onNodoEnter(nodo: Nodo): void {
    if (nodo.state === 'idle' || nodo.state === 'used') {
      nodo.state = 'hover';
      this.state.triggerRender();
    }
  }

  onNodoLeave(nodo: Nodo): void {
    if (nodo.state === 'hover') {
      const isUsed = this.state.contours.some((c) =>
        c.segments.some((s) => s.nodoA.key === nodo.key || s.nodoB.key === nodo.key),
      );
      nodo.state = isUsed ? 'used' : 'idle';
      this.state.triggerRender();
    }
  }

  onTangentClick(tangent: Tangent): void {
    if (this.state.phase === 'target_set') {
      this.state.selectTangent(tangent);
    }
  }

  onEscape(): void {
    if (this.state.phase !== 'idle') {
      this.state.clearInteraction();
    }
  }
}
