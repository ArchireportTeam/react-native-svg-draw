import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { DrawItem } from '../../types';
import { hslToRgb } from './CurrentAnimatedItem';

const styles = StyleSheet.create({
  textBackground: {
    marginHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  markerContainerLeft: {
    position: 'absolute',
    left: 5,
    height: '100%',
    justifyContent: 'center',
  },
  markerContainerRight: {
    position: 'absolute',
    right: 5,
    height: '100%',
    justifyContent: 'center',
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#3a6cff',
    borderWidth: 1,
    borderColor: 'white',
  },
});

/**
 * There is an issue on re-render for ForeignObject (see https://github.com/react-native-svg/react-native-svg/issues/1357)
 * So we cannot embed this component directly in the Svg
 */
export default function CurrentAnimatedText({
  currentItem,
  onHeightChange,
}: {
  currentItem: Animated.SharedValue<DrawItem | null>;
  onHeightChange: (height: number) => void;
}) {
  const [text, setText] = useState(
    currentItem.value?.type === 'text' ? currentItem.value.text || '' : ''
  );

  useDerivedValue(() => {
    runOnJS(setText)(
      currentItem.value?.type === 'text' ? currentItem.value.text || '' : ''
    );
  }, [currentItem.value]);

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: 10 + (currentItem.value?.strokeWidth ?? 0) * 2,
      color: currentItem.value?.color
        ? hslToRgb(currentItem.value?.color)
        : 'white',
    };
  }, [currentItem.value?.strokeWidth]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: currentItem.value?.type === 'text' ? 1 : 0,
      height: currentItem.value?.type === 'text' ? 'auto' : -10,
      width:
        (currentItem.value?.type === 'text' &&
          (typeof currentItem.value.data.width === 'string'
            ? parseFloat(currentItem.value.data.width)
            : currentItem.value.data.width)) ||
        0,
      position: 'absolute',
      top: 0,
      left: 0,
      transform: [
        {
          translateX:
            (currentItem.value?.type === 'text' &&
              (typeof currentItem.value.data.x === 'string'
                ? parseFloat(currentItem.value.data.x) - 28
                : currentItem.value.data.x
                ? currentItem.value.data.x - 28
                : 0)) ||
            0,
        },
        {
          translateY:
            (currentItem.value?.type === 'text' &&
              (typeof currentItem.value.data.y === 'string'
                ? parseFloat(currentItem.value.data.y) - 12
                : currentItem.value.data.y
                ? currentItem.value.data.y - 12
                : 0)) ||
            0,
        },
      ],
    };
  }, [currentItem.value]);

  return (
    <Animated.View style={containerStyle}>
      <View
        style={styles.textBackground}
        onLayout={(event) => {
          onHeightChange(event.nativeEvent.layout.height);
        }}
      >
        <Animated.Text style={textAnimatedStyle}>{text}</Animated.Text>
      </View>
      <View style={styles.markerContainerLeft}>
        <View style={styles.marker} />
      </View>
      <View style={styles.markerContainerRight}>
        <View style={styles.marker} />
      </View>
    </Animated.View>
  );
}
