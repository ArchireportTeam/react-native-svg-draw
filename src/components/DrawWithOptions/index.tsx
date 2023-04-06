import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewProps,
  ImageRequireSource,
  ImageURISource,
  Keyboard,
  Text,
} from 'react-native';
import DoubleHeadSvg from './DoubleHeadSvg';
import CircleSvg from './CircleSvg';
import SquareSvg from './SquareSvg';
import ArrowSvg from './ArrowSvg';
import TextSvg from './TextSvg';
import CloseSvg from './CloseSvg';
import PenSvg from './PenSvg';

import type { DrawCoreProps } from 'src/types';
import useDrawHook from '../DrawCore/useDrawHook';
import Sliders from '../Slider/Sliders';
import DrawCore from '../DrawCore';

const styles = StyleSheet.create({
  container: { flex: 1 },
  option: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
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
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
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
    backgroundColor: 'red',
  },
});

export default function DrawWithOption({
  takeSnapshot,
  linearGradient,
  image,
  close,
}: {
  takeSnapshot?: (snap: Promise<string | undefined>) => void;
  linearGradient: React.ComponentType<{ colors: any[] } & ViewProps>;
  image?: ImageRequireSource | ImageURISource;
  close: () => void;
}) {
  const { drawingMode, setDrawingMode } = useDrawHook();
  //console.log('strokeWidth', strokeWidth);
  const drawRef = useRef<DrawCoreProps>(null);
  //const [t] = useTranslation();

  //const [drawingMode, setDrawingMode] = useState<DrawItemType>(defaultDrawingMode);

  //const [selectedItem, setSelectedItem] = useState(false);

  //const [cancelEnabled, setCancelEnabled] = useState(false);

  //const theme = useTheme<Theme>();
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

    const sudDidShow = Keyboard.addListener(
      'keyboardDidShow',
      (event: { endCoordinates: { height: number } }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View>
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
              height: 50,
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
          >
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
                color={'grey'}
                opacity={drawingMode === 'text' ? 1 : 0.5}
              />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 50, height: 40 }}>
          <Pressable onPress={onPressSend}>
            <Text>inserer</Text>
          </Pressable>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 100,
          borderWidth: 1,
          borderColor: 'grey',
          flex: 1,
        }}
      >
        <DrawCore ref={drawRef} image={image} backgroundColor={'white'} />
      </View>

      <Sliders linearGradient={linearGradient} />
      {/*
      {showToolbar ? (
        <View style={styles.bottomToolBar}>
          selectedItem ? (
            <Pressable
              style={styles.option}
              onPress={() => {
                drawRef.current?.deleteSelectedItem();
              }}>
              <ThrashSvg width={28} height={28} color="white" />
            </Pressable>
          ) : null
            
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
                color={'grey'}
                strokeWidth={2}
              />
            </Pressable>
          ) : null}
         
        </View>
      ) : null}
       */}
    </View>
  );
}
