import {Vector} from './types';

export const getAxisRotationOffset = (
  x: number,
  y: number,
  angle: number,
): Vector<number> => {
  'worklet';
  const deltaY = y + -1 * y * Math.cos(angle);
  const deltaX = x + -1 * x * Math.cos(angle);

  const offsetYForX = y * Math.sin(angle) - deltaX;
  const offsetXForY = -1 * x * Math.sin(angle) - deltaY;

  return {
    x: offsetYForX,
    y: offsetXForY,
  };
};
