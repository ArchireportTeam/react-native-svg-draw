import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { G, Line, Ellipse, Rect, Path, ForeignObject } from 'react-native-svg';
import type { DrawItem, Point } from '../../types';

const transformPointsToPath = (points: Point[]) => {
  return points.length > 0
    ? points.reduce(
        (acc, point) => `${acc} L ${point.x},${point.y}`,
        `M ${points[0].x},${points[0].y}`
      )
    : '';
};

const styles = StyleSheet.create({
  textZone: {
    paddingHorizontal: 10,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  text: {
    color: 'white',
  },
});

export default function Item({
  item,
  onPress,
}: {
  item: DrawItem;
  onPress: () => void;
}) {
  switch (item.type) {
    case 'singleHead':
      return (
        <G onPressIn={onPress}>
          <Line
            {...item.data}
            fill="none"
            stroke={item.color}
            strokeWidth={item.strokeWidth}
            markerEnd="url(#arrowhead)"
          />
        </G>
      );
    case 'doubleHead':
      return (
        <G onPressIn={onPress}>
          <Line
            {...item.data}
            fill="none"
            stroke={item.color}
            strokeWidth={item.strokeWidth}
            markerStart="url(#side)"
            markerEnd="url(#side)"
          />
        </G>
      );
    case 'ellipse':
      return (
        <Ellipse
          {...item.data}
          fill="none"
          stroke={item.color}
          strokeWidth={item.strokeWidth}
          onPress={onPress}
        />
      );
    case 'rectangle':
      return (
        <Rect
          {...item.data}
          fill="none"
          stroke={item.color}
          strokeWidth={item.strokeWidth}
          onPress={onPress}
        />
      );
    case 'pen':
      return (
        <Path
          d={transformPointsToPath(item.data)}
          stroke={item.color}
          fill="none"
          strokeWidth={item.strokeWidth}
          onPress={onPress}
        />
      );
    case 'text':
      return (
        <G onPress={onPress}>
          <Rect {...item.data} onPress={onPress} />
          <ForeignObject
            x={item.data.x}
            y={item.data.y}
            width={item.data.width}
            key={item.text}
          >
            <View
              style={[
                styles.textZone,
                {
                  width: item.data.width,
                },
              ]}
            >
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 14 + item.strokeWidth,
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          </ForeignObject>
        </G>
      );

    default:
      return null;
  }
}
