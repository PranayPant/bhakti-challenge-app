import type { Asset } from "expo-asset";
import { Image, type ImageSource } from "expo-image";
import { Dimensions, Pressable, Text, View, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const WindowWidth = Dimensions.get("window").width;
export const ScrollableCardWidth = WindowWidth * 0.8;
export const ScrollableCardHeight = (ScrollableCardWidth / 3) * 4;

export interface ScrollListItem {
  index: number;
  scrollOffset: SharedValue<number>;
  asset: Asset | undefined;
}

export const ScrollableCard = ({
  index,
  scrollOffset,
  asset,
}: ScrollListItem) => {
  const isDirectionX = true;
  const flippedState = useSharedValue(false);

  const flipStyles = useAnimatedStyle(() => {
    const backgroundColor = flippedState.value ? "lightblue" : "lightpink";
    const spinValue = interpolate(Number(flippedState.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });

    return {
      backgroundColor,
      transform: [{ rotateY: rotateValue }],
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(flippedState.value),
      [0, 1],
      [180, 360]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });

    return {
      transform: [
        isDirectionX ? { rotateX: rotateValue } : { rotateY: rotateValue },
      ],
    };
  });

  const rContainerStyle = useAnimatedStyle(() => {
    const paddingLeft = (WindowWidth - ScrollableCardWidth) / 4;
    const activeIndex = scrollOffset.value / ScrollableCardWidth;

    const translateX = interpolate(
      activeIndex,
      [index - 2, index - 1, index, index + 1], // input range [-1 ,0 , 1]
      [120, 60, 0, -ScrollableCardWidth - paddingLeft * 2], // output range
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      activeIndex,
      [index - 2, index - 1, index, index + 1],
      [0.8, 0.9, 1, 1], // output range
      Extrapolation.CLAMP
    );

    return {
      left: paddingLeft,
      transform: [
        {
          translateX: scrollOffset.value + translateX,
        },
        { scale },
      ],
    };
  }, []);

  const handlePress = () => {
    flippedState.value = !flippedState.value;
  };

  return (
    <Animated.View
      style={[
        {
          zIndex: -index,
        },
        rContainerStyle,
      ]}
    >
      <View
        style={{
          width: ScrollableCardWidth,
          height: ScrollableCardHeight,
          position: "absolute",
          borderRadius: 25,
          backgroundColor: "white",
        }}
      >
        <>
          {asset && (
            <View
              style={[
                {
                  width: "100%",
                  height: "100%",
                  borderRadius: 25,
                },
              ]}
            >
              <Animated.View
                style={[
                  {
                    width: "100%",
                    height: "80%",
                    borderRadius: 25,
                    position: "absolute",
                  },
                  flipStyles,
                ]}
              >
                <Image
                  source={asset.localUri}
                  priority="high"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 25,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                />
              </Animated.View>

              <View style={styles.buttonContainer}>
                <Pressable style={styles.toggleButton} onPress={handlePress}>
                  <Text style={styles.toggleButtonText}>Toggle card</Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    backgroundColor: "#b58df1",
    padding: 12,
    borderRadius: 48,
  },
  toggleButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});
