import React, { useState } from 'react';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { View, StyleSheet, Text } from 'react-native';

const TRACK_R = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  thumb: {
    position: 'absolute',
    width: TRACK_R * 2,
    height: TRACK_R * 2,
    borderRadius: TRACK_R,
    top: 0,
    backgroundColor: 'white',
  },
  track: {
    width: 10,
    flex: 1,
    borderRadius: 5,
    backgroundColor: 'black',
  },
  textIndicator: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    fontWeight: 'bold',
  },
});

const StrokeSlider = ({
  minValue,
  maxValue,
  stroke,
}: {
  minValue: number;
  maxValue: number;
  stroke: Animated.SharedValue<number>;
}) => {
  const sliderHeight = useSharedValue(0);

  const [text, setText] = useState(stroke.value);

  const position = useDerivedValue(() => {
    runOnJS(setText)(Math.round(stroke.value));
    return (
      (sliderHeight.value / (maxValue - minValue)) * (stroke.value - minValue)
    );
  });

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startY: number }
  >(
    {
      onStart: ({ y }, ctx) => {
        ctx.startY = y;
      },
      onActive: ({ translationY }, { startY }) => {
        stroke.value = Math.min(
          maxValue,
          Math.max(
            minValue,
            ((startY + translationY) / sliderHeight.value) *
              (maxValue - minValue) +
              minValue
          )
        );
      },
      onEnd: () => {},
    },
    []
  );

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: position.value - TRACK_R }],
    };
  }, [position.value]);

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.container}>
          <View
            onLayout={(event) => {
              sliderHeight.value = event.nativeEvent.layout.height;
            }}
            style={styles.track}
          />
          <Animated.View style={[styles.thumb, style]} />
        </Animated.View>
      </PanGestureHandler>
      <Text style={styles.textIndicator}>{text}</Text>
    </View>
  );
};

export default StrokeSlider;
