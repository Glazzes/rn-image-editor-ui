import {useWindowDimensions, ViewStyle} from 'react-native';
import React from 'react';
import {Canvas, Fill, Shader, Skia} from '@shopify/react-native-skia';

type HSLSpectrumProps = {};

const PADDING = 16;

// Formula from https://www.had2know.org/technology/hsl-rgb-color-converter.html
const shader = Skia.RuntimeEffect.Make(`
  uniform float size;

  vec3 hsl2RGB(float h, float s, float l) {
    float d = s * (1.0 - abs(2.0 * l - 1.0));
    float m = l - d / 2.0;
    float x = d * (1.0 - abs(mod((h / 60), 2.0) - 1.0));

    if(h >= 0.0 && h <= 60) {
      return vec3(d + m, x + m, m);
    } else if (h >= 60 && h <= 120) {
      return vec3(x + m, d + m, m);
    } else if (h >= 120 && h <= 180) {
      return vec3(m, d + m, x + m);
    } else if (h >= 180 && h <= 240) {
      return vec3(m, x + m, d + m);
    } else if(h >= 240 && h <= 300) {
      return vec3(x + m, m, d + m);
    } else {
      return vec3(d + m, m, x + m);
    }
  }

  vec4 main(vec2 xy) {
    float hue = 360 * (xy.y / size);
    float saturation = 1.0;
    float luminosity = 1.0 - (xy.x / size);

    vec3 color = hsl2RGB(hue, 1.0, luminosity);
    return vec4(color, 1.0);
  }`)!;

const HSLSpectrum: React.FC<HSLSpectrumProps> = ({}) => {
  const {width} = useWindowDimensions();

  const size = width - PADDING * 2;
  const canvasStyles: ViewStyle = {
    width: size,
    height: size,
  };

  return (
    <Canvas style={canvasStyles}>
      <Fill>
        <Shader source={shader} uniforms={{size}} />
      </Fill>
    </Canvas>
  );
};

export default HSLSpectrum;
