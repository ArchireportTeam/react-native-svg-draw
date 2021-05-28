import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function DoubleHeadSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 9 22" {...props}>
      <Path d="M1.754 2.628A1.293 1.293 0 011.622.051l.132-.006h5.13a1.292 1.292 0 01.132 2.577l-.133.006H5.628v16.79l1.256.002c.669 0 1.219.508 1.285 1.16l.006.132c0 .668-.508 1.219-1.16 1.285l-.131.006h-5.13a1.293 1.293 0 01-.132-2.577l.132-.006 1.292-.002V2.629H1.754z" />
    </Svg>
  );
}
