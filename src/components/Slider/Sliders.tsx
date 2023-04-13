import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import StrokeSlider from './StrokeSlider';
import ColorSlider from './ColorSlider';
import type { LinearGradientType } from '../../types';
import useDrawHook from '../DrawCore/useDrawHook';

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
    <View
      style={{
        flexDirection: 'row',
        marginTop: 20,
        borderColor: 'grey',
        //backgroundColor: '#42434E',
        borderRadius: 20,
        height: 40,
        borderWidth: 1,
        marginHorizontal: 20,
        maxWidth: 500,
        alignSelf: 'center',
      }}
    >
      <View
        style={{
          flex: 1,
          height: 40,
          marginHorizontal: 40,
          justifyContent: 'center',
        }}
      >
        <StrokeSlider minValue={2} maxValue={10} />
      </View>
      <View
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#E5E5E5',
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          padding: 4,
        }}
      >
        <Animated.View
          style={[
            { width: 20, height: 20, borderRadius: 10 },
            styleStrokeColor,
          ]}
        />
      </View>
      <View
        style={{
          flex: 1,
          height: 40,
          marginHorizontal: 40,
          justifyContent: 'center',
        }}
      >
        <ColorSlider linearGradient={linearGradient} />
      </View>
    </View>
  );
};

export default Sliders;
