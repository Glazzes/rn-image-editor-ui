import {Dimension, Vector} from '../utils/types';

export const clamp = (
  value: number,
  lowerBound: number,
  upperBound: number,
) => {
  'worklet';
  return Math.max(lowerBound, Math.min(value, upperBound));
};

type ClampSelectionOptions = {
  translate: Vector<number>;
  selectionDimensions: Dimension;
  imageDimensions: Dimension;
  scale: number;
};

export const clampSelectionBoundaries = (
  options: ClampSelectionOptions,
): Vector<number> => {
  'worklet';
  const {translate, selectionDimensions, imageDimensions, scale} = options;

  const offsetY =
    (imageDimensions.height * scale - selectionDimensions.height) / 2;

  const offsetX =
    (imageDimensions.width * scale - selectionDimensions.width) / 2;

  const clamppedX = clamp(translate.x, -offsetX, offsetX);
  const clamppedY = clamp(translate.y, -offsetY, offsetY);

  return {
    x: clamppedX,
    y: clamppedY,
  };
};
