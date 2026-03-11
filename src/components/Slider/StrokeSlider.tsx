import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { View } from 'react-native';
import { sliderStyle, TRACK_R } from './sliderStyle';
import useDrawHook from '../DrawCore/useDrawHook';
import SliderSvg from '../DrawWithOptions/SliderSvg';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    height: 38,
    width: '100%',
    justifyContent: 'center',
  },
  sliderBackground: {
    maxHeight: 15,
  },
});

const StrokeSlider = ({
  minValue,
  maxValue,
}: {
  minValue: number;
  maxValue: number;
}) => {
  const { onColorStrokeChange, strokeWidth } = useDrawHook();

  const sliderWidth = useSharedValue(0);
  const gestureStartX = useSharedValue(0);

  const position = useDerivedValue(() => {
    return (
      (sliderWidth.value / (maxValue - minValue)) *
      (strokeWidth!.value - minValue)
    );
  });
  const wrapperOnColorStrokeChange = () => {
    onColorStrokeChange();
  };

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      gestureStartX.value = event.x;
    })
    .onUpdate((event) => {
      strokeWidth!.value = Math.min(
        maxValue,
        Math.max(
          minValue,
          ((gestureStartX.value + event.translationX) / sliderWidth.value) *
            (maxValue - minValue) +
            minValue
        )
      );
    })
    .onEnd(() => {
      runOnJS(wrapperOnColorStrokeChange)();
    });

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value - TRACK_R }],
    };
  });

  return (
    <View style={sliderStyle.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={sliderStyle.container}>
          <View
            onLayout={(event) => {
              sliderWidth.value = event.nativeEvent.layout.width;
            }}
            style={styles.container}
          >
            <SliderSvg
              color="grey"
              preserveAspectRatio="none"
              style={styles.sliderBackground}
            />
          </View>
          <Animated.View style={[sliderStyle.thumb, style]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
export default StrokeSlider;
