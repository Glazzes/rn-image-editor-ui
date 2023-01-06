import {View, StyleSheet, Dimensions} from 'react-native';
import React, {useRef} from 'react';
import Animated, {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useDimensions, useVector} from '../utils/useVector';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Dimension, Vector} from '../utils/types';
import {clamp} from './clampSelectionBoundaries';

type SelectionProps = {};

type GestureState = {
  isXUpdated: boolean;
  isYUpdated: boolean;
};

const {width: windowWidth} = Dimensions.get('window');
const WIDTH = 200;
const RATIO = 1244 / 1659;

const Selection: React.FC<SelectionProps> = ({}) => {
  const state = useRef<GestureState>({
    isXUpdated: false,
    isYUpdated: false,
  });

  const translate = useVector(0, 0);
  const translateImage = useVector(0, 0);
  const translateImageOffset = useVector(0, 0);
  const scale = useSharedValue<number>(1);

  const largestWidth = useSharedValue<number>(WIDTH);
  const maxAchievableWidthIncrease = useSharedValue<number>(
    (windowWidth - WIDTH) / 2,
  );

  const dimensions = useDimensions(WIDTH, WIDTH / RATIO);
  const dimensionsOffset = useDimensions(0, 0);

  const imageDimensions = useDerivedValue<Dimension>(() => {
    const width = Math.max(largestWidth.value, WIDTH);
    const height = width / RATIO;

    return {width, height};
  }, [largestWidth]);

  const imageTranslation = useDerivedValue<Vector<number>>(() => {
    const offsetX = (imageDimensions.value.width - dimensions.width.value) / 2;
    const offsetY =
      (imageDimensions.value.height - dimensions.height.value) / 2;

    const x = clamp(translateImage.x.value, -1 * offsetX, offsetX);
    const y = clamp(translateImage.y.value, -1 * offsetY, offsetY);

    return {x, y};
  }, [imageDimensions, dimensions, translateImage]);

  const imagePanGesture = Gesture.Pan()
    .onStart(_ => {
      translateImageOffset.x.value = imageTranslation.value.x;
      translateImageOffset.y.value = imageTranslation.value.y;
    })
    .onChange(({translationX, translationY}) => {
      translateImage.x.value = translateImageOffset.x.value + translationX;
      translateImage.y.value = translateImageOffset.y.value + translationY;
    });

  const horizontalPan = Gesture.Pan()
    .onStart(_ => {
      maxAchievableWidthIncrease.value =
        (windowWidth - dimensions.width.value) / 2;

      dimensionsOffset.width.value = dimensions.width.value;
    })
    .onChange(({translationX}) => {
      const moveToX = Math.min(
        translationX / 2,
        maxAchievableWidthIncrease.value / 2,
      );

      translate.x.value = moveToX;
      translateImage.x.value = Math.max(translateImage.x.value, moveToX);

      dimensions.width.value =
        dimensionsOffset.width.value +
        Math.min(translationX, maxAchievableWidthIncrease.value);

      largestWidth.value = Math.max(largestWidth.value, dimensions.width.value);
    })
    .onEnd(_ => {
      translateImage.x.value = withTiming(
        translateImage.x.value - translate.x.value,
      );

      translate.x.value = withTiming(0);
      /*
      const x = WIDTH - dimensions.width.value;
      translate.x.value = withTiming(x / 2);
      const toX = dimensionsOffset.width.value - dimensions.width.value;
      translateImage.x.value = withTiming(translateImage.x.value + toX / 2);
      */
    });

  const imageRef = useAnimatedRef<Animated.Image>();
  const selectionRef = useAnimatedRef<Animated.View>();

  const deltaX = useSharedValue<number>(0);

  const rightOffset = useSharedValue<number>(0);
  const leftOffset = useSharedValue<number>(0);
  const s = useSharedValue<boolean>(false);

  const rightPan = Gesture.Pan()
    .maxPointers(1)
    .onBegin(_ => {
      const selectionMeasure = measure(selectionRef);
      const imageMeasure = measure(imageRef);

      leftOffset.value =
        imageMeasure.pageX < 0
          ? Math.abs(imageMeasure.pageX) + selectionMeasure.pageX
          : selectionMeasure.pageX - imageMeasure.pageX;

      rightOffset.value =
        Math.round(imageMeasure.width) -
        Math.round(selectionMeasure.width) -
        leftOffset.value;
    })
    .onChange(({translationX}) => {
      const delta = translationX - deltaX.value;
      const maxOffset = leftOffset.value + rightOffset.value;

      translate.x.value += delta / 2;
      dimensions.width.value += delta;

      if (
        translationX >= rightOffset.value &&
        translationX <= leftOffset.value
      ) {
        translateImage.x.value = Math.max(
          translateImage.x.value,
          translateImage.x.value + delta,
        );
      }

      if (translationX > maxOffset) {
        translateImage.x.value = Math.max(
          translateImage.x.value,
          translateImage.x.value + delta / 2,
        );

        s.value = true;
      }

      largestWidth.value = Math.max(largestWidth.value, dimensions.width.value);
      deltaX.value = translationX;
    })
    .onEnd(() => {
      deltaX.value = 0;
      translateImage.x.value = withTiming(
        translateImage.x.value - translate.x.value,
      );
      translate.x.value = withTiming(0);
      s.value = false;
    });

  const leftPan = Gesture.Pan()
    .maxPointers(1)
    .onStart(_ => {
      const selectionMeasure = measure(selectionRef);
      const imageMeasure = measure(imageRef);

      leftOffset.value =
        imageMeasure.pageX < 0
          ? Math.abs(imageMeasure.pageX) + selectionMeasure.pageX
          : imageMeasure.pageX - selectionMeasure.pageX;

      rightOffset.value =
        Math.round(imageMeasure.width) -
        Math.round(selectionMeasure.width) -
        rightOffset.value;
    })
    .onChange(({translationX}) => {
      const normalizedTranslation = -1 * translationX;
      const delta = translationX - deltaX.value;
      const maxOffset = leftOffset.value + rightOffset.value;

      translate.x.value += delta / 2;
      dimensions.width.value += -1 * delta;

      if (translationX >= -1 * leftOffset.value) {
        translateImage.x.value = Math.min(
          translateImage.x.value,
          translateImage.x.value + delta / 2,
        );
      }

      deltaX.value = translationX;
      largestWidth.value = Math.max(largestWidth.value, dimensions.width.value);
    })
    .onEnd(_ => {
      deltaX.value = 0;
      translate.x.value = withTiming(0);
      translateImage.x.value = withTiming(
        translateImage.x.value - translate.x.value,
      );
    });

  const verticalPan = Gesture.Pan()
    .onStart(_ => {
      dimensionsOffset.height.value = dimensions.height.value;
    })
    .onChange(({translationY}) => {
      dimensions.height.value = dimensionsOffset.height.value + translationY;
    })
    .onEnd(_ => {
      const moveSelectionToY = WIDTH / RATIO - dimensions.height.value;
      translate.y.value = withTiming(moveSelectionToY / 2);

      const moveImageToY =
        (dimensionsOffset.height.value - dimensions.height.value) / 2;
      translateImage.y.value = withTiming(
        translateImage.y.value + moveImageToY,
      );

      state.current.isYUpdated = true;
    });

  const selectionStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: 'rgba(252, 3, 236, 0.4)',
      width: dimensions.width.value,
      height: dimensions.height.value,
      transform: [
        {translateX: translate.x.value},
        {translateY: translate.y.value},
      ],
    };
  });

  const imageStyles = useAnimatedStyle(() => {
    return {
      width: imageDimensions.value.width,
      height: imageDimensions.value.height,
      transform: [
        {translateX: translateImage.x.value},
        {translateY: translateImage.y.value},
        // {translateX: imageTranslation.value.x},
        // {translateY: imageTranslation.value.y},
        {scale: scale.value},
      ],
    };
  });

  return (
    <View style={styles.root}>
      <Animated.Image
        ref={imageRef}
        source={require('../assets/dalmatian.jpg')}
        style={[styles.image, imageStyles]}
      />

      <GestureDetector gesture={leftPan}>
        <Animated.View
          ref={selectionRef}
          style={[styles.selection, selectionStyles]}
        />
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
  image: {
    width: WIDTH,
    height: WIDTH / RATIO,
    position: 'absolute',
  },
  selection: {
    position: 'absolute',
  },
});

export default Selection;
