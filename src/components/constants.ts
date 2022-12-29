type Rect = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

const HITSLOP = 20;

export const backgroundColors = [
  '#3366ff',
  'orange',
  'lightgreen',
  'pink',
  'lightred',
  'grey',
  'yellow',
];

export const textColors = [
  '#fff',
  '#000',
  '#000',
  '#000',
  '#000',
  '#fff',
  '#000',
];

export const rightBallHitslop: Rect = {
  top: HITSLOP,
  bottom: HITSLOP,
  right: HITSLOP,
  left: 0,
};

export const leftBallHitslop: Rect = {
  top: HITSLOP,
  bottom: HITSLOP,
  left: HITSLOP,
  right: 0,
};
