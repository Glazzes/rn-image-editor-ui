import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Animated, {
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
} from 'react-native-reanimated';
import {launchImageLibrary, Asset} from 'react-native-image-picker';

type ScrollableBottomSheetProps = {
  translateY: Animated.SharedValue<number>;
};

const {width, height} = Dimensions.get('window');

const data: Asset[] = [];

function renderItem(info: ListRenderItemInfo<Asset>): React.ReactElement {
  return <View />;
}

function keyExtractor(item: Asset, index: number): string {
  return `${item.uri}-${index}`;
}

const ScrollableBottomSheet: React.FC<ScrollableBottomSheetProps> = ({
  translateY,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const animatedRef = useAnimatedRef<Animated.FlatList<Asset>>();

  useAnimatedReaction(
    () => translateY.value,
    value => {
      scrollTo(animatedRef, 0, -1 * value - height, false);
    },
    [translateY],
  );

  useEffect(() => {
    launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 0,
    })
      .then(response => {
        if (response.assets) {
          setAssets(response.assets);
          return;
        }

        Promise.reject('No assets were found');
      })
      .catch(resason => Alert.alert(resason));
  });

  return (
    <View style={styles.root}>
      <Text>Welcome to ScrollableBottomSheet</Text>
      <Animated.FlatList
        ref={animatedRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width,
    height,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});

export default ScrollableBottomSheet;
