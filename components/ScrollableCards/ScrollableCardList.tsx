import { StyleSheet, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  cancelAnimation,
  DerivedValue,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue,
} from "react-native-reanimated";

import {
  ScrollableCard,
  ScrollableCardHeight,
  ScrollableCardWidth,
  WindowWidth,
} from "./ScrollableCard";
import { type ScrollListItem } from "./ScrollableCard";
import { useState } from "react";

export interface ScrollList {
  items: Partial<ScrollListItem>[];
}

export const ScrollableCardList = ({ items }: ScrollList) => {
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(animatedRef);
  const text = useDerivedValue(
    () => `Scroll offset: ${scrollOffset.value.toFixed(1)}`
  );
  const activeIndex = useDerivedValue(
    () =>
      `Active index: ${(scrollOffset.value / ScrollableCardWidth).toFixed(1)}`
  );
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      //console.log("The list is scrolling.");
    },
    onMomentumBegin: (e) => {
      //console.log("The list is moving.");
    },
    onMomentumEnd: (e) => {
      //console.log("The list stopped moving.");
    //   scrollOffset.value = Math.round(scrollOffset.value);
    },
    onBeginDrag: (e) => {
      //console.log("The list is being dragged.");
    },
    onEndDrag: (e) => {
      //console.log("The list stopped being dragged.");
    },
  });

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
          disableIntervalMomentum={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16} // 1/60fps = 16ms
          contentContainerStyle={{
            width: ScrollableCardWidth * items.length + ListPadding,
          }}
          style={{
            backgroundColor: "lightblue",
          }}
          onScroll={scrollHandler}
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
      <View
        style={{
          width: "80%",
          backgroundColor: "lightpink",
          height: 50,
          marginTop: 20,
        }}
      >
        <AnimatedText text={text} />
        <AnimatedText text={activeIndex} />
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
      {...props}
      value={text.value}
      animatedProps={animatedProps}
    />
  );
}
