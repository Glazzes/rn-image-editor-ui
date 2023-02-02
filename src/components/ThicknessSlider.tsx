import {View, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import {
  Blur,
  Canvas,
  Circle,
  clamp,
  ColorMatrix,
  Extrapolate,
  Group,
  interpolate,
  Paint,
  Path,
  Skia,
  SkPath,
  Transforms2d,
  useComputedValue,
  useTouchHandler,
  useValue,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

type ThicknessSliderProps = {};

const {width, height} = Dimensions.get('window');
const center = {x: width / 2, y: height / 2};

const DISTANCE = 150;
const BIG_R = 36;
const R = BIG_R / 6;
const COLOR = 'rgba(255, 255, 255, 1)';

const dx = Math.cos(Math.PI / 8);
const dy = Math.sin(Math.PI / 4);

const path = Skia.Path.Make();
path.moveTo(center.x - BIG_R - 1, center.y - BIG_R);
path.lineTo(center.x - R - 1, center.y + DISTANCE);
path.lineTo(center.x + R + 1, center.y + DISTANCE);
path.lineTo(center.x + BIG_R + 1, center.y - BIG_R);
path.close();

const ThicknessSlider: React.FC<ThicknessSliderProps> = ({}) => {
  const progress = useValue<number>(1);
  const translateY = useSharedValue<number>(0);
  const offsetY = useSharedValue<number>(0);
  const radius = useSharedValue<number>(BIG_R);

  const path2 = useComputedValue<SkPath>(() => {
    const d = Skia.Path.Make();
    d.moveTo(0, BIG_R);
    d.lineTo(BIG_R - R, height / 2 - R);
    d.lineTo(BIG_R + R, height / 2 - R);
    d.lineTo(BIG_R * 2, BIG_R);
    d.close();

    return d;
  }, [progress]);

  const cy = useComputedValue<number>(() => {
    return interpolate(progress.current, [0, 1], [R, BIG_R], Extrapolate.CLAMP);
  }, [progress]);

  const pan = Gesture.Pan()
    .onStart(_ => {
      offsetY.value = translateY.value;
    })
    .onChange(({changeY}) => {
      translateY.value += changeY;
    })
    .onEnd(e => {});

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: radius.value * 2,
      height: radius.value * 2,
      borderRadius: radius.value,
      backgroundColor: '#fff',
      transform: [{translateY: translateY.value}],
    };
  });

  return (
    <View style={styles.root}>
      <Canvas style={styles.flex}>
        <Circle cx={BIG_R} cy={cy} r={BIG_R} color={'#3366ff'} />
        <Circle cx={BIG_R} cy={height / 2 - R} r={R} color={'#3366ff'} />
        <Path
          path={path2}
          antiAlias={true}
          style={'fill'}
          color={'#3366ff'}
          strokeWidth={2}
        />
      </Canvas>

      <GestureDetector gesture={pan}>
        <Animated.View style={indicatorStyles} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    width: BIG_R * 2,
    height: height / 2,
    backgroundColor: 'salmon',
    opacity: 0.5,
  },
});

export default ThicknessSlider;
