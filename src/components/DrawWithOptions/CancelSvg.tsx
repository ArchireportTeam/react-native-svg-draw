import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export default function CancelSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 27 27" {...props}>
      <Path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5.833 4.667c-.644 0-1.166.522-1.166 1.166v16.334c0 .644.522 1.166 1.166 1.166h16.334c.644 0 1.166-.522 1.166-1.166V5.833c0-.644-.522-1.166-1.166-1.166H5.833zm0-2.334h16.334a3.5 3.5 0 013.5 3.5v16.334a3.5 3.5 0 01-3.5 3.5H5.833a3.5 3.5 0 01-3.5-3.5V5.833a3.5 3.5 0 013.5-3.5z"
      />
    </Svg>
  );
}
