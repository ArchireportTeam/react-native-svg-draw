import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  G,
  Line,
  Ellipse,
  Rect,
  Path,
  ForeignObject,
  Text as SvgText,
} from 'react-native-svg';
import type { DrawItem } from '../../types';
import { hslToRgb, pointsToPath } from './CurrentAnimatedItem';

const styles = StyleSheet.create({
  textZone: {
    paddingHorizontal: 10,
  },
  textContainer: {
    //backgroundColor: 'rgba(0, 0, 0, 0.6)',
    //borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  text: {
    color: 'white',
  },
});

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

export const getGetcoordinateValue = ({
  x1,
  y1,
  x2,
  y2,
  first = true,
  text = '',
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  first: boolean;
  text: string;
}) => {
  const dist = distance(x1, y1, x2, y2);
  const textLength = text && text.length > 5 ? text.length * 10 : 50;
  //const isShortArrow = textLength > dist;
  const newDist = (!textLength ? dist : dist - textLength) / 2;

  const ratio = newDist / dist;
  let newX1 = x1;
  let newY1 = y1;
  let newX2 = x2;
  let newY2 = y2;

  if (newDist > 10) {
    [newX1, newX2] = getCoordinatesWithRatio({
      c1: x1,
      c2: x2,
      ratio,
      first,
    });
    [newY1, newY2] = getCoordinatesWithRatio({
      c1: y1,
      c2: y2,
      ratio,
      first,
    });
  }
  return [newX1, newY1, newX2, newY2];
};

export const getCoordinatesWithRatio = ({
  c1,
  c2,
  ratio,
  first = true,
}: {
  c1: number;
  c2: number;
  ratio: number;
  first?: boolean;
}): [number, number] => {
  let newC1 = c1;
  let newC2 = c2;

  if (c1 > c2) {
    if (first) {
      newC2 = c1 - (c1 - c2) * ratio;
    } else {
      newC1 = c2 + (c1 - c2) * ratio;
    }
  } else {
    if (first) {
      newC2 = c1 + (c2 - c1) * ratio;
    } else {
      newC1 = c2 - (c2 - c1) * ratio;
    }
  }

  return [newC1 as number, newC2 as number];
};

export const doubleArrowsProps = (item: DrawItem, first: boolean) => {
  const coordinates =
    item.type === 'doubleArrows'
      ? item.data
      : { x1: -10, y1: -10, x2: -10, y2: -10 };

  const [x1, y1, x2, y2] = getGetcoordinateValue({
    x1: Number(coordinates.x1),
    y1: Number(coordinates.y1),
    x2: Number(coordinates.x2),
    y2: Number(coordinates.y2),
    first: first,
    text: item.type === 'doubleArrows' && item.text ? item.text : '',
  });
  return {
    x1: String(x1),
    y1: String(y1),
    x2: String(x2),
    y2: String(y2),
  };
};

export const getTextValues = ({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => {
  const dist = distance(x1, y1, x2, y2);
  const ratio = 0.5;
  const newX = (x1 + x2) * ratio;
  const newY = (y1 + y2) * ratio;

  let angle = 0;
  if (x1 > x2) {
    if (y1 > y2) {
      angle = Math.acos((x1 - x2) / dist) * (180 / Math.PI);
    } else {
      angle = 180 - Math.acos((x1 - x2) / dist) * (180 / Math.PI) + 180;
    }
  } else {
    if (y1 > y2) {
      angle = 180 - Math.acos((x2 - x1) / dist) * (180 / Math.PI) + 180;
    } else {
      angle = Math.acos((x2 - x1) / dist) * (180 / Math.PI);
    }
  }

  return [newX, newY, angle];
};
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
        <G onPress={onPress}>
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
        <G onPress={onPress}>
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
    case 'doubleArrows':
      const [textX, textY, angle] = getTextValues({
        x1: Number(item.data.x1),
        y1: Number(item.data.y1),
        x2: Number(item.data.x2),
        y2: Number(item.data.y2),
      });
      return (
        <G>
          <Line
            {...doubleArrowsProps(item, true)}
            fill="none"
            stroke={item.color}
            strokeWidth={item.strokeWidth}
            markerStart="url(#arrowheadStart)"
            onPress={onPress}
          />
          <G x={String(textX)} y={String(textY)} rotation={String(angle)}>
            <SvgText
              stroke={item.color}
              fill={item.color}
              textAnchor="middle"
              fontSize={item.strokeWidth + 10}
              onPress={onPress}
            >
              {item.text}
            </SvgText>
          </G>

          <Line
            {...doubleArrowsProps(item, false)}
            fill="none"
            stroke={item.color}
            strokeWidth={item.strokeWidth}
            markerEnd="url(#arrowhead)"
            onPress={onPress}
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
          <Rect {...item.data} onPress={onPress} fill={'transparent'} />
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
                      fontSize: 10 + item.strokeWidth * 2,
                      color: item.color ? hslToRgb(item.color) : 'white',
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
