import React from 'react';
import {denormalize, HSL, hsl2rgb, rgbToString} from '../utils/colors';
import {Rect} from '@shopify/react-native-skia';
import {GRID_CELL_SIZE, LUMINOSITY_PERCENTAGES} from './colorPicker/constants';

type ColorColumnProps = {
  color: HSL;
  index: number;
};

const ColorColumn: React.FC<ColorColumnProps> = ({color, index}) => {
  return (
    <React.Fragment>
      {LUMINOSITY_PERCENTAGES.map((interval, rowIndex) => {
        const normalizedRgb = hsl2rgb({
          ...color,
          s: color.s + (interval < 4 ? interval : 0),
          l: color.l + interval,
        });
        let rgb = rgbToString(denormalize(normalizedRgb));

        if (rowIndex === 0) {
          const pct = 255 * Math.min(1 - index * 0.1 + 0.05, 1);
          rgb = `rgba(${pct}, ${pct}, ${pct}, 1)`;
        }

        const x = GRID_CELL_SIZE * index;
        const y = GRID_CELL_SIZE * (5 + (rowIndex - 5));

        return (
          <Rect
            x={x}
            y={y}
            width={GRID_CELL_SIZE}
            height={GRID_CELL_SIZE}
            color={rgb}
            key={`${rgb}-${interval}-${rowIndex}`}
          />
        );
      })}
    </React.Fragment>
  );
};

export default ColorColumn;
