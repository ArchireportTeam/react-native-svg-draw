import React from 'react';
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
import SliderSvg from '../DrawWithOptions/SliderSvg';
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

  const position = useDerivedValue(() => {
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
          <View
            onLayout={(event) => {
              sliderWidth.value = event.nativeEvent.layout.width;
            }}
          >
            <SliderSvg
              color="grey"
              width={150}
              style={{
                marginTop: 5,
              }}
            />
          </View>
          <Animated.View style={[sliderStyle.thumb, style]} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
export default StrokeSlider;
