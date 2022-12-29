import Animated, {useSharedValue} from 'react-native-reanimated';
import {TypeDimensions, Vector} from './types';

export const useVector = (
  x: number,
  y: number,
): Vector<Animated.SharedValue<number>> => {
  const valueX = useSharedValue<number>(x);
  const valueY = useSharedValue<number>(y);

  return {x: valueX, y: valueY};
};

export const useDimensions = (
  width: number,
  height: number,
): TypeDimensions<Animated.SharedValue<number>> => {
  const widthValue = useSharedValue<number>(width);
  const heightValue = useSharedValue<number>(height);

  return {
    width: widthValue,
    height: heightValue,
  };
};
