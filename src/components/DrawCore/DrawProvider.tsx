import { DrawContext } from './DrawContext';
import React, {
  ReactElement,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type {
  Action,
  DrawItem,
  DrawItemType,
  DrawState,
  hslColor,
} from '../../types';
import { useSharedValue } from 'react-native-reanimated';
import type ViewShot from 'react-native-view-shot';

const DrawProvider = ({ children }: { children: ReactElement }) => {
  const itemIsSelected = useSharedValue<boolean>(false);
  const strokeWidth = useSharedValue<number>(2);
  const color = useSharedValue<hslColor>('hsl(0, 100%, 0%)');
  const currentItem = useSharedValue<DrawItem | null>(null);
  const [cancelEnabled, setCancelEnabled] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawItemType>('pen');
  const viewShot = useRef<ViewShot>(null);

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
            setCancelEnabled(false);
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

  const contextValue = useMemo(
    () => ({
      drawState,
      dispatchDrawStates,
      strokeWidth,
      color,
      currentItem,
      drawingMode,
      setDrawingMode,
      itemIsSelected,
      cancelEnabled,
      setCancelEnabled,
      viewShot,
    }),
    [
      drawState,
      dispatchDrawStates,
      strokeWidth,
      color,
      currentItem,
      drawingMode,
      setDrawingMode,
      itemIsSelected,
      cancelEnabled,
      setCancelEnabled,
      viewShot,
    ]
  );

  return (
    <DrawContext.Provider value={contextValue}>{children}</DrawContext.Provider>
  );
};

export default DrawProvider;
