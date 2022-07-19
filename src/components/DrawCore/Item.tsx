import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { G, Line, Ellipse, Rect, Path, ForeignObject } from 'react-native-svg';
import type { DrawItem, Point } from '../../types';

// properties of a line
const line = (pointA: Point, pointB: Point) => {
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};

// position of a control point
const controlPoint = (
  current: Point,
  previous: Point,
  next: Point,
  reverse: boolean
): Point => {
  // When 'current' is the first or last point of the array, 'previous' or 'next' don't exist
  // --> replace with 'current'
  const p = previous || current;
  const n = next || current;
  // The smoothing ratio
  const smoothing = 0.2;
  // Properties of the opposed-line
  const o = line(p, n);
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  // The control point position is relative to the current point
  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;

  return { x: x, y: y };
};

// create the bezier curve command
const bezierCommand = (point: Point, i: number, a: Point[]) => {
  console.log('bezier');

  const startPoint: Point = point;
  const endPoint: Point = point;

  // // start control point
  // const startPoint: Point = controlPoint(a[i - 1], a[i - 2], point, true);
  // // end control point
  // const endPoint: Point = controlPoint(point, a[i - 1], a[i + 1], true);
  console.log(
    `C ${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y} ${point.x},${point.y}`
  );
  return `C ${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y} ${point.x},${point.y}`;
};

const pointsToPath = (points: Point[]) => {
  console.log('pointToPath Item' + points);
  return points.length > 0
    ? points.reduce(
        // (acc, point) => `${acc} L ${point.x},${point.y}`,
        // `M ${points[0].x},${points[0].y}`

        (acc, point, i, a) =>
          i === 0
            ? `M ${point.x},${point.y}`
            : // : `${acc} L ${point.x},${point.y}`,
              `${acc} ${bezierCommand(point, i, a)}`,
        ''
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
          d={pointsToPath(item.data)}
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
