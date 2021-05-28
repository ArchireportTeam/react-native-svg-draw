import * as React from 'react';
import Svg, { SvgProps, Path, G } from 'react-native-svg';

function SendSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 12 19" {...props}>
      <G>
        <Path d="M8.114,9.721 L1.057,16.778 C0.537,17.298 0.537,18.143 1.057,18.664 C1.577,19.184 2.422,19.184 2.943,18.664 L10.943,10.664 C11.463,10.144 11.463,9.299 10.943,8.778 L2.943,0.778 C2.423,0.258 1.578,0.258 1.057,0.778 C0.537,1.298 0.537,2.143 1.057,2.664 L8.114,9.721 Z" />
      </G>
    </Svg>
  );
}

export default SendSvg;
