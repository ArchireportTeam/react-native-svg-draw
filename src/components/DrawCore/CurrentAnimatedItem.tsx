import React from 'react';
import Animated, {
  createAnimatedPropAdapter,
  processColor,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Path, Ellipse, Rect, Line, G } from 'react-native-svg';
import type { hslColor, Point } from '../../types';
import { TextInput } from 'react-native';
import useDrawHook from './useDrawHook';

//import { TextInput } from 'react-native-gesture-handler';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const AnimatedRectangle = Animated.createAnimatedComponent(Rect);

const AnimatedLine = Animated.createAnimatedComponent(Line);

//const AnimatedText = Animated.createAnimatedComponent(Text);

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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
export function hslToRgb(col: hslColor) {
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
      props.fill = { type: 0, payload: processColor(props.fill as string) };
    }
    if (
      Object.keys(props).includes('stroke') &&
      (typeof props.stroke === 'string' || typeof props.stroke === 'number')
    ) {
      props.stroke = { type: 0, payload: processColor(props.stroke as string) };
    }
  },
  ['fill', 'stroke']
);

export default function CurrentAnimatedItem() {
  const { currentItem, doubleArrowTextInput } = useDrawHook();

  const getTextLength = () => {
    'worklet';
    const text =
      currentItem.value?.type === 'doubleArrows' ? currentItem.value?.text : '';

    const textLength = text && text.length > 5 ? text.length * 10 : 50;
    return textLength;
  };

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
        //stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
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
        //stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
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
        //stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
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
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    'worklet';
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  };

  const getCoordinatesWithRatio = ({
    c1,
    c2,
    ratio,
    first = true,
  }: {
    c1: number;
    c2: number;
    ratio: number;
    first?: boolean;
  }): [number, number] => {
    'worklet';
    let newC1 = c1;
    let newC2 = c2;

    if (c1 > c2) {
      if (first) {
        newC1 = c1;
        newC2 = c1 - (c1 - c2) * ratio;
      } else {
        newC1 = c2 + (c1 - c2) * ratio;
        newC2 = c2;
      }
    } else {
      if (first) {
        newC1 = c1;
        newC2 = c1 + (c2 - c1) * ratio;
      } else {
        newC1 = c2 - (c2 - c1) * ratio;
        newC2 = c2;
      }
    }

    return [newC1 as number, newC2 as number];
  };

  const getGetcoordinateValue = ({
    x1,
    y1,
    x2,
    y2,
    first = true,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    first: boolean;
  }) => {
    'worklet';
    const dist = distance(x1, y1, x2, y2);
    const textLength = getTextLength();
    const newDist = (!textLength ? dist : dist - textLength) / 2;

    let newX1 = x1;
    let newY1 = y1;
    let newX2 = x2;
    let newY2 = y2;

    //if (newDist > textLength / 2 && !isShortArrow) {
    const ratio = newDist / dist;
    [newX1, newX2] = getCoordinatesWithRatio({
      c1: x1,
      c2: x2,
      ratio,
      first,
    });
    [newY1, newY2] = getCoordinatesWithRatio({
      c1: y1,
      c2: y2,
      ratio,
      first,
    });
    //}
    return [newX1, newY1, newX2, newY2];
  };

  const doubleArrowsAnimatedPropsFirst = useAnimatedProps(
    () => {
      let x1, y1, x2, y2;

      if (currentItem.value?.type !== 'doubleArrows') {
        x1 = -10;
        y1 = -10;
        x2 = -10;
        y2 = -10;
      } else {
        const coordinates = currentItem.value.data;
        [x1, y1, x2, y2] = getGetcoordinateValue({
          x1: Number(coordinates.x1),
          y1: Number(coordinates.y1),
          x2: Number(coordinates.x2),
          y2: Number(coordinates.y2),
          first: true,
          //text: currentItem.value?.text,
        });
      }

      return {
        x1,
        y1,
        x2,
        y2,
        fill: 'transparent',
        //stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'doubleArrows' ? 1 : 0,
        strokeWidth:
          currentItem.value?.type === 'doubleArrows'
            ? currentItem.value.strokeWidth
            : 0,
        markerStart: 'arrowheadStart',
      };
    },
    null,
    propAdapter
  );

  const doubleArrowsAnimatedPropsLast = useAnimatedProps(
    () => {
      let x1, y1, x2, y2;

      if (currentItem.value?.type !== 'doubleArrows') {
        x1 = -10;
        y1 = -10;
        x2 = -10;
        y2 = -10;
      } else {
        const coordinates = currentItem.value.data;
        [x1, y1, x2, y2] = getGetcoordinateValue({
          x1: Number(coordinates.x1),
          y1: Number(coordinates.y1),
          x2: Number(coordinates.x2),
          y2: Number(coordinates.y2),
          first: false,
          //text: currentItem.value?.text,
        });
      }

      return {
        x1,
        y1,
        x2,
        y2,
        fill: 'transparent',
        //stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
        opacity: currentItem.value?.type === 'doubleArrows' ? 1 : 0,
        strokeWidth:
          currentItem.value?.type === 'doubleArrows'
            ? currentItem.value.strokeWidth
            : 0,
        markerEnd: 'arrowhead',
      };
    },
    null,
    propAdapter
  );

  const getTextValues = ({
    x1,
    y1,
    x2,
    y2,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }): [number, number, number] => {
    'worklet';
    const dist = distance(x1, y1, x2, y2);
    const ratio = 0.5;
    const newX = (x1 + x2) * ratio;
    const newY = (y1 + y2) * ratio;

    let angle = 0;
    if (x1 > x2) {
      if (y1 > y2) {
        angle = Math.acos((x1 - x2) / dist) * (180 / Math.PI);
      } else {
        angle = 180 - Math.acos((x1 - x2) / dist) * (180 / Math.PI) + 180;
      }
    } else {
      if (y1 > y2) {
        angle = 180 - Math.acos((x2 - x1) / dist) * (180 / Math.PI) + 180;
      } else {
        angle = Math.acos((x2 - x1) / dist) * (180 / Math.PI);
      }
    }

    return [newX, newY, angle];
  };
  const doubleArrowsAnimatedPropsText = useAnimatedProps(
    () => {
      let x = 0,
        y = 0,
        angle = 0;

      if (currentItem.value?.type !== 'doubleArrows') {
        x = -50;
        y = -50;
        angle = 0;
      } else {
        const coordinates = currentItem.value.data;
        [x, y, angle] = getTextValues({
          x1: Number(coordinates.x1),
          y1: Number(coordinates.y1),
          x2: Number(coordinates.x2),
          y2: Number(coordinates.y2),
        });
      }

      return {
        top: y - 25,
        left: x - getTextLength() / 2,
        fontSize: 10 + (currentItem.value?.strokeWidth ?? 0) * 2,
        color: currentItem.value?.color
          ? hslToRgb(currentItem.value?.color)
          : 'white',
        transform: [{ rotateZ: `${angle}deg` }],
        //backgroundColor: 'red',
        width: getTextLength(),
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
        //stroke: hslToRgb(currentItem.value?.color || 'hsl(0, 0%, 0%)'),
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
        //opacity: 1,
        opacity: currentItem.value?.type === 'pen' ? 1 : 0,
        //stroke: currentItem.value?.color || "black",
        strokeWidth:
          currentItem.value?.type === 'pen' ? currentItem.value.strokeWidth : 0,
        fill: 'transparent',
        markerStart: 'selection',
        markerEnd: 'selection',
      };
    },
    null,
    propAdapter
  );

  const updateText = (value: string) => {
    if (!doubleArrowTextInput?.current) return;
    doubleArrowTextInput.current.setNativeProps({
      text: value,
    });
  };
  useAnimatedReaction(
    () => {
      return currentItem.value?.type === 'doubleArrows'
        ? currentItem.value?.text || ''
        : '';
    },
    (value) => {
      if (updateText) runOnJS(updateText)(value);
    },
    [updateText, doubleArrowTextInput]
  );

  return (
    <>
      <AnimatedEllipse
        animatedProps={ellipseAnimatedProps}
        stroke={currentItem.value?.color || 'black'}
      />
      <G markerStart="url(#selection)" markerEnd="url(#selection)">
        <AnimatedLine
          animatedProps={singleHeadAnimatedProps}
          stroke={currentItem.value?.color || 'black'}
        />
      </G>
      <G markerStart="url(#selection)" markerEnd="url(#selection)">
        <AnimatedLine
          animatedProps={doubleHeadAnimatedProps}
          stroke={currentItem.value?.color || 'black'}
        />
      </G>
      <G markerStart="url(#selection)" markerEnd="url(#selection)">
        <AnimatedLine
          animatedProps={doubleArrowsAnimatedPropsFirst}
          stroke={currentItem.value?.color || 'black'}
        />

        <AnimatedTextInput
          animatedProps={{
            ...(doubleArrowsAnimatedPropsText as any), // Type cast to bypass the type error
            // Ensure other relevant props if needed
          }}
          value={
            currentItem.value?.type === 'doubleArrows'
              ? currentItem.value.text
              : ''
          }
          ref={doubleArrowTextInput}
          underlineColorAndroid={'transparent'}
          onChangeText={(text) => {
            if (currentItem.value?.type === 'doubleArrows') {
              currentItem.value = {
                ...currentItem.value,
                text,
              };
            }
          }}
          style={{
            color: 'black',
            fontSize: 24,
            position: 'absolute',
          }}
        />

        <AnimatedLine
          animatedProps={doubleArrowsAnimatedPropsLast}
          stroke={currentItem.value?.color || 'black'}
        />
      </G>
      <AnimatedRectangle
        animatedProps={rectangleAnimatedProps}
        stroke={currentItem.value?.color || 'black'}
      />
      <AnimatedPath
        animatedProps={penAnimatedProps}
        stroke={currentItem.value?.color || 'black'}
      />
    </>
  );
}
