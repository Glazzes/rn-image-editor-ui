import {View, StyleSheet, Keyboard} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Gesture,
  GestureDetector,
  TextInput,
} from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Canvas,
  Fill,
  interpolateColors,
  Text,
  useClockValue,
  useComputedValue,
  useFont,
  useSharedValueEffect,
  useTiming,
  useValue,
} from '@shopify/react-native-skia';
import {
  backgroundColors,
  leftBallHitslop,
  rightBallHitslop,
  textColors,
} from './constants';
import {useVector} from '../utils/useVector';

const IMAGE_SIZE = 100;
const BORDER_SIZE = IMAGE_SIZE * Math.SQRT2;
const SIZE = 140;
const R = SIZE / 2;

const FONT_SIZE = 40;
const PADDING = 10;

const StickerText: React.FC = ({}) => {
  const clock = useClockValue();
  clock.start();

  const t = useComputedValue(() => {
    return `${Math.floor(clock.current / 1000)}`;
  }, [clock]);

  const timing = useTiming(
    {
      from: 0,
      to: 6,
      yoyo: true,
      loop: true,
    },
    {duration: 10000},
  );

  const bgColor = useComputedValue(() => {
    return interpolateColors(
      timing.current,
      [0, 1, 2, 3, 4, 5, 6],
      backgroundColors,
    );
  }, [timing]);

  const textColor = useComputedValue(() => {
    return interpolateColors(timing.current, [0, 1, 2, 3, 4, 5, 6], textColors);
  }, [timing]);

  const font = useFont(require('./UberBold.otf'), FONT_SIZE);
  const containerRef = useAnimatedRef<Animated.View>();
  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState<string>('');
  const [gesturesEnabled, setGesturesEnabled] = useState<boolean>(true);

  const textWidth = useSharedValue<number>(0);

  const sliderTranslateX = useSharedValue<number>(0);
  const skTranslateX = useValue(0);

  useSharedValueEffect(() => {
    skTranslateX.current = sliderTranslateX.value;
  }, sliderTranslateX);

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const containerPosition = useVector(0, 0);

  const angle = useSharedValue<number>(0);
  const radius = useSharedValue<number>(R);
  const radiusOffset = useSharedValue<number>(R);

  const opacity = useSharedValue<number>(1);

  const focus = () => {
    if (opacity.value === 1) {
      inputRef.current?.focus();
      setGesturesEnabled(false);
      opacity.value = 0;
      return;
    }

    opacity.value = opacity.value === 1 ? 0 : 1;
  };

  const onChangeText = (value: string) => {
    setText(value);
    const tw = font ? font.getTextWidth(value) : 50;
    textWidth.value = tw;
    radius.value = tw;
  };

  const dimensions = useDerivedValue(() => {
    return {
      width: textWidth.value + PADDING * 2,
      height: FONT_SIZE + PADDING * 2,
    };
  }, [textWidth]);

  const tap = Gesture.Tap()
    .enabled(gesturesEnabled)
    .numberOfTaps(1)
    .onStart(_ => runOnJS(focus)());

  const translationPan = Gesture.Pan()
    .maxPointers(1)
    .enabled(gesturesEnabled)
    .onStart(_ => {
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onChange(e => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(_ => {
      radiusOffset.value = radius.value;
    })
    .onChange(e => {
      radius.value = radiusOffset.value * e.scale;
    });

  const rightRotationPan = Gesture.Pan()
    .enabled(gesturesEnabled)
    .maxPointers(1)
    .hitSlop(rightBallHitslop)
    .onStart(_ => {
      const {pageX, pageY} = measure(containerRef);
      containerPosition.x.value = pageX + dimensions.value.width / 2;
      containerPosition.y.value = pageY + dimensions.value.height / 2;
    })
    .onChange(e => {
      const relativeX = e.absoluteX - containerPosition.x.value;
      const relativeY = -1 * (e.absoluteY - containerPosition.y.value);

      radius.value = Math.sqrt(relativeX ** 2 + relativeY ** 2);
      radius.value = Math.max(R / 2, radius.value);
      angle.value = Math.atan2(relativeY, relativeX);
    });

  const leftRotationPan = Gesture.Pan()
    .enabled(gesturesEnabled)
    .maxPointers(1)
    .hitSlop(leftBallHitslop)
    .onStart(_ => {
      const {pageX, pageY} = measure(containerRef);
      containerPosition.x.value = pageX + dimensions.value.width / 2;
      containerPosition.y.value = pageY + dimensions.value.height / 2;
    })
    .onChange(e => {
      const relativeX = e.absoluteX - containerPosition.x.value;
      const relativeY = -1 * (e.absoluteY - containerPosition.y.value);

      radius.value = Math.sqrt(relativeX ** 2 + relativeY ** 2);
      radius.value = Math.max(R / 2, radius.value);
      angle.value = Math.atan2(relativeY, relativeX) + Math.PI;
    });

  const containerStyles = useAnimatedStyle(() => ({
    width: textWidth.value + PADDING * 2,
    height: 60,
    transform: [
      {translateX: translate.x.value},
      {translateY: translate.y.value},
    ],
  }));

  const borderStyles = useAnimatedStyle(() => ({
    width: textWidth.value + PADDING * 2,
    // height: radius.value * 2,
    height: 50 - PADDING,
    borderRadius: 5,
    opacity: opacity.value,
    transform: [{rotate: `${-1 * angle.value}rad`}],
  }));

  const rightBallStyles = useAnimatedStyle(() => {
    const ballSize = 15 / 2;
    const translateX = (textWidth.value / 2 + ballSize) * Math.cos(angle.value);
    const translateY =
      -1 * (textWidth.value / 2 + ballSize) * Math.sin(angle.value);

    return {
      opacity: opacity.value,
      transform: [{translateX}, {translateY}],
    };
  });

  const leftBallStyles = useAnimatedStyle(() => {
    const ballSize = 15 / 2;
    const translateX =
      (textWidth.value / 2 + ballSize) * Math.cos(angle.value + Math.PI);
    const translateY =
      -1 * (textWidth.value / 2 + ballSize) * Math.sin(angle.value + Math.PI);

    return {
      opacity: opacity.value,
      transform: [{translateX}, {translateY}],
    };
  });

  const imageStyles = useAnimatedStyle(() => {
    return {
      width: textWidth.value + PADDING * 2,
      height: 50 + PADDING,
      transform: [{rotate: `${-1 * angle.value}rad`}],
    };
  });

  useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidHide', () => {
      Keyboard.dismiss();
      setGesturesEnabled(true);
    });
    return () => listener.remove();
  });

  if (!font) {
    return null;
  }

  return (
    <View style={styles.root}>
      <GestureDetector gesture={Gesture.Race(tap, pinch, translationPan)}>
        <Animated.View
          ref={containerRef}
          style={[styles.container, containerStyles]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            autoCapitalize={'sentences'}
            onChangeText={onChangeText}
            autoFocus={true}
          />
          <Animated.View style={[styles.border, borderStyles]} />

          <GestureDetector gesture={rightRotationPan}>
            <Animated.View style={[styles.ball, rightBallStyles]} />
          </GestureDetector>

          <GestureDetector gesture={leftRotationPan}>
            <Animated.View style={[styles.ball, leftBallStyles]} />
          </GestureDetector>

          <Animated.View style={[styles.image, imageStyles]}>
            <Canvas style={styles.flex}>
              <Fill color={bgColor} />
              <Text
                x={10}
                y={FONT_SIZE * 0.7 + PADDING * 1.5}
                font={font}
                text={t}
                color={textColor}
              />
            </Canvas>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
  container: {
    height: BORDER_SIZE,
    width: BORDER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    height: BORDER_SIZE,
    width: BORDER_SIZE,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 75,
    borderStyle: 'dashed',
  },
  flex: {
    flex: 1,
  },
  input: {
    position: 'absolute',
    color: 'transparent',
  },
  image: {
    position: 'absolute',
    borderRadius: 5,
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    height: 15,
    width: 15,
    borderRadius: 15 / 2,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#3366ff',
  },
});

export default StickerText;
