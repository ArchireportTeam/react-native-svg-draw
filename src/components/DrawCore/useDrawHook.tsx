import { DrawContext } from './DrawContext';
import { useCallback, useContext } from 'react';
import type { DrawItem } from 'src/types';

const useDrawHook = () => {
  const {
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
  } = useContext(DrawContext);

  const addDoneItem = useCallback(
    (item: DrawItem) => {
      'worklet';
      setDrawState((previousDrawState) => ({
        ...previousDrawState,
        doneItems: drawState.doneItems.concat(item),
      }));
    },
    [drawState, setDrawState]
  );

  const deleteDoneItem = useCallback(
    (indice: number) => {
      'worklet';
      setDrawState((previousDrawState) => ({
        ...previousDrawState,
        doneItems: previousDrawState.doneItems.splice(indice, 1),
      }));
    },
    [setDrawState]
  );

  const addScreenState = useCallback(
    (item: DrawItem | null) => {
      'worklet';
      setDrawState((previousDrawState) => ({
        ...previousDrawState,
        screenStates: previousDrawState.screenStates.concat([
          item !== null
            ? [...previousDrawState.doneItems, item]
            : [...previousDrawState.doneItems],
        ]),
      }));
    },
    [setDrawState]
  );

  const onColorStrokeChange = useCallback(() => {
    'worklet';
    //console.log('onColorStrokeChange');
    if (currentItem?.value) {
      addScreenState(currentItem.value);
    }
  }, [addScreenState, currentItem?.value]);

  const cancelAction = useCallback(() => {
    'worklet';
    const len = drawState.screenStates.length;
    if (len > 1) {
      const newScreenStates = drawState.screenStates;
      newScreenStates.pop();
      setDrawState({
        doneItems: drawState.screenStates[len - 2] ?? [],
        screenStates: newScreenStates,
      });
    } else {
      return drawState;
    }
  }, [drawState, setDrawState]);

  return {
    drawState: drawState!,
    currentItem: currentItem!,
    strokeWidth: strokeWidth!,
    color: color!,
    addDoneItem,
    deleteDoneItem,
    addScreenState,
    cancelAction,
    onColorStrokeChange,
    drawingMode,
    setDrawingMode,
    itemIsSelected: itemIsSelected!,
    cancelEnabled,
    setCancelEnabled,
  };
};

export default useDrawHook;
