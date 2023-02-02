import {Vector} from './types';

export const add = (u: Vector<number>, v: Vector<number>): Vector<number> => {
  'worklet';
  return {
    x: u.x + v.x,
    y: u.y + v.y,
  };
};

export const scale = (u: Vector<number>, scalar: number): Vector<number> => {
  return {
    x: u.x * scalar,
    y: u.y * scalar,
  };
};

export const magnitude = (u: Vector<number>): number => {
  'worklet';
  return Math.sqrt(u.x ** 2 + u.y ** 2);
};

export const normalize = (u: Vector<number>): Vector<number> => {
  'worklet';
  const h = magnitude(u);
  return {
    x: u.x / h,
    y: u.y / h,
  };
};

export const rotate = (u: Vector<number>, angle: number): Vector<number> => {
  'worklet';
  const x1 = u.x * Math.cos(angle) + u.y * -1 * Math.sin(angle);
  const y1 = u.x * Math.sin(angle) + u.y * Math.cos(angle);

  return {
    x: x1,
    y: y1,
  };
};

export const distance = (u: Vector<number>, v: Vector<number>): number => {
  'worklet';
  return Math.sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
};
