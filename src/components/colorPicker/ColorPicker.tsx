import {useWindowDimensions, StyleSheet, View} from 'react-native';
import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import HSLSpectrum from '../HSLSpectrum';
import ColorGrid from '../ColorGrid';
import ColorSliders from '../ColorSliders';

type ColorPickerProps = {
  startColor: string;
};

const PADDING = 16;

const ColorPicker: React.FC<ColorPickerProps> = ({startColor}) => {
  const {width} = useWindowDimensions();
  const styles = StyleSheet.create({
    root: {
      width: width * 3,
      flexDirection: 'row',
      backgroundColor: '#212121',
    },
    picker: {
      width,
      padding: PADDING,
    },
  });

  const currentColor = useSharedValue<string>(
    startColor ?? 'rgba(51, 102, 255, 1)',
  );

  const translateX = useSharedValue(-2 * width);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: -2 * width}],
    };
  });

  return (
    <Animated.View style={[styles.root, animatedStyle]}>
      <View style={styles.picker}>
        <ColorGrid />
      </View>
      <View style={styles.picker}>
        <HSLSpectrum currentColor={currentColor} />
      </View>
      <View style={styles.picker}>
        <ColorSliders />
      </View>
    </Animated.View>
  );
};

export default ColorPicker;
