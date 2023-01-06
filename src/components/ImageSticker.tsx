import {View, StyleSheet} from 'react-native';
import React from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {leftBallHitslop, rightBallHitslop} from './constants';
import {getStickerInfo} from '../utils/getStickerInfo';
import {useVector} from '../utils/useVector';

type ImageStickerProps = {
  uri: string;
};

const IMAGE_SIZE = 100;
const BORDER_SIZE = IMAGE_SIZE * Math.SQRT2;
const SIZE = 140;
const R = SIZE / 2;

const ImageSticker: React.FC<ImageStickerProps> = ({}) => {
  const containerRef = useAnimatedRef<Animated.View>();

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const containerPosition = useVector(0, 0);

  const angle = useSharedValue<number>(0);
  const radius = useSharedValue<number>(R);
  const radiusOffset = useSharedValue<number>(R);

  const opacity = useSharedValue<number>(1);

  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(_ => {
      opacity.value = opacity.value === 0 ? 1 : 0;
    });

  const translationPan = Gesture.Pan()
    .maxPointers(1)
    .onStart(_ => {
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
      opacity.value = 1;
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
    .maxPointers(1)
    .hitSlop(rightBallHitslop)
    .onStart(_ => {
      const {pageX, pageY} = measure(containerRef);
      containerPosition.x.value = pageX + R;
      containerPosition.y.value = pageY + R;
    })
    .onChange(({absoluteX, absoluteY}) => {
      const {radius: stickerRadius, angle: stickerAngle} = getStickerInfo({
        absolutePosition: {x: absoluteX, y: absoluteY},
        stickerPosition: {
          x: containerPosition.x.value,
          y: containerPosition.y.value,
        },
        radius: R,
      });

      radius.value = stickerRadius;
      angle.value = stickerAngle;
    });

  const leftRotationPan = Gesture.Pan()
    .maxPointers(1)
    .hitSlop(leftBallHitslop)
    .onStart(_ => {
      const {pageX, pageY} = measure(containerRef);
      containerPosition.x.value = pageX + R;
      containerPosition.y.value = pageY + R;
    })
    .onChange(({absoluteX, absoluteY}) => {
      const {radius: stickerRadius, angle: stickerAngle} = getStickerInfo({
        absolutePosition: {x: absoluteX, y: absoluteY},
        stickerPosition: {
          x: containerPosition.x.value,
          y: containerPosition.y.value,
        },
        radius: R,
      });

      radius.value = stickerRadius;
      angle.value = stickerAngle + Math.PI;
    });

  const containerStyles = useAnimatedStyle(() => ({
    transform: [
      {translateX: translate.x.value},
      {translateY: translate.y.value},
    ],
  }));

  const borderStyles = useAnimatedStyle(() => ({
    width: radius.value * 2,
    height: radius.value * 2,
    borderRadius: radius.value,
    opacity: opacity.value,
    transform: [{rotate: `${-1 * angle.value}rad`}],
  }));

  const rightBallStyles = useAnimatedStyle(() => {
    const translateX = radius.value * Math.cos(angle.value);
    const translateY = -1 * radius.value * Math.sin(angle.value);

    return {
      opacity: opacity.value,
      transform: [{translateX}, {translateY}],
    };
  });

  const leftBallStyles = useAnimatedStyle(() => {
    const translateX = radius.value * Math.cos(angle.value + Math.PI);
    const translateY = -1 * radius.value * Math.sin(angle.value + Math.PI);

    return {
      opacity: opacity.value,
      transform: [{translateX}, {translateY}],
    };
  });

  const imageStyles = useAnimatedStyle(() => {
    return {
      width: (radius.value * 2) / Math.SQRT2,
      height: (radius.value * 2) / Math.SQRT2,
      transform: [{rotate: `${-1 * angle.value}rad`}],
    };
  });

  return (
    <View style={styles.root}>
      <GestureDetector gesture={Gesture.Race(tap, pinch, translationPan)}>
        <Animated.View
          ref={containerRef}
          style={[styles.container, containerStyles]}>
          <Animated.View style={[styles.border, borderStyles]} />

          <GestureDetector gesture={rightRotationPan}>
            <Animated.View style={[styles.ball, rightBallStyles]} />
          </GestureDetector>

          <GestureDetector gesture={leftRotationPan}>
            <Animated.View style={[styles.ball, leftBallStyles]} />
          </GestureDetector>

          <Animated.Image
            source={require('./hello.png')}
            resizeMode={'cover'}
            resizeMethod={'scale'}
            style={[styles.image, imageStyles]}
          />
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
  image: {
    width: 100,
    height: 100,
    position: 'absolute',
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

export default ImageSticker;
