import {StyleSheet, View, ViewStyle} from 'react-native';
import React from 'react';
import {Canvas, Fill, Shader, Skia} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  denormalize,
  hsl2rgb,
  hsl2xy,
  rgbToString,
  xy2hsl,
} from '../utils/colors';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useVector} from '../utils/useVector';
import {clamp} from './clampSelectionBoundaries';
import {Vector} from '../utils/types';
import {PICKER_HEIGHT, PICKER_WIDTH} from './colorPicker/constants';

type HSLSpectrumProps = {
  currentColor: Animated.SharedValue<string>;
};

const INDICATOR_SIZE = 30;
const PADDING = 16;

// Formula from https://www.had2know.org/technology/hsl-rgb-color-converter.html
const shader = Skia.RuntimeEffect.Make(`
  uniform float width;
  uniform float height;

  vec3 hsl2rgb(float h, float s, float l) {
    float d = s * (1.0 - abs(2.0 * l - 1.0));
    float m = l - d / 2.0;
    float x = d * (1.0 - abs(mod((h / 60), 2.0) - 1.0));

    if(h >= 0.0 && h <= 60) {
      return vec3(d + m, x + m, m);
    } else if (h >= 60 && h <= 120) {
      return vec3(x + m, d + m, m);
    } else if (h >= 120 && h <= 180) {
      return vec3(m, d + m, x + m);
    } else if (h >= 180 && h <= 240) {
      return vec3(m, x + m, d + m);
    } else if(h >= 240 && h <= 300) {
      return vec3(x + m, m, d + m);
    } else {
      return vec3(d + m, m, x + m);
    }
  }

  vec4 main(vec2 xy) {
    float hue = 360 * (xy.y / height);
    float saturation = 1.0;
    float luminosity = 1.0 - (xy.x / width);

    vec3 color = hsl2rgb(hue, saturation, luminosity);
    return vec4(color, 1.0);
  }`)!;

const HSLSpectrum: React.FC<HSLSpectrumProps> = ({currentColor}) => {
  const canvasStyles: ViewStyle = {
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
  };

  const translate = useVector(0);
  const offset = useVector(0);

  const translation = useDerivedValue<Vector<number>>(() => {
    const offsetX = PICKER_WIDTH / 2 - INDICATOR_SIZE / 2;
    const offsetY = PICKER_HEIGHT / 2 - INDICATOR_SIZE / 2;
    const x = clamp(translate.x.value, -offsetX, offsetX);
    const y = clamp(translate.y.value, -offsetY, offsetY);

    return {x, y};
  }, [translate]);

  const activeColor = useDerivedValue<string>(() => {
    const color = xy2hsl(
      {
        x: translation.value.x + PICKER_WIDTH / 2 - INDICATOR_SIZE / 2,
        y: translation.value.y + PICKER_WIDTH / 2 - INDICATOR_SIZE / 2,
      },
      {
        width: PICKER_WIDTH,
        height: PICKER_HEIGHT,
      },
    );

    const rgb = hsl2rgb(color);
    const denormalized = denormalize(rgb);
    return rgbToString(denormalized);
  }, [translation]);

  const pan = Gesture.Pan()
    .hitSlop(20)
    .onBegin(_ => {
      offset.x.value = translation.value.x;
      offset.y.value = translation.value.y;
    })
    .onChange(e => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    });

  const colorIndicatorStyle = useAnimatedStyle(() => ({
    backgroundColor: activeColor.value,
    transform: [
      {translateX: translation.value.x},
      {translateY: translation.value.y},
    ],
  }));

  useAnimatedReaction(
    () => activeColor.value,
    value => {
      currentColor.value = value;
    },
    [activeColor],
  );

  return (
    <View style={styles.root}>
      <Canvas style={canvasStyles}>
        <Fill>
          <Shader
            source={shader}
            uniforms={{width: PICKER_WIDTH, height: PICKER_HEIGHT}}
          />
        </Fill>
      </Canvas>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.colorIndicator, colorIndicatorStyle]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: PADDING / 2,
    overflow: 'hidden',
  },
  colorIndicator: {
    position: 'absolute',
    height: INDICATOR_SIZE,
    width: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderColor: '#ffffff',
    borderWidth: 3,
  },
});

export default HSLSpectrum;
