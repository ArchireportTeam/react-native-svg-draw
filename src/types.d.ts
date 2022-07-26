import React from 'react';
import { View } from 'react-native';
import {
  ForeignObjectProps,
  EllipseProps,
  LineProps,
  RectProps,
  PathProps,
} from 'react-native-svg';

export type Point = { x: number; y: number };

export type hslColor = `hsl(${number}, ${number | string}%, ${
  | number
  | string}%)`;

type Size = { width: number; height: number };

export type DrawItem = (
  | { type: 'singleHead'; data: LineProps }
  | { type: 'doubleHead'; data: LineProps }
  | { type: 'rectangle'; data: RectProps }
  | { type: 'ellipse'; data: EllipseProps }
  | { type: 'text'; data: ForeignObjectProps; text?: string }
  | { type: 'pen'; data: Point[] }
) & { strokeWidth: number; color: hslColor };

export type DrawItemType = DrawItem['type'];

export type DrawCoreProps = {
  drawingContainer: React.Ref<View>;
  deleteSelectedItem: () => void;
  cancelLastAction: () => void;
  takeSnapshot: () => Promise<string | undefined>;
};
