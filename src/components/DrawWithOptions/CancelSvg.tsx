import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function CancelSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 24 24" {...props}>
      <Path
        d="M2 4L2 10L8 10"
        stroke="#F1F1F5"
        stroke-width="1.99277"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M4.51 15.0004C5.15839 16.8408 6.38734 18.4206 8.01166 19.5018C9.63598 20.583 11.5677 21.107 13.5157 20.9949C15.4637 20.8828 17.3226 20.1406 18.8121 18.8802C20.3017 17.6198 21.3413 15.9094 21.7742 14.0068C22.2072 12.1042 22.0101 10.1124 21.2126 8.33154C20.4152 6.55068 19.0605 5.07723 17.3528 4.1332C15.6451 3.18917 13.6769 2.8257 11.7447 3.09755C9.81245 3.36941 8.02091 4.26186 6.64 5.64044L2 10.0004"
        stroke="#F1F1F5"
        stroke-width="1.99277"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
}
