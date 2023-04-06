import { DrawContext } from './DrawContext';
import { useCallback, useContext } from 'react';

const useDrawHook = () => {
  const {
    drawState,
    dispatchDrawStates,
    //setDrawState,
    strokeWidth,
    color,
    currentItem,
    drawingMode,
    setDrawingMode,
    itemIsSelected,
    cancelEnabled,
    setCancelEnabled,
  } = useContext(DrawContext);

  /*
  const addDoneItem = useCallback(
    (item: DrawItem) => {
      'worklet';
      console.log('******************** addDoneItem *********************');
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
      console.log('******************** deleteDoneItem *********************');
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
      console.log('******************** addScreenState *********************');
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

  

  const cancelAction = useCallback(() => {
    'worklet';
    console.log('******************** cancelAction *********************');

    setDrawState((previousDrawState) => {
      const newScreenStates = previousDrawState.screenStates;
      const len = newScreenStates.length;
      if (len > 1) {
        newScreenStates.pop();
        return {
          doneItems: previousDrawState.screenStates[len - 2] ?? [],
          screenStates: newScreenStates,
        };
      } else {
        return previousDrawState;
      }
    });
  }, [setDrawState]);
*/
  const onColorStrokeChange = useCallback(() => {
    'worklet';
    console.log(
      '******************** onColorStrokeChange *********************'
    );
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
    /*
    addDoneItem,
    deleteDoneItem,
    addScreenState,
    cancelAction,*/
    onColorStrokeChange,
    drawingMode,
    setDrawingMode,
    itemIsSelected: itemIsSelected!,
    cancelEnabled,
    setCancelEnabled,
  };
};

export default useDrawHook;
