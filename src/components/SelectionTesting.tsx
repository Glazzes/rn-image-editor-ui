import {View, StyleSheet, Text} from 'react-native';
import React from 'react';
import {HitSlop} from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';

type SelectionTestingProps = {};

const SIZE = 25;
const horizontalHitSlop: HitSlop = {left: 20};

const SelectionTesting: React.FC<SelectionTestingProps> = ({}) => {
  return (
    <View style={styles.root}>
      <View style={styles.square}>
        <View>
          <View style={styles.diagonalSelector} />
          <View style={styles.verticalSelector} />
          <View style={styles.diagonalSelector} />
          
        </View>

        <View style={{flex: 1}} />

        <View>
          <View style={styles.diagonalSelector} />
          <View style={styles.verticalSelector} />
          <View style={styles.diagonalSelector} />
        </View>
      </View>
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
  flex: {
    flex: 1,
  },
  square: {
    height: 250,
    width: 250,
    backgroundColor: '#3366ff',
    flexDirection: 'row',
  },
  verticalSelector: {
    flex: 1,
    width: SIZE,
    backgroundColor: 'lime',
  },
  diagonalSelector: {
    width: SIZE,
    height: SIZE,
    backgroundColor: 'pink',
  },
  horizontalSelector: {
    height: SIZE,
    backgroundColor: 'tomato',
  },
});

export default SelectionTesting;
