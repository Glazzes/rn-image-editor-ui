import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const PADDING = 16;
const SLIDER_WIDTH = width - PADDING * 2 - 50 - 10;
const OPACITY_SLIDER_WIDTH = width - PADDING * 2;
const BALL_SIZE = 28;

const CHANNEL_START_POINT = -1 * (SLIDER_WIDTH / 2 - BALL_SIZE / 2);
const CHANNEL_END_POINT = SLIDER_WIDTH / 2 - BALL_SIZE / 2;
const OPACITY_CHANNEL_END_POINT = OPACITY_SLIDER_WIDTH / 2 - BALL_SIZE / 2;

const positionOutputRange = [CHANNEL_START_POINT, CHANNEL_END_POINT];

export {
  SLIDER_WIDTH,
  OPACITY_SLIDER_WIDTH,
  CHANNEL_START_POINT,
  OPACITY_CHANNEL_END_POINT,
  positionOutputRange,
  BALL_SIZE,
};
