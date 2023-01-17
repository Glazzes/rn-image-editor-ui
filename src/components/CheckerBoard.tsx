import React from 'react';
import {Rect} from '@shopify/react-native-skia';

type CheckerBoardProps = {
  checkerSize: number;
  width: number;
  height: number;
  colors: [string, string];
};

const CheckerBoard: React.FC<CheckerBoardProps> = ({
  width,
  height,
  checkerSize,
  colors,
}) => {
  const columns = Math.ceil(width / checkerSize);
  const rows = Math.ceil(height / checkerSize);
  const checkers = new Array(columns * rows).fill(0);

  return (
    <React.Fragment>
      {checkers.map((_, index) => {
        const x = index % columns;
        const y = Math.floor(index / columns);

        let color = x % 2 === 0 ? colors[0] : colors[1];
        if (y % 2 === 1) {
          color = color === colors[0] ? colors[1] : colors[0];
        }

        return (
          <Rect
            key={`checker-${index}`}
            x={x * checkerSize}
            y={y * checkerSize}
            width={checkerSize}
            height={checkerSize}
            color={color}
          />
        );
      })}
    </React.Fragment>
  );
};

export default CheckerBoard;
