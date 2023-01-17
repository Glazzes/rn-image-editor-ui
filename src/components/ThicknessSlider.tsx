import {View, StyleSheet, Dimensions} from 'react-native';
import React from 'react';
import {
  Blur,
  Canvas,
  Circle,
  ColorMatrix,
  CornerPathEffect,
  Fill,
  Group,
  Line,
  Paint,
  Path,
  Skia,
  vec,
  
} from '@shopify/react-native-skia';

type ThicknessSliderProps = {};

const {width, height} = Dimensions.get('window');
const center = {x: width / 2, y: height / 2};

const dx = Math.cos(Math.PI / 8);
const dy = Math.sin(Math.PI / 4);

const path = Skia.Path.Make();
path.moveTo(center.x - 10, center.y + 50);
path.lineTo(center.x - 50, center.y - 50);
path.addArc(
  {x: center.x - 50, y: center.y - 100, width: 100, height: 100},
  180,
  180,
);
path.lineTo(center.x + 50, center.y - 50);
path.lineTo(center.x + 10, center.y + 50);
path.lineTo(center.x - 10, center.y + 50);
path.addArc(
  {x: center.x - 10, y: center.y + 40, width: 20, height: 20},
  0,
  180,
);

const ThicknessSlider: React.FC<ThicknessSliderProps> = ({}) => {
  return (
    <View style={styles.root}>
      <Canvas style={styles.flex}>
        <Fill color={'#fff'} />
        <Group
          layer={
            <Paint>
              <ColorMatrix
                matrix={[
                  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, -10,
                ]}
              />
              <Blur blur={4} />
            </Paint>
          }>
          <Path path={path} color={'#3366ff'} style={'fill'} />

          <Circle cx={center.x} cy={center.y - 50} color={'#3366ff'} r={50} />
        </Group>

        <Line
          color={'orange'}
          p1={vec(center.x - 10 + 1, center.y + 50)}
          p2={vec(center.x - 50 * dx - 1, center.y - 50 * dy)}
          strokeWidth={2}
        />
      </Canvas>
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
    width,
    height,
  },
});

export default ThicknessSlider;
