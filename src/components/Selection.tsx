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

  const rightBound = useSharedValue<number>(0);
  const leftBound = useSharedValue<number>(0);
  const upperBound = useSharedValue<number>(0);
  const lowerBound = useSharedValue<number>(0);

  const rotatedOffset = useDimensions(0, 0);
  const largestTranslate = useVector(0, 0);

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

  const onChangeHorizontal = (
    translationX: number,
    changeX: number,
    inverted: boolean
  ) => {
     const sign = inverted ? -1 : 1;
     const translateX = sign * translationX;
  }

  const onEndHorizontalPan = () => {
    'worklet';
    largestTranslate.x.value = 0;
    translateImage.x.value = withTiming(translateImage.x.value - translate.x.value);
    translate.x.value = withTiming(0);
  };

  const rightPan = Gesture.Pan()
    .maxPointers(1)
    .onStart(measureBounds)
    .onChange(({translationX, changeX}) => {
      dimensions.width.value = dimensionsOffset.width.value + translationX;

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

      if (width > imageDimensions.value.width) {
        translateImage.x.value += deltaX / 2;
      }

      const haveAngleAndTranslateYSameSign = Math.sign(angle.value) === Math.sign(translateImage.y.value);    
      const hasGoneBeyondUpperBound = height >= rotatedOffset.height.value + upperBound.value;
      const hasGoneBeyondLowerBound = height >= rotatedOffset.height.value + lowerBound.value;
      if(
        haveAngleAndTranslateYSameSign &&
        (hasGoneBeyondLowerBound || hasGoneBeyondUpperBound) &&
        translationX >= largestTranslate.x.value
      ){
        translateImage.y.value -= deltaY;
      }

      translate.x.value += changeX / 2;
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
      translate.x.value += changeX / 2;
      dimensions.width.value = dimensionsOffset.width.value + inverseTranslation;

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
        width >= rotatedOffset.width.value + leftBound.value &&
        width <= imageDimensions.value.width &&
        inverseTranslation > largestTranslate.x.value
      ) {
        translateImage.x.value += deltaX;
      }

      if (width > imageDimensions.value.width) {
        translateImage.x.value += deltaX / 2;
      }

      const areSignsDifferent = Math.sign(angle.value) !== Math.sign(translateImage.y.value);    
      const hasGoneBeyondUpperBound = height >= rotatedOffset.height.value + upperBound.value;
      const hasGoneBeyondLowerBound = height >= rotatedOffset.height.value + lowerBound.value;
      if(
        areSignsDifferent &&
        (hasGoneBeyondLowerBound || hasGoneBeyondUpperBound) &&
        inverseTranslation >= largestTranslate.x.value
      ){
        translateImage.y.value -= deltaY;
      }

      largestTranslate.x.value = Math.max(inverseTranslation, largestTranslate.x.value);
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
    <GestureDetector gesture={leftPan}>
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
