import {View, StyleSheet, Dimensions} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {rotate} from '../utils/Vector';
import {getAxisRotationOffset} from '../utils/getAxisRotationOffset';
import { size } from '@shopify/react-native-skia';

type MeasureTestProps = {};

const {width, height} = Dimensions.get('window');
const center = {x: width / 2, y: height / 2};

const MeasureTest: React.FC<MeasureTestProps> = ({}) => {
  const ref = useAnimatedRef<Animated.View>();
  const ref2 = useAnimatedRef<Animated.View>();

  useEffect(() => {
    setTimeout(() => {
      runOnUI(() => {
        'worklet';

        const m1 = measure(ref);
        const m2 = measure(ref2);

        const newPos = {
          x: center.x - m2.pageX,
          y: -1 * (center.y - m2.pageY),
        };

        const rPos = rotate(newPos, Math.PI / 9);

        console.log(m1.pageX, m1.pageY);
        console.log(rPos);
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
    transform: [{rotate: `${Math.PI / 9}rad`}],
  },
});

export default MeasureTest;
