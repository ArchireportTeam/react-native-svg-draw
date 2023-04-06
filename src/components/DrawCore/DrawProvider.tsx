import { DrawContext } from './DrawContext';
import React, { ReactElement, useMemo, useState } from 'react';
import type { DrawItem, DrawItemType, DrawState, hslColor } from '../../types';
import { useSharedValue } from 'react-native-reanimated';

const DrawProvider = ({ children }: { children: ReactElement }) => {
  console.log('********** DrawProvider init ***************');
  const [drawState, setDrawState] = useState<DrawState>({
    doneItems: [],
    screenStates: [[]],
  });
  console.log('drawState.doneItems.length', drawState.doneItems.length);
  const itemIsSelected = useSharedValue<boolean>(false);
  const strokeWidth = useSharedValue<number>(2);
  const color = useSharedValue<hslColor>('hsl(0, 100%, 0%)');
  const currentItem = useSharedValue<DrawItem | null>(null);
  const [cancelEnabled, setCancelEnabled] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawItemType>('pen');

  //const strokeWidth = useSharedValue<number>(2);
  //const strokeWidth = useSharedValue<number>(2);
  const contextValue = useMemo(
    () => ({
      drawState,
      setDrawState,
      strokeWidth,
      color,
      currentItem,
      drawingMode,
      setDrawingMode,
      itemIsSelected,
      cancelEnabled,
      setCancelEnabled,
    }),
    [
      drawState,
      setDrawState,
      strokeWidth,
      color,
      currentItem,
      drawingMode,
      setDrawingMode,
      itemIsSelected,
      cancelEnabled,
      setCancelEnabled,
    ]
  );

  return (
    <DrawContext.Provider value={contextValue}>{children}</DrawContext.Provider>
  );
};

export default DrawProvider;
