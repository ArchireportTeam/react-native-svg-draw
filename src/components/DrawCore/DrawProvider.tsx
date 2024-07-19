import { DrawContext } from './DrawContext';
import React, { ReactElement, useMemo, useReducer, useRef } from 'react';
import type { Action, DrawItem, DrawState, hslColor } from '../../types';
import { useSharedValue } from 'react-native-reanimated';
import type ViewShot from 'react-native-view-shot';
import { Keyboard } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const initialState: DrawState = {
  doneItems: [],
  screenStates: [[]],
  cancelEnabled: false,
  drawingMode: 'pen',
};

const reducerDrawStates = (drawState: DrawState, action: Action): DrawState => {
  'worklet';
  switch (action.type) {
    case 'SET_CANCEL_ENABLED':
      return {
        ...drawState,
        cancelEnabled: action.cancelEnabled,
      };
    case 'SET_DRAWING_MODE':
      Keyboard.dismiss();
      return {
        ...drawState,
        drawingMode: action.drawingMode,
      };
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
        // hack sometime rectangle is not draw
        if (
          action.currentItem.type === 'rectangle' &&
          (!action.currentItem.data.width || !action.currentItem.data.height)
        ) {
          return drawState;
        } else {
          return {
            ...drawState,
            screenStates: drawState.screenStates.concat([
              [...drawState.doneItems, action.currentItem],
            ]),
          };
        }
      } else {
        return {
          ...drawState,
          cancelEnabled: action.cancelEnabled ?? drawState.cancelEnabled,
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

        return {
          ...drawState,
          cancelEnabled:
            newScreenStates.length === 1 ? false : drawState.cancelEnabled,
          doneItems: drawState.screenStates[len - 2] ?? [],
          screenStates: newScreenStates,
        };
      } else {
        return drawState;
      }
  }
};

const DrawProvider = ({ children }: { children: ReactElement }) => {
  const itemIsSelected = useSharedValue<boolean>(false);
  const strokeWidth = useSharedValue<number>(2);
  const color = useSharedValue<hslColor>('hsl(0, 100%, 0%)');
  const currentItem = useSharedValue<DrawItem | null>(null);
  const viewShot = useRef<ViewShot>(null);
  const doubleArrowTextInput = useRef<TextInput>(null);

  const [drawState, dispatchDrawStates] = useReducer(
    reducerDrawStates,
    initialState
  );

  const contextValue = useMemo(
    () => ({
      drawState,
      dispatchDrawStates,
      strokeWidth,
      color,
      currentItem,
      itemIsSelected,
      viewShot,
      doubleArrowTextInput,
    }),
    [
      drawState,
      dispatchDrawStates,
      strokeWidth,
      color,
      currentItem,
      itemIsSelected,
      viewShot,
      doubleArrowTextInput,
    ]
  );

  return (
    <DrawContext.Provider value={contextValue}>{children}</DrawContext.Provider>
  );
};

export default DrawProvider;
