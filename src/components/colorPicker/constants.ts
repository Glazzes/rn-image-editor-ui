import {Dimensions} from 'react-native';
import {HSL} from '../../utils/colors';

const {width} = Dimensions.get('window');

export const PADDING = 16;
export const PICKER_SIZE = width - PADDING * 2;
export const LUMINOSITY_PERCENTAGES = [
  0, -0.28, -0.2, -0.125, -0.075, 0, 0.12, 0.175, 0.25, 0.32,
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

export const GRID_CELL_WIDTH = Math.round(PICKER_SIZE / 12);
export const GRID_CELL_HEIGHT = Math.round(PICKER_SIZE / 10);
