import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, withTiming, SharedValue } from 'react-native-reanimated';

import { ReactNode } from 'react';
import { useChallengeStore } from '@/stores/challenge-provider';
import { Icon } from 'react-native-paper';

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
  children
}: CardProps) => {
  const goBackwards = useChallengeStore((store) => store.goBackwards);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });

    return {
      transform: [{ rotateY: rotateValue }]
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration: 500 });

    return {
      transform: [{ rotateY: rotateValue }]
    };
  });

  const handleBack = () => {
    goBackwards();
  };

  return (
    <Animated.View style={rootStyle}>
      {children}

      <Animated.View style={[cardStyle.spacer, flipCardStyles.base, regularCardAnimatedStyle, frontStyle]}>
        {frontDisplay}
        <Pressable
          className="flex flex-row items-center justify-center gap-1 h-12 absolute bottom-5 right-5 bg-white p-2 rounded-lg"
          onPress={handleBack}>
          <Icon source="arrow-left" color="black" size={18} />
          <Text>Go back</Text>
        </Pressable>
      </Animated.View>
      <Animated.View style={[cardStyle.spacer, flipCardStyles.base, flippedCardAnimatedStyle, backStyle]}>
        {backDisplay}
      </Animated.View>
    </Animated.View>
  );
};

const cardStyle = StyleSheet.create({
  spacer: {
    flex: 1
  },
  container: {
    flexDirection: 'row'
  },
  circle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 15
  },
  topLine: {
    height: 20,
    width: 120,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 15
  },
  bottomLine: {
    height: 20,
    width: 60,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 15
  }
});

const flipCardStyles = StyleSheet.create({
  base: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden'
  }
});

export default Card;
