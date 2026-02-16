import type { AppPhase, Flow, Point2D } from './types';
import { Nodo } from './nodo';
import { Tangent } from './tangent';
import { Contour } from './contour';
import { computeTangents, filterTangentsByFlow } from '../math/tangent-calc';

export class AppState {
  rows = 4;
  cols = 4;
  radiusRatio = 0.40;
  showNodos = true;
  phase: AppPhase = 'idle';

  nodos: Nodo[][] = [];
  activeNodo: Nodo | null = null;
  targetNodo: Nodo | null = null;
  previewTangents: Tangent[] = [];
  contours: Contour[] = [];
  currentContour: Contour | null = null;

  _onChange: (() => void) | null = null;

  setOnChange(fn: () => void): void {
    this._onChange = fn;
  }

  triggerRender(): void {
    this._onChange?.();
  }

  buildGrid(): void {
    this.nodos = [];
    for (let i = 0; i < this.rows; i++) {
      const row: Nodo[] = [];
      for (let j = 0; j < this.cols; j++) {
        row.push(new Nodo(i, j));
      }
      this.nodos.push(row);
    }
    this.clearInteraction();
    this.triggerRender();
  }

  getSpacing(canvasSize: number): number {
    const gridMax = Math.max(this.rows, this.cols);
    return canvasSize / (gridMax + 1);
  }

  getRadius(canvasSize: number): number {
    return (this.getSpacing(canvasSize) / 2) * this.radiusRatio;
  }

  getOffset(canvasSize: number): { offsetX: number; offsetY: number } {
    const spacing = this.getSpacing(canvasSize);
    return {
      offsetX: (canvasSize - (this.cols - 1) * spacing) / 2,
      offsetY: (canvasSize - (this.rows - 1) * spacing) / 2,
    };
  }

  getNodoCenter(nodo: Nodo, canvasSize: number): Point2D {
    const spacing = this.getSpacing(canvasSize);
    const { offsetX, offsetY } = this.getOffset(canvasSize);
    return nodo.center(spacing, offsetX, offsetY);
  }

  clearInteraction(): void {
    this.phase = 'idle';
    this.activeNodo = null;
    this.targetNodo = null;
    this.previewTangents = [];
    this.currentContour = null;
    for (const row of this.nodos) {
      for (const nodo of row) {
        nodo.state = 'idle';
      }
    }
    this.markUsedNodos();
    this.triggerRender();
  }

  clearAll(): void {
    this.contours = [];
    this.clearInteraction();
  }

  private markUsedNodos(): void {
    const usedKeys = new Set<string>();
    for (const contour of this.contours) {
      for (const seg of contour.segments) {
        usedKeys.add(seg.nodoA.key);
        usedKeys.add(seg.nodoB.key);
      }
    }
    for (const row of this.nodos) {
      for (const nodo of row) {
        if (nodo.state === 'idle' && usedKeys.has(nodo.key)) {
          nodo.state = 'used';
        }
      }
    }
  }

  setActive(nodo: Nodo): void {
    this.clearNodoStates();
    this.activeNodo = nodo;
    this.targetNodo = null;
    this.previewTangents = [];
    nodo.state = 'active';
    this.phase = 'active_set';

    if (!this.currentContour) {
      this.currentContour = new Contour();
    }

    this.markUsedNodos();
    this.triggerRender();
  }

  setTarget(nodo: Nodo, canvasSize: number): void {
    if (!this.activeNodo || nodo === this.activeNodo) return;

    this.targetNodo = nodo;
    nodo.state = 'target';
    this.phase = 'target_set';

    const centerA = this.getNodoCenter(this.activeNodo, canvasSize);
    const centerB = this.getNodoCenter(nodo, canvasSize);
    const radius = this.getRadius(canvasSize);

    const rawTangents = computeTangents(centerA, centerB, radius);

    const requiredFlow = this.getRequiredFlow();
    const filtered = filterTangentsByFlow(rawTangents, requiredFlow);

    this.previewTangents = filtered.map(
      (t) => new Tangent(this.activeNodo!, nodo, t.pA, t.pB, t.kind, t.flowA, t.flowB),
    );

    this.triggerRender();
  }

  private getRequiredFlow(): Flow | null {
    if (!this.currentContour || this.currentContour.isEmpty) return null;
    return this.currentContour.lastSegment!.flowB;
  }

  selectTangent(tangent: Tangent): void {
    if (!this.currentContour) return;

    this.currentContour.addSegment(tangent);

    const firstNodo = this.currentContour.firstSegment!.nodoA;
    if (tangent.nodoB === firstNodo && this.currentContour.segments.length >= 2) {
      // Check flow continuity for closing
      const firstFlow = this.currentContour.firstSegment!.flowA;
      if (tangent.flowB === firstFlow) {
        this.currentContour.closed = true;
        this.contours.push(this.currentContour);
        this.currentContour = null;
        this.phase = 'idle';
        this.activeNodo = null;
        this.targetNodo = null;
        this.previewTangents = [];
        this.clearNodoStates();
        this.markUsedNodos();
        this.triggerRender();
        return;
      }
    }

    // Target becomes new active
    this.previewTangents = [];
    this.targetNodo = null;
    this.clearNodoStates();
    this.activeNodo = tangent.nodoB;
    tangent.nodoB.state = 'active';
    this.phase = 'active_set';
    this.markUsedNodos();
    this.triggerRender();
  }

  private clearNodoStates(): void {
    for (const row of this.nodos) {
      for (const nodo of row) {
        nodo.state = 'idle';
      }
    }
  }

  setRows(n: number): void {
    if (n < 2 || n > 10) return;
    if (this.wouldRemoveUsedNodos(n, this.cols)) return;
    this.rows = n;
    this.buildGrid();
  }

  setCols(n: number): void {
    if (n < 2 || n > 10) return;
    if (this.wouldRemoveUsedNodos(this.rows, n)) return;
    this.cols = n;
    this.buildGrid();
  }

  private wouldRemoveUsedNodos(newRows: number, newCols: number): boolean {
    for (const contour of this.contours) {
      for (const seg of contour.segments) {
        if (seg.nodoA.i >= newRows || seg.nodoA.j >= newCols) return true;
        if (seg.nodoB.i >= newRows || seg.nodoB.j >= newCols) return true;
      }
    }
    return false;
  }

  setRadiusRatio(ratio: number): void {
    this.radiusRatio = Math.max(0.05, Math.min(0.95, ratio));
    this.triggerRender();
  }

  isFirstNodo(nodo: Nodo): boolean {
    if (!this.currentContour || this.currentContour.isEmpty) return false;
    return this.currentContour.firstSegment!.nodoA === nodo;
  }

  generateRandom(canvasSize: number): void {
    this.clearAll();

    const allNodos = this.nodos.flat();
    if (allNodos.length < 3) return;

    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = this.tryBuildRandomContour(allNodos, canvasSize);
      if (result) {
        this.contours.push(result);
        this.clearNodoStates();
        this.markUsedNodos();
        this.triggerRender();
        return;
      }
    }
    this.triggerRender();
  }

  private tryBuildRandomContour(allNodos: Nodo[], canvasSize: number): Contour | null {
    const contour = new Contour();
    const pathLength = 3 + Math.floor(Math.random() * (Math.min(allNodos.length, 8) - 2));

    const startNodo = allNodos[Math.floor(Math.random() * allNodos.length)];
    let currentNodo = startNodo;
    let requiredFlow: Flow | null = null;

    for (let step = 0; step < pathLength; step++) {
      const isClosing = step === pathLength - 1;
      const targetNodo = isClosing ? startNodo : this.pickRandomTarget(currentNodo, allNodos);
      if (!targetNodo || targetNodo === currentNodo) return null;

      const centerA = this.getNodoCenter(currentNodo, canvasSize);
      const centerB = this.getNodoCenter(targetNodo, canvasSize);
      const radius = this.getRadius(canvasSize);

      const rawTangents = computeTangents(centerA, centerB, radius);
      const filtered = filterTangentsByFlow(rawTangents, requiredFlow);
      if (filtered.length === 0) return null;

      // For closing step, also check that flowB matches first segment's flowA
      let candidates = filtered;
      if (isClosing && contour.firstSegment) {
        const firstFlow = contour.firstSegment.flowA;
        candidates = filtered.filter((t) => t.flowB === firstFlow);
        if (candidates.length === 0) return null;
      }

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const tangent = new Tangent(
        currentNodo, targetNodo,
        chosen.pA, chosen.pB, chosen.kind, chosen.flowA, chosen.flowB,
      );

      contour.addSegment(tangent);
      requiredFlow = chosen.flowB;
      currentNodo = targetNodo;
    }

    contour.closed = true;
    return contour;
  }

  private pickRandomTarget(current: Nodo, allNodos: Nodo[]): Nodo | null {
    const others = allNodos.filter((n) => n !== current);
    if (others.length === 0) return null;
    return others[Math.floor(Math.random() * others.length)];
  }
}
