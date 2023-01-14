import {View, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';

type MeasureTestProps = {};

const MeasureTest: React.FC<MeasureTestProps> = ({}) => {
  const ref = useAnimatedRef<Animated.View>();
  const ref2 = useAnimatedRef<Animated.View>();

  return (
    <View style={styles.root}>
      <Animated.View ref={ref} style={styles.box} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: 'orange',
    transform: [
      {perspective: 200},
      {
      matrix: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]
    }],
  },
});

export default MeasureTest;
