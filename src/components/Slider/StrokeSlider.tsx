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
import { View } from 'react-native';
import { sliderStyle, TRACK_R } from './sliderStyle';
import useDrawHook from '../DrawCore/useDrawHook';
//import Rectangle from '../DrawWithOptions/rectangle.svg';

const StrokeSlider = ({
  minValue,
  maxValue,
}: {
  minValue: number;
  maxValue: number;
}) => {
  const { onColorStrokeChange, strokeWidth } = useDrawHook();

  const sliderWidth = useSharedValue(0);

  const [text, setText] = useState(strokeWidth!.value);

  const position = useDerivedValue(() => {
    runOnJS(setText)(Math.round(strokeWidth!.value));
    return (
      (sliderWidth.value / (maxValue - minValue)) *
      (strokeWidth!.value - minValue)
    );
  });
  const wrapperOnColorStrokeChange = () => {
    onColorStrokeChange();
  };
  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >(
    {
      onStart: ({ x }, ctx) => {
        ctx.startX = x;
      },
      onActive: ({ translationX }, { startX }) => {
        strokeWidth!.value = Math.min(
          maxValue,
          Math.max(
            minValue,
            ((startX + translationX) / sliderWidth.value) *
              (maxValue - minValue) +
              minValue
          )
        );
      },
      onEnd: () => {
        runOnJS(wrapperOnColorStrokeChange)();
      },
    },
    []
  );

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value - TRACK_R }],
    };
  }, [position.value]);

  return (
    <View style={sliderStyle.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={sliderStyle.container}>
          {/*
                  <Rectangle width={"100%"} height={"100%"} color={"#E5E5E5"} />
          */}
          <View
            onLayout={(event) => {
              sliderWidth.value = event.nativeEvent.layout.width;
            }}
            style={{
              width: '100%',
            }}
          />
          <Animated.View style={[sliderStyle.thumb, style]} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
export default StrokeSlider;
