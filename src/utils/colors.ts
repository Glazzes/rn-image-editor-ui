export type Channel = 'r' | 'g' | 'b' | 'a';

export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

export type RGBA<T> = {
  [Name in Channel]: T;
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

export const normalize = (color: RGBColor): RGBColor => {
  'worklet';
  return {
    r: color.r / 255,
    g: color.g / 255,
    b: color.b / 255,
  };
};

export const denormalize = (color: RGBColor): RGBColor => {
  'worklet';
  return {
    r: color.r * 255,
    g: color.g * 255,
    b: color.b * 255,
  };
};

export const mix = (start: RGBColor, end: RGBColor, t: number): RGBColor => {
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

export const rgbToString = (rgb: RGBColor, opacity?: number): string => {
  'worklet';
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity ?? 1})`;
};

export const rgb2Hex = (color: RGBColor): string => {
  'worklet';
  const r1 = rgb2HexValues[Math.floor(color.r / 16)];
  const r2 = rgb2HexValues[Math.round(color.r) % 16];
  const g1 = rgb2HexValues[Math.floor(color.g / 16)];
  const g2 = rgb2HexValues[Math.round(color.g) % 16];
  const b1 = rgb2HexValues[Math.floor(color.b / 16)];
  const b2 = rgb2HexValues[Math.round(color.b) % 16];
  return `#${r1}${r2}${g1}${g2}${b1}${b2}`;
};

export const hex2RGB = (color: string): RGBColor => {
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
