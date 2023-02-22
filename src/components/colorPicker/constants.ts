import {Dimensions} from 'react-native';
import {HSL} from '../../utils/colors';

const {width} = Dimensions.get('window');

export const PADDING = 16;

export const LUMINOSITY_PERCENTAGES = [
  0, -0.2, -0.15, -0.1, -0.05, 0, 0.07, 0.14, 0.21, 0.28,
];

// grid
export const GRID_COLORS: HSL[] = [
  {h: 195, s: 1, l: 0.42},
  {h: 218, s: 1, l: 0.5},
  {h: 258, s: 0.71, l: 0.42},
  {h: 285, s: 0.63, l: 0.45},
  {h: 339, s: 0.61, l: 0.45},
  {h: 11, s: 0.98, l: 0.53},
  {h: 25, s: 1, l: 0.5},
  {h: 41, s: 1, l: 0.5},
  {h: 47, s: 1, l: 0.49},
  {h: 59, s: 0.97, l: 0.63},
  {h: 66, s: 0.82, l: 0.57},
  {h: 93, s: 0.49, l: 0.49},
];

export const PICKER_WIDTH = width - PADDING * 2;
export const GRID_CELL_SIZE = Math.round(PICKER_WIDTH / 12);
export const PICKER_HEIGHT = GRID_CELL_SIZE * 10;
