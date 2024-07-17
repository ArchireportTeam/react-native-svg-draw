import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewProps,
  ImageRequireSource,
  ImageURISource,
  Keyboard,
} from 'react-native';
import DoubleHeadSvg from './DoubleHeadSvg';
import CircleSvg from './CircleSvg';
import SquareSvg from './SquareSvg';
import ArrowSvg from './ArrowSvg';
import TextSvg from './TextSvg';
import CloseSvg from './CloseSvg';
import PenSvg from './PenSvg';
import useDrawHook from '../DrawCore/useDrawHook';
import Sliders from '../Slider/Sliders';
import DrawCore from '../DrawCore';
import ThrashSvg from './ThrashSvg';
import CancelSvg from './CancelSvg';
import SendSvg from './SendSvg';
import DrawProvider from '../DrawCore/DrawProvider';

const styles = StyleSheet.create({
  container: { flex: 1 },
  actionButton: {
    backgroundColor: 'grey',
    padding: 10,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    width: 40,
  },
  option: {
    width: 22,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  drawOptions: {
    flex: 1,
    paddingHorizontal: 10,
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

type DrawWithOptionsProps = {
  linearGradient: React.ComponentType<{ colors: any[] } & ViewProps>;
  image?: ImageRequireSource | ImageURISource;
  close?: () => void;
  takeSnapshot?: (snap: Promise<string | undefined>) => void;
  backgroundColor?: string;
};

function DrawWithOptionsCore({
  linearGradient,
  image,
  close,
  takeSnapshot,
  backgroundColor,
}: DrawWithOptionsProps) {
  const {
    itemIsSelected,
    cancelLastAction,
    takeSnapshot: takeSnapshotAction,
    deleteSelectedItem,
    dispatchDrawStates,
    drawState,
  } = useDrawHook();

  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    const sudDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setShowToolbar(true);
    });

    const sudDidShow = Keyboard.addListener(
      'keyboardDidShow',
      (event: { endCoordinates: { height: number } }) => {
        console.log('keyboardDidShow dwo');
        // avoid events triggered by InputAccessoryView
        if (event.endCoordinates.height > 100) {
          setShowToolbar(false);
        }
      }
    );

    // cleanup function
    return () => {
      sudDidShow.remove();
      sudDidHide.remove();
    };
  }, []);

  const takeSnapshotAndGetUri = useCallback(async () => {
    if (takeSnapshot) {
      takeSnapshot(takeSnapshotAction());
    }
  }, [takeSnapshot, takeSnapshotAction]);
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.actionButton}>
          <Pressable onPress={close}>
            <CloseSvg height={20} width={20} fill="#ffffff" />
          </Pressable>
        </View>
        <View style={styles.drawOptions}>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              borderWidth: 1,
              borderColor: 'grey',
              borderRadius: 25,
              height: 40,
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
          >
            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'pen',
                });
              }}
            >
              <PenSvg
                height={23}
                width={22}
                stroke="#ffffff"
                strokeWidth="2"
                opacity={drawState.drawingMode === 'pen' ? 1 : 0.5}
              />
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'doubleHead',
                });
              }}
            >
              <DoubleHeadSvg
                height={20}
                width={20}
                fill="#ffffff"
                opacity={drawState.drawingMode === 'doubleHead' ? 1 : 0.5}
              />
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'singleHead',
                });
              }}
            >
              <ArrowSvg
                height={23}
                width={23}
                fill="#ffffff"
                opacity={drawState.drawingMode === 'singleHead' ? 1 : 0.5}
              />
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'rectangle',
                });
              }}
            >
              <SquareSvg
                height={27}
                width={27}
                fill="#ffffff"
                opacity={drawState.drawingMode === 'rectangle' ? 1 : 0.5}
              />
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'ellipse',
                });
              }}
            >
              <CircleSvg
                fill="#ffffff"
                height={26}
                width={26}
                opacity={drawState.drawingMode === 'ellipse' ? 1 : 0.5}
              />
            </Pressable>

            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'text',
                });
              }}
            >
              <TextSvg
                height={28}
                width={28}
                color={'grey'}
                opacity={drawState.drawingMode === 'text' ? 1 : 0.5}
              />
            </Pressable>

            <Pressable
              style={styles.option}
              onPress={() => {
                dispatchDrawStates({
                  type: 'SET_DRAWING_MODE',
                  drawingMode: 'doubleArrows',
                });
              }}
            >
              <DoubleHeadSvg
                height={20}
                width={20}
                fill="#ffffff"
                opacity={drawState.drawingMode === 'doubleArrows' ? 1 : 0.5}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.actionButton}>
          <Pressable onPress={takeSnapshotAndGetUri}>
            <SendSvg height={20} width={20} fill="#ffffff" />
          </Pressable>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 0,
          flex: 1,
        }}
      >
        <DrawCore image={image} backgroundColor={backgroundColor} />
      </View>

      <Sliders linearGradient={linearGradient} />

      <View style={{ height: 70 }}>
        {showToolbar ? (
          <View style={styles.bottomToolBar}>
            {itemIsSelected.value ? (
              <View style={{ ...styles.actionButton, marginRight: 10 }}>
                <Pressable style={styles.option} onPress={deleteSelectedItem}>
                  <ThrashSvg
                    width={28}
                    height={28}
                    color="white"
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            ) : null}
            {drawState.cancelEnabled ? (
              <View
                style={{
                  ...styles.actionButton,
                }}
              >
                <Pressable style={styles.option} onPress={cancelLastAction}>
                  <CancelSvg
                    width={28}
                    height={28}
                    color={'grey'}
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function DrawWithOptions(props: DrawWithOptionsProps) {
  return (
    <DrawProvider>
      <DrawWithOptionsCore {...props} />
    </DrawProvider>
  );
}
