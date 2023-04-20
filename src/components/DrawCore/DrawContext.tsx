import type { DrawItem, hslColor, DrawState, Action } from '../../types';
import { createContext, RefObject } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type ViewShot from 'react-native-view-shot';

export const DrawContext = createContext<{
  drawState: DrawState;
  dispatchDrawStates: React.Dispatch<Action>;
  strokeWidth?: SharedValue<number>;
  color?: SharedValue<hslColor>;
  currentItem?: SharedValue<DrawItem | null>;
  itemIsSelected?: SharedValue<boolean>;
  viewShot?: RefObject<ViewShot>;
}>({
  drawState: {
    doneItems: [],
    screenStates: [[]],
    drawingMode: 'ellipse',
    cancelEnabled: false,
  },
  dispatchDrawStates: () => true,
});
