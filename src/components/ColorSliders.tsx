import {View, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import {useComputedValue, useValue} from '@shopify/react-native-skia';
import {useSharedValue} from 'react-native-reanimated';
import {rgbToHex} from '../utils/colors';
import ChannelSlider from './ChannelSlider';
import ReanimatedInput from './ReanimatedInput';
import {useFonts, unloadAsync} from 'expo-font';

type ColorSlidersProps = {};

const FONT = {UberBold: require('../assets/UberBold.otf')};

const ColorSliders: React.FC<ColorSlidersProps> = ({}) => {
  const [isLoaded] = useFonts(FONT);

  const currentHexColor = useSharedValue<string>('#000000');
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

  const onChangeText = (hexColor: string) => {
    const regex = new RegExp(/^([A-F\d]{3}|([A-F\d]{6}))$/gi);
    const isValid = regex.test(hexColor);
    if (!isValid) {
      return;
    }
  };

  useComputedValue(() => {
    const hexColor = rgbToHex({
      r: r.current,
      g: g.current,
      b: b.current,
    });

    currentHexColor.value = hexColor;
  }, [r, g, b]);

  useEffect(() => {
    unloadAsync(FONT);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={styles.root}>
      <ChannelSlider channel={'r'} {...sliderProps} />
      <ChannelSlider channel={'g'} {...sliderProps} />
      <ChannelSlider channel={'b'} {...sliderProps} />
      <ReanimatedInput text={currentHexColor} onChangeText={onChangeText} />
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
