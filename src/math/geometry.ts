import type { Point2D } from '../model/types';

export function add(a: Point2D, b: Point2D): Point2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Point2D, b: Point2D): Point2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(p: Point2D, s: number): Point2D {
  return { x: p.x * s, y: p.y * s };
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angle(a: Point2D, b: Point2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function rotatePoint(p: Point2D, theta: number): Point2D {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  };
}

export function normalizeAngle(a: number): number {
  let result = a % (2 * Math.PI);
  if (result < 0) result += 2 * Math.PI;
  return result;
}

export function angleDiff(from: number, to: number): number {
  let diff = normalizeAngle(to) - normalizeAngle(from);
  if (diff < 0) diff += 2 * Math.PI;
  return diff;
}
