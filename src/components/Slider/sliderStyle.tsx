import { StyleSheet } from 'react-native';
export const TRACK_R = 10;
export const sliderStyle = StyleSheet.create({
  container: {
    height: 40,
    alignItems: 'center',
    width: '100%',
  },
  thumb: {
    position: 'absolute',
    width: TRACK_R * 2,
    height: TRACK_R * 2,
    borderRadius: TRACK_R,
    left: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: 9,
  },
  track: {
    width: '100%',
    backgroundColor: 'grey',
    height: 6,
    marginTop: 15,
    borderRadius: 3,
  },
});
