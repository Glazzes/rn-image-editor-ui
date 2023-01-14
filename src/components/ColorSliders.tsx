import {View, StyleSheet, TextInput} from 'react-native';
import React from 'react';
import {
  Canvas,
  Fill,
  useComputedValue,
  useValue,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {rgbToHex} from '../utils/colors';
import ChannelSlider from './ChannelSlider';

type ColorSlidersProps = {};

Animated.addWhitelistedNativeProps({text: true});
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ColorSliders: React.FC<ColorSlidersProps> = ({}) => {
  const currentHexColor = useSharedValue<string>('#000000');
  const animatedProps = useAnimatedProps(() => {
    return {
      text: currentHexColor.value,
    } as any;
  });

  const r = useValue<number>(0);
  const g = useValue<number>(0);
  const b = useValue<number>(0);
  const a = useValue<number>(1);

  const currentColor = useComputedValue(() => {
    return `rgba(${r.current}, ${g.current}, ${b.current}, 1)`;
  }, [r, g, b, a]);

  const sliderProps = {
    currentColor,
    r,
    g,
    b,
    a,
  };

  useComputedValue(() => {
    const hexColor = rgbToHex({
      r: r.current,
      g: g.current,
      b: b.current,
    });

    currentHexColor.value = hexColor;
  }, [r, g, b]);

  return (
    <View style={styles.root}>
      <ChannelSlider channel={'r'} {...sliderProps} />
      <ChannelSlider channel={'g'} {...sliderProps} />
      <ChannelSlider channel={'b'} {...sliderProps} />
      <ChannelSlider channel={'a'} {...sliderProps} />
      <AnimatedTextInput editable={false} animatedProps={animatedProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ColorSliders;
