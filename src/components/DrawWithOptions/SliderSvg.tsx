import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgSlider(props: SvgProps) {
  return (
    <Svg width="189" height="6" viewBox="0 0 189 6" fill="none" {...props}>
      <Path
        d="M0.99994 4.01059C0.445985 4.00473 -7.21155e-08 3.554 -1.31135e-07 3.00001C-1.90155e-07 2.44602 0.445985 1.99529 0.999941 1.98943L186 0.0317445C187.652 0.0142669 189 1.3483 189 3C189 4.65169 187.652 5.98572 186 5.96825L0.99994 4.01059Z"
        fill="currentColor"
      />
    </Svg>
  );
}

export default SvgSlider;
