import React from 'react';
import {denormalize, HSL, hsl2rgb, rgbToString} from '../utils/colors';
import {Rect} from '@shopify/react-native-skia';
import {Dimensions} from 'react-native';
import {
  GRID_CELL_HEIGHT,
  GRID_CELL_WIDTH,
  LUMINOSITY_PERCENTAGES,
} from './colorPicker/constants';

type ColorColumnProps = {
  color: HSL;
  index: number;
};

const {width: windowWidth} = Dimensions.get('window');
const size = windowWidth - 32;
const width = Math.round(size / 12);
const height = Math.round(size / 10);

const ColorColumn: React.FC<ColorColumnProps> = ({color, index}) => {
  return (
    <React.Fragment>
      {LUMINOSITY_PERCENTAGES.map((invertal, rowIndex) => {
        const normalizedRgb = hsl2rgb({...color, l: color.l + invertal});
        let rgb = rgbToString(denormalize(normalizedRgb));

        if (rowIndex === 0) {
          const pct = 255 * (1 - index * 0.1 + 0.1);
          rgb = `rgba(${pct}, ${pct}, ${pct}, 1)`;
        }

        const x = width * index;
        const y = height * (5 + (rowIndex - 5));

        return (
          <Rect
            x={x}
            y={y}
            width={GRID_CELL_WIDTH}
            height={GRID_CELL_HEIGHT}
            color={rgb}
            key={`${rgb}-${invertal}-${rowIndex}`}
          />
        );
      })}
    </React.Fragment>
  );
};

export default ColorColumn;
