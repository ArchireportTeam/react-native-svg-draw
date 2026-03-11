import * as React from 'react';

import { StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  DrawWithOptions,
  DrawProvider,
} from '@archireport/react-native-svg-draw';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <DrawProvider>
            <DrawWithOptions
              linearGradient={LinearGradient as React.ComponentType<any>}
              image={require('./pexels-sebastian-palomino-2847766.jpg')}
              close={() => true}
              actionWithSnapShotUri={async (uri) => {
                console.log('uri', uri);
              }}
            />
          </DrawProvider>
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
});
