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

export const hex2RGB = (hexColor: string): RGBColor => {
  'worklet';
  const r = hex2RGBValues[hexColor[0]] * 16 + hex2RGBValues[hexColor[1]];
  const g = hex2RGBValues[hexColor[2]] * 16 + hex2RGBValues[hexColor[3]];
  const b = hex2RGBValues[hexColor[4]] * 16 + hex2RGBValues[hexColor[5]];

  return {
    r,
    g,
    b,
  };
};

export class Colors {
  private static colorRegex = /^#([a-f\d]{2}){3}$/gi;

  public static hexToRgb(color: string): RGBColor {
    const normalizedColor = color.toUpperCase();
    const isColor = this.colorRegex.test(normalizedColor);
    if (!isColor || normalizedColor.length !== 7) {
      throw Error(`${color} is not a valid hex color`);
    }

    const result = normalizedColor.match(/([a-f\d]{2})/gi)!;

    return {
      r: this.parseHex(result[0]),
      g: this.parseHex(result[1]),
      b: this.parseHex(result[2]),
    };
  }

  private static parseHex(hexPart: string): number {
    let result = 0;
    const isLetter = /^[A-F]$/;

    const valueOne = hexPart[0];
    const valueTwo = hexPart[1];

    const isValueOneLetter = isLetter.test(valueOne);
    const isValueTwoLtter = isLetter.test(valueTwo);

    result += isValueOneLetter
      ? (valueOne.charCodeAt(0) - 65 + 10) * 16
      : parseInt(valueOne) * 16;

    result += isValueTwoLtter
      ? valueTwo.charCodeAt(0) - 65 + 10
      : parseInt(valueTwo);

    return result;
  }

  public static luminance(color: RGBColor): number {
    const values = Object.values(color).map(channel => {
      const normalizedChannel = (channel /= 255);
      return normalizedChannel <= 0.03928
        ? normalizedChannel / 12.92
        : Math.pow((normalizedChannel + 0.055) / 1.055, 2.4);
    });

    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  }
}
