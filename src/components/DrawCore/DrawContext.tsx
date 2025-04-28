import type { DrawItem, hslColor, DrawState, Action } from '../../types';
import { createContext, RefObject } from 'react';
import { TextInput } from 'react-native';
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
  doubleArrowTextInput?: RefObject<TextInput>;
  doSnapshot: () => void;
  snapShotRequested: boolean;
  setSnapShotRequested: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  drawState: {
    doneItems: [],
    screenStates: [[]],
    drawingMode: 'ellipse',
    cancelEnabled: false,
  },
  dispatchDrawStates: () => true,
  doSnapshot: () => {},
  snapShotRequested: false,
  setSnapShotRequested: () => {},
});
