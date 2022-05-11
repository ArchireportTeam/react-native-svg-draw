import React from 'react';
import { View } from 'react-native';
import {
  ForeignObjectProps,
  EllipseProps,
  LineProps,
  RectProps,
} from 'react-native-svg';

export type Point = { x: number; y: number };

export type hslColor = `hsl(${number}, ${number}%, ${number}%)`;

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
  takeSnapshot: () => Promise<string | undefined>;
};
