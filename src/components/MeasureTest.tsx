import {View, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
} from 'react-native-reanimated';

type MeasureTestProps = {};

const MeasureTest: React.FC<MeasureTestProps> = ({}) => {
  const ref = useAnimatedRef<Animated.View>();
  const ref2 = useAnimatedRef<Animated.View>();

  useEffect(() => {
    if (ref) {
      setTimeout(() => {
        runOnUI(() => {
          'worklet';
          const sure = measure(ref);
          const sure2 = measure(ref2);
          console.log(sure);
          console.log(sure2);
        })();
      }, 2000);
    }
  }, [ref, ref2]);

  return (
    <View style={styles.root}>
      <Animated.View ref={ref2} style={styles.box2} />
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
    transform: [{rotate: '45deg'}, {translateX: 0}],
  },
  box2: {
    position: 'absolute',
    width: 220,
    height: 220,
    backgroundColor: 'salmon',
    transform: [{rotate: '45deg'}, {translateX: 0}],
  },
});

export default MeasureTest;
