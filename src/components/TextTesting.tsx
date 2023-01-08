import {View, StyleSheet, Dimensions, TextInput} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
  Text,
  useFont,
} from '@shopify/react-native-skia';

type TextContent = {
  text: string;
  width: number;
  largestTextWidth: number;
};

const {width, height} = Dimensions.get('window');

const TextTesting = () => {
  const uber = useFont(require('../assets/UberBold.otf'), 20);
  const [text, setText] = useState<string>('');
  const [textContent, setTextContent] = useState<TextContent[]>([]);

  const onChangeText = (value: string) => {
    if (!uber) {
      return;
    }

    const contents = value.split('\n');

    const largestWidth = contents
      .map(c => uber.getTextWidth(c))
      .reduce((prev, next) => {
        if (prev > next) {
          return prev;
        }

        return next;
      });

    const newContents: TextContent[] = [];
    for (let content of contents) {
      const textWidth = uber.getTextWidth(content);
      newContents.push({
        text: content,
        width: textWidth,
        largestTextWidth: largestWidth,
      });
    }

    setText(text);
    setTextContent(newContents);
  };

  useEffect(() => {}, []);

  if (!uber) {
    return null;
  }

  return (
    <View style={styles.root}>
      <TextInput
        onChangeText={onChangeText}
        multiline={true}
        autoFocus={true}
      />
      <Canvas style={styles.canvas}>
        <Group
          layer={
            <Paint>
              <Blur blur={4} />
              <ColorMatrix
                matrix={[
                  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, -10,
                ]}
              />
            </Paint>
          }>
          <RoundedRect
            x={85}
            y={0}
            width={100}
            height={40}
            color={'#3366ff'}
            r={0}
          />
          <RoundedRect
            x={85}
            y={40}
            width={150}
            height={40}
            color={'#3366ff'}
            r={0}
          />
          <RoundedRect
            x={110}
            y={80}
            width={100}
            height={40}
            color={'#3366ff'}
            r={0}
          />
        </Group>
        <Group>
          <Text x={95} y={30} color={'#fff'} font={uber} text={'Hello'} />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width,
    height,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width,
    height,
  },
});

export default TextTesting;
