import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  ViewStyle,
  Keyboard,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  Rect,
  SkFont,
  Text,
  useFont,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useDimensions} from '../utils/useVector';
import {useFonts} from 'expo-font';

type Aligment = 'left' | 'center' | 'right';

type TextContent = {
  text: string;
  width: number;
  largestTextWidth: number;
};

type TextBackgroundProps = {
  color: string;
  index: number;
  width: number;
  canvasWidth: number;
  alignment?: Aligment;
};

type BackgroundTextProps = {
  text: string;
  index: number;
  width: number;
  canvasWidth: number;
  font: SkFont | null;
  alignment?: Aligment;
};

const BG_HEIGHT = 50;
const PADDING = 10;
const FONT_SIZE = 30;
const {width, height} = Dimensions.get('window');

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

const TextBackground: React.FC<TextBackgroundProps> = ({
  index,
  color,
  width: textWidth,
  canvasWidth,
  alignment,
}) => {
  const x = useMemo(() => {
    if (canvasWidth === textWidth || alignment === 'left') {
      return 0;
    }

    if (alignment === 'center') {
      return (canvasWidth - textWidth) / 2;
    }

    if (alignment === 'right') {
      return canvasWidth - textWidth;
    }

    return 0;
  }, [alignment, canvasWidth, textWidth]);

  return (
    <Rect
      x={x}
      y={index * BG_HEIGHT}
      height={BG_HEIGHT}
      width={textWidth + PADDING * 2}
      color={color}
    />
  );
};

const BackgroudText: React.FC<BackgroundTextProps> = ({
  index,
  text,
  font,
  width: textWidth,
  canvasWidth,
  alignment,
}) => {
  const x = useMemo(() => {
    if (canvasWidth === textWidth || alignment === 'left') {
      return 0;
    }

    if (alignment === 'center') {
      return (canvasWidth - textWidth) / 2;
    }

    if (alignment === 'right') {
      return canvasWidth - textWidth;
    }

    return 0;
  }, [alignment, canvasWidth, textWidth]);

  if (font === null) {
    return null;
  }

  return (
    <Text
      text={text}
      color={'#fff'}
      font={font}
      x={x + PADDING}
      y={BG_HEIGHT * (index + 1) - PADDING * 1.5}
    />
  );
};

const TextTesting = () => {
  const [isFontLoaded] = useFonts({
    UberBold: require('../assets/UberBold.otf'),
  });

  const uber = useFont(require('../assets/UberBold.otf'), 30);

  const [alignment, setAlignment] = useState<Aligment>('left');
  const [canvasWidth, setCanvasWidth] = useState<number>(30);
  const [textContents, setTextContent] = useState<TextContent[]>([]);

  const canvasDimensions = useDimensions(0, 0);

  const inputStyles = useAnimatedStyle(() => {
    return {
      fontFamily: 'UberBold',
      margin: 0,
      padding: 0,
      fontSize: FONT_SIZE,
      height: canvasDimensions.height.value,
      width: canvasDimensions.width.value,
      backgroundColor: 'lime',
    };
  });

  const canvasStyle = useAnimatedStyle(() => {
    return {
      width: canvasDimensions.width.value,
      height: canvasDimensions.height.value,
    };
  });

  const onChangeText = (value: string) => {
    if (!uber) {
      return;
    }

    const contents = value.split('\n');

    const largestWidth = contents
      .map(c => uber.getTextWidth(c))
      .reduce((prev, next) => (prev > next ? prev : next));

    const newContents: TextContent[] = [];
    for (let content of contents) {
      const textWidth = uber.getTextWidth(content);
      newContents.push({
        text: content,
        width: textWidth,
        largestTextWidth: largestWidth,
      });
    }

    canvasDimensions.width.value = largestWidth + PADDING * 2;
    canvasDimensions.height.value = newContents.length * BG_HEIGHT;
    setTextContent(newContents);
    setCanvasWidth(largestWidth);
  };

  useEffect(() => {
    const kListener = Keyboard.addListener('keyboardDidHide', Keyboard.dismiss);
    return kListener.remove;
  }, []);

  if (!uber && !isFontLoaded) {
    return null;
  }

  return (
    <View style={styles.root}>
      <AnimatedInput
        onChangeText={onChangeText}
        multiline={true}
        autoFocus={true}
        style={inputStyles}
      />
      <Animated.View style={canvasStyle}>
        <Canvas style={{flex: 1}}>
          <Group
            color={'salmon'}
            style={'fill'}
            layer={
              <Paint>
                <Blur blur={4} />
                <ColorMatrix
                  matrix={[
                    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20,
                    -10,
                  ]}
                />
              </Paint>
            }>
            {textContents.map((context, index) => {
              return (
                <TextBackground
                  key={`block-${index}`}
                  index={index}
                  width={context.width}
                  canvasWidth={canvasWidth}
                  color={'salmon'}
                  alignment={alignment}
                />
              );
            })}
          </Group>
          <Group>
            {textContents.map((context, index) => {
              return (
                <BackgroudText
                  key={`block-${index}`}
                  index={index}
                  width={context.width}
                  canvasWidth={canvasWidth}
                  font={uber}
                  text={context.text}
                  alignment={alignment}
                />
              );
            })}
          </Group>
        </Canvas>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width,
    height,
    backgroundColor: '#fff',
  },
  canvas: {
    width,
    height,
  },
});

export default TextTesting;
