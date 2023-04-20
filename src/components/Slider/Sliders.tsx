import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import StrokeSlider from './StrokeSlider';
import ColorSlider from './ColorSlider';
import type { LinearGradientType } from '../../types';
import useDrawHook from '../DrawCore/useDrawHook';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  strokeContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderColor: 'grey',
    borderRadius: 20,
    height: 40,
    borderWidth: 1,
    marginHorizontal: 20,
    maxWidth: 500,
    alignSelf: 'center',
  },
  strokeWrapper: {
    flex: 1,
    height: 40,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  currentColorContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    padding: 4,
  },
  currentColor: { width: 20, height: 20, borderRadius: 10 },
  colorContainer: {
    flex: 1,
    height: 40,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
});

const Sliders = ({
  linearGradient,
}: {
  linearGradient: React.ComponentType<LinearGradientType & ViewProps>;
}) => {
  const { strokeWidth, color } = useDrawHook();

  const styleStrokeColor = useAnimatedStyle(() => {
    return {
      borderWidth: strokeWidth!.value,
      borderColor: color!.value,
    };
  }, [strokeWidth, color]);

  return (
    <View style={styles.strokeContainer}>
      <View style={styles.strokeWrapper}>
        <StrokeSlider minValue={2} maxValue={10} />
      </View>
      <View style={styles.currentColorContainer}>
        <Animated.View style={[styles.currentColor, styleStrokeColor]} />
      </View>
      <View style={styles.colorContainer}>
        <ColorSlider linearGradient={linearGradient} />
      </View>
    </View>
  );
};

export default Sliders;
