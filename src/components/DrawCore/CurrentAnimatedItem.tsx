import React from 'react';
import Animated, {
  createAnimatedPropAdapter,
  processColor,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Path, Ellipse, Rect, Line, G } from 'react-native-svg';
import type { DrawItem, hslColor, Point } from '../../types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const AnimatedRectangle = Animated.createAnimatedComponent(Rect);

const AnimatedLine = Animated.createAnimatedComponent(Line);

// properties of a line
const line = (pointA: Point, pointB: Point) => {
  'worklet';
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};

// position of a control point
const controlPoint = (
  current: Point,
  previous: Point,
  next: Point,
  reverse: boolean
): Point => {
  'worklet';
  // When 'current' is the first or last point of the array, 'previous' or 'next' don't exist --> replace with 'current'
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.2;
  // Properties of the opposed-line
  const o = line(p, n);
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;

  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;

  return { x: x, y: y };
};

// create the bezier curve command
const bezierCommand = (point: Point, i: number, a: Point[]) => {
  'worklet';
  const previousPoint = a[i - 1];
  const nextPoint = a[i + 1];
  if (previousPoint && nextPoint) {
    const endPoint: Point = controlPoint(point, previousPoint, nextPoint, true);
    if (i === 1) {
      const pointBefore = a[i - 2];
      if (pointBefore) {
        const startPoint: Point = controlPoint(
          previousPoint,
          pointBefore,
          point,
          true
        );
        return `C ${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y} ${point.x},${point.y}`;
      }
    } else {
      return `S ${endPoint.x},${endPoint.y} ${point.x},${point.y}`;
    }
  }
  return '';
};

export const pointsToPath = (points: Point[]) => {
  'worklet';
  return points.length > 0
    ? points.reduce(
        (acc, point, i, a) =>
          i === 0
            ? `M ${point.x},${point.y}`
            : `${acc} ${bezierCommand(point, i, a)}`,
        ''
      )
    : '';
};

function hue2rgb(p: number, q: number, t: number) {
  'worklet';
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

// see https://github.com/software-mansion/react-native-reanimated/issues/1909
function hslToRgb(col: hslColor) {
  'worklet';
  const hslRegExp = new RegExp(/hsl\(([\d.]+),\s*(\d+)%,\s*([\d.]+)%\)/);
  const res = hslRegExp.exec(col);

  const h = res ? parseFloat(res[1] ?? '0') / 360 : 0;
  const s = res ? parseFloat(res[2] ?? '0') / 100 : 0;
  const l = res ? parseFloat(res[3] ?? '0') / 100 : 0;

  var r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )})`;
}

const propAdapter = createAnimatedPropAdapter(
  (props: Record<string, unknown>) => {
    if (
      Object.keys(props).includes('fill') &&
      (typeof props.fill === 'string' || typeof props.fill === 'number')
    ) {
      props.fill = { type: 0, payload: processColor(props.fill) };
    }
    if (
      Object.keys(props).includes('stroke') &&
      (typeof props.stroke === 'string' || typeof props.stroke === 'number')
    ) {
      props.stroke = { type: 0, payload: processColor(props.stroke) };
    }
  },
  ['fill', 'stroke']
);

export default function CurrentAnimatedItem({
  currentItem,
}: {
  currentItem: Animated.SharedValue<DrawItem | null>;
}) {
  const ellipseAnimatedProps = useAnimatedProps(
    () => {
      const coordinates =
        currentItem.value?.type === 'ellipse'
          ? currentItem.value.data
          : { cx: -10, cy: -10, rx: 0, ry: 0 };

      return {
        cx: coordinates.cx,
        cy: coordinates.cy,
        rx: coordinates.rx,
        ry: coordinates.ry,
        fill: 'transparent',
        stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'ellipse' ? 1 : 0,
        strokeWidth:
          currentItem.value?.type === 'ellipse'
            ? currentItem.value.strokeWidth
            : 0,
        marker: 'url(#selection)',
      };
    },
    null,
    propAdapter
  );

  const singleHeadAnimatedProps = useAnimatedProps(
    () => {
      const coordinates =
        currentItem.value?.type === 'singleHead'
          ? currentItem.value.data
          : { x1: -10, y1: -10, x2: -10, y2: -10 };
      return {
        x1: coordinates.x1,
        y1: coordinates.y1,
        x2: coordinates.x2,
        y2: coordinates.y2,
        fill: 'transparent',
        stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'singleHead' ? 1 : 0,
        strokeWidth:
          currentItem.value?.type === 'singleHead'
            ? currentItem.value.strokeWidth
            : 0,
        markerEnd: 'arrowhead',
      };
    },
    null,
    propAdapter
  );

  const doubleHeadAnimatedProps = useAnimatedProps(
    () => {
      const coordinates =
        currentItem.value?.type === 'doubleHead'
          ? currentItem.value.data
          : { x1: -10, y1: -10, x2: -10, y2: -10 };

      return {
        x1: coordinates.x1,
        y1: coordinates.y1,
        x2: coordinates.x2,
        y2: coordinates.y2,
        fill: 'transparent',
        stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'doubleHead' ? 1 : 0,
        strokeWidth:
          currentItem.value?.type === 'doubleHead'
            ? currentItem.value.strokeWidth
            : 0,
        markerStart: 'side',
        markerEnd: 'side',
      };
    },
    null,
    propAdapter
  );

  const rectangleAnimatedProps = useAnimatedProps(
    () => {
      const coordinates =
        currentItem.value?.type === 'rectangle'
          ? currentItem.value.data
          : { x: -10, y: -10, width: 0, height: 0 };
      return {
        x: coordinates.x,
        y: coordinates.y,
        width: coordinates.width,
        height: coordinates.height,
        fill: 'transparent',
        stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'rectangle' ? 1 : 0,
        strokeWidth:
          currentItem.value?.type === 'rectangle'
            ? currentItem.value.strokeWidth
            : 0,

        marker: 'url(#selection)',
      };
    },
    null,
    propAdapter
  );

  const penAnimatedProps = useAnimatedProps(
    () => {
      const d = pointsToPath(
        currentItem.value?.type === 'pen'
          ? currentItem.value.data
          : [{ x: -10, y: -10 }]
      );
      return {
        d: d,
        strokeWidth:
          currentItem.value?.type === 'pen' ? currentItem.value.strokeWidth : 0,
        stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'pen' ? 1 : 0,
        fill: 'transparent',
        markerStart: 'selection',
        markerEnd: 'selection',
      };
    },
    null,
    propAdapter
  );

  return (
    <>
      <AnimatedEllipse animatedProps={ellipseAnimatedProps} />
      <G markerStart="url(#selection)" markerEnd="url(#selection)">
        <AnimatedLine animatedProps={singleHeadAnimatedProps} />
      </G>
      <G markerStart="url(#selection)" markerEnd="url(#selection)">
        <AnimatedLine animatedProps={doubleHeadAnimatedProps} />
      </G>
      <AnimatedRectangle animatedProps={rectangleAnimatedProps} />
      <AnimatedPath animatedProps={penAnimatedProps} />
    </>
  );
}
