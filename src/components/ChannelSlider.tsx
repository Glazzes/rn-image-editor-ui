import {View, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import {Channel} from '../utils/colors';
import {
  Canvas,
  Circle,
  Extrapolate,
  Fill,
  interpolate,
  LinearGradient,
  Path,
  RoundedRect,
  Skia,
  SkiaMutableValue,
  SkiaValue,
  useComputedValue,
  useSharedValueEffect,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  interpolate as interpolateWorklet,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {clamp} from './clampSelectionBoundaries';
import CheckerBoard from './CheckerBoard';
import ReanimatedInput from './ReanimatedInput';

type ChannelSliderProps = {
  channel: Channel;
  currentColor: SkiaValue<string>;
  r: SkiaMutableValue<number>;
  g: SkiaMutableValue<number>;
  b: SkiaMutableValue<number>;
  a: SkiaMutableValue<number>;
};

const {width} = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.75;
const SLIDER_HEIGHT = 13;
const BALL_SIZE = SLIDER_HEIGHT * 2;
const STROKE_WIDTH = 2;

const upperPath = Skia.Path.Make();
upperPath.moveTo(0, 0);
upperPath.lineTo(BALL_SIZE, 0);
upperPath.lineTo(0, BALL_SIZE);
upperPath.lineTo(0, 0);
upperPath.close();

const lowerPath = Skia.Path.Make();
lowerPath.moveTo(BALL_SIZE, 0);
lowerPath.lineTo(BALL_SIZE, BALL_SIZE);
lowerPath.lineTo(0, BALL_SIZE);
lowerPath.lineTo(BALL_SIZE, 0);
lowerPath.close();

const ChannelSlider: React.FC<ChannelSliderProps> = ({
  channel,
  currentColor,
  r,
  g,
  b,
  a,
}) => {
  const colors = useComputedValue(() => {
    if (channel === 'a') {
      return [
        `rgba(${r.current}, ${g.current}, ${b.current}, 0)`,
        currentColor.current,
      ];
    }

    if (channel === 'r') {
      const start = `rgba(0, ${g.current}, ${b.current}, 1)`;
      const end = `rgba(255, ${g.current}, ${b.current}, 1)`;
      return [start, end];
    }

    if (channel === 'g') {
      const start = `rgba(${r.current}, 0, ${b.current}, 1)`;
      const end = `rgba(${r.current}, 255, ${b.current}, 1)`;
      return [start, end];
    }

    if (channel === 'b') {
      const start = `rgba(${r.current}, ${g.current}, 0, 1)`;
      const end = `rgba(${r.current}, ${g.current}, 255, 1)`;
      return [start, end];
    }

    return ['transparent', 'transparent'];
  }, [channel, r, g, b, a]);

  const hexChannel = useSharedValue<number>(0);
  const translateX = useSharedValue<number>(
    channel === 'a' ? SLIDER_WIDTH / 2 : -SLIDER_WIDTH / 2,
  );
  const offsetX = useSharedValue<number>(0);

  const pan = Gesture.Pan()
    .onStart(_ => {
      offsetX.value = translateX.value;
    })
    .onChange(e => {
      const tx = offsetX.value + e.translationX;
      translateX.value = clamp(tx, -SLIDER_WIDTH / 2, SLIDER_WIDTH / 2);
    });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  useAnimatedReaction(
    () => translateX.value,
    tx => {
      hexChannel.value = interpolateWorklet(
        tx,
        [-SLIDER_WIDTH / 2, SLIDER_WIDTH / 2],
        [0, 255],
        Extrapolate.CLAMP,
      );
    },
  );

  useSharedValueEffect(() => {
    if (channel === 'a') {
      a.current = interpolate(
        translateX.value,
        [-SLIDER_WIDTH / 2, SLIDER_WIDTH / 2],
        [0, 1],
        Extrapolate.CLAMP,
      );

      return;
    }

    const currentChannelValue = interpolate(
      translateX.value,
      [-SLIDER_WIDTH / 2, SLIDER_WIDTH / 2],
      [0, 255],
      Extrapolate.CLAMP,
    );

    if (channel === 'r') {
      r.current = currentChannelValue;
    }
    if (channel === 'g') {
      g.current = currentChannelValue;
    }
    if (channel === 'b') {
      b.current = currentChannelValue;
    }
  }, translateX);

  return (
    <View>
      {channel !== 'a' ? <ReanimatedInput text={hexChannel} /> : null}
      <View style={styles.root}>
        <Canvas style={styles.canvas}>
          {channel === 'a' ? (
            <CheckerBoard
              checkerSize={SLIDER_HEIGHT / 2}
              width={SLIDER_WIDTH}
              height={SLIDER_HEIGHT}
            />
          ) : null}
          <RoundedRect
            x={0}
            y={0}
            width={SLIDER_WIDTH}
            height={SLIDER_HEIGHT}
            r={SLIDER_HEIGHT}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(SLIDER_WIDTH, 0)}
              colors={colors}
            />
          </RoundedRect>
        </Canvas>
        <GestureDetector gesture={pan}>
          <Animated.View style={[animatedStyles, styles.ball]}>
            <Canvas style={styles.ballCanvas}>
              {channel === 'a' ? (
                <CheckerBoard
                  checkerSize={5}
                  width={BALL_SIZE}
                  height={BALL_SIZE}
                />
              ) : (
                <Fill color={currentColor} />
              )}
              <Path style={'fill'} color={currentColor} path={upperPath} />
              <Path
                antiAlias={true}
                style={'fill'}
                color={currentColor}
                path={lowerPath}
                opacity={channel === 'a' ? a : 1}
              />
              <Circle
                color={'#fff'}
                cx={BALL_SIZE / 2}
                cy={BALL_SIZE / 2}
                r={BALL_SIZE / 2 - STROKE_WIDTH / 2}
                strokeWidth={STROKE_WIDTH}
                style={'stroke'}
              />
            </Canvas>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: SLIDER_WIDTH,
    height: BALL_SIZE,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    height: SLIDER_HEIGHT,
    width: SLIDER_WIDTH,
    borderRadius: SLIDER_HEIGHT,
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    overflow: 'hidden',
  },
  ballCanvas: {
    width: BALL_SIZE,
    height: BALL_SIZE,
  },
});

export default ChannelSlider;
