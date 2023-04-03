import { DrawContext } from "./DrawContext";
import { useContext, useState } from "react";
import { DrawItem } from "@archireport/react-native-svg-draw/src/types";


const useDrawHook = ()=>{

  const {drawState,setDrawState,strokeWidth,color,currentItem,drawingMode, setDrawingMode,selectedItem, setSelectedItem} = useContext(DrawContext);

  const addDoneItem = (item:DrawItem)=>{
    'worklet';
    setDrawState({
      ...drawState,
      doneItems: drawState.doneItems.concat(item),
    });
  }

  const deleteDoneItem = (indice:number)=>{
    'worklet';
    const newDoneItems = drawState.doneItems;
    newDoneItems.splice(indice, 1);

    setDrawState({
      ...drawState,
      doneItems: newDoneItems,
    });
  }

  const addScreenState = (currentItem:DrawItem|null)=>{
    'worklet';
    setDrawState({
      ...drawState,
      screenStates: drawState.screenStates.concat([
        currentItem!==null ? [...drawState.doneItems, currentItem]:[...drawState.doneItems],
      ]),
    });
  }

  const onColorStrokeChange =()=> {
    'worklet';
    if (currentItem?.value) {
      addScreenState(currentItem.value);
    }
  }


  const cancelAction = ()=>{
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
  }

  return {drawState:drawState!,currentItem:currentItem!,strokeWidth,color,addDoneItem,deleteDoneItem,addScreenState,cancelAction,onColorStrokeChange,drawingMode, setDrawingMode,setSelectedItem,selectedItem}
}

export default useDrawHook;