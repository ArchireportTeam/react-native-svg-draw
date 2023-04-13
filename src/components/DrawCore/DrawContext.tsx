import type {
  DrawItem,
  DrawItemType,
  hslColor,
  DrawState,
  Action,
} from '../../types';
import { createContext, RefObject } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type ViewShot from 'react-native-view-shot';

export const DrawContext = createContext<{
  drawState: DrawState;
  dispatchDrawStates: React.Dispatch<Action>;
  drawingMode: DrawItemType;
  setDrawingMode: React.Dispatch<React.SetStateAction<DrawItemType>>;
  strokeWidth?: SharedValue<number>;
  color?: SharedValue<hslColor>;
  currentItem?: SharedValue<DrawItem | null>;
  itemIsSelected?: SharedValue<boolean>;
  cancelEnabled: boolean;
  setCancelEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  viewShot?: RefObject<ViewShot>;
}>({
  drawState: { doneItems: [], screenStates: [[]] },
  dispatchDrawStates: () => true,
  drawingMode: 'ellipse',
  setDrawingMode: () => true,
  cancelEnabled: false,
  setCancelEnabled: () => true,
});
