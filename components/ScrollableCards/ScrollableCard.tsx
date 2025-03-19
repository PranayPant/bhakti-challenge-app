import type { Asset } from "expo-asset";
import {
  Dimensions,
  Pressable,
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FlipCard } from "../FlipCard";
import { useDebugValue } from "react";

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
  const activeIndex = useDerivedValue(() => {
    return scrollOffset.value / ScrollableCardWidth;
  });
  const rContainerStyle = useAnimatedStyle(() => {
    const paddingLeft = (WindowWidth - ScrollableCardWidth) / 4;

    const translateX = interpolate(
      activeIndex.value,
      [index - 2, index - 1, index, index + 1], // input range [-1 ,0 , 1]
      [120, 60, 0, -ScrollableCardWidth - paddingLeft * 2], // output range
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      activeIndex.value,
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
        }}
      >
        <>
          {asset && (
            <View
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                borderRadius: 25,
                backgroundColor: "#fff",
                shadowColor: "#000",
              }}
            >
              <FlipCard
                index={index}
                currentIndex={activeIndex.value}
                RegularContent={
                  <Image
                    source={{
                      uri: asset.uri,
                    }}
                    style={{
                      flex: 1,
                      width: "100%",
                      height: "100%",
                      borderRadius: 25,
                    }}
                  />
                  // <View
                  //   style={{
                  //     flex: 1,
                  //     width: "100%",
                  //     height: "100%",
                  //     backgroundColor: "#fff",
                  //     borderRadius: 25,
                  //     justifyContent: "center",
                  //     alignItems: "center",
                  //   }}
                  // >
                  //   <Text>Front {index}</Text>
                  // </View>
                }
                FlippedContent={
                  <Image
                    source={{
                      uri: asset.uri,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 25,
                    }}
                  />
                  // <View
                  //   style={{
                  //     flex: 1,
                  //     justifyContent: "center",
                  //     alignItems: "center",
                  //     width: "100%",
                  //     height: "100%",
                  //     backgroundColor: "#b58df1",
                  //     borderRadius: 25,
                  //   }}
                  // >
                  //   <Text>Back {index}</Text>
                  // </View>
                }
              />
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
