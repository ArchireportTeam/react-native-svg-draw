import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewProps,
  ImageRequireSource,
  ImageURISource,
  Keyboard,
} from 'react-native';
import DrawCore from '../DrawCore';
import type { DrawItemType, DrawCoreProps } from '../../types';
import PenSvg from './PenSvg';
import DoubleHeadSvg from './DoubleHeadSvg';
import CircleSvg from './CircleSvg';
import SquareSvg from './SquareSvg';
import ArrowSvg from './ArrowSvg';
import TextSvg from './TextSvg';
import CloseSvg from './CloseSvg';
import ThrashSvg from './ThrashSvg';
import SendSvg from './SendSvg';
import CancelSvg from './CancelSvg';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  option: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  drawOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#3a6cff',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
  },
  bottomToolBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
});

export default function DrawWithOptions({
  close,
  takeSnapshot,
  linearGradient,
  image,
  defaultDrawingMode = 'ellipse',
}: {
  close?: () => void;
  takeSnapshot?: (snap: Promise<string | undefined>) => void;
  linearGradient: React.ComponentType<{ colors: any[] } & ViewProps>;
  image?: ImageRequireSource | ImageURISource;
  defaultDrawingMode?: DrawItemType;
}) {
  const drawRef = useRef<DrawCoreProps>(null);

  const [drawingMode, setDrawingMode] =
    useState<DrawItemType>(defaultDrawingMode);

  const [selectedItem, setSelectedItem] = useState(false);

  const [cancelEnabled, setCancelEnabled] = useState(false);

  const onPressSend = useCallback(() => {
    if (drawRef.current) {
      takeSnapshot?.(drawRef.current.takeSnapshot());
    }
  }, [takeSnapshot]);

  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    const sudDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setShowToolbar(true);
    });

    const sudDidShow = Keyboard.addListener('keyboardDidShow', (event) => {
      // avoid events triggered by InputAccessoryView
      if (event.endCoordinates.height > 100) {
        setShowToolbar(false);
      }
    });

    // cleanup function
    return () => {
      sudDidShow.remove();
      sudDidHide.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable style={styles.option} onPress={close}>
          <CloseSvg height={20} width={20} fill="#ffffff" />
        </Pressable>
        <View style={styles.drawOptions}>
          <Pressable
            style={styles.option}
            onPress={() => {
              setDrawingMode('pen');
            }}
          >
            <PenSvg
              height={23}
              width={22}
              stroke="#ffffff"
              strokeWidth="2"
              opacity={drawingMode === 'pen' ? 1 : 0.5}
            />
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              setDrawingMode('doubleHead');
            }}
          >
            <DoubleHeadSvg
              height={20}
              width={20}
              fill="#ffffff"
              opacity={drawingMode === 'doubleHead' ? 1 : 0.5}
            />
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              setDrawingMode('singleHead');
            }}
          >
            <ArrowSvg
              height={23}
              width={23}
              fill="#ffffff"
              opacity={drawingMode === 'singleHead' ? 1 : 0.5}
            />
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              setDrawingMode('rectangle');
            }}
          >
            <SquareSvg
              height={27}
              width={27}
              fill="#ffffff"
              opacity={drawingMode === 'rectangle' ? 1 : 0.5}
            />
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              setDrawingMode('ellipse');
            }}
          >
            <CircleSvg
              fill="#ffffff"
              height={26}
              width={26}
              opacity={drawingMode === 'ellipse' ? 1 : 0.5}
            />
          </Pressable>

          <Pressable
            style={styles.option}
            onPress={() => {
              setDrawingMode('text');
            }}
          >
            <TextSvg
              height={28}
              width={28}
              fill="#ffffff"
              opacity={drawingMode === 'text' ? 1 : 0.5}
            />
          </Pressable>
        </View>
      </View>
      <DrawCore
        ref={drawRef}
        drawingMode={drawingMode}
        image={image}
        linearGradient={linearGradient}
        onSelectionChange={setSelectedItem}
        onCancelChange={setCancelEnabled}
      />

      {showToolbar ? (
        <View style={styles.bottomToolBar}>
          {selectedItem ? (
            <Pressable
              style={styles.option}
              onPress={() => {
                drawRef.current?.deleteSelectedItem();
              }}
            >
              <ThrashSvg width={28} height={28} fill="white" />
            </Pressable>
          ) : null}
          {cancelEnabled ? (
            <Pressable
              style={styles.option}
              onPress={() => {
                drawRef.current?.cancelLastAction();
              }}
            >
              <CancelSvg
                width={27}
                height={27}
                stroke="#ffffff"
                strokeWidth={2}
              />
            </Pressable>
          ) : null}
          <Pressable style={styles.sendButton} onPress={onPressSend}>
            <SendSvg fill="#fff" width={20} height={20} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
