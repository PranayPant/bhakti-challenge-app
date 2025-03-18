import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
} from "react-native-reanimated";

import {
  ScrollableCard,
  ScrollableCardHeight,
  ScrollableCardWidth,
  WindowWidth,
} from "./ScrollableCard";
import { type ScrollListItem } from "./ScrollableCard";

export interface ScrollList {
  items: Partial<ScrollListItem>[];
}

export const ScrollableCardList = ({ items }: ScrollList) => {
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(animatedRef);

  const ListPadding = WindowWidth - ScrollableCardWidth;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View
        style={{
          height: ScrollableCardHeight,
          width: "100%",
        }}
      >
        <Animated.ScrollView
          ref={animatedRef}
          horizontal
          snapToInterval={ScrollableCardWidth}
          decelerationRate={"fast"}
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16} // 1/60fps = 16ms
          contentContainerStyle={{
            width: ScrollableCardWidth * items.length + ListPadding,
          }}
        >
          {items.map((item, index) => {
            return (
              <ScrollableCard
                index={index}
                key={index}
                scrollOffset={scrollOffset}
                asset={item.asset}
              />
            );
          })}
        </Animated.ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D3045",
    alignItems: "center",
    justifyContent: "center",
  },
});
