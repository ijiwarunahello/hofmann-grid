import type { Tangent } from './tangent';

export class Contour {
  readonly segments: Tangent[] = [];
  closed = false;

  addSegment(tangent: Tangent): void {
    this.segments.push(tangent);
  }

  get isEmpty(): boolean {
    return this.segments.length === 0;
  }

  get lastSegment(): Tangent | null {
    return this.segments.length > 0 ? this.segments[this.segments.length - 1] : null;
  }

  get firstSegment(): Tangent | null {
    return this.segments.length > 0 ? this.segments[0] : null;
  }
}
