import { DrawItem, DrawItemType, DrawState, hslColor, Size } from '../../types';
import {createContext} from 'react';
import { SharedValue } from 'react-native-reanimated';

export const DrawContext = createContext<{
    drawState: DrawState;
    setDrawState:  React.Dispatch<React.SetStateAction<DrawState>>;
    drawingMode: DrawItemType;
    setDrawingMode:  React.Dispatch<React.SetStateAction<DrawItemType>>;
    strokeWidth?: SharedValue<number>;
    color?: SharedValue<hslColor>;
    currentItem? : SharedValue<DrawItem | null>;
    selectedItem: boolean, 
    setSelectedItem:React.Dispatch<React.SetStateAction<boolean>>;
}>({
    drawState: { doneItems: [], screenStates: [[]] },
    setDrawState: () => true,
    drawingMode: 'ellipse',
    setDrawingMode: () => true,
    selectedItem: false, 
    setSelectedItem:() => true,
});