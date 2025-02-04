import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Keyboard,
  ImageBackground,
  Image,
  ImageRequireSource,
  ImageURISource,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

import type { DrawItem, DrawItemType, hslColor, Size } from '../../types';
import DrawPad from './DrawPad';
import ViewShot from 'react-native-view-shot';
import useDrawHook from './useDrawHook';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawZone: {
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  bgImage: { width: '100%', height: '100%' },
  textInput: {
    backgroundColor: '#262626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 16,
    color: 'white',
    width: '100%',
    opacity: 0,
    height: 20,
    maxWidth: 20,
  },
});

const pDistance = (
  point: { x: number; y: number },
  line: { x1: number; x2: number; y1: number; y2: number }
) => {
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
};

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
  addDoneItem: (item: DrawItem) => void,
  position: { x: number; y: number },
  style: {
    textBaseHeight: Animated.SharedValue<number | null>;
    strokeWidth: Animated.SharedValue<number>;
    color: Animated.SharedValue<hslColor>;
  }
) => {
  'worklet';
  if (currentItem.value) {
    runOnJS(addDoneItem)(currentItem.value);
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
    case 'doubleArrows':
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

const DrawCore = ({
  image,
  backgroundColor,
}: {
  image?: ImageRequireSource | ImageURISource;
  backgroundColor?: string;
}) => {
  const {
    drawState,
    dispatchDrawStates,
    strokeWidth,
    color,
    currentItem,
    itemIsSelected,
    viewShot,
    doubleArrowTextInput,
  } = useDrawHook();

  const onCancelChangeWrapper = (arg: boolean) => {
    dispatchDrawStates({ type: 'SET_CANCEL_ENABLED', cancelEnabled: arg });
  };

  const mode = useSharedValue<DrawItemType>('pen');

  const [drawRegion, setDrawRegion] = useState<Size | null>(null);

  const [originalImageSize, setOriginalImageSize] = useState<Size | null>(null);

  const [imageSize, setImageSize] = useState<Size | null>(null);

  const drawContainer = useRef<View>(null);

  const [textVal, setTextVal] = useState<string>('');

  const initialItem = useSharedValue<DrawItem | null>(null);

  const textBaseHeight = useSharedValue<number | null>(null);

  const addDoneItem = useCallback(
    (item: DrawItem) => {
      dispatchDrawStates({ type: 'ADD_DONE_ITEM', item: item });
    },
    [dispatchDrawStates]
  );

  const deleteDoneItem = useCallback(
    (indice: number) => {
      dispatchDrawStates({ type: 'DELETE_DONE_ITEM', indice: indice });
    },
    [dispatchDrawStates]
  );

  const addScreenStates = useCallback(
    (item: DrawItem | null) => {
      dispatchDrawStates({
        type: 'ADD_SCREEN_STATE',
        currentItem: item,
      });
    },
    [dispatchDrawStates]
  );

  useEffect(() => {
    mode.value = drawState.drawingMode;
    if (currentItem.value) {
      addDoneItem(currentItem.value);
    }
    currentItem.value = null;
    itemIsSelected.value = false;
  }, [drawState.drawingMode, mode, currentItem, addDoneItem, itemIsSelected]);

  const showTextInput = useSharedValue(false); //TODO: remove

  const textFocusState = useCallback(() => {
    //setShowTextInputState(true);
    console.log('textFocusState');
    doubleArrowTextInput?.current?.focus();
  }, [doubleArrowTextInput]);

  const textFocus = useCallback(() => {
    console.log('textFocus');
    textInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (currentItem.value?.type === 'text') {
      console.log('use effect text');
      showTextInput.value = true;
      textFocus();
      currentItem.value = {
        data: currentItem.value.data,
        type: currentItem.value.type,
        strokeWidth: currentItem.value.strokeWidth,
        color: currentItem.value.color,
        text: textVal,
      };
    }
  }, [currentItem, showTextInput, textFocus, textVal]);

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    Context
  >({
    onStart: ({ x: startX, y: startY }, ctx) => {
      ctx.startX = startX;
      ctx.startY = startY;
      ctx.newlyCreated = false;
      console.log('**********************************');
      console.log('onGestureEvent');
      //panPosition.value = withTiming(RIGHT_PANE_WIDTH);
      console.log('onStart', currentItem.value?.type);
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
        case 'doubleArrows':
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
          console.log(heightText);
          console.log(widthText);
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
            ((widthText > 0 && startX > xText && startX < xText + widthText) ||
              (widthText < 0 &&
                startX < xText &&
                startX > xText + widthText)) &&
            ((heightText > 0 &&
              startY > yText &&
              startY < yText + heightText) ||
              (heightText < 0 && startY < yText && startY > yText + heightText))
          ) {
            ctx.zone = 'CENTER';
            console.log('on active center');
          } else {
            ctx.zone = 'OUT';
            console.log('on active out');
            initialItem.value = null;

            ctx.newlyCreated = true;
            runOnJS(setTextVal)('');
            drawNewItem(
              mode,
              currentItem,
              addDoneItem,
              { x: startX, y: startY },
              { textBaseHeight, strokeWidth, color }
            );

            itemIsSelected!.value = true;
            onCancelChangeWrapper && runOnJS(onCancelChangeWrapper)(true);

            runOnJS(textFocus)();
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
          if (drawState.drawingMode === 'text') {
            /* NEW GEOFF */
            console.log('on active out');
            ctx.newlyCreated = true;

            runOnJS(setTextVal)('');

            drawNewItem(
              mode,
              currentItem,
              addDoneItem,
              { x: startX, y: startY },
              { textBaseHeight, strokeWidth, color }
            );

            itemIsSelected!.value = true;
            onCancelChangeWrapper && runOnJS(onCancelChangeWrapper)(true);

            runOnJS(textFocus)();
          }
          break;
      }
    },
    onActive: (
      { x: currentX, y: currentY, translationX, translationY },
      ctx
    ) => {
      const { startX, startY, zone, newlyCreated } = ctx;
      if (zone === 'OUT' && newlyCreated === false && mode.value !== 'text') {
        console.log('on active out');
        ctx.newlyCreated = true;
        /*
        if (mode.value === 'text') {
          runOnJS(setTextVal)('');
        }*/
        drawNewItem(
          mode,
          currentItem,
          addDoneItem,
          { x: startX, y: startY },
          { textBaseHeight, strokeWidth, color }
        );

        itemIsSelected!.value = true;
        onCancelChangeWrapper && runOnJS(onCancelChangeWrapper)(true);
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
                x: currentX,
                y: currentY,
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
        case 'doubleArrows':
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
                  text:
                    currentItem.value.type === 'doubleArrows'
                      ? currentItem.value.text ?? ''
                      : '',
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
                  text:
                    currentItem.value.type === 'doubleArrows'
                      ? currentItem.value.text ?? ''
                      : '',
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
                  text:
                    currentItem.value.type === 'doubleArrows'
                      ? currentItem.value.text ?? ''
                      : '',
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
              text:
                currentItem.value.type === 'doubleArrows'
                  ? currentItem.value.text ?? ''
                  : '',
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
          console.log('on active text');
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
      if (currentItem.value?.type === 'doubleArrows') {
        runOnJS(textFocusState)();
      }
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
      runOnJS(addScreenStates)(currentItem.value);
    },
  });

  useEffect(() => {
    const sudDidHide = Keyboard.addListener('keyboardDidHide', () => {
      showTextInput.value = false;
    });

    const sudDidShow = Keyboard.addListener('keyboardDidShow', (event) => {
      // avoid events triggered by InputAccessoryView
      console.log('keyboardDidShow dc');
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

  useAnimatedReaction(
    () => {
      return {
        strokeWidth: strokeWidth.value,
        color: color?.value!,
      };
    },
    ({
      strokeWidth: sw,
      color: c,
    }: {
      strokeWidth: number;
      color: hslColor;
    }) => {
      switch (currentItem.value?.type) {
        case 'singleHead':
        case 'doubleHead':
        case 'doubleArrows':
        case 'ellipse':
        case 'rectangle':
        case 'pen':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth: sw,
            color: c,
          } as DrawItem;
          break;
        case 'text':
          currentItem.value = {
            type: currentItem.value.type,
            data: currentItem.value.data,
            strokeWidth: sw,
            color: c,
            text: currentItem.value.text,
          };
          break;
      }
    },
    [strokeWidth.value, color?.value]
  );

  const onPressItem = useCallback(
    (item: DrawItem, index: number) => () => {
      console.log('onPressItem');
      itemIsSelected.value = true;

      const previousItem = currentItem.value;

      strokeWidth.value = item.strokeWidth;
      color.value = item.color;
      console.log('item', item);
      currentItem.value = item;

      deleteDoneItem(index);

      if (previousItem) {
        addDoneItem(previousItem);
      }

      if (item.type === 'text') {
        setTextVal(item.text ?? '');
        textInputRef.current?.focus();
      } else if (item.type === 'doubleArrows') {
        //setTextVal(item.text ?? '');
        //textInputRef.current?.focus();
      } else {
        textInputRef.current?.blur();
      }
    },
    [
      itemIsSelected,
      currentItem,
      strokeWidth,
      color,
      deleteDoneItem,
      addDoneItem,
    ]
  );
  /*
  const onPressItemText = useCallback(
    (item: DrawItem, index: number) => () => {
      itemIsSelected.value = true;

      const previousItem = currentItem.value;

      strokeWidth.value = item.strokeWidth;
      color.value = item.color;
      currentItem.value = item;

      deleteDoneItem(index);

      if (previousItem) {
        addDoneItem(previousItem);
      }

      if (item.type === 'text') {
        setTextVal(item.text ?? '');
        
      } else {
        textInputRef.current?.blur();
      }
    },
    [
      itemIsSelected,
      currentItem,
      strokeWidth,
      color,
      deleteDoneItem,
      addDoneItem,
    ]
  );*/

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

  // do not remove keyboard will appear over the drawing frame and not shift it
  useAnimatedKeyboard();

  /*
  const onEndEditingTextInput = useCallback(() => {
    console.log('onEndEditingTextInput');
    setShowTextInputState(false);
    if (currentItem.value && currentItem.value.type === 'doubleArrows') {
      console.log(currentItem.value.text);
      addScreenStates(currentItem.value);
    }
  }, [currentItem, addScreenStates]);

  const onChangeText = useCallback(
    (value: string) => {
      if (
        value &&
        currentItem.value &&
        currentItem.value.type === 'doubleArrows'
      ) {
        console.log('******************');
        console.log(value);
        console.log(currentItem.value);

        currentItem.value = {
          ...currentItem.value,
          text: value,
        };
      }
    },
    [currentItem]
  );
  */
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.drawZone,
          { backgroundColor: backgroundColor ?? 'none' },
        ]}
        onLayout={(event) => {
          setDrawRegion({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
          });
        }}
      >
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={70}>
          <PanGestureHandler onGestureEvent={onGestureEvent}>
            <Animated.View style={imageSize || drawRegion}>
              <View ref={drawContainer}>
                {image ? (
                  imageSize && originalImageSize ? (
                    <ViewShot
                      ref={viewShot}
                      options={{
                        format: 'jpg',
                        quality: 1,
                      }}
                      style={imageSize}
                    >
                      <ImageBackground source={image} style={styles.bgImage}>
                        <DrawPad
                          currentItem={currentItem}
                          doneItems={drawState.doneItems}
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
                      addBackground
                      currentItem={currentItem}
                      doneItems={drawState.doneItems}
                      onPressItem={onPressItem}
                      onTextHeightChange={onTextHeightChange}
                    />
                  </ViewShot>
                ) : null}
              </View>
            </Animated.View>
          </PanGestureHandler>

          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            onEndEditing={textInputRef.current?.clear}
            onChangeText={setTextVal}
            value={textVal}
            autoCorrect={false}
          />
        </KeyboardAvoidingView>
        {/*Platform.OS === 'ios' ? (
          <InputAccessoryView>
            <AnimatedTextInput
              ref={textInputRef}
              style={[styles.textInput, textInputStyle]}
              onEndEditing={textInputRef.current?.clear}
              onChangeText={setTextVal}
              value={textVal}
              autoCorrect={false}
            />
            <View
              style={{ height: 10, width: '100%', backgroundColor: 'green' }}
            ></View>
          </InputAccessoryView>
        ) : (
          <Animated.View style={textInputContainerStyle}>
            {currentItem.value?.type === 'text' && (
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                onEndEditing={textInputRef.current?.clear}
                onChangeText={setTextVal}
                value={textVal}
                autoCorrect={false}
              />
            )}
          </Animated.View>
        )*/}
      </View>
    </View>
  );
};

export default DrawCore;
