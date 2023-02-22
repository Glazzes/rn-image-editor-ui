import {View, StyleSheet, Image, Dimensions} from 'react-native';
import React, {useState} from 'react';
import {
  Canvas,
  Fill,
  ImageShader,
  Line,
  Path,
  Shader,
  Skia,
  useClockValue,
  useComputedValue,
  useImage,
  useTouchHandler,
  vec,
} from '@shopify/react-native-skia';

type CurveTestProps = {};

const aspectRatio = 768 / 1024;
const {width} = Dimensions.get('window');

const path = Skia.Path.Make();
path.moveTo(100, 100);
path.quadTo(200, 100, 100, 300);

const shader = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float time;

    const float TAU = 6.283185307179586;

    vec4 main(vec2 xy) {
      float angle = time * TAU; 

      xy -= vec2(160);
      xy *= mat2(cos(angle), -1.0 * sin(angle), sin(angle), cos(angle));
      xy += vec2(160);

      float color = step(100, xy.x) * step(xy.x, 220) * step(100, xy.y) * step(xy.y, 220);
      vec3 mixed = mix(
        vec3(0.2, 0.45, 1.0),
        vec3(1.0, 0.0, 0.0),
        (xy.x - 120) / 100
      );
      
      mixed *= vec3(color);
      return vec4(vec3(mixed), 1.0);
    }
`)!;

const CurveTest: React.FC<CurveTestProps> = ({}) => {
  const image = useImage(require('../assets/wolf.jpg'));
  const [displayOriginal, setDisplayOriginal] = useState<boolean>(false);

  const time = useClockValue();
  time.start();

  const modTime = useComputedValue(() => {
    return (time.current % 3000) / 3000;
  }, [time]);

  const uniforms = useComputedValue(() => ({time: modTime.current}), [time]);

  const onTouch = useTouchHandler({
    onStart: _ => {
      setDisplayOriginal(true);
    },
    onEnd: _ => {
      setDisplayOriginal(false);
    },
  });

  if (!image) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Canvas style={styles.canvas} onTouch={onTouch}>
        <Fill>
          <Shader source={shader} uniforms={uniforms}>
            <ImageShader
              image={image}
              x={0}
              y={0}
              width={280}
              height={280 / aspectRatio}
              fit={'cover'}
            />
          </Shader>
        </Fill>
      </Canvas>
      {displayOriginal ? (
        <Image
          source={require('../assets/wolf.jpg')}
          style={[styles.canvas, styles.absolute]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width,
    height: width,
  },
  absolute: {
    position: 'absolute',
  },
});

export default CurveTest;
