import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
  Keyboard,
  ImageBackground,
  Image,
  ImageRequireSource,
  ImageURISource,
  ViewProps,
  Platform,
  InputAccessoryView,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import ColorSlider from './ColorSlider';
import StrokeSlider from './StrokeSlider';
import type {
  DrawItem,
  DrawItemType,
  DrawCoreProps,
  hslColor,
  Size,
} from '../../types';
import DrawPad from './DrawPad';
import ViewShot from 'react-native-view-shot';

const RIGHT_PANE_WIDTH = 60;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  rightPaneBaseStyle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000000cc',
    width: RIGHT_PANE_WIDTH,
    justifyContent: 'space-evenly',
    marginVertical: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingVertical: 30,
  },
  strokeSliderContainer: {
    flex: 1,
    paddingBottom: 15,
    borderBottomColor: '#000000',
    borderBottomWidth: 2,
  },
  colorSliderContainer: { flex: 1, paddingTop: 15 },
  bgImage: { width: '100%', height: '100%' },
  textInput: {
    backgroundColor: '#000000c5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 16,
    color: 'white',
    width: '100%',
  },
});

function pDistance(
  point: { x: number; y: number },
  line: { x1: number; x2: number; y1: number; y2: number }
) {
  'worklet';
  const { x1, x2, y1, y2 } = line;
  const { x, y } = point;

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq !== 0) {
    //in case of 0 length line
    param = dot / len_sq;
  }

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

const AnimatedKeyboardAvoidingView =
  Animated.createAnimatedComponent(KeyboardAvoidingView);

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const DEFAULT_TEXT = '';

const THRESHOLD = 20;

type Context = {
  startX: number;
  startY: number;
  newlyCreated: boolean;
  zone?:
    | 'TOP'
    | 'BOTTOM'
    | 'LEFT'
    | 'RIGHT'
    | 'TOP_LEFT'
    | 'TOP_RIGHT'
    | 'BOTTOM_LEFT'
    | 'BOTTOM_RIGHT'
    | 'CENTER'
    | 'OUT';
};

const drawNewItem = (
  mode: Animated.SharedValue<DrawItemType>,
  currentItem: Animated.SharedValue<DrawItem | null>,
  updateDoneItems: (item: DrawItem) => void,
  position: { x: number; y: number },
  style: {
    textBaseHeight: Animated.SharedValue<number | null>;
    strokeWidth: Animated.SharedValue<number>;
    color: Animated.SharedValue<hslColor>;
  }
) => {
  'worklet';

  if (currentItem.value) {
    runOnJS(updateDoneItems)(currentItem.value);
  }

  switch (mode.value) {
    case 'ellipse':
      currentItem.value = {
        type: mode.value,
        data: {
          cx: position.x,
          cy: position.y,
          rx: 0,
          ry: 0,
        },
        strokeWidth: style.strokeWidth.value,
        color: style.color.value,
      };
      break;
    case 'rectangle':
      currentItem.value = {
        type: mode.value,
        data: { x: position.x, y: position.y, width: 0, height: 0 },
        strokeWidth: style.strokeWidth.value,
        color: style.color.value,
      };
      break;
    case 'singleHead':
    case 'doubleHead':
      currentItem.value = {
        type: mode.value,
        data: {
          x1: position.x,
          y1: position.y,
          x2: position.x,
          y2: position.y,
        },
        strokeWidth: style.strokeWidth.value,
        color: style.color.value,
      };
      break;
    case 'text':
      currentItem.value = {
        type: mode.value,
        data: {
          x: position.x,
          y: position.y,
          width: 200,
          height: style.textBaseHeight.value || 0,
        },
        strokeWidth: style.strokeWidth.value,
        text: DEFAULT_TEXT,
        color: style.color.value,
      };
      break;
    case 'pen':
      currentItem.value = {
        type: mode.value,
        data: [],
        strokeWidth: style.strokeWidth.value,
        color: style.color.value,
      };
      break;
  }
};

const onTextHeightUpdate = (
  currentItem: Animated.SharedValue<DrawItem | null>,
  textBaseHeight: Animated.SharedValue<number | null>,
  height: number
) => {
  'worklet';
  if (currentItem.value?.type === 'text') {
    textBaseHeight.value = textBaseHeight.value || height;

    currentItem.value = {
      data: {
        ...currentItem.value.data,
        height: height,
      },
      type: currentItem.value.type,
      strokeWidth: currentItem.value.strokeWidth,
      color: currentItem.value.color,
      text: currentItem.value.text,
    };
  }
};

const DrawCore = React.forwardRef<
  DrawCoreProps,
  {
    drawingMode: DrawItemType;
    image?: ImageRequireSource | ImageURISource;
    linearGradient: React.ComponentType<{ colors: any[] } & ViewProps>;
    onSelectionChange?: (selected: boolean) => void;
  }
>(({ drawingMode, image, linearGradient, onSelectionChange }, ref) => {
  const mode = useSharedValue<DrawItemType>('pen');

  const [drawRegion, setDrawRegion] = useState<Size | null>(null);

  const [originalImageSize, setOriginalImageSize] = useState<Size | null>(null);

  const [imageSize, setImageSize] = useState<Size | null>(null);

  const drawContainer = useRef<View>(null);

  const viewShot = useRef<ViewShot>(null);

  const [textVal, setTextVal] = useState<string>('');

  const currentItem = useSharedValue<DrawItem | null>(null);

  const initialItem = useSharedValue<DrawItem | null>(null);

  const [doneItems, setDoneItems] = useState<DrawItem[]>([]);

  const textBaseHeight = useSharedValue<number | null>(null);

  const updateDoneItems = useCallback((done: DrawItem) => {
    setDoneItems((previous) => previous.concat(done));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      drawingContainer: drawContainer,
      deletedSelectedItem: () => {
        if (currentItem.value) {
          currentItem.value = null;
        }
        onSelectionChange?.(false);
      },
      takeSnapshot: async (): Promise<string | undefined> => {
        return viewShot.current?.capture?.();
      },
    }),
    [currentItem, onSelectionChange]
  );

  useEffect(() => {
    mode.value = drawingMode;
    if (currentItem.value) {
      updateDoneItems(currentItem.value);
    }
    currentItem.value = null;
    onSelectionChange?.(false);
  }, [drawingMode, mode, currentItem, updateDoneItems, onSelectionChange]);

  const addNewItem = runOnJS(updateDoneItems);

  const strokeWidth = useSharedValue<number>(2);

  const color = useSharedValue<hslColor>('hsl(0, 100%, 0%)');

  const panPosition = useSharedValue(0);

  const showTextInput = useSharedValue(false);

  const textFocus = useCallback(() => {
    textInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (currentItem.value?.type === 'text') {
      currentItem.value = {
        data: currentItem.value.data,
        type: currentItem.value.type,
        strokeWidth: currentItem.value.strokeWidth,
        color: currentItem.value.color,
        text: textVal,
      };
    }
  }, [currentItem, textVal]);

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    Context
  >(
    {
      onStart: ({ x, y }, ctx) => {
        const startX = x;
        const startY = y;
        ctx.startX = startX;
        ctx.startY = startY;
        ctx.newlyCreated = false;

        panPosition.value = withTiming(RIGHT_PANE_WIDTH);

        initialItem.value = currentItem.value;

        switch (currentItem.value?.type) {
          case 'ellipse':
            const cx =
              typeof currentItem.value.data.cx === 'string'
                ? parseFloat(currentItem.value.data.cx)
                : currentItem.value.data.cx || 0;
            const cy =
              typeof currentItem.value.data.cy === 'string'
                ? parseFloat(currentItem.value.data.cy)
                : currentItem.value.data.cy || 0;
            const rx =
              typeof currentItem.value.data.rx === 'string'
                ? parseFloat(currentItem.value.data.rx)
                : currentItem.value.data.rx || 0;
            const ry =
              typeof currentItem.value.data.ry === 'string'
                ? parseFloat(currentItem.value.data.ry)
                : currentItem.value.data.ry || 0;

            if (
              startX <= cx + THRESHOLD &&
              startX >= cx - THRESHOLD &&
              startY <= cy - ry + THRESHOLD &&
              startY >= cy - ry - THRESHOLD
            ) {
              ctx.zone = 'TOP';
            } else if (
              startX <= cx + THRESHOLD &&
              startX >= cx - THRESHOLD &&
              startY <= cy + ry + THRESHOLD &&
              startY >= cy + ry - THRESHOLD
            ) {
              ctx.zone = 'BOTTOM';
            } else if (
              startY <= cy + THRESHOLD &&
              startY >= cy - THRESHOLD &&
              startX <= cx - rx + THRESHOLD &&
              startX >= cx - rx - THRESHOLD
            ) {
              ctx.zone = 'LEFT';
            } else if (
              startY <= cy + THRESHOLD &&
              startY >= cy - THRESHOLD &&
              startX <= cx + rx + THRESHOLD &&
              startX >= cx + rx - THRESHOLD
            ) {
              ctx.zone = 'RIGHT';
            } else if (
              ((rx > 0 && startX > cx - rx && startX < cx + rx) ||
                (rx < 0 && startX < cx - rx && startX > cx + rx)) &&
              ((ry > 0 && startY > cy - ry && startY < cy + ry) ||
                (ry < 0 && startY < cy - ry && startY > cy + ry))
            ) {
              ctx.zone = 'CENTER';
            } else {
              ctx.zone = 'OUT';
              initialItem.value = null;
            }

            break;
          case 'rectangle':
            const x =
              typeof currentItem.value.data.x === 'string'
                ? parseFloat(currentItem.value.data.x)
                : currentItem.value.data.x || 0;
            const y =
              typeof currentItem.value.data.y === 'string'
                ? parseFloat(currentItem.value.data.y)
                : currentItem.value.data.y || 0;
            const height =
              typeof currentItem.value.data.height === 'string'
                ? parseFloat(currentItem.value.data.height)
                : currentItem.value.data.height || 0;
            const width =
              typeof currentItem.value.data.width === 'string'
                ? parseFloat(currentItem.value.data.width)
                : currentItem.value.data.width || 0;

            if (startX <= x + THRESHOLD && startX >= x - THRESHOLD) {
              if (startY <= y + THRESHOLD && startY >= y - THRESHOLD) {
                ctx.zone = 'TOP_LEFT';
              } else if (
                startY <= y + height + THRESHOLD &&
                startY >= y + height - THRESHOLD
              ) {
                ctx.zone = 'BOTTOM_LEFT';
              }
            } else if (
              startX <= x + width + THRESHOLD &&
              startX >= x + width - THRESHOLD
            ) {
              if (startY <= y + THRESHOLD && startY >= y - THRESHOLD) {
                ctx.zone = 'TOP_RIGHT';
              } else if (
                startY <= y + height + THRESHOLD &&
                startY >= y + height - THRESHOLD
              ) {
                ctx.zone = 'BOTTOM_RIGHT';
              }
            } else if (
              ((width > 0 && startX > x && startX < x + width) ||
                (width < 0 && startX < x && startX > x + width)) &&
              ((height > 0 && startY > y && startY < y + height) ||
                (height < 0 && startY < y && startY > y + height))
            ) {
              ctx.zone = 'CENTER';
            } else {
              ctx.zone = 'OUT';
              initialItem.value = null;
            }

            break;
          case 'doubleHead':
          case 'singleHead':
            const x1 =
              typeof currentItem.value.data.x1 === 'string'
                ? parseFloat(currentItem.value.data.x1)
                : currentItem.value.data.x1 || 0;
            const y1 =
              typeof currentItem.value.data.y1 === 'string'
                ? parseFloat(currentItem.value.data.y1)
                : currentItem.value.data.y1 || 0;
            const x2 =
              typeof currentItem.value.data.x2 === 'string'
                ? parseFloat(currentItem.value.data.x2)
                : currentItem.value.data.x2 || 0;
            const y2 =
              typeof currentItem.value.data.y2 === 'string'
                ? parseFloat(currentItem.value.data.y2)
                : currentItem.value.data.y2 || 0;

            if (
              startX <= x1 + THRESHOLD &&
              startX >= x1 - THRESHOLD &&
              startY <= y1 + THRESHOLD &&
              startY >= y1 - THRESHOLD
            ) {
              ctx.zone = 'TOP';
            } else if (
              startX <= x2 + THRESHOLD &&
              startX >= x2 - THRESHOLD &&
              startY - THRESHOLD <= y2 + THRESHOLD &&
              startY + THRESHOLD >= y2 - THRESHOLD
            ) {
              ctx.zone = 'BOTTOM';
            } else if (
              pDistance({ x: startX, y: startY }, { x1, x2, y1, y2 }) <=
                THRESHOLD &&
              ((startX > x1 && startX < x2) || (startX < x1 && startX > x2)) &&
              ((startY > y1 && startY < y2) || (startY < y1 && startY > y2))
            ) {
              ctx.zone = 'CENTER';
            } else {
              ctx.zone = 'OUT';
              initialItem.value = null;
            }

            break;
          case 'text':
            const xText =
              typeof currentItem.value.data.x === 'string'
                ? parseFloat(currentItem.value.data.x)
                : currentItem.value.data.x || 0;
            const yText =
              typeof currentItem.value.data.y === 'string'
                ? parseFloat(currentItem.value.data.y)
                : currentItem.value.data.y || 0;
            const widthText =
              typeof currentItem.value.data.width === 'string'
                ? parseFloat(currentItem.value.data.width)
                : currentItem.value.data.width || 0;
            const heightText =
              typeof currentItem.value.data.height === 'string'
                ? parseFloat(currentItem.value.data.height)
                : currentItem.value.data.height || 0;

            if (
              startX <= xText + THRESHOLD &&
              startX >= xText - THRESHOLD &&
              startY <= yText + heightText / 2 + THRESHOLD &&
              startY >= yText + heightText / 2 - THRESHOLD
            ) {
              ctx.zone = 'LEFT';
            } else if (
              startX <= xText + widthText + THRESHOLD &&
              startX >= xText + widthText - THRESHOLD &&
              startY <= yText + heightText / 2 + THRESHOLD &&
              startY >= yText + heightText / 2 - THRESHOLD
            ) {
              ctx.zone = 'RIGHT';
            } else if (
              ((widthText > 0 &&
                startX > xText &&
                startX < xText + widthText) ||
                (widthText < 0 &&
                  startX < xText &&
                  startX > xText + widthText)) &&
              ((heightText > 0 &&
                startY > yText &&
                startY < yText + heightText) ||
                (heightText < 0 &&
                  startY < yText &&
                  startY > yText + heightText))
            ) {
              ctx.zone = 'CENTER';
            } else {
              ctx.zone = 'OUT';
              initialItem.value = null;
            }

            break;
          case 'pen':
            if (
              currentItem.value.data.some(
                (p) =>
                  startX <= p.x + THRESHOLD &&
                  startX >= p.x - THRESHOLD &&
                  startY <= p.y + THRESHOLD &&
                  startY >= p.y - THRESHOLD
              )
            ) {
              ctx.zone = 'CENTER';
            } else {
              ctx.zone = 'OUT';
              initialItem.value = null;
            }
            break;
          default:
            ctx.zone = 'OUT';
            initialItem.value = null;
            break;
        }
      },
      onActive: ({ x, y, translationX, translationY }, ctx) => {
        const { startX, startY, zone, newlyCreated } = ctx;
        if (zone === 'OUT' && newlyCreated === false) {
          ctx.newlyCreated = true;
          if (mode.value === 'text') {
            runOnJS(setTextVal)('');
          }

          drawNewItem(
            mode,
            currentItem,
            addNewItem,
            { x: startX, y: startY },
            { textBaseHeight, strokeWidth, color }
          );
          onSelectionChange && runOnJS(onSelectionChange)(true);
        }
        switch (currentItem.value?.type) {
          case 'pen':
            if (
              initialItem.value?.type === currentItem.value.type &&
              zone === 'CENTER'
            ) {
              currentItem.value = {
                type: 'pen',
                strokeWidth: currentItem.value.strokeWidth,
                color: currentItem.value.color,
                data: initialItem.value.data.map((p) => ({
                  x: p.x + translationX,
                  y: p.y + translationY,
                })),
              };
            } else {
              currentItem.value = {
                type: 'pen',
                strokeWidth: currentItem.value.strokeWidth,
                color: currentItem.value.color,
                data: currentItem.value.data.concat({
                  x: x,
                  y: y,
                }),
              };
            }
            break;
          case 'ellipse':
            if (initialItem.value?.type === currentItem.value.type) {
              const rx =
                typeof initialItem.value.data.rx === 'string'
                  ? parseFloat(initialItem.value?.data.rx)
                  : initialItem.value.data.rx || 0;

              const ry =
                typeof initialItem.value.data.ry === 'string'
                  ? parseFloat(initialItem.value.data.ry)
                  : initialItem.value.data.ry || 0;

              const cx =
                typeof initialItem.value.data.cx === 'string'
                  ? parseFloat(initialItem.value.data.cx)
                  : initialItem.value.data.cx || 0;

              const cy =
                typeof initialItem.value.data.cy === 'string'
                  ? parseFloat(initialItem.value.data.cy)
                  : initialItem.value.data.cy || 0;

              switch (zone) {
                case 'TOP':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      cx: cx,
                      cy: cy + translationY,
                      rx: rx,
                      ry: ry - translationY,
                    },
                  };
                  break;
                case 'BOTTOM':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      cx: cx,
                      cy: cy + translationY,
                      rx: rx,
                      ry: ry + translationY,
                    },
                  };
                  break;
                case 'LEFT':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      cx: cx + translationX,
                      cy: cy,
                      rx: rx - translationX,
                      ry: ry,
                    },
                  };
                  break;
                case 'RIGHT':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      cx: cx + translationX,
                      cy: cy,
                      rx: rx + translationX,
                      ry: ry,
                    },
                  };
                  break;
                case 'CENTER':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      cx: cx + translationX,
                      cy: cy + translationY,
                      rx: rx,
                      ry: ry,
                    },
                  };
                  break;
              }
            } else {
              currentItem.value = {
                type: currentItem.value.type,
                strokeWidth: currentItem.value.strokeWidth,
                color: currentItem.value.color,
                data: {
                  cx: startX + translationX,
                  cy: startY + translationY,
                  rx: translationX,
                  ry: translationY,
                },
              };
            }

            break;
          case 'rectangle':
            if (initialItem.value?.type === currentItem.value.type) {
              const height =
                typeof initialItem.value?.data.height === 'string'
                  ? parseFloat(initialItem.value?.data.height)
                  : initialItem.value?.data.height || 0;

              const width =
                typeof initialItem.value?.data.width === 'string'
                  ? parseFloat(initialItem.value?.data.width)
                  : initialItem.value?.data.width || 0;

              const x =
                typeof initialItem.value?.data.x === 'string'
                  ? parseFloat(initialItem.value?.data.x)
                  : initialItem.value?.data.x || 0;

              const y =
                typeof initialItem.value?.data.y === 'string'
                  ? parseFloat(initialItem.value?.data.y)
                  : initialItem.value?.data.y || 0;

              switch (zone) {
                case 'TOP_LEFT':
                  currentItem.value = {
                    type: 'rectangle',
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x: startX + translationX,
                      y: startY + translationY,
                      width: width - translationX,
                      height: height - translationY,
                    },
                  };
                  break;
                case 'TOP_RIGHT':
                  currentItem.value = {
                    type: 'rectangle',
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x: x,
                      y: startY + translationY,
                      width: width + translationX,
                      height: height - translationY,
                    },
                  };
                  break;
                case 'BOTTOM_LEFT':
                  currentItem.value = {
                    type: 'rectangle',
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x: startX + translationX,
                      y: y,
                      width: width - translationX,
                      height: height + translationY,
                    },
                  };
                  break;
                case 'BOTTOM_RIGHT':
                  currentItem.value = {
                    type: 'rectangle',
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x: x,
                      y: y,
                      width: width + translationX,
                      height: height + translationY,
                    },
                  };
                  break;
                case 'CENTER':
                  currentItem.value = {
                    type: 'rectangle',
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x: x + translationX,
                      y: y + translationY,
                      width: width,
                      height: height,
                    },
                  };
                  break;
              }
            } else {
              currentItem.value = {
                type: 'rectangle',
                strokeWidth: currentItem.value.strokeWidth,
                color: currentItem.value.color,
                data: {
                  x: currentItem.value.data.x,
                  y: currentItem.value.data.y,
                  width: translationX,
                  height: translationY,
                },
              };
            }
            break;
          case 'singleHead':
          case 'doubleHead':
            if (initialItem.value?.type === currentItem.value.type) {
              const x1 =
                typeof initialItem.value?.data.x1 === 'string'
                  ? parseFloat(initialItem.value?.data.x1)
                  : initialItem.value?.data.x1 || 0;

              const y1 =
                typeof initialItem.value?.data.y1 === 'string'
                  ? parseFloat(initialItem.value?.data.y1)
                  : initialItem.value?.data.y1 || 0;

              const x2 =
                typeof initialItem.value?.data.x2 === 'string'
                  ? parseFloat(initialItem.value?.data.x2)
                  : initialItem.value?.data.x2 || 0;

              const y2 =
                typeof initialItem.value?.data.y2 === 'string'
                  ? parseFloat(initialItem.value?.data.y2)
                  : initialItem.value?.data.y2 || 0;

              switch (zone) {
                case 'TOP':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x1: x1 + translationX,
                      y1: y1 + translationY,
                      x2: x2,
                      y2: y2,
                    },
                  };
                  break;
                case 'BOTTOM':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x1: x1,
                      y1: y1,
                      x2: x2 + translationX,
                      y2: y2 + translationY,
                    },
                  };
                  break;
                case 'CENTER':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    data: {
                      x1: x1 + translationX,
                      y1: y1 + translationY,
                      x2: x2 + translationX,
                      y2: y2 + translationY,
                    },
                  };
                  break;
              }
            } else {
              currentItem.value = {
                type: currentItem.value.type,
                strokeWidth: currentItem.value.strokeWidth,
                color: currentItem.value.color,
                data: {
                  x1: startX,
                  y1: startY,
                  x2: startX + translationX,
                  y2: startY + translationY,
                },
              };
            }
            break;
          case 'text':
            if (initialItem.value?.type === currentItem.value.type) {
              const xText =
                typeof initialItem.value?.data.x === 'string'
                  ? parseFloat(initialItem.value?.data.x)
                  : initialItem.value?.data.x || 0;
              const yText =
                typeof initialItem.value?.data.y === 'string'
                  ? parseFloat(initialItem.value?.data.y)
                  : initialItem.value?.data.y || 0;
              const widthText =
                typeof initialItem.value?.data.width === 'string'
                  ? parseFloat(initialItem.value?.data.width)
                  : initialItem.value?.data.width || 0;
              const heightText =
                typeof initialItem.value?.data.height === 'string'
                  ? parseFloat(initialItem.value?.data.height)
                  : initialItem.value?.data.height || 0;

              switch (zone) {
                case 'LEFT':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    text: currentItem.value.text,
                    data: {
                      x: xText + translationX,
                      y: yText,
                      width: widthText - translationX,
                      height: heightText,
                    },
                  };
                  break;
                case 'RIGHT':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    text: currentItem.value.text,
                    data: {
                      x: xText,
                      y: yText,
                      width: widthText + translationX,
                      height: heightText,
                    },
                  };
                  break;
                case 'CENTER':
                  currentItem.value = {
                    type: currentItem.value.type,
                    strokeWidth: currentItem.value.strokeWidth,
                    color: currentItem.value.color,
                    text: currentItem.value.text,
                    data: {
                      x: xText + translationX,
                      y: yText + translationY,
                      width: widthText,
                      height: heightText,
                    },
                  };
                  break;
              }
            } else {
              currentItem.value = {
                type: currentItem.value.type,
                strokeWidth: currentItem.value.strokeWidth,
                color: currentItem.value.color,
                text: currentItem.value.text,
                data: {
                  x: startX + translationX,
                  y: startY + translationY,
                  width: currentItem.value.data.width,
                  height: currentItem.value.data.height,
                },
              };
            }
        }
      },
      onEnd: (_event) => {
        panPosition.value = withTiming(0);

        if (currentItem.value?.type === 'text') {
          runOnJS(textFocus)();

          currentItem.value = {
            type: currentItem.value.type,
            strokeWidth: currentItem.value.strokeWidth,
            color: currentItem.value.color,
            data: currentItem.value.data,
            text:
              currentItem.value.text !== DEFAULT_TEXT
                ? currentItem.value.text ?? ''
                : '',
          };
        }
      },
    },
    []
  );

  const rightPaneStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: panPosition.value }],
    };
  }, [panPosition.value]);

  useEffect(() => {
    const sudDidHide = Keyboard.addListener('keyboardDidHide', () => {
      showTextInput.value = false;
    });

    const sudDidShow = Keyboard.addListener('keyboardDidShow', (event) => {
      // avoid events triggered by InputAccessoryView
      if (event.endCoordinates.height > 100) {
        showTextInput.value = true;
      }
    });

    // cleanup function
    return () => {
      sudDidShow.remove();
      sudDidHide.remove();
    };
  }, [showTextInput]);

  const textInputRef = useRef<TextInput>(null);

  const keyboardAvoidingViewStyle = useAnimatedStyle(() => {
    return {
      height: 'auto',
      backgroundColor: 'white',
      display: 'flex',
      opacity: showTextInput.value ? withTiming(1) : withTiming(0),
    };
  }, [showTextInput.value]);

  const textInputStyle = useAnimatedStyle(() => {
    return {
      display: showTextInput.value ? 'flex' : 'none',
      opacity: showTextInput.value ? withTiming(1) : withTiming(0),
    };
  }, [showTextInput.value]);

  useAnimatedReaction(
    () => {
      return { strokeWidth: strokeWidth.value, color: color.value };
    },
    ({ strokeWidth, color }: { strokeWidth: number; color: hslColor }) => {
      switch (currentItem.value?.type) {
        case 'singleHead':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth,
            color,
          };
          break;
        case 'doubleHead':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth,
            color,
          };
          break;
        case 'ellipse':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth,
            color,
          };
          break;
        case 'rectangle':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth,
            color,
          };
          break;

        case 'pen':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth,
            color,
          };
          break;
        case 'text':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth,
            color,
            text: currentItem.value.text,
          };
          break;
      }
    },
    [strokeWidth.value, color.value]
  );

  const onPressItem = useCallback(
    (item: DrawItem, index: number) => () => {
      onSelectionChange?.(true);

      const previousItem = currentItem.value;

      strokeWidth.value = item.strokeWidth;
      color.value = item.color;
      currentItem.value = item;

      setDoneItems((done) => {
        const copy = [...done];
        copy.splice(index, 1);
        return copy;
      });

      if (previousItem) {
        updateDoneItems(previousItem);
      }

      if (item.type === 'text') {
        setTextVal(item.text ?? '');
      } else {
        textInputRef.current?.blur();
      }
    },
    [color, currentItem, strokeWidth, updateDoneItems, onSelectionChange]
  );

  const onTextHeightChange = useCallback(
    (height: number) => {
      onTextHeightUpdate(currentItem, textBaseHeight, height);
    },
    [currentItem, textBaseHeight]
  );

  const calculateSizes = useCallback(
    (imageWidth: number, imageHeight: number) => {
      if (drawRegion) {
        setOriginalImageSize({ width: imageWidth, height: imageHeight });

        const ratioImageHeight =
          Math.round(((imageHeight * drawRegion.width) / imageWidth) * 100) /
          100;

        if (ratioImageHeight < drawRegion.height) {
          setImageSize({
            width: drawRegion.width,
            height: ratioImageHeight,
          });
        } else {
          setImageSize({
            height: drawRegion.height,
            width:
              Math.round(
                ((imageWidth * drawRegion.height) / imageHeight) * 100
              ) / 100,
          });
        }
      }
    },
    [drawRegion]
  );

  useEffect(() => {
    if (drawRegion && image) {
      if (typeof image === 'number') {
        const infos = Image.resolveAssetSource(image);

        calculateSizes(infos.width, infos.height);
      } else if (image.uri) {
        Image.getSize(image.uri, (imageWidth, imageHeight) => {
          calculateSizes(imageWidth, imageHeight);
        });
      }
    }
  }, [image, drawRegion, calculateSizes]);

  return (
    <View style={styles.container}>
      <View
        style={styles.drawZone}
        onLayout={(event) => {
          setDrawRegion({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
          });
        }}
      >
        <PanGestureHandler
          activeOffsetX={2}
          activeOffsetY={2}
          onGestureEvent={onGestureEvent}
        >
          <Animated.View style={imageSize || drawRegion}>
            <View ref={drawContainer}>
              {image ? (
                imageSize && originalImageSize ? (
                  <ViewShot
                    ref={viewShot}
                    options={{
                      format: 'jpg',
                      quality: 1,
                      ...originalImageSize,
                    }}
                    style={imageSize}
                  >
                    <ImageBackground source={image} style={styles.bgImage}>
                      <DrawPad
                        currentItem={currentItem}
                        doneItems={doneItems}
                        onPressItem={onPressItem}
                        onTextHeightChange={onTextHeightChange}
                      />
                    </ImageBackground>
                  </ViewShot>
                ) : null
              ) : drawRegion ? (
                <ViewShot
                  ref={viewShot}
                  options={{
                    format: 'jpg',
                    quality: 1,
                    ...drawRegion,
                  }}
                  style={drawRegion}
                >
                  <DrawPad
                    currentItem={currentItem}
                    doneItems={doneItems}
                    onPressItem={onPressItem}
                    onTextHeightChange={onTextHeightChange}
                  />
                </ViewShot>
              ) : null}
            </View>
          </Animated.View>
        </PanGestureHandler>

        <Animated.View style={[styles.rightPaneBaseStyle, rightPaneStyle]}>
          <View style={styles.strokeSliderContainer}>
            <StrokeSlider minValue={2} maxValue={10} stroke={strokeWidth} />
          </View>
          <View style={styles.colorSliderContainer}>
            <ColorSlider color={color} linearGradient={linearGradient} />
          </View>
        </Animated.View>
      </View>
      {Platform.OS === 'ios' ? (
        <InputAccessoryView>
          <AnimatedTextInput
            ref={textInputRef}
            style={[styles.textInput, textInputStyle]}
            onEndEditing={textInputRef.current?.clear}
            onChangeText={setTextVal}
            value={textVal}
            autoCorrect={false}
          />
        </InputAccessoryView>
      ) : (
        <AnimatedKeyboardAvoidingView
          behavior="position"
          style={keyboardAvoidingViewStyle}
        >
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            onEndEditing={textInputRef.current?.clear}
            onChangeText={setTextVal}
            value={textVal}
            autoCorrect={false}
          />
        </AnimatedKeyboardAvoidingView>
      )}
    </View>
  );
});

export default DrawCore;
