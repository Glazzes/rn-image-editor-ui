import {useWindowDimensions, Animated} from 'react-native';
import React from 'react';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import HSLSpectrum from '../HSLSpectrum';

type ColorPickerProps = {
  startColor: string;
};

const ColorPicker: React.FC<ColorPickerProps> = ({startColor}) => {
  const {width} = useWindowDimensions();

  const currentColor = useSharedValue<string>(startColor);

  const translateX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: width * 3,
      transform: [{translateX: translateX.value}],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <HSLSpectrum currentColor={currentColor} />
    </Animated.View>
  );
};

export default ColorPicker;
