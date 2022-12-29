import Animated from 'react-native-reanimated';

type Vector<T> = {
  x: T;
  y: T;
};

type Coordiantes = {
  x: number;
  y: number;
};

type PinchEvent = {
  focalX: number;
  focalY: number;
  scale: number;
};

type PinchOptions = {
  event: PinchEvent;
  center: Coordiantes;
  origin: Vector<Animated.SharedValue<number>>;
  offset: Coordiantes;
  canAssignOrigin: Animated.SharedValue<boolean>;
};

export const pinch = (options: PinchOptions) => {
  'worklet';
  const {event, center, origin, offset, canAssignOrigin} = options;
  const adjustedFocalX = event.focalX - (center.x + offset.x);
  const adjustedFocalY = event.focalY - (center.y + offset.y);

  if (canAssignOrigin.value) {
    origin.x.value = adjustedFocalX;
    origin.y.value = adjustedFocalY;
    canAssignOrigin.value = false;
  }

  const pinchX = adjustedFocalX - origin.x.value;
  const pinchY = adjustedFocalY - origin.y.value;

  const translateX =
    pinchX + origin.x.value + -1 * event.scale * origin.x.value;

  const translateY =
    pinchY + origin.y.value + -1 * event.scale * origin.y.value;

  return {translateX, translateY};
};
