import {StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {pinch} from './pinch';
import {clampSelectionBoundaries} from './clampSelectionBoundaries';
import {getAxisRotationOffset} from '../utils/getAxisRotationOffset';
import {useDimensions, useVector} from '../utils/useVector';
import {Dimension} from '../utils/types';
import Selection from './Selection';
import {rotateDimensions} from '../utils/rotateDimensions';

type ImageTestProps = {
  source: any;
  width: number;
  height: number;
  onCrop: () => void;
  imageNativeId?: string;
  rememberLastCrop?: boolean;
};

const {width: windowWidth} = Dimensions.get('window');

const WIDTH = 200;
const aspectRatio = 1244 / 1659;

const ImageTest: React.FC<ImageTestProps> = ({}) => {
  const baseHeight = WIDTH / aspectRatio;

  const sliderTranslateX = useSharedValue<number>(0);
  const sliderTranslateXOffset = useSharedValue<number>(0);

  const translate = useVector(0, 0);
  const translateOffset = useVector(0, 0);

  const scale = useSharedValue<number>(1);
  const scaleOffset = useSharedValue<number>(1);

  const origin = useVector(0, 0);
  const canAssignOrigin = useSharedValue<boolean>(true);
  const largestRecordAngle = useSharedValue<number>(0);

  const deltaY = useSharedValue<number | undefined>(undefined);

  const angle = useDerivedValue(() => {
    return interpolate(
      sliderTranslateX.value,
      [-1 * (windowWidth / 2 - 15), 0, windowWidth / 2 - 15],
      [-Math.PI / 4, 0, Math.PI / 4],
      Extrapolate.CLAMP,
    );
  }, [sliderTranslateX]);

  const selectionDimensions = useDimensions(WIDTH, baseHeight);
  const largestSelectionDimensions = useDimensions(WIDTH, baseHeight);

  useAnimatedReaction(
    () => selectionDimensions,
    dim => {
      largestSelectionDimensions.width.value = Math.max(
        largestSelectionDimensions.width.value,
        dim.width.value,
      );

      largestSelectionDimensions.height.value = Math.max(
        largestSelectionDimensions.height.value,
        dim.height.value,
      );
    },
  );

  const rotatedSelectionDimensions = useDerivedValue<Dimension>(() => {
    const {width, height} = rotateDimensions(
      {
        width: selectionDimensions.width.value,
        height: selectionDimensions.height.value,
      },
      angle.value,
    );

    return {
      width,
      height,
    };
  }, [angle, selectionDimensions]);

  const imageDimensions = useDerivedValue<Dimension>(() => {
    const absAngle = Math.abs(angle.value);
    const largestAngle = Math.max(absAngle, Math.abs(largestRecordAngle.value));
    const width =
      largestSelectionDimensions.height.value * Math.sin(largestAngle) +
      largestSelectionDimensions.width.value * Math.cos(largestAngle);

    const height = width / aspectRatio;

    return {
      width,
      height,
    };
  }, [angle, largestRecordAngle, largestSelectionDimensions]);

  const sliderPan = Gesture.Pan()
    .onStart(_ => {
      sliderTranslateXOffset.value = sliderTranslateX.value;
    })
    .onChange(e => {
      sliderTranslateX.value = sliderTranslateXOffset.value + e.translationX;

      const {x, y} = clampSelectionBoundaries({
        translate: {x: translate.x.value, y: translate.y.value},
        imageDimensions: imageDimensions.value,
        selectionDimensions: rotatedSelectionDimensions.value,
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

      deltaY.value = undefined;
    })
    .onChange(({translationX, translationY}) => {
      const {x: offsetXForY, y: offsetYForX} = getAxisRotationOffset(
        translationX,
        translationY,
        angle.value,
      );

      translate.x.value = translateOffset.x.value + translationX + offsetXForY;
      translate.y.value = translateOffset.y.value + translationY + offsetYForX;
    })
    .onEnd(_ => {
      const {x, y} = clampSelectionBoundaries({
        translate: {x: translate.x.value, y: translate.y.value},
        imageDimensions: imageDimensions.value,
        selectionDimensions: rotatedSelectionDimensions.value,
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
          x: imageDimensions.value.width / 2,
          y: imageDimensions.value.height / 2,
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
        imageDimensions: imageDimensions.value,
        selectionDimensions: rotatedSelectionDimensions.value,
        scale: toScale,
      });

      translate.x.value = withTiming(x);
      translate.y.value = withTiming(y);

      canAssignOrigin.value = true;
    });

  const imageStyles = useAnimatedStyle(() => {
    return {
      width: imageDimensions.value.width,
      height: imageDimensions.value.height,
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

      <Selection
        rotatedDimensions={rotatedSelectionDimensions}
        imageDimensions={imageDimensions}
        dimensions={selectionDimensions}
        translateImage={translate}
        deltaY={deltaY}
        scale={scale}
        angle={angle}
      />

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
