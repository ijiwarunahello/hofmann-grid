export interface Point2D {
  x: number;
  y: number;
}

export type Flow = 'O' | 'A';

export type TangentKind = 'OO' | 'AA' | 'OA' | 'AO';

export type NodoState = 'idle' | 'hover' | 'active' | 'target' | 'used';

export type AppPhase = 'idle' | 'active_set' | 'target_set';

export interface TangentEndpoints {
  pA: Point2D;
  pB: Point2D;
  kind: TangentKind;
}
