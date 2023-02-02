import {View, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {rotate} from '../utils/Vector';
import {getAxisRotationOffset} from '../utils/getAxisRotationOffset';

type MeasureTestProps = {};

const MeasureTest: React.FC<MeasureTestProps> = ({}) => {
  const ref = useAnimatedRef<Animated.View>();
  const ref2 = useAnimatedRef<Animated.View>();

  useEffect(() => {
    setTimeout(() => {
      runOnUI(() => {
        'worklet';

        const m1 = measure(ref);
        const m2 = measure(ref2);

        // const {x, y} = rotate({x: 5, y: 0}, Math.PI / 4);
        const {x, y} = getAxisRotationOffset(100, 100, Math.PI / 4);
        console.log(x, y);
      })();
    }, 1000);
  }, [ref, ref2]);

  return (
    <View style={styles.root}>
      <Animated.View ref={ref} style={styles.box} />
      <Animated.View ref={ref2} style={styles.box2} />
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
  },
  box2: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: '#3366ff',
    transform: [{rotate: `${Math.PI / 4}rad`}],
  },
});

export default MeasureTest;
