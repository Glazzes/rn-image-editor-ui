/* eslint-disable react-hooks/exhaustive-deps */
import {View, StyleSheet, Text} from 'react-native';
import React, {useEffect} from 'react';
import {useComputedValue, useValue} from '@shopify/react-native-skia';
import {
  Extrapolate,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import {hex2RGB, rgb2Hex} from '../utils/colors';
import ChannelSlider from './ChannelSlider';
import ReanimatedInput from './ReanimatedInput';
import {useFonts} from 'expo-font';
import {
  CHANNEL_START_POINT,
  OPACITY_CHANNEL_END_POINT,
  OPACITY_SLIDER_WIDTH,
  positionOutputRange,
  SLIDER_WIDTH,
} from './sliders/constants';

type ColorSlidersProps = {};

const FONT = {UberBold: require('../assets/UberBold.otf')};

const startColor = '3366ff';

const ColorSliders: React.FC<ColorSlidersProps> = ({}) => {
  const [isLoaded] = useFonts(FONT);

  const text = useSharedValue<string>('000000');
  const isSliding = useSharedValue<boolean>(false);

  const translateR = useSharedValue<number>(CHANNEL_START_POINT);
  const translateG = useSharedValue<number>(CHANNEL_START_POINT);
  const translateB = useSharedValue<number>(CHANNEL_START_POINT);
  const translateA = useSharedValue<number>(OPACITY_CHANNEL_END_POINT);

  const currentHexColor = useSharedValue<string>('000000');
  const r = useValue<number>(0);
  const g = useValue<number>(0);
  const b = useValue<number>(0);
  const a = useValue<number>(1);

  const currentColor = useComputedValue(() => {
    return `rgba(${r.current}, ${g.current}, ${b.current}, 1)`;
  }, [r, g, b, a]);

  const sliderProps = {
    currentColor,
    isSliding,
    r,
    g,
    b,
    a,
  };

  const onChangeText = (hexColor: string) => {
    text.value = hexColor;
    const regex = new RegExp(/^#?([A-F\d]{6}|([A-F\d]{3}))$/gi);
    const isValidHexColor = regex.test(hexColor);
    if (!isValidHexColor) {
      return;
    }

    if (hexColor.length % 3 === 0) {
      const rgb = hex2RGB(hexColor);

      translateR.value = interpolate(
        rgb.r,
        [0, 255],
        positionOutputRange,
        Extrapolate.CLAMP,
      );

      translateG.value = interpolate(
        rgb.g,
        [0, 255],
        positionOutputRange,
        Extrapolate.CLAMP,
      );

      translateB.value = interpolate(
        rgb.b,
        [0, 255],
        positionOutputRange,
        Extrapolate.CLAMP,
      );
    }
  };

  useComputedValue(() => {
    const hexColor = rgb2Hex({
      r: r.current,
      g: g.current,
      b: b.current,
    });

    if (isSliding.value) {
      currentHexColor.value = hexColor.slice(1, hexColor.length);
    } else {
      currentHexColor.value = text.value;
    }
  }, [r, g, b]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const startRGB = hex2RGB(startColor);
    text.value = startColor;

    translateR.value = interpolate(
      startRGB.r,
      [0, 255],
      positionOutputRange,
      Extrapolate.CLAMP,
    );

    translateG.value = interpolate(
      startRGB.g,
      [0, 255],
      positionOutputRange,
      Extrapolate.CLAMP,
    );

    translateB.value = interpolate(
      startRGB.b,
      [0, 255],
      positionOutputRange,
      Extrapolate.CLAMP,
    );
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={styles.root}>
      <ChannelSlider
        channel={'r'}
        translateX={translateR}
        width={SLIDER_WIDTH}
        {...sliderProps}
      />
      <ChannelSlider
        channel={'g'}
        translateX={translateG}
        width={SLIDER_WIDTH}
        {...sliderProps}
      />
      <ChannelSlider
        channel={'b'}
        translateX={translateB}
        width={SLIDER_WIDTH}
        {...sliderProps}
      />
      <View style={styles.hexContainer}>
        <Text style={styles.hexTitle}>HEX COLOR #</Text>
        <View style={styles.inputContainer}>
          <ReanimatedInput
            text={currentHexColor}
            onChangeText={onChangeText}
            style={styles.hexInput}
          />
        </View>
      </View>
      <ChannelSlider
        channel={'a'}
        translateX={translateA}
        width={OPACITY_SLIDER_WIDTH}
        {...sliderProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#222121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  hexTitle: {
    fontFamily: 'UberBold',
    color: '#545454',
  },
  inputContainer: {
    marginLeft: 16,
    backgroundColor: '#545454',
    borderRadius: 10,
    width: 75,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexInput: {
    fontFamily: 'UberBold',
    color: '#fff',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    textAlign: 'center',
  },
});

export default ColorSliders;
