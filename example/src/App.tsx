import * as React from 'react';

import { StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { DrawWithOptions } from '@archireport/react-native-svg-draw';
import LinearGradient from 'react-native-linear-gradient';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <DrawWithOptions
        linearGradient={LinearGradient}
        image={require('./pexels-sebastian-palomino-2847766.jpg')}
      />
    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height,
    backgroundColor: 'black',
  },
});
