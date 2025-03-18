import { Image, type ImageSource } from "expo-image";
import { Dimensions, Text } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const WindowWidth = Dimensions.get("window").width;
export const ScrollableCardWidth = WindowWidth * 0.8;
export const ScrollableCardHeight = (ScrollableCardWidth / 3) * 4;

export interface ScrollListItem {
  index: number;
  scrollOffset: SharedValue<number>;
  imageSource: ImageSource;
}

export const ScrollableCard = ({
  index,
  scrollOffset,
  imageSource,
}: ScrollListItem) => {
  const rContainerStyle = useAnimatedStyle(() => {
    const activeIndex = scrollOffset.value / ScrollableCardWidth;

    const paddingLeft = (WindowWidth - ScrollableCardWidth) / 4;

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

  return (
    <Animated.View
      style={[
        {
          zIndex: -index,
        },
        rContainerStyle,
      ]}
    >
      <Image
        source={imageSource}
        style={{
          width: ScrollableCardWidth,
          height: ScrollableCardHeight,
          position: "absolute",
          borderRadius: 25,
        }}
      />
    </Animated.View>
  );
};
