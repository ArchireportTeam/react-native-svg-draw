import React from 'react';
import type Animated from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Marker,
  MarkerUnits,
  Polyline,
  Use,
} from 'react-native-svg';
import CurrentAnimatedItem from './CurrentAnimatedItem';
import CurrentAnimatedText from './CurrentAnimatedText';
import Item from './Item';
import type { DrawItem } from '../../types';

const DrawPad = ({
  currentItem,
  doneItems,
  onPressItem,
  onTextHeightChange,
}: {
  currentItem: Animated.SharedValue<DrawItem | null>;
  doneItems: Array<DrawItem>;
  onPressItem: (item: DrawItem, index: number) => () => void;
  onTextHeightChange: (height: number) => void;
}) => {
  return (
    <>
      <Svg fillRule="evenodd">
        <Defs>
          <Circle
            id="selectionIndicator"
            fill="#3a6cff"
            r={5}
            cx={0}
            cy={0}
            strokeWidth={1}
            stroke="white"
          />
          <Marker
            id="arrowhead"
            markerUnits={'strokeWidth' as MarkerUnits}
            refX="0"
            refY="0"
            orient="auto"
          >
            <Polyline
              points="-2,-2 0,0 -2,2 0,0"
              stroke="context-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Marker>

          <Marker
            id="side"
            markerUnits={'strokeWidth' as MarkerUnits}
            refX="0"
            refY="0"
            orient="auto"
          >
            <Polyline
              stroke="context-stroke"
              points="0,-2 0,2 0,0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Marker>

          <Marker
            id="selection"
            markerUnits={'userSpaceOnUse' as MarkerUnits}
            refX="0"
            refY="0"
            orient="auto"
          >
            <Use href="#selectionIndicator" />
          </Marker>
        </Defs>

        <CurrentAnimatedItem currentItem={currentItem} />

        {doneItems.map((item, index) => (
          <Item key={index} item={item} onPress={onPressItem(item, index)} />
        ))}
      </Svg>

      <CurrentAnimatedText
        currentItem={currentItem}
        onHeightChange={onTextHeightChange}
      />
    </>
  );
};

export default DrawPad;
