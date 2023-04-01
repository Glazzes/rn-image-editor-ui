import {StyleSheet} from 'react-native';
import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useDimensions, useVector} from '../utils/useVector';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Dimension, TypeDimensions, Vector} from '../utils/types';
import {getAxisRotationOffset} from '../utils/getAxisRotationOffset';
import {rotateDimensions} from '../utils/rotateDimensions';

type SelectionProps = {
  imageDimensions: Readonly<Animated.SharedValue<Dimension>>;
  rotatedDimensions: Readonly<Animated.SharedValue<Dimension>>;
  dimensions: TypeDimensions<Animated.SharedValue<number>>;
  translateImage: Vector<Animated.SharedValue<number>>;
  deltaY: Animated.SharedValue<number | undefined>;
  scale: Animated.SharedValue<number>;
  angle: Animated.SharedValue<number>;
};

const WIDTH = 200;

const Selection: React.FC<SelectionProps> = ({
  angle,
  scale,
  deltaY,
  dimensions,
  translateImage,
  imageDimensions,
  rotatedDimensions,
}) => {
  const translate = useVector(0, 0);
  const dimensionsOffset = useDimensions(0, 0);

  const largestWidth = useSharedValue<number>(WIDTH);

  const rightBound = useSharedValue<number>(0);
  const leftBound = useSharedValue<number>(0);
  const upperBound = useSharedValue<number>(0);
  const lowerBound = useSharedValue<number>(0);

  const rotatedOffset = useDimensions(0, 0);

  const largestTranslate = useVector(0, 0);

  /*
    When shrinking and expanding the dynamic selection beyond its original dimensions
    will result in additional offset according to the current selection width and
    the largest image's width recorded, this value aims to keep the image in a static position
    as the gesture is active
  */
  const extraOffset = useSharedValue<number>(0);

  const measureBounds = () => {
    'worklet';
    const offsetX =
      (imageDimensions.value.width * scale.value -
        rotatedDimensions.value.width) /
      2;

    const offsetY =
      (imageDimensions.value.height * scale.value -
        rotatedDimensions.value.height) /
      2;

    rightBound.value = offsetX + translateImage.x.value;
    leftBound.value =
      imageDimensions.value.width -
      rightBound.value -
      rotatedDimensions.value.width;

    lowerBound.value = offsetY + translateImage.y.value;
    upperBound.value =
      imageDimensions.value.height -
      lowerBound.value -
      rotatedDimensions.value.height;

    rotatedOffset.width.value = rotatedDimensions.value.width;
    rotatedOffset.height.value = rotatedDimensions.value.height;
    dimensionsOffset.width.value = dimensions.width.value;
  };

  const onEndHorizontalPan = () => {
    'worklet';
    extraOffset.value = 0;
    largestTranslate.x.value = 0;

    const {y} = getAxisRotationOffset(
      translateImage.x.value - translate.x.value * Math.cos(angle.value),
      0,
      angle.value,
    );

    deltaY.value = y;

    translateImage.x.value = withTiming(
      translateImage.x.value - translate.x.value * Math.cos(angle.value),
    );

    translateImage.y.value = withTiming(deltaY.value ?? 0);

    translate.x.value = withTiming(0);
  };

  const rightPan = Gesture.Pan()
    .maxPointers(1)
    .onStart(measureBounds)
    .onChange(({translationX, changeX}) => {
      dimensions.width.value = dimensionsOffset.width.value + translationX;
      translate.x.value += changeX / 2;

      const {width, height} = rotateDimensions(
        {
          width: dimensions.width.value,
          height: dimensions.height.value,
        },
        angle.value,
      );

      const deltaX = changeX * Math.cos(angle.value);
      const deltaY = changeX * Math.sin(angle.value);
      if (
        width >= rotatedOffset.width.value + rightBound.value &&
        width <= imageDimensions.value.width &&
        translationX > largestTranslate.x.value
      ) {
        translateImage.x.value += deltaX;
      }

      if (width >= imageDimensions.value.width) {
        translateImage.x.value += deltaX / 2;
      }

      if (
        height >= rotatedOffset.height.value + lowerBound.value &&
        translationX > largestTranslate.x.value &&
        Math.sign(angle.value) === -1 &&
        Math.sign(translateImage.y.value) === -1
      ) {
        translateImage.y.value += (changeX / 2) * Math.sin(angle.value);
      }

      if (
        height >= rotatedOffset.height.value + upperBound.value &&
        translationX > largestTranslate.x.value &&
        Math.sign(angle.value) === 1 &&
        Math.sign(translateImage.y.value) === 1
      ) {
        translateImage.y.value -= (changeX / 2) * Math.sin(angle.value);
      }

      // largestWidth.value = Math.max(largestWidth.value, dimensions.width.value);
      largestTranslate.x.value = Math.max(
        translationX,
        largestTranslate.x.value,
      );
    })
    .onEnd(onEndHorizontalPan);

  const leftPan = Gesture.Pan()
    .maxPointers(1)
    .onStart(measureBounds)
    .onChange(({translationX, changeX}) => {
      const inverseTranslation = -1 * translationX;
      const maxOffset = leftBound.value + rightBound.value + extraOffset.value;
      const actualLeftOffset = leftBound.value + extraOffset.value;

      translate.x.value += changeX / 2;
      dimensions.width.value =
        dimensionsOffset.width.value + inverseTranslation;

      if (
        inverseTranslation >= actualLeftOffset &&
        inverseTranslation >= largestTranslate.x.value &&
        inverseTranslation <= maxOffset
      ) {
        translateImage.x.value = Math.min(
          translateImage.x.value,
          translateImage.x.value + changeX,
        );
      }

      if (inverseTranslation >= maxOffset) {
        translateImage.x.value = Math.min(
          translateImage.x.value,
          translateImage.x.value + changeX / 2,
        );

        extraOffset.value = Math.max(
          extraOffset.value,
          extraOffset.value + -1 * changeX,
        );
      }

      largestWidth.value = Math.max(largestWidth.value, dimensions.width.value);
      largestTranslate.x.value = Math.max(
        inverseTranslation,
        largestTranslate.x.value,
      );
    })
    .onEnd(onEndHorizontalPan);

  const selectionStyles = useAnimatedStyle(() => {
    return {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 255, 0.4)',
      width: dimensions.width.value,
      height: dimensions.height.value,
      transform: [
        {translateX: translate.x.value},
        {translateY: translate.y.value},
      ],
    };
  });

  const test = useAnimatedStyle(() => {
    return {
      borderWidth: 3,
      borderColor: 'orange',
      width: rotatedDimensions.value.width,
      height: rotatedDimensions.value.height,
      transform: [{rotate: `${angle.value}rad`}],
    };
  });

  return (
    <GestureDetector gesture={rightPan}>
      <Animated.View style={[styles.selection, selectionStyles]}>
        <Animated.View style={[styles.selection, test]} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  selection: {
    position: 'absolute',
  },
});

export default Selection;
