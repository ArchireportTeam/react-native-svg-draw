import * as React from 'react';

import { StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import {
  DrawWithOptions,
  DrawProvider,
} from '@archireport/react-native-svg-draw';
import { LinearGradient } from 'expo-linear-gradient';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

export default gestureHandlerRootHOC(function App() {
  return (
    <SafeAreaView style={styles.container}>
      <DrawProvider>
        <DrawWithOptions
          linearGradient={LinearGradient}
          image={require('./pexels-sebastian-palomino-2847766.jpg')}
          close={() => true}
          takeSnapshot={(snap) => {
            snap.then((uri) => console.log('snapShot uri:', uri));
          }}
        />
      </DrawProvider>
    </SafeAreaView>
  );
});

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height,
    backgroundColor: 'black',
  },
});
