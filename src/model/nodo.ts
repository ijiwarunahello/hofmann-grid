import type { NodoState, Point2D } from './types';

export class Nodo {
  readonly i: number;
  readonly j: number;
  state: NodoState = 'idle';

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }

  get key(): string {
    return `${this.i},${this.j}`;
  }

  center(spacing: number, offsetX: number, offsetY: number): Point2D {
    return {
      x: offsetX + this.j * spacing,
      y: offsetY + this.i * spacing,
    };
  }
}
