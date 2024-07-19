import { DrawContext } from './DrawContext';
import { useCallback, useContext } from 'react';

const useDrawHook = () => {
  const {
    drawState,
    dispatchDrawStates,
    strokeWidth,
    color,
    currentItem,
    itemIsSelected,
    viewShot,
    doubleArrowTextInput,
  } = useContext(DrawContext);

  const takeSnapshot = useCallback(async () => {
    if (currentItem?.value) {
      dispatchDrawStates({ type: 'ADD_DONE_ITEM', item: currentItem.value });
      currentItem.value = null;
    }
    return viewShot!.current?.capture?.();
  }, [currentItem, dispatchDrawStates, viewShot]);

  const cancelLastAction = useCallback(() => {
    itemIsSelected!.value = false;
    if (currentItem?.value) {
      currentItem.value = null;
    }
    dispatchDrawStates({
      type: 'CANCEL',
    });
  }, [currentItem, dispatchDrawStates, itemIsSelected]);

  const deleteSelectedItem = useCallback(() => {
    if (currentItem?.value) {
      currentItem.value = null;
      dispatchDrawStates({
        type: 'ADD_SCREEN_STATE',
        currentItem: currentItem.value,
        cancelEnabled: true,
      });
    }
    itemIsSelected!.value = false;
  }, [currentItem, dispatchDrawStates, itemIsSelected]);

  const onColorStrokeChange = useCallback(() => {
    'worklet';
    if (currentItem?.value) {
      dispatchDrawStates({
        type: 'ADD_SCREEN_STATE',
        currentItem: currentItem.value,
      });
    }
  }, [currentItem?.value, dispatchDrawStates]);

  return {
    drawState: drawState!,
    dispatchDrawStates,
    currentItem: currentItem!,
    strokeWidth: strokeWidth!,
    color: color!,
    onColorStrokeChange,
    itemIsSelected: itemIsSelected!,
    cancelLastAction,
    takeSnapshot: takeSnapshot!,
    viewShot: viewShot!,
    deleteSelectedItem,
    doubleArrowTextInput,
  };
};

export default useDrawHook;
