import {View, StyleSheet, ViewStyle, Text} from 'react-native';
import React, {useMemo} from 'react';
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
import {SLIDER_WIDTH} from './sliders/constants';

type ChannelSliderProps = {
  width: number;
  channel: Channel;
  currentColor: SkiaValue<string>;
  translateX: Animated.SharedValue<number>;
  isSliding: Animated.SharedValue<boolean>;
  r: SkiaMutableValue<number>;
  g: SkiaMutableValue<number>;
  b: SkiaMutableValue<number>;
  a: SkiaMutableValue<number>;
};

const SLIDER_HEIGHT = 8;
const BALL_SIZE = 24;
const STROKE_WIDTH = 2;

const upperPath = Skia.Path.Make();
upperPath.moveTo(0, 0);
upperPath.lineTo(BALL_SIZE + 1, 0);
upperPath.lineTo(0, BALL_SIZE);
upperPath.lineTo(0, 0);
upperPath.close();

const lowerPath = Skia.Path.Make();
lowerPath.moveTo(BALL_SIZE, 0);
lowerPath.lineTo(BALL_SIZE, BALL_SIZE + 1);
lowerPath.lineTo(0, BALL_SIZE);
lowerPath.lineTo(BALL_SIZE, 0);
lowerPath.close();

const ChannelSlider: React.FC<ChannelSliderProps> = ({
  width,
  channel,
  currentColor,
  translateX,
  isSliding,
  r,
  g,
  b,
  a,
}) => {
  const hexChannel = useSharedValue<string>('0');
  const offsetX = useSharedValue<number>(0);

  const translateInputRange = [
    -width / 2 + BALL_SIZE / 2,
    width / 2 - BALL_SIZE / 2,
  ];

  // Logic stuff
  const channelName = useMemo(() => {
    if (channel === 'r') {
      return 'Red';
    }

    if (channel === 'g') {
      return 'Green';
    }

    return 'Blue';
  }, [channel]);

  const sliderStyles: ViewStyle = {
    width: width,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const canvaStyles: ViewStyle = {
    height: SLIDER_HEIGHT,
    width: width,
    borderRadius: SLIDER_HEIGHT,
    overflow: 'hidden',
  };

  const onChangeText = (value: string) => {
    const channelValue = parseInt(value, 10);
    if (isNaN(channelValue)) {
      translateX.value = -width / 2 + BALL_SIZE / 2;
      return;
    }

    if (channelValue < 0 || channelValue > 255) {
      return;
    }

    translateX.value = interpolate(
      channelValue,
      [0, 255],
      translateInputRange,
      Extrapolate.CLAMP,
    );
  };

  const onFocus = () => (isSliding.value = true);
  const onBlur = () => (isSliding.value = false);

  // Animation stuff
  const gradient = useComputedValue(() => {
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
  }, [channel, r, g, b, a, currentColor]);

  const pan = Gesture.Pan()
    .onStart(_ => {
      offsetX.value = translateX.value;
      isSliding.value = true;
    })
    .onChange(e => {
      const tx = offsetX.value + e.translationX;
      translateX.value = clamp(
        tx,
        translateInputRange[0],
        translateInputRange[1],
      );
    })
    .onEnd(_ => (isSliding.value = false));

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  useAnimatedReaction(
    () => translateX.value,
    tx => {
      const channelValue = interpolateWorklet(
        tx,
        translateInputRange,
        [0, 255],
        Extrapolate.CLAMP,
      );

      hexChannel.value = '' + clamp(Math.round(channelValue), 0, 255);
    },
    [translateX],
  );

  useSharedValueEffect(() => {
    if (channel === 'a') {
      a.current = interpolate(
        translateX.value,
        translateInputRange,
        [0, 1],
        Extrapolate.CLAMP,
      );

      return;
    }

    const currentChannelValue = interpolate(
      translateX.value,
      translateInputRange,
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
    <View style={styles.root}>
      {channel !== 'a' ? (
        <Text style={styles.channelName}>{channelName}</Text>
      ) : null}
      <View style={styles.sliderContainer}>
        <View style={sliderStyles}>
          <Canvas style={canvaStyles}>
            {channel === 'a' ? (
              <CheckerBoard
                checkerSize={SLIDER_HEIGHT / 2}
                width={width}
                height={SLIDER_HEIGHT}
                colors={['#000000', '#ffffff']}
              />
            ) : null}
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={SLIDER_HEIGHT}
              r={SLIDER_HEIGHT}>
              <LinearGradient
                start={vec(0, SLIDER_HEIGHT)}
                end={vec(width, 0)}
                colors={gradient}
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
                    colors={['#000000', '#f2eded']}
                  />
                ) : (
                  <Fill color={currentColor} />
                )}
                <Path
                  antiAlias={true}
                  style={'fill'}
                  color={currentColor}
                  path={upperPath}
                />
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
        {channel !== 'a' ? (
          <View style={styles.inputContainer}>
            <ReanimatedInput
              text={hexChannel}
              style={styles.input}
              keyboardType={'numeric'}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginVertical: 5,
  },
  channelName: {
    color: '#ffffff',
    fontFamily: 'UberBold',
  },
  sliderContainer: {
    width: 320 - 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  slider: {
    width: SLIDER_WIDTH,
    height: BALL_SIZE,
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
  inputContainer: {
    backgroundColor: '#545454',
    borderRadius: 8,
    width: 50,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontFamily: 'UberBold',
    color: '#fff',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    textAlign: 'center',
  },
});

export default ChannelSlider;
