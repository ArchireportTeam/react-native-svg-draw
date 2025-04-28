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
    doSnapshot,
    snapShotRequested,
    setSnapShotRequested,
  } = useContext(DrawContext);

  const captureSnapshot = useCallback(async () => {
    if (viewShot) {
      return await viewShot.current?.capture?.();
    }
    return null;
  }, [viewShot]);

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
    captureSnapshot: captureSnapshot!,
    viewShot: viewShot!,
    deleteSelectedItem,
    doubleArrowTextInput,
    snapShotRequested,
    doSnapshot,
    setSnapShotRequested,
  };
};

export default useDrawHook;
