import type { Point2D, Flow, TangentKind } from './types';
import type { Nodo } from './nodo';

export class Tangent {
  readonly nodoA: Nodo;
  readonly nodoB: Nodo;
  readonly pA: Point2D;
  readonly pB: Point2D;
  readonly kind: TangentKind;
  readonly flowA: Flow;
  readonly flowB: Flow;

  constructor(
    nodoA: Nodo,
    nodoB: Nodo,
    pA: Point2D,
    pB: Point2D,
    kind: TangentKind,
    flowA: Flow,
    flowB: Flow,
  ) {
    this.nodoA = nodoA;
    this.nodoB = nodoB;
    this.pA = pA;
    this.pB = pB;
    this.kind = kind;
    this.flowA = flowA;
    this.flowB = flowB;
  }
}
