import React from "react";
import { View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import StrokeSlider from './StrokeSlider';
import ColorSlider from './ColorSlider';
import { hslColor, LinearGradientType } from '../../types';

const Sliders = ({
    strokeWidth,
    color,
    linearGradient,
    onColorStrokeChange,
}:{
    strokeWidth:Animated.SharedValue<number>;
    color:Animated.SharedValue<hslColor>;
    linearGradient: React.ComponentType<
    LinearGradientType & ViewProps
  >;
    onColorStrokeChange:()=>void;
})=>{
    const styleStrokeColor = useAnimatedStyle(() => {
        return {
          borderWidth: strokeWidth.value,
          borderColor: color.value
        };
      }, [strokeWidth,color]);

    return (
        <View style={{
        flexDirection: 'row', 
        marginTop:20 , 
        borderColor:"#E5E5E5",
        borderRadius:20,
        height:40,
        borderWidth:1,
        }}>
            <View style={{flex: 1,height:40, marginHorizontal:40,justifyContent:"center"}}>
                <StrokeSlider
                minValue={2}
                maxValue={10}
                stroke={strokeWidth}
                onStrokeChange={onColorStrokeChange}
                />
            </View>
            <View style={{
                borderRadius:20, 
                borderWidth:1, 
                borderColor:"#E5E5E5", 
                justifyContent:"center", 
                alignContent:"center", 
                alignSelf:"center", 
                padding:4,
                }} >
                <Animated.View style={[{width:20,height:20, borderRadius:10}, styleStrokeColor]} />
            </View>
            <View style={{flex: 1,height:40, marginHorizontal:40,justifyContent:"center"}} >
                <ColorSlider
                color={color}
                linearGradient={linearGradient}
                onColorChange={onColorStrokeChange}
                />
            </View>
        </View>
    );

}

export default Sliders;