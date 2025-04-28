import {
  ForeignObjectProps,
  EllipseProps,
  LineProps,
  RectProps,
} from 'react-native-svg';

export type Point = { x: number; y: number };

export type hslColor = `hsl(${number}, ${number | string}%, ${
  | number
  | string}%)`;

export type Size = { width: number; height: number };

export type DrawItem = (
  | { type: 'singleHead'; data: LineProps }
  | { type: 'doubleHead'; data: LineProps }
  | {
      type: 'doubleArrows';
      data: LineProps;
      text?: string;
      strokeWidth: number;
      color?: string;
    }
  | { type: 'rectangle'; data: RectProps }
  | { type: 'ellipse'; data: EllipseProps }
  | { type: 'text'; data: ForeignObjectProps; text?: string }
  | { type: 'pen'; data: Point[] }
) & { strokeWidth: number; color: hslColor };

export type DrawItemType = DrawItem['type'];

export type DrawCoreProps = {
  takeSnapshotAction: () => void;
};
/*
export type DrawCoreProps = {
  drawingContainer: React.Ref<View>;
  deleteSelectedItem: () => void;
  cancelLastAction: () => void;
  takeSnapshot: () => Promise<string | undefined>;
};*/

export type DrawState = {
  doneItems: DrawItem[];
  screenStates: DrawItem[][];
  cancelEnabled: boolean;
  drawingMode: DrawItemType;
};

export type LinearGradientType = {
  colors: any[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export type Action =
  | { type: 'ADD_DONE_ITEM'; item: DrawItem }
  | { type: 'DELETE_DONE_ITEM'; indice: number }
  | {
      type: 'ADD_SCREEN_STATE';
      currentItem: DrawItem | null;
      cancelEnabled?: boolean;
    }
  | {
      type: 'CANCEL';
      onCancelChange?: (cancel: boolean) => void;
    }
  | {
      type: 'SET_DRAWING_MODE';
      drawingMode: DrawItemType;
    }
  | {
      type: 'SET_CANCEL_ENABLED';
      cancelEnabled: boolean;
    };
