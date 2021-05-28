import * as React from 'react';
import Svg, { SvgProps, Defs, Path, G, Mask, Use } from 'react-native-svg';

function SvgComponent(props: SvgProps) {
  return (
    <Svg viewBox="0 0 28 28" {...props}>
      <Defs>
        <Path
          id="prefix__a"
          d="M23.333 3.5c.645 0 1.167.522 1.167 1.167v3.5a1.166 1.166 0 01-2.333 0V5.833h-7.001v16.333H17.5c.601 0 1.096.456 1.16 1.04l.007.127c0 .645-.523 1.167-1.167 1.167l-3.482-.001L14 24.5h-3.5a1.167 1.167 0 010-2.333l2.333-.001V5.833h-7v2.334a1.166 1.166 0 11-2.333 0v-3.5c0-.645.522-1.167 1.167-1.167z"
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

export default SvgComponent;
