import type { DrawItem, DrawItemType, hslColor, DrawState } from '../../types';
import { createContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export const DrawContext = createContext<{
  drawState: DrawState;
  setDrawState: React.Dispatch<React.SetStateAction<DrawState>>;
  drawingMode: DrawItemType;
  setDrawingMode: React.Dispatch<React.SetStateAction<DrawItemType>>;
  strokeWidth?: SharedValue<number>;
  color?: SharedValue<hslColor>;
  currentItem?: SharedValue<DrawItem | null>;
  itemIsSelected?: SharedValue<boolean>;
  cancelEnabled: boolean;
  setCancelEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  drawState: { doneItems: [], screenStates: [[]] },
  setDrawState: () => true,
  drawingMode: 'ellipse',
  setDrawingMode: () => true,
  cancelEnabled: false,
  setCancelEnabled: () => true,
});
