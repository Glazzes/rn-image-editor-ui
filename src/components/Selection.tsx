import {View, StyleSheet} from 'react-native';
import React, {useRef} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useDimensions, useVector} from '../utils/useVector';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

type SelectionProps = {};

type GestureState = {
  isXUpdated: boolean;
  isYUpdated: boolean;
};

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

  const dimensions = useDimensions(WIDTH, WIDTH / RATIO);
  const dimensionsOffset = useDimensions(0, 0);

  const imagePanGesture = Gesture.Pan()
    .onStart(_ => {
      translateImageOffset.x.value = translateImage.x.value;
    })
    .onChange(({translationX}) => {
      translateImage.x.value = translateImageOffset.x.value + translationX;
    });

  const horizontalPan = Gesture.Pan()
    .onStart(_ => {
      dimensionsOffset.width.value = dimensions.width.value;
    })
    .onChange(({translationX}) => {
      dimensions.width.value = dimensionsOffset.width.value + translationX;
    })
    .onEnd(_ => {
      if (state.current.isYUpdated) {
        state.current = {isXUpdated: false, isYUpdated: false};
        return;
      }

      const x = WIDTH - dimensions.width.value;
      translate.x.value = withTiming(x / 2);
      const toX = dimensionsOffset.width.value - dimensions.width.value;
      translateImage.x.value = withTiming(translateImage.x.value + toX / 2);

      state.current.isXUpdated = true;
    });

  const verticalPan = Gesture.Pan()
    .onStart(_ => {
      dimensionsOffset.height.value = dimensions.height.value;
    })
    .onChange(({translationY}) => {
      dimensions.height.value = dimensionsOffset.height.value + translationY;
    })
    .onEnd(_ => {
      if (state.current.isXUpdated) {
        const toScale = dimensionsOffset.height.value / dimensions.height.value;
        scale.value = withTiming(toScale);
        return;
      }

      const moveSelectionToY = (WIDTH - dimensions.height.value) / 2;
      translate.y.value = withTiming(moveSelectionToY);

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
      transform: [
        {translateX: translateImage.x.value},
        {translateY: translateImage.y.value},
        {scale: scale.value},
      ],
    };
  });

  return (
    <View style={styles.root}>
      <View>
        <GestureDetector gesture={imagePanGesture}>
          <Animated.Image
            source={require('../assets/dalmatian.jpg')}
            style={[styles.image, imageStyles]}
          />
        </GestureDetector>
        <GestureDetector gesture={horizontalPan}>
          <Animated.View style={[styles.selection, selectionStyles]} />
        </GestureDetector>
      </View>
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
  },
  selection: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default Selection;
