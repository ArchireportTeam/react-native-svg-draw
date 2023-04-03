import { DrawContext } from "./DrawContext";
import React,{ ReactElement, useMemo, useState } from "react";
import { DrawItem, DrawItemType, DrawState, hslColor, Size } from "../../types";
import { useSharedValue } from "react-native-reanimated";

const DrawProvider = ({ children }:{
  children:ReactElement
}) => {
  console.log("DrawProvider init");
  const [drawState,setDrawState] = useState<DrawState>({ doneItems: [], screenStates: [[]] });
  const [selectedItem, setSelectedItem] = useState(false);
  const strokeWidth= useSharedValue<number>(2);
  const color= useSharedValue<hslColor>('hsl(0, 100%, 0%)');
  const currentItem = useSharedValue<DrawItem | null>(null);

  const [drawingMode, setDrawingMode] =
  useState<DrawItemType>('pen');
  
  //const strokeWidth = useSharedValue<number>(2); 
  //const strokeWidth = useSharedValue<number>(2);
  const contextValue = useMemo(()=>({ 
    drawState, 
    setDrawState,
    strokeWidth,
    color,
    currentItem,
    drawingMode, 
    setDrawingMode,
    selectedItem, 
    setSelectedItem,
   
  }),[
    drawState,
    setDrawState,
    strokeWidth,
    color,
    currentItem,
    drawingMode, 
    setDrawingMode,
    selectedItem, 
    setSelectedItem,
    
  ]);
  
  return (
    <DrawContext.Provider value={contextValue}>
      {children}
    </DrawContext.Provider>
  );
};

export default DrawProvider;