import React from 'react';
import type Animated from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Marker, Polyline, Use } from 'react-native-svg';
import CurrentAnimatedItem from './CurrentAnimatedItem';
import CurrentAnimatedText from './CurrentAnimatedText';
import Item from './Item';
import type { DrawItem } from '../../types';
import type { MarkerUnits } from 'react-native-svg/lib/typescript/elements/Marker';

const DrawPad = ({
  currentItem,
  doneItems,
  onPressItem,
  onTextHeightChange,
  addBackground = false,
  ratioImage = 1,
}: {
  currentItem: Animated.SharedValue<DrawItem | null>;
  doneItems: Array<DrawItem>;
  onPressItem: (item: DrawItem, index: number) => () => void;
  onTextHeightChange: (height: number) => void;
  addBackground?: boolean;
  ratioImage?: number;
}) => {
  return (
    <>
      <Svg
        style={addBackground ? { backgroundColor: 'white' } : null}
        preserveAspectRatio="xMinYMin slice"
        height="100%"
        width="100%"
      >
        <G scale={ratioImage}>
          <Defs>
            <Circle
              id="selectionIndicator"
              fill="#3a6cff"
              r={10}
              cx={0}
              cy={0}
              strokeWidth={1}
              stroke="black"
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
              id="arrowheadStart"
              markerUnits={'strokeWidth' as MarkerUnits}
              refX="0"
              refY="0"
              orient="auto"
            >
              <Polyline
                points="2,-2 0,0 2,2 0,0"
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

          {doneItems.map((item, index) => (
            <Item key={index} item={item} onPress={onPressItem(item, index)} />
          ))}

          <CurrentAnimatedItem />
        </G>
      </Svg>
      <CurrentAnimatedText
        currentItem={currentItem}
        onHeightChange={onTextHeightChange}
      />
    </>
  );
};

export default DrawPad;
