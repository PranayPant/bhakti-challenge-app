import {
  Pressable,
  StyleSheet,
  View,
  Text,
  TextStyle,
  TextInput,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
  SharedValue,
  useSharedValue,
  DerivedValue,
  useAnimatedProps,
} from "react-native-reanimated";

export const Colors = {
  LIGHT_BLUE: "#afd0ff",
  LIGHT_GOLD: "#e8d38f",
  LIGHT_RED: "#ff7e85",
  DARK_BLUE: "#4a64a8",
  DARK_GOLD: "#85692a",
  DARK_RED: "#992e1e",
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

function AnimatedText({
  text,
  style,
  ...props
}: {
  text: DerivedValue<string>;
  style?: TextStyle;
}) {
  const animatedProps = useAnimatedProps(() => ({
    text: text.value,
    defaultValue: text.value,
  }));
  return (
    <AnimatedTextInput
      editable={false}
      style={{
        backgroundColor: "lightgreen",
        width: 200,
        zIndex: 900,
        ...style,
      }}
      {...props}
      value={text.value}
      animatedProps={animatedProps}
    />
  );
}

interface CardProps {
  id: number;
  style: object;
  frontDisplay: DerivedValue<string>;
  children?: React.ReactNode;
}

export const Card = ({ id, style, frontDisplay, children }: CardProps) => {
  const isFlipped = useSharedValue(false);

  const getColor = () => {
    switch (id % 3) {
      case 0:
        return Colors.DARK_BLUE;
      case 1:
        return Colors.DARK_RED;
      case 2:
        return Colors.DARK_GOLD;
    }
  };

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });

    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });

    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const handlePress = () => {
    isFlipped.value = !isFlipped.value;
  };

  return (
    <Animated.View style={style}>
      {children}
      <Pressable
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "lightskyblue",
          padding: 8,
          width: 100,
          height: 40,
          borderRadius: 8,
          zIndex: 99999,
        }}
        onPress={handlePress}
      >
        <Text>Flip</Text>
      </Pressable>

      <Animated.View
        style={[
          cardStyle.spacer,
          flipCardStyles.base,
          regularCardAnimatedStyle,
        ]}
      >
        <AnimatedText
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "lightskyblue",
            padding: 8,
            width: 100,
            height: 40,
            borderRadius: 8,
          }}
          text={frontDisplay}
        ></AnimatedText>
        <View style={cardStyle.spacer} />
        <View style={cardStyle.container}>
          <View style={[cardStyle.circle, { backgroundColor: getColor() }]} />
          <View>
            <View
              style={[cardStyle.topLine, { backgroundColor: getColor() }]}
            />
            <View
              style={[cardStyle.bottomLine, { backgroundColor: getColor() }]}
            />
          </View>
        </View>
      </Animated.View>
      <Animated.View
        style={[
          cardStyle.spacer,
          flipCardStyles.base,
          flippedCardAnimatedStyle,
          { backgroundColor: "lightgreen", borderRadius: 8 },
        ]}
      >
        <View style={cardStyle.spacer} />
        <View style={cardStyle.container}>
          <View style={[cardStyle.circle, { backgroundColor: getColor() }]} />
          <View>
            <View
              style={[cardStyle.topLine, { backgroundColor: getColor() }]}
            />
            <View
              style={[cardStyle.bottomLine, { backgroundColor: getColor() }]}
            />
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const cardStyle = StyleSheet.create({
  spacer: {
    flex: 1,
  },
  container: {
    flexDirection: "row",
  },
  circle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 15,
  },
  topLine: {
    height: 20,
    width: 120,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 15,
  },
  bottomLine: {
    height: 20,
    width: 60,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 15,
  },
});

const flipCardStyles = StyleSheet.create({
  base: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
});

export default Card;
