import {Vector} from './types';

export const getRotateTranslationDifference = (
  x: number,
  y: number,
  angle: number,
): Vector<number> => {
  'worklet';
  const diffY = y + -1 * y * Math.cos(angle);
  const diffX = x + -1 * x * Math.cos(angle);

  const originX = y * Math.sin(angle) - diffX;
  const originY = -1 * x * Math.sin(angle) - diffY;

  return {
    x: originX,
    y: originY,
  };
};
