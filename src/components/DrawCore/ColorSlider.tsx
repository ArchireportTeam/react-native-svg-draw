import React, { useCallback } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from 'react-native';

import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import type { hslColor } from '../../types';

const TRACK_R = 10;

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
  track: { width: 10, flex: 1, borderRadius: 5, borderWidth: 1 },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 22,
    marginTop: 20,
  },
});

const ColorSlider = ({
  color,
  linearGradient: LinearGradient,
}: {
  color: Animated.SharedValue<hslColor>;
  linearGradient: React.ComponentType<{ colors: any[] } & ViewProps>;
}) => {
  const sliderHeight = useSharedValue(0);

  const position = useDerivedValue(() => {
    const hslRegExp = new RegExp(/hsl\(([\d.]+),\s*(\d+)%,\s*([\d.]+)%\)/);
    const res = hslRegExp.exec(color.value);

    const lum = res ? parseFloat(res[3]) : 0;

    const tint = res ? parseFloat(res[1]) : 0;

    if (lum > 50) {
      return ((sliderHeight.value * 0.1) / 50) * (100 - lum);
    }

    if (lum < 50) {
      return sliderHeight.value - ((sliderHeight.value * 0.1) / 50) * lum;
    }

    return Math.min(
      sliderHeight.value,
      Math.max(
        0,
        sliderHeight.value * 0.1 +
          tint * ((sliderHeight.value - sliderHeight.value * 0.2) / 360)
      )
    );
  }, [sliderHeight.value]);

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startY: number }
  >(
    {
      onStart: ({ y }, ctx) => {
        ctx.startY = y;
      },
      onActive: ({ translationY }, { startY }) => {
        const slidePos = Math.min(sliderHeight.value, startY + translationY);

        if (slidePos < 0.1 * sliderHeight.value) {
          color.value = `hsl(${0 as number}, ${100 as number}%, ${Math.min(
            100,
            100 - (slidePos / (0.1 * sliderHeight.value)) * 50
          )}%)` as const;
        } else if (slidePos > 0.9 * sliderHeight.value) {
          color.value = `hsl(${0 as number}, ${100 as number}%, ${Math.max(
            50 -
              ((slidePos - 0.9 * sliderHeight.value) /
                (0.1 * sliderHeight.value)) *
                50,
            0
          )}%)` as const;
        } else {
          color.value = `hsl(${
            ((slidePos - sliderHeight.value * 0.1) /
              (sliderHeight.value - sliderHeight.value * 0.2)) *
            360
          }, ${100 as number}%, ${50 as number}%)` as const;
        }
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

  const selectedColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: color.value,
    };
  }, [color.value]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      sliderHeight.value = event.nativeEvent.layout.height;
    },
    [sliderHeight]
  );

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.container}>
          <LinearGradient
            colors={gradientColors}
            onLayout={onLayout}
            style={styles.track}
          />
          <Animated.View style={[styles.thumb, style]} />
        </Animated.View>
      </PanGestureHandler>

      <Animated.View style={[styles.indicator, selectedColorStyle]} />
    </View>
  );
};

export default ColorSlider;
