import React from 'react';
import Svg, { Defs, Path, G, Mask, Use, SvgProps } from 'react-native-svg';

export default function SquareSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 28 28" {...props}>
      <Defs>
        <Path
          id="prefix__a"
          d="M5.833 4.667c-.644 0-1.166.522-1.166 1.166v16.334c0 .644.522 1.166 1.166 1.166h16.334c.644 0 1.166-.522 1.166-1.166V5.833c0-.644-.522-1.166-1.166-1.166H5.833zm0-2.334h16.334a3.5 3.5 0 013.5 3.5v16.334a3.5 3.5 0 01-3.5 3.5H5.833a3.5 3.5 0 01-3.5-3.5V5.833a3.5 3.5 0 013.5-3.5z"
        />
      </Defs>
      <G fill="none" fillRule="evenodd">
        <Mask id="prefix__b" fill="#fff">
          <Use xlinkHref="#prefix__a" />
        </Mask>
        <Use fill="#000" fillRule="nonzero" xlinkHref="#prefix__a" />
        <G fill="#FFF" mask="url(#prefix__b)">
          <Path d="M0 0h28v28H0z" />
        </G>
      </G>
    </Svg>
  );
}
