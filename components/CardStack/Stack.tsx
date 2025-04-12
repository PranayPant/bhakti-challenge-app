import { ReactNode, useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  Button,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  useAnimatedProps,
  interpolate,
  useAnimatedReaction,
  withTiming,
  runOnJS,
  Easing,
  SharedValue,
  DerivedValue,
} from "react-native-reanimated";
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
  Pressable,
} from "react-native-gesture-handler";

import { Card, Colors } from "./Card";

const { height, width } = Dimensions.get("window");

const DECK_SIZE = 3;

interface CardContainerProps {
  color: string;
  priorities: SharedValue<number[]>;
  index: number;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

function AnimatedText({ text, ...props }: { text: DerivedValue<string> }) {
  const animatedProps = useAnimatedProps(() => ({
    text: text.value,
    defaultValue: text.value,
  }));
  return (
    <AnimatedTextInput
      editable={false}
      style={{
        margin: 2,
        backgroundColor: "lightgreen",
        width: 200,
        zIndex: 900,
      }}
      {...props}
      value={text.value}
      animatedProps={animatedProps}
    />
  );
}

const CardContainer = ({ color, priorities, index }: CardContainerProps) => {
  console.log("CardContainer", index);
  const [isFront, setIsFront] = useState(() => false);
  const BOTTOM_BUFFER = 30;
  const isFlipped = useSharedValue(false);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(BOTTOM_BUFFER);
  const isRightFlick = useSharedValue(true);
  const rotationValue = useDerivedValue(
    () =>
      `${interpolate(
        rotation.value,
        isRightFlick.value ? [BOTTOM_BUFFER, height] : [BOTTOM_BUFFER, -height],
        [0, 4]
      )}rad`
  );

  const priority = useDerivedValue(() =>
    priorities.value.findIndex((p) => p === index)
  );

  useAnimatedReaction(
    () => priority.value,
    (current) => {
      runOnJS(setIsFront)(current === 0);
    }
  );

  const panGesture = Gesture.Pan()
    .onBegin(({ absoluteX, translationY }) => {
      translateY.value = translationY;
      rotation.value = translationY + BOTTOM_BUFFER;
      if (absoluteX < width / 2) {
        isRightFlick.value = false;
      }
    })
    .onUpdate(({ translationY }) => {
      translateY.value = translationY;
      rotation.value = translationY + BOTTOM_BUFFER;
    })
    .onEnd(({ translationY }) => {
      if (Math.abs(Math.round(translationY)) < 100) {
        translateY.value = withTiming(
          0,
          {
            duration: 200,
            easing: Easing.quad,
          },
          () => {
            isRightFlick.value = true;
          }
        );
        rotation.value = withTiming(BOTTOM_BUFFER, {
          duration: 200,
          easing: Easing.quad,
        });
        return;
      }

      priorities.value = [...priorities.value.slice(1), priorities.value[0]];

      translateY.value = withTiming(
        0,
        {
          duration: 400,
          easing: Easing.quad,
        },
        () => {
          isRightFlick.value = true;
        }
      );

      rotation.value = withTiming(
        -1280,
        {
          duration: 400,
          easing: Easing.linear,
        },
        () => {
          rotation.value = BOTTOM_BUFFER;
        }
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    height: 200,
    width: 325,
    backgroundColor: color,
    bottom: withTiming(BOTTOM_BUFFER + 20 * priority.value),
    borderRadius: 8,
    zIndex: interpolate(priority.value, [0, 2], [20, 10]),
    transform: [
      { translateY: translateY.value },
      {
        rotate: rotationValue.value,
      },
      {
        scale: withTiming(interpolate(priority.value, [0, 2], [1, 0.9]), {
          duration: 400,
          easing: Easing.quad,
        }),
      },
    ],
  }));

  const handlePress = () => {
    isFlipped.value = !isFlipped.value;
  };

  return (
    <>
      {isFront ? (
        <GestureDetector gesture={panGesture}>
          <>
            <Card isFlipped={isFlipped} id={index} style={animatedStyle}>
              <View>
                {/* <AnimatedText text={prioritiesText} /> */}
                <Pressable
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
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
              </View>
            </Card>
          </>
        </GestureDetector>
      ) : (
        <Card isFlipped={isFlipped} id={index} style={animatedStyle} />
      )}
    </>
  );
};

export interface CardStackProps {
  size: number;
}

export const CardStack = ({ size }: CardStackProps) => {
  const indices = Array.from({ length: size }, (_, i) => i);
  const priorities = useSharedValue(indices);
  const [displayIndices, setDisplayIndices] = useState(() => indices);

  useAnimatedReaction(
    () => priorities.value,
    (current) => {
      console.log("Priorities changed:", current);
      runOnJS(setDisplayIndices)(current);
      
    }
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        {displayIndices.map((index) => (
          <CardContainer
            key={index}
            index={index}
            priorities={priorities}
            color={
              index % 3 === 0
                ? Colors.LIGHT_RED
                : index === 1
                  ? Colors.LIGHT_GOLD
                  : Colors.LIGHT_BLUE
            }
          />
        ))}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 8,
  },
});
