import {TextInputProps} from 'react-native';
import React from 'react';
import Animated, {useAnimatedProps} from 'react-native-reanimated';
import {TextInput} from 'react-native-gesture-handler';

type ReanimatedInputProps = {
  text: Animated.SharedValue<string>;
};

Animated.addWhitelistedNativeProps({text: true});
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ReanimatedInput: React.FC<
  ReanimatedInputProps & TextInputProps
> = props => {
  const animatedProps = useAnimatedProps(() => {
    return {text: props.text.value} as any;
  });

  return <AnimatedTextInput animatedProps={animatedProps} {...props} />;
};

export default ReanimatedInput;
