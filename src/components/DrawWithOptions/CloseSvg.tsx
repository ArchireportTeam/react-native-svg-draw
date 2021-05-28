import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

export default function CloseSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 20 20" {...props}>
      <Path d="M1.057 1.057c.52-.52 1.365-.52 1.886 0L10 8.114l7.057-7.057A1.335 1.335 0 0118.835.96l.108.097c.52.52.52 1.365 0 1.886L11.886 10l7.057 7.057c.486.486.518 1.254.097 1.778l-.097.108c-.52.52-1.365.52-1.886 0L10 11.886l-7.057 7.057a1.335 1.335 0 01-1.778.097l-.108-.097a1.335 1.335 0 010-1.886L8.114 10 1.057 2.943A1.335 1.335 0 01.96 1.165l.097-.108z" />
    </Svg>
  );
}
