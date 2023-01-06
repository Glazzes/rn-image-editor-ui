import {View, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {pinch} from './pinch';
import {clampSelectionBoundaries} from './clampSelectionBoundaries';
import {getRotateTranslationDifference} from '../utils/getRotateTranslationDifference';
import {useVector} from '../utils/useVector';

type ImageTestProps = {};

type DimensionsType = {
  width: number;
  height: number;
};

type ImageDimensions = {
  base: DimensionsType;
  selection: DimensionsType;
  image: DimensionsType;
};

const {width} = Dimensions.get('window');

const WIDTH = 200;
const aspectRatio = 1244 / 1659;

const ImageTest: React.FC<ImageTestProps> = ({}) => {
  const sliderTranslateX = useSharedValue<number>(0);
  const sliderTranslateXOffset = useSharedValue<number>(0);

  const translate = useVector(0, 0);
  const translateOffset = useVector(0, 0);

  const scale = useSharedValue<number>(1);
  const scaleOffset = useSharedValue<number>(1);

  const origin = useVector(0, 0);

  const canAssignOrigin = useSharedValue<boolean>(true);

  const largestRecordAngle = useSharedValue<number>(0);

  const angle = useDerivedValue(() => {
    return interpolate(
      sliderTranslateX.value,
      [-1 * (width / 2 - 15), 0, width / 2 - 15],
      [-Math.PI / 4, 0, Math.PI / 4],
      Extrapolate.CLAMP,
    );
  }, [sliderTranslateX]);

  const dimensions = useDerivedValue<ImageDimensions>(() => {
    const baseHeight = WIDTH / aspectRatio;

    const currentAngle = Math.abs(angle.value);

    const largestAngle = Math.max(
      currentAngle,
      Math.abs(largestRecordAngle.value),
    );

    const imageWidth =
      baseHeight * Math.sin(largestAngle) + WIDTH * Math.cos(largestAngle);

    const imageHeight = imageWidth / aspectRatio;

    const selectionWidth =
      baseHeight * Math.sin(currentAngle) + WIDTH * Math.cos(currentAngle);

    const selectionHeight =
      baseHeight * Math.cos(currentAngle) + WIDTH * Math.sin(currentAngle);

    return {
      base: {
        width: WIDTH,
        height: baseHeight,
      },
      image: {
        width: imageWidth,
        height: imageHeight,
      },
      selection: {
        width: selectionWidth,
        height: selectionHeight,
      },
    };
  }, [angle]);

  const sliderPan = Gesture.Pan()
    .onStart(_ => {
      sliderTranslateXOffset.value = sliderTranslateX.value;
    })
    .onChange(e => {
      sliderTranslateX.value = sliderTranslateXOffset.value + e.translationX;

      const {x, y} = clampSelectionBoundaries({
        translate: {x: translate.x.value, y: translate.y.value},
        imageDimensions: dimensions.value.image,
        selectionDimensions: dimensions.value.selection,
        scale: scale.value,
      });

      translate.x.value = x;
      translate.y.value = y;
    });

  const imagePan = Gesture.Pan()
    .maxPointers(1)
    .onStart(_ => {
      largestRecordAngle.value = Math.max(
        Math.abs(largestRecordAngle.value),
        Math.abs(angle.value),
      );

      translateOffset.x.value = translate.x.value;
      translateOffset.y.value = translate.y.value;
    })
    .onChange(e => {
      const {x: originX, y: originY} = getRotateTranslationDifference(
        e.translationX,
        e.translationY,
        angle.value,
      );

      translate.x.value = translateOffset.x.value + e.translationX + originX;
      translate.y.value = translateOffset.y.value + e.translationY + originY;
    })
    .onEnd(_ => {
      const {x, y} = clampSelectionBoundaries({
        translate: {x: translate.x.value, y: translate.y.value},
        imageDimensions: dimensions.value.image,
        selectionDimensions: dimensions.value.selection,
        scale: scale.value,
      });

      translate.x.value = withTiming(x);
      translate.y.value = withTiming(y);
    });

  const imagePinch = Gesture.Pinch()
    .onStart(_ => {
      scaleOffset.value = scale.value;
      translateOffset.x.value = translate.x.value;
      translateOffset.y.value = translate.y.value;
    })
    .onChange(e => {
      scale.value = Math.max(1, scaleOffset.value * e.scale);

      const {translateX, translateY} = pinch({
        event: e,
        center: {
          x: dimensions.value.image.width / 2,
          y: dimensions.value.image.height / 2,
        },
        offset: {
          x: translateOffset.x.value,
          y: translateOffset.y.value,
        },
        origin,
        canAssignOrigin,
      });

      translate.x.value = translateOffset.x.value + translateX;
      translate.y.value = translateOffset.y.value + translateY;
    })
    .onEnd(_ => {
      const toScale = scale.value < 1 ? 1 : scale.value;
      if (scale.value < 1) {
        scale.value = withTiming(toScale);
      }

      const {x, y} = clampSelectionBoundaries({
        translate: {x: translate.x.value, y: translate.y.value},
        imageDimensions: dimensions.value.image,
        selectionDimensions: dimensions.value.selection,
        scale: toScale,
      });

      translate.x.value = withTiming(x);
      translate.y.value = withTiming(y);

      canAssignOrigin.value = true;
    });

  const imageStyles = useAnimatedStyle(() => {
    return {
      width: dimensions.value.image.width,
      height: dimensions.value.image.height,
      transform: [
        {rotate: `${angle.value}rad`},
        {translateX: translate.x.value},
        {translateY: translate.y.value},
        {scale: scale.value},
      ],
    };
  });

  return (
    <Animated.View style={styles.root}>
      <GestureDetector gesture={Gesture.Race(imagePinch, imagePan)}>
        <Animated.Image
          source={require('../assets/dalmatian.jpg')}
          resizeMethod={'scale'}
          resizeMode={'cover'}
          style={imageStyles}
        />
      </GestureDetector>

      <View style={styles.selection} pointerEvents={'none'} />

      <GestureDetector gesture={sliderPan}>
        <Animated.View style={styles.ball} />
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selection: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'lime',
    width: 200,
    height: 200 / aspectRatio,
  },
  ball: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'orange',
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
});

export default ImageTest;
