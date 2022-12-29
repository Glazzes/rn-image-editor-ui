import {Vector} from './types';

type StickerInfo = {
  radius: number;
  angle: number;
};

type StickerInfoOptions = {
  stickerPosition: Vector<number>;
  absolutePosition: Vector<number>;
  radius: number;
};

export const getStickerInfo = (options: StickerInfoOptions): StickerInfo => {
  'worklet';
  const {stickerPosition, absolutePosition, radius} = options;
  const relativeX = absolutePosition.x - stickerPosition.x;
  const relativeY = -1 * (absolutePosition.y - stickerPosition.y);

  const newRadius = Math.sqrt(relativeX ** 2 + relativeY ** 2);
  const clampedRadius = Math.max(radius / 2, newRadius);
  const angle = Math.atan2(relativeY, relativeX);

  return {
    radius: clampedRadius,
    angle: angle,
  };
};
