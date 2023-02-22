import {Dimension} from './types';

/**
 * Turns the size of a reactangle into their respective width and height when rotated by a given
 * angle
 * @param {Vector<number>} dimensios
 * @param {Number} angle
 * @returns {Dimension}
 */
export const rotateDimensions = (
  dimensios: Dimension,
  angle: number,
): Dimension => {
  'worklet';
  const absAngle = Math.abs(angle);
  const width =
    dimensios.height * Math.sin(absAngle) +
    dimensios.width * Math.cos(absAngle);

  const height =
    dimensios.height * Math.cos(absAngle) +
    dimensios.width * Math.sin(absAngle);

  return {
    width,
    height,
  };
};
