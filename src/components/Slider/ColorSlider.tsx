import { sliderStyle, TRACK_R } from './sliderStyle';
import React, { useCallback } from 'react';
import { LayoutChangeEvent, View, ViewProps } from 'react-native';

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
import type { LinearGradientType } from '../../types';
import useDrawHook from '../DrawCore/useDrawHook';

const gradientColors = [
  'hsl(0, 100%, 100%) 00%',
  'hsl(0, 100%, 50%) 10%',
  'hsl(45, 100%, 50%) 20%',
  'hsl(90, 100%, 50%) 30%',
  'hsl(135, 100%, 50%) 40%',
  'hsl(180, 100%, 50%) 50%',
  'hsl(225, 100%, 50%) 60%',
  'hsl(270, 100%, 50%) 70%',
  'hsl(315, 100%, 50%) 80%',
  'hsl(360, 100%, 50%) 90%',
  'hsl(0, 100%, 0%) 100%  ',
];

const gradientStart = { x: 0, y: 0 };
const gradientEnd = { x: 1, y: 0 };

const ColorSlider = ({
  linearGradient: LinearGradient,
}: {
  linearGradient: React.ComponentType<LinearGradientType & ViewProps>;
}) => {
  const { onColorStrokeChange, color } = useDrawHook();
  const sliderWidth = useSharedValue(0);

  const position = useDerivedValue(() => {
    const hslRegExp = new RegExp(/hsl\(([\d.]+),\s*(\d+)%,\s*([\d.]+)%\)/);
    const res = hslRegExp.exec(color!.value);

    const lum = res ? parseFloat(res[3] ?? '0') : 0;

    const tint = res ? parseFloat(res[1] ?? '0') : 0;

    if (lum > 50) {
      return ((sliderWidth.value * 0.1) / 50) * (100 - lum);
    }

    if (lum < 50) {
      return sliderWidth.value - ((sliderWidth.value * 0.1) / 50) * lum;
    }

    return Math.min(
      sliderWidth.value,
      Math.max(
        0,
        sliderWidth.value * 0.1 +
          tint * ((sliderWidth.value - sliderWidth.value * 0.2) / 360)
      )
    );
  }, [sliderWidth.value]);

  const wrapperOnColorChange = () => {
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
        const slidePos = Math.min(sliderWidth.value, startX + translationX);

        if (slidePos < 0.1 * sliderWidth.value) {
          color!.value = `hsl(0, 100%, ${Math.min(
            100,
            100 - (slidePos / (0.1 * sliderWidth.value)) * 50
          ).toFixed(10)}%)`;
        } else if (slidePos > 0.9 * sliderWidth.value) {
          color!.value = `hsl(0, 100%, ${Math.max(
            50 -
              ((slidePos - 0.9 * sliderWidth.value) /
                (0.1 * sliderWidth.value)) *
                50,
            0
          ).toFixed(10)}%)`;
        } else {
          color!.value = `hsl(${
            ((slidePos - sliderWidth.value * 0.1) /
              (sliderWidth.value - sliderWidth.value * 0.2)) *
            360
          }, 100%, 50%)`;
        }
      },
      onEnd: () => {
        runOnJS(wrapperOnColorChange)();
      },
    },
    []
  );

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value - TRACK_R }],
    };
  }, [position.value]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      sliderWidth.value = event.nativeEvent.layout.width;
    },
    [sliderWidth]
  );

  return (
    <View style={sliderStyle.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={sliderStyle.container}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={gradientColors}
            onLayout={onLayout}
            style={sliderStyle.track}
          />
          <Animated.View style={[sliderStyle.thumb, style]} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default ColorSlider;
