import {Extrapolate, interpolate} from 'react-native-reanimated';
import {clamp} from '../components/clampSelectionBoundaries';
import {Dimension, Vector} from './types';

export type Channel = 'r' | 'g' | 'b' | 'a';

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type HSL = {
  h: number;
  s: number;
  l: number;
};

const rgb2HexValues: {[id: number]: string | number} = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 'a',
  11: 'b',
  12: 'c',
  13: 'd',
  14: 'e',
  15: 'f',
};

const hex2RGBValues: {[id: string]: number} = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
};

export const normalize = (color: RGB): RGB => {
  'worklet';
  return {
    r: clamp(color.r / 255, 0, 255),
    g: clamp(color.g / 255, 0, 255),
    b: clamp(color.b / 255, 0, 255),
  };
};

export const denormalize = (color: RGB): RGB => {
  'worklet';
  return {
    r: clamp(color.r * 255, 0, 255),
    g: clamp(color.g * 255, 0, 255),
    b: clamp(color.b * 255, 0, 255),
  };
};

export const mix = (start: RGB, end: RGB, t: number): RGB => {
  'worklet';
  const normalizedT = Math.max(Math.min(1, t), 0);
  const deltaR = start.r - end.r;
  const deltaG = start.g - end.g;
  const deltaB = start.b - end.b;

  return {
    r: start.r + deltaR * normalizedT,
    g: start.g + deltaG * normalizedT,
    b: start.b + deltaB * normalizedT,
  };
};

export const rgbToString = (rgb: RGB, opacity?: number): string => {
  'worklet';
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity ?? 1})`;
};

export const rgb2Hex = (color: RGB): string => {
  'worklet';
  const r1 = rgb2HexValues[Math.floor(color.r / 16)];
  const r2 = rgb2HexValues[Math.round(color.r) % 16];
  const g1 = rgb2HexValues[Math.floor(color.g / 16)];
  const g2 = rgb2HexValues[Math.round(color.g) % 16];
  const b1 = rgb2HexValues[Math.floor(color.b / 16)];
  const b2 = rgb2HexValues[Math.round(color.b) % 16];
  return `#${r1}${r2}${g1}${g2}${b1}${b2}`;
};

export const hex2rgb = (color: string): RGB => {
  'worklet';
  const currentHex =
    color.length === 3
      ? color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
      : color;

  const r = hex2RGBValues[currentHex[0]] * 16 + hex2RGBValues[currentHex[1]];
  const g = hex2RGBValues[currentHex[2]] * 16 + hex2RGBValues[currentHex[3]];
  const b = hex2RGBValues[currentHex[4]] * 16 + hex2RGBValues[currentHex[5]];

  return {
    r,
    g,
    b,
  };
};

/**
 * Turns an HSL color into an RGB color whose values range from 0 to 1
 */
export const hsl2rgb = (color: HSL): RGB => {
  'worklet';
  const {h, s, l} = color;
  const d = s * (1 - Math.abs(2.0 * l - 1));
  const m = l - d / 2;
  const x = d * (1 - Math.abs(((h / 60) % 2) - 1));

  if (h >= 0 && h <= 60) {
    return {r: d + m, g: x + m, b: m};
  } else if (h >= 60 && h <= 120) {
    return {r: x + m, g: d + m, b: m};
  } else if (h >= 120 && h <= 180) {
    return {r: m, g: d + m, b: x + m};
  } else if (h >= 180 && h <= 240) {
    return {r: m, g: x + m, b: d + m};
  } else if (h >= 240 && h <= 300) {
    return {r: x + m, g: m, b: d + m};
  } else {
    return {r: d + m, g: m, b: x + m};
  }
};

/**
 * Turns a pair of x and y coordinates into an HSL color. Hue is calculated from y cooridante from
 * 0 to dimensions's height. Luminosity is calculated from x coordinate from 0 to dimensions's width.
 * Saturation is always 1.0
 */
export const xy2hsl = (xy: Vector<number>, dimension: Dimension): HSL => {
  'worklet';
  const hue = 360 * (xy.y / dimension.height);
  const luminosity = 1 - xy.x / dimension.width;

  return {
    h: hue,
    s: 1,
    l: luminosity,
  };
};

/**
 * Given a color in hsl color model, will return it's position in the given dimensions
 * turning the hue into the Y coordinate and luminosity into the X coordinate, saturation
 * it's always treated as 1.0
 */
export const hsl2xy = (color: HSL, dimensions: Dimension): Vector<number> => {
  'worklet';
  const x = interpolate(
    color.l,
    [1, 0],
    [0, dimensions.width],
    Extrapolate.CLAMP,
  );

  const y = interpolate(
    color.h,
    [0, 360],
    [0, dimensions.height],
    Extrapolate.CLAMP,
  );

  return {x, y};
};
