import {View, StyleSheet} from 'react-native';
import React from 'react';
import {
  Canvas,
  Fill,
  useFont,
  Text,
  Group,
  useComputedValue,
} from '@shopify/react-native-skia';

type EmojiStickerProps = {};

const EmojiSticker: React.FC<EmojiStickerProps> = ({}) => {
  const noto = useFont(require('../assets/fonts/Noto.ttf'), 180);

  const x = useComputedValue(() => {
    if (!noto) {
      return 0;
    }

    return (200 - noto.getTextWidth('🫠')) / 2;
  }, [noto]);

  if (!noto) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Canvas style={styles.canvas}>
        <Fill color={'#3366ff'} />
        <Group origin={{x: 100, y: 100}}>
          <Text x={x} y={162} text={'🤢'} font={noto} />
        </Group>
      </Canvas>
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
    width: 200,
    height: 200,
  },
});

export default EmojiSticker;
