import { DrawContext } from './DrawContext';
import React, { ReactElement, useMemo, useReducer, useState } from 'react';
import type {
  Action,
  DrawItem,
  DrawItemType,
  DrawState,
  hslColor,
} from '../../types';
import { useSharedValue } from 'react-native-reanimated';

const DrawProvider = ({ children }: { children: ReactElement }) => {
  console.log('********** DrawProvider init ***************');

  /*
  const [drawState, setDrawState] = useState<DrawState>({
    doneItems: [],
    screenStates: [[]],
  });*/
  //console.log('drawState.doneItems.length', drawState.doneItems.length);
  const itemIsSelected = useSharedValue<boolean>(false);
  const strokeWidth = useSharedValue<number>(2);
  const color = useSharedValue<hslColor>('hsl(0, 100%, 0%)');
  const currentItem = useSharedValue<DrawItem | null>(null);
  const [cancelEnabled, setCancelEnabled] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawItemType>('pen');

  const reducerDrawStates = (
    drawState: DrawState,
    action: Action
  ): DrawState => {
    'worklet';
    switch (action.type) {
      case 'ADD_DONE_ITEM':
        return {
          ...drawState,
          doneItems: drawState.doneItems.concat(action.item),
        };
      case 'DELETE_DONE_ITEM':
        const newDoneItems = drawState.doneItems;
        newDoneItems.splice(action.indice, 1);
        return {
          ...drawState,
          doneItems: newDoneItems,
        };
      case 'ADD_SCREEN_STATE':
        if (action.currentItem) {
          return {
            ...drawState,
            screenStates: drawState.screenStates.concat([
              [...drawState.doneItems, action.currentItem],
            ]),
          };
        } else {
          return {
            ...drawState,
            screenStates: drawState.screenStates.concat([
              [...drawState.doneItems],
            ]),
          };
        }

      case 'CANCEL':
        const len = drawState.screenStates.length;
        if (len > 1) {
          const newScreenStates = drawState.screenStates;
          newScreenStates.pop();
          if (newScreenStates.length === 1) {
            action.onCancelChange?.(false);
          }
          return {
            doneItems: drawState.screenStates[len - 2] ?? [],
            screenStates: newScreenStates,
          };
        } else {
          return drawState;
        }
    }
  };

  const initialState: DrawState = {
    doneItems: [],
    screenStates: [[]],
  };

  const [drawState, dispatchDrawStates] = useReducer(
    reducerDrawStates,
    initialState
  );

  //const strokeWidth = useSharedValue<number>(2);
  //const strokeWidth = useSharedValue<number>(2);
  const contextValue = useMemo(
    () => ({
      drawState,
      //setDrawState,
      dispatchDrawStates,
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
      //setDrawState,
      dispatchDrawStates,
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
