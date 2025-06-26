import { TextInput, TextInputProps } from 'react-native';
import Animated, { DerivedValue, useAnimatedProps } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

export function AnimatedText({
  text,
  ...props
}: {
  text: DerivedValue<string>;
} & TextInputProps) {
  const animatedProps = useAnimatedProps(() => ({
    text: text.value,
    defaultValue: text.value
  }));
  return <AnimatedTextInput editable={false} {...props} value={text.value} animatedProps={animatedProps} />;
}
