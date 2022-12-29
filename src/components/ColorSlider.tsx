import {View, Dimensions, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {
  Canvas,
  Circle,
  Fill,
  interpolateColors,
  LinearGradient,
  Path,
  RoundedRect,
  Skia,
  SkPath,
  useComputedValue,
  useSharedValueEffect,
  useTouchHandler,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {clamp} from './clampSelectionBoundaries';
import {useVector} from '../utils/useVector';

type ColorSliderProps = {};

type FreeHandStroke = {
  path: SkPath;
  color: Float32Array;
};

const {width, height} = Dimensions.get('window');
const HEIGHT = 15;
const SLIDER_WIDTH = width * 0.9;

const colors = [
  '#ea294b',
  '#e036ad',
  '#8746db',
  '#345de6',
  '#47b9ec',
  '#8bcb66',
  '#fddb64',
  '#fda152',
  '#030102',
  '#ffffff',
];

const COLOR_WIDTH = SLIDER_WIDTH / colors.length;
const colorInputRange = colors.map((_, index) => {
  return index * COLOR_WIDTH;
});

const ColorSlider: React.FC<ColorSliderProps> = ({}) => {
  const [strokes, setStrokes] = useState<FreeHandStroke[]>([]);

  const skiaTranslate = useValue<number>(-SLIDER_WIDTH / 2 + HEIGHT);
  const translate = useVector(-SLIDER_WIDTH / 2 + HEIGHT, 0);
  const offsetX = useSharedValue<number>(0);
  const scale = useSharedValue<number>(1);

  // logic stuff
  const removeLastStroke = () => {
    setStrokes(strks => {
      return strks.slice(0, strks.length - 1);
    });
  };

  // animation stuff
  const color = useComputedValue(() => {
    return interpolateColors(
      skiaTranslate.current + SLIDER_WIDTH / 2 - HEIGHT,
      colorInputRange,
      colors,
    );
  }, [skiaTranslate]);

  const translation = useDerivedValue<number>(() => {
    const offset = (width * 0.9) / 2 - HEIGHT;
    return clamp(translate.x.value, -offset, offset);
  }, [translate.x]);

  const scaleAndTranslate = (y: number, scaleValue: number) => {
    'worklet';
    const easing = y < 0 ? Easing.bezier(0.34, 1.56, 0.64, 1) : Easing.linear;
    const config = y < 0 ? undefined : {duration: 150};
    translate.y.value = withTiming(y, {easing, ...config});
    scale.value = withTiming(scaleValue);
  };

  const pan = Gesture.Pan()
    .onBegin(_ => {
      offsetX.value = translate.x.value;
      scaleAndTranslate(-65, 1.5);
    })
    .onChange(e => {
      translate.x.value = offsetX.value + e.translationX;
    })
    .onEnd(_ => {
      scaleAndTranslate(0, 1);
    });

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: translation.value},
        {translateY: translate.y.value},
        {scale: scale.value},
      ],
    };
  });

  useSharedValueEffect(() => {
    skiaTranslate.current = translate.x.value;
  }, translate.x);

  // shit to delete
  const touchHandler = useTouchHandler({
    onStart: ({x, y}) => {
      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);

      const drawing: FreeHandStroke = {
        path: newPath,
        color: color.current,
      };

      setStrokes(d => [drawing, ...d]);
    },
    onActive: ({x, y}) => {
      const lastDrawing = strokes[strokes.length - 1];
      lastDrawing.path.lineTo(x, y);
    },
  });

  return (
    <View style={styles.flex}>
      <View style={styles.slider}>
        <Canvas style={styles.slider}>
          <RoundedRect
            x={0}
            y={0}
            width={SLIDER_WIDTH}
            height={HEIGHT}
            r={HEIGHT}>
            <LinearGradient
              start={vec(HEIGHT, 0)}
              end={vec(SLIDER_WIDTH, HEIGHT)}
              colors={colors}
            />
          </RoundedRect>
        </Canvas>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.indicator, indicatorStyles]}>
            <Canvas style={styles.indicatorColor}>
              <Circle
                r={HEIGHT / 4}
                cx={HEIGHT / 4}
                cy={HEIGHT / 4}
                color={color}
              />
            </Canvas>
          </Animated.View>
        </GestureDetector>
      </View>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <Fill color={'#fff'} />
        {strokes.map((drawing, index) => {
          return (
            <Path
              key={`drawing-${index}`}
              path={drawing.path}
              color={drawing.color}
              strokeWidth={3}
              strokeCap={'round'}
              style={'stroke'}
            />
          );
        })}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width,
    height: width,
    transform: [{translateY: 100}],
  },
  flex: {
    width,
    height,
    backgroundColor: '#000',
  },
  slider: {
    width: SLIDER_WIDTH,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderCanvas: {
    flex: 1,
  },
  indicator: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: HEIGHT * 2,
    width: HEIGHT * 2,
    borderRadius: HEIGHT,
    position: 'absolute',
    top: -HEIGHT / 2,
  },
  indicatorColor: {
    height: HEIGHT / 2,
    width: HEIGHT / 2,
    borderRadius: HEIGHT / 4,
  },
});

export default ColorSlider;
