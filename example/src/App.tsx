import React, { useState } from 'react';

import { StyleSheet, Dimensions, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  DrawWithOptions,
  DrawProvider,
} from '@archireport/react-native-svg-draw';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ZoomableImage from './ZoomableImage';
import { Pressable } from 'react-native-gesture-handler';

export default function App() {
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          {snapshotUri ? (
            <View style={styles.resultContainer}>
              <Pressable
                style={styles.backButton}
                onPress={() => setSnapshotUri(null)}
              >
                <Text style={styles.backButtonText}>← Retour</Text>
              </Pressable>
              <ZoomableImage uri={snapshotUri} />
            </View>
          ) : (
            <DrawProvider>
              <DrawWithOptions
                linearGradient={LinearGradient as React.ComponentType<any>}
                image={require('./pexels-sebastian-palomino-2847766.jpg')}
                close={() => true}
                actionWithSnapShotUri={async (uri) => {
                  setSnapshotUri(uri);
                }}
              />
            </DrawProvider>
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    height,
    backgroundColor: 'black',
  },
  resultContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
