import {View, StyleSheet} from 'react-native';
import React from 'react';
import {
  Canvas,
  Rect,
  useComputedValue,
  useTouchHandler,
  useValue,
} from '@shopify/react-native-skia';
import ColorColumn from './ColorColumn';
import {
  GRID_CELL_SIZE,
  GRID_COLORS,
  LUMINOSITY_PERCENTAGES,
  PICKER_HEIGHT,
  PICKER_WIDTH,
} from './colorPicker/constants';
import {denormalize, hsl2rgb, rgbToString} from '../utils/colors';

type ColorGridProps = {};

const PADDING = 16;

const ColorGrid: React.FC<ColorGridProps> = ({}) => {
  const x = useValue<number>(-1 * GRID_CELL_SIZE);
  const y = useValue<number>(0);

  const touchHandler = useTouchHandler({
    onEnd: e => {
      x.current = e.x - (e.x % GRID_CELL_SIZE);
      y.current = e.y - (e.y % GRID_CELL_SIZE);
    },
  });

  useComputedValue(() => {
    const gridColor = GRID_COLORS[Math.floor(x.current / GRID_CELL_SIZE)];
    const luminosity =
      LUMINOSITY_PERCENTAGES[Math.floor(y.current / GRID_CELL_SIZE)];

    console.log(
      Math.floor(x.current / GRID_CELL_SIZE),
      Math.floor(y.current / GRID_CELL_SIZE),
    );

    if (luminosity === 0) {
      const pct =
        255 * (1 - Math.floor(x.current / GRID_CELL_SIZE) * 0.1 + 0.1);
    } else {
      const color = hsl2rgb({...gridColor, l: gridColor.l + luminosity});
    }
  }, [x, y]);

  return (
    <View style={styles.root}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        {GRID_COLORS.map((color, index) => {
          return (
            <ColorColumn
              color={color}
              index={index}
              key={`column-${color}-${index}`}
            />
          );
        })}
        <Rect
          x={x}
          y={y}
          width={GRID_CELL_SIZE}
          height={GRID_CELL_SIZE}
          color={'#ffffff'}
          style={'stroke'}
          strokeWidth={3}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
    borderRadius: PADDING / 2,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});

export default ColorGrid;
