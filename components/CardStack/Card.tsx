import { Pressable, StyleSheet, View, Text, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
  SharedValue,
} from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { ReactNode } from "react";

interface CardProps {
  id: number;
  isFlipped: SharedValue<boolean>;
  rootStyle: ViewStyle;
  frontStyle?: ViewStyle;
  backStyle?: ViewStyle;
  frontDisplay: ReactNode;
  backDisplay: ReactNode;
  children?: React.ReactNode;
}

export const Card = ({
  id,
  isFlipped,
  rootStyle,
  frontStyle,
  backStyle,
  frontDisplay,
  backDisplay,
  children,
}: CardProps) => {
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
    <Animated.View style={rootStyle}>
      {children}

      <Animated.View
        style={[
          cardStyle.spacer,
          flipCardStyles.base,
          regularCardAnimatedStyle,
          frontStyle,
        ]}
      >
        {frontDisplay}
        <Pressable
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            backgroundColor: Colors.purple[300],
            padding: 8,
            width: 100,
            height: 40,
            borderRadius: 8,
          }}
          onPress={handlePress}
        >
          <Text style={{ margin: "auto", color: "white" }}>See answer</Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        style={[
          cardStyle.spacer,
          flipCardStyles.base,
          flippedCardAnimatedStyle,
          backStyle,
        ]}
      >
        {backDisplay}
        <Pressable
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            backgroundColor: Colors.purple[300],
            padding: 8,
            width: 100,
            height: 40,
            borderRadius: 8,
          }}
          onPress={handlePress}
        >
          <Text style={{ margin: "auto", color: "white" }}>Go back</Text>
        </Pressable>
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
